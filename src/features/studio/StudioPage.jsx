import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import BuilderTab from './builder/BuilderTab'
import CodeTab from './code/CodeTab'
import PreviewPane from './preview/PreviewPane'
import PromptTab from './prompt/PromptTab'
import DeploymentHistory from './deploy/DeploymentHistory'
import DeploymentModal from './deploy/DeploymentModal'
import PageSkeleton from '../../components/common/PageSkeleton'
import { ensureFrontendFiles } from '../../core/utils/frontendFiles'
import { generateFrontendFromPrompt } from '../../services/aiFrontendService'
import { getDeploymentStatus, publishProject, rollbackDeployment } from '../../services/deploymentService'
import { buildDefaultUiTree } from '../../core/utils/uiTree'
import { useProjectStore } from '../../store/useProjectStore'

const tabs = ['prompt', 'builder', 'code', 'preview']

function tabClass(isActive) {
  return isActive
    ? 'rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white'
    : 'rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
}

function StudioPage() {
  const { projectId } = useParams()

  const loadProject = useProjectStore((state) => state.loadProject)
  const currentProject = useProjectStore((state) => state.currentProject)
  const isLoadingProject = useProjectStore((state) => state.isLoadingProject)
  const error = useProjectStore((state) => state.error)

  const setFrontendFiles = useProjectStore((state) => state.setFrontendFiles)
  const updateFrontendFileContent = useProjectStore((state) => state.updateFrontendFileContent)
  const syncUiTreeFromFrontendFiles = useProjectStore((state) => state.syncUiTreeFromFrontendFiles)
  const addComponent = useProjectStore((state) => state.addComponent)
  const updateComponent = useProjectStore((state) => state.updateComponent)
  const deleteComponent = useProjectStore((state) => state.deleteComponent)
  const reorderComponents = useProjectStore((state) => state.reorderComponents)
  const setUiTree = useProjectStore((state) => state.setUiTree)
  const undoUiTree = useProjectStore((state) => state.undoUiTree)
  const upsertDeployment = useProjectStore((state) => state.upsertDeployment)

  const [activeTab, setActiveTab] = useState('prompt')
  const [prompt, setPrompt] = useState('Create a modern sneaker ecommerce landing page with navbar, hero, products, and footer.')
  const [saveStatus, setSaveStatus] = useState('Saved')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState('')
  const [selectedFilePath, setSelectedFilePath] = useState('App.jsx')
  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isRollingBackId, setIsRollingBackId] = useState('')
  const [publishModal, setPublishModal] = useState({
    isOpen: false,
    phase: 'idle',
    deployment: null,
    error: '',
    isRetrying: false,
  })
  const pollTimerRef = useRef(null)

  const frontendFiles = currentProject?.files?.frontend || []
  const uiTree = currentProject?.uiTree || []
  const deployments = currentProject?.deployments || []
  const currentProjectKey = currentProject?.id || currentProject?._id || projectId
  const liveDeployment = useMemo(() => deployments.find((deployment) => deployment?.status === 'ready' && deployment?.url) || deployments[0] || null, [deployments])

  const clearPollTimer = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }

  const normalizeDeployment = (deployment) => ({
    ...deployment,
    id: deployment?.id || deployment?._id || deployment?.deploymentId || '',
    status: deployment?.status || 'queued',
    url: deployment?.url || deployment?.liveUrl || '',
    createdAt: deployment?.createdAt || new Date().toISOString(),
  })

  const scheduleDeploymentPoll = (deploymentId) => {
    clearPollTimer()

    pollTimerRef.current = window.setTimeout(async () => {
      try {
        const status = await getDeploymentStatus(currentProjectKey, deploymentId)
        const normalized = normalizeDeployment(status)

        setPublishModal((prev) => ({
          ...prev,
          phase: normalized.status,
          deployment: {
            ...(prev.deployment || {}),
            ...normalized,
          },
          error: '',
        }))

        if (['queued', 'building', 'deploying'].includes(normalized.status)) {
          scheduleDeploymentPoll(deploymentId)
          return
        }

        if (normalized.status === 'ready') {
          upsertDeployment(normalized)
          setIsPublishing(false)
          setPublishModal((prev) => ({
            ...prev,
            isOpen: true,
            phase: 'ready',
            deployment: {
              ...(prev.deployment || {}),
              ...normalized,
            },
            error: '',
            isRetrying: false,
          }))
          toast.success('Deployment is live')
          return
        }

        setIsPublishing(false)
        setPublishModal((prev) => ({
          ...prev,
          phase: 'failed',
          error: normalized.error || 'Deployment failed. Try again.',
          isRetrying: false,
        }))
        toast.error(normalized.error || 'Deployment failed. Try again.')
      } catch (error) {
        setIsPublishing(false)
        setPublishModal((prev) => ({
          ...prev,
          phase: 'failed',
          error: error?.uiMessage || 'Could not fetch deployment status.',
          isRetrying: false,
        }))
        toast.error(error?.uiMessage || 'Could not fetch deployment status.')
      }
    }, 2000)
  }

  const runPublishFlow = async ({ isRetrying = false } = {}) => {
    if (!currentProjectKey) {
      toast.error('Project is still loading.')
      return
    }

    if (frontendFiles.length === 0) {
      const message = 'No frontend files found. Generate the project before publishing.'
      setPublishModal({ isOpen: true, phase: 'failed', deployment: null, error: message, isRetrying: false })
      toast.error(message)
      return
    }

    const emptyFiles = frontendFiles.filter((file) => !String(file?.content || '').trim())
    if (emptyFiles.length > 0) {
      const message = `Fix the empty file before publishing: ${emptyFiles[0].path}`
      setPublishModal({ isOpen: true, phase: 'failed', deployment: null, error: message, isRetrying: false })
      toast.error(message)
      return
    }

    try {
      ensureFrontendFiles(frontendFiles)
    } catch (error) {
      const message = error?.message || 'Generated frontend files are incomplete.'
      setPublishModal({ isOpen: true, phase: 'failed', deployment: null, error: message, isRetrying: false })
      toast.error(message)
      return
    }

    clearPollTimer()
    setIsPublishing(true)
    setPublishModal({
      isOpen: true,
      phase: 'queued',
      deployment: null,
      error: '',
      isRetrying,
    })

    try {
      const deployment = normalizeDeployment(await publishProject(currentProjectKey, { mode: 'vercel' }))

      if (!deployment?.id) {
        throw new Error('Deployment id missing from publish response.')
      }

      setPublishModal((prev) => ({
        ...prev,
        deployment,
        phase: deployment.status || 'deploying',
      }))

      if (deployment.status === 'ready') {
        upsertDeployment(deployment)
        setIsPublishing(false)
        setPublishModal((prev) => ({
          ...prev,
          phase: 'ready',
          error: '',
          isRetrying: false,
        }))
        toast.success('Deployment is live')
        return
      }

      scheduleDeploymentPoll(deployment.id)
    } catch (error) {
      setIsPublishing(false)
      setPublishModal((prev) => ({
        ...prev,
        phase: 'failed',
        error: error?.uiMessage || error?.message || 'Publish failed. Please try again.',
        isRetrying: false,
      }))
      toast.error(error?.uiMessage || error?.message || 'Publish failed. Please try again.')
    }
  }

  const handleCopyLiveUrl = async () => {
    const url = publishModal.deployment?.url || liveDeployment?.url
    if (!url) return

    try {
      await navigator.clipboard.writeText(url)
      toast.success('Live URL copied')
    } catch (error) {
      toast.error('Could not copy the live URL.')
    }
  }

  const handleOpenLiveUrl = () => {
    const url = publishModal.deployment?.url || liveDeployment?.url
    if (!url) return

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleRollback = async (deployment) => {
    const deploymentId = deployment?.id || deployment?._id || deployment?.deploymentId
    if (!deploymentId || !currentProjectKey) return

    setIsRollingBackId(deploymentId)

    try {
      const rolledBackDeployment = normalizeDeployment(await rollbackDeployment(currentProjectKey, deploymentId))
      if (rolledBackDeployment?.id) {
        upsertDeployment(rolledBackDeployment)
      }
      toast.success('Rollback completed')
    } catch (error) {
      toast.error(error?.uiMessage || 'Rollback failed.')
    } finally {
      setIsRollingBackId('')
    }
  }

  useEffect(() => {
    if (projectId) {
      loadProject(projectId)
        .then((project) => {
          if (!Array.isArray(project?.uiTree) || project.uiTree.length === 0) {
            setUiTree(buildDefaultUiTree())
          }
        })
        .catch(() => {})
    }
  }, [loadProject, projectId, setUiTree])

  useEffect(() => {
    if (!currentProjectKey) return

    try {
      const draft = localStorage.getItem(`nexora:studio:${currentProjectKey}`)
      if (!draft) return

      const parsed = JSON.parse(draft)
      if (Array.isArray(parsed?.frontendFiles) && parsed.frontendFiles.length > 0) {
        setFrontendFiles(parsed.frontendFiles)
      }
      if (Array.isArray(parsed?.uiTree) && parsed.uiTree.length > 0) {
        setUiTree(parsed.uiTree)
      }
    } catch (error) {
      console.error('[Studio] Failed to load autosave draft', error)
    }
  }, [currentProjectKey, setFrontendFiles, setUiTree])

  useEffect(() => {
    if (frontendFiles.length === 0) return

    const hasSelected = frontendFiles.some((file) => file.path === selectedFilePath)
    if (!hasSelected) {
      setSelectedFilePath(frontendFiles[0].path)
    }
  }, [frontendFiles, selectedFilePath])

  useEffect(() => {
    if (uiTree.length === 0) {
      setSelectedSectionId(null)
      return
    }

    const hasSelected = uiTree.some((section) => section.id === selectedSectionId)
    if (!hasSelected) {
      setSelectedSectionId(uiTree[0].id)
    }
  }, [uiTree, selectedSectionId])

  useEffect(() => {
    if (isLoadingProject || !currentProjectKey) return

    setSaveStatus('Unsaved changes')
    const timer = setTimeout(() => {
      setSaveStatus('Saved')
    }, 300)

    const autosaveTimer = setTimeout(() => {
      try {
        localStorage.setItem(
          `nexora:studio:${currentProjectKey}`,
          JSON.stringify({ frontendFiles, uiTree }),
        )
      } catch (error) {
        console.error('[Studio] Autosave failed', error)
      }
    }, 1200)

    return () => {
      clearTimeout(timer)
      clearTimeout(autosaveTimer)
    }
  }, [frontendFiles, uiTree, isLoadingProject, currentProjectKey])

  useEffect(() => () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const handleShortcut = (event) => {
      if (!(event.ctrlKey || event.metaKey)) return

      if (event.key.toLowerCase() === 's') {
        event.preventDefault()
        toast.success('Project saved locally')
        try {
          localStorage.setItem(
            `nexora:studio:${currentProjectKey}`,
            JSON.stringify({ frontendFiles, uiTree }),
          )
        } catch (error) {
          console.error('[Studio] Manual save failed', error)
        }
      }

      if (event.key.toLowerCase() === 'z' && activeTab === 'builder') {
        event.preventDefault()
        undoUiTree()
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [activeTab, currentProjectKey, frontendFiles, uiTree, undoUiTree])

  const selectedFile = useMemo(
    () => frontendFiles.find((file) => file.path === selectedFilePath) || null,
    [frontendFiles, selectedFilePath],
  )

  const selectedSection = useMemo(
    () => uiTree.find((section) => section.id === selectedSectionId) || null,
    [uiTree, selectedSectionId],
  )

  const handleGenerate = async () => {
    const sanitizedPrompt = prompt.trim()
    setGenerationError('')

    if (!sanitizedPrompt) {
      setGenerationError('Prompt is required.')
      return
    }

    if (sanitizedPrompt.length > 600) {
      setGenerationError('Prompt is too long. Keep it under 600 characters.')
      return
    }

    setIsGenerating(true)

    try {
      const files = await generateFrontendFromPrompt(sanitizedPrompt)
      setFrontendFiles(files)
      syncUiTreeFromFrontendFiles()
      setSelectedFilePath('App.jsx')
      setActiveTab('builder')
      toast.success('Frontend generated successfully')
    } catch (requestError) {
      const message = requestError?.uiMessage || requestError?.message || 'Frontend generation failed.'
      setGenerationError(message)
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section className="space-y-4">
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Studio</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-100">{currentProject?.name || 'Loading project...'}</h1>
            {liveDeployment?.url ? (
              <a
                href={liveDeployment.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex break-all text-xs font-medium text-cyan-700 underline decoration-cyan-300 underline-offset-4 hover:text-cyan-800"
              >
                {liveDeployment.url}
              </a>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className={`rounded-xl px-3 py-1 text-xs font-semibold ${saveStatus === 'Saved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {saveStatus}
            </p>
            <button
              type="button"
              onClick={() => runPublishFlow({ isRetrying: false })}
              disabled={isPublishing || isLoadingProject || !currentProjectKey}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={tabClass(activeTab === tab)}
            >
              {tab === 'prompt' ? 'Prompt' : tab === 'builder' ? 'Builder' : tab === 'code' ? 'Code' : 'Preview'}
            </button>
          ))}
        </div>
      </header>

      <DeploymentModal
        isOpen={publishModal.isOpen}
        deployment={publishModal.deployment}
        phase={publishModal.phase}
        error={publishModal.error}
        isRetrying={publishModal.isRetrying}
        onClose={() => setPublishModal((prev) => ({ ...prev, isOpen: false }))}
        onRetry={() => runPublishFlow({ isRetrying: true })}
        onCopyUrl={handleCopyLiveUrl}
        onOpenUrl={handleOpenLiveUrl}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {isLoadingProject ? <PageSkeleton /> : null}
        {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        {!isLoadingProject ? (
          <>
            {activeTab === 'prompt' ? (
              <PromptTab
                prompt={prompt}
                onPromptChange={setPrompt}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                error={generationError}
              />
            ) : null}

            {activeTab === 'builder' ? (
              <BuilderTab
                uiTree={uiTree}
                selectedSection={selectedSection}
                selectedSectionId={selectedSectionId}
                onSelectSection={setSelectedSectionId}
                onDeleteSection={(id) => deleteComponent(id)}
                onReorderSections={reorderComponents}
                onAddComponent={(type) => addComponent(type)}
                onAddBelow={(index) => addComponent('features', index)}
                onUpdateSection={(key, value) => {
                  if (!selectedSection) return
                  updateComponent(selectedSection.id, { [key]: value })
                }}
              />
            ) : null}

            {activeTab === 'code' ? (
              <CodeTab
                files={frontendFiles}
                selectedFilePath={selectedFilePath}
                onSelectFile={setSelectedFilePath}
                selectedFile={selectedFile}
                onChangeFile={updateFrontendFileContent}
              />
            ) : null}

            {activeTab === 'preview' ? <PreviewPane uiTree={uiTree} /> : null}
          </>
        ) : null}
      </section>

      {!isLoadingProject ? (
        <DeploymentHistory
          deployments={deployments}
          onRollback={handleRollback}
          isRollingBackId={isRollingBackId}
        />
      ) : null}
    </section>
  )
}

export default StudioPage
