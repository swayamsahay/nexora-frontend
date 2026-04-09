import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import BuilderCanvas from '../components/visual-builder/BuilderCanvas'
import BuilderLibrary from '../components/visual-builder/BuilderLibrary'
import BuilderPreview from '../components/visual-builder/BuilderPreview'
import BuilderPropertiesPanel from '../components/visual-builder/BuilderPropertiesPanel'
import { generateFrontendFromPrompt } from '../services/aiFrontendService'
import { buildDefaultUiTree } from '../utils/uiTree'
import { useProjectStore } from '../store/useProjectStore'

const tabs = ['prompt', 'builder', 'code', 'preview']

function tabClass(isActive) {
  return isActive
    ? 'rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white'
    : 'rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950'
}

function fileTabClass(isActive) {
  return isActive
    ? 'rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white'
    : 'rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200'
}

function Studio() {
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

  const [activeTab, setActiveTab] = useState('prompt')
  const [prompt, setPrompt] = useState('Create a modern sneaker ecommerce landing page with navbar, hero, products, and footer.')
  const [saveStatus, setSaveStatus] = useState('Saved')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState('')
  const [selectedFilePath, setSelectedFilePath] = useState('App.jsx')
  const [selectedSectionId, setSelectedSectionId] = useState(null)

  const frontendFiles = currentProject?.files?.frontend || []
  const uiTree = currentProject?.uiTree || []

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
    if (isLoadingProject) return

    setSaveStatus('Unsaved changes')
    const timer = setTimeout(() => {
      setSaveStatus('Saved')
    }, 300)

    return () => clearTimeout(timer)
  }, [frontendFiles, uiTree, isLoadingProject])

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
      <header className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Studio</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">{currentProject?.name || 'Loading project...'}</h1>
          </div>
          <p className={`rounded-xl px-3 py-1 text-xs font-semibold ${saveStatus === 'Saved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            {saveStatus}
          </p>
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

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        {isLoadingProject ? <p className="text-sm text-slate-600">Loading project...</p> : null}
        {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        {!isLoadingProject ? (
          <>
            {activeTab === 'prompt' ? (
              <div className="space-y-3">
                <label htmlFor="prompt" className="block text-sm font-medium text-slate-700">Prompt</label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  className="min-h-40 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                  placeholder="Create a modern sneaker ecommerce landing page"
                  maxLength={600}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">{prompt.length}/600</p>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </button>
                </div>
                {generationError ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{generationError}</p> : null}
              </div>
            ) : null}

            {activeTab === 'builder' ? (
              <div className="grid gap-4 xl:grid-cols-[0.9fr_1.2fr_0.9fr]">
                <BuilderLibrary onAdd={(type) => addComponent(type)} />
                <div className="space-y-4">
                  <BuilderCanvas
                    uiTree={uiTree}
                    selectedId={selectedSectionId}
                    onSelect={setSelectedSectionId}
                    onDelete={(id) => deleteComponent(id)}
                    onReorder={reorderComponents}
                    onAddBelow={(index) => addComponent('features', index)}
                  />
                  <div>
                    <p className="mb-2 text-sm font-medium text-slate-700">Live Preview</p>
                    <BuilderPreview uiTree={uiTree} />
                  </div>
                </div>
                <BuilderPropertiesPanel
                  selectedSection={selectedSection}
                  onUpdate={(key, value) => {
                    if (!selectedSection) return
                    updateComponent(selectedSection.id, { [key]: value })
                  }}
                />
              </div>
            ) : null}

            {activeTab === 'code' ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {frontendFiles.map((file) => (
                    <button
                      key={file.path}
                      type="button"
                      onClick={() => setSelectedFilePath(file.path)}
                      className={fileTabClass(selectedFilePath === file.path)}
                    >
                      {file.path}
                    </button>
                  ))}
                </div>

                {selectedFile ? (
                  <textarea
                    value={selectedFile.content}
                    onChange={(event) => updateFrontendFileContent(selectedFile.path, event.target.value)}
                    className="min-h-96 w-full rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100 outline-none focus:border-slate-500"
                  />
                ) : (
                  <p className="text-sm text-slate-600">No generated files yet. Use Prompt tab to generate frontend code.</p>
                )}
              </div>
            ) : null}

            {activeTab === 'preview' ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Preview from uiTree</p>
                <BuilderPreview uiTree={uiTree} />
              </div>
            ) : null}
          </>
        ) : null}
      </section>
    </section>
  )
}

export default Studio
