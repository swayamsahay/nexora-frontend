import { create } from 'zustand'
import { createProject, getProjectById, getProjects } from '../services/projectService'
import { buildDefaultFrontendFiles } from '../utils/frontendFiles'
import { buildDefaultUiTree, buildUiTreeFromFrontendFiles, createUiSection } from '../utils/uiTree'

function withFrontendFiles(project) {
  if (!project) return null

  const frontendFiles = Array.isArray(project?.files?.frontend) && project.files.frontend.length > 0
    ? project.files.frontend
    : buildDefaultFrontendFiles(project?.name)

  return {
    ...project,
    files: {
      ...project.files,
      frontend: frontendFiles,
    },
    deployments: Array.isArray(project?.deployments) ? project.deployments : [],
    uiTree: Array.isArray(project?.uiTree) && project.uiTree.length > 0
      ? project.uiTree
      : buildUiTreeFromFrontendFiles(frontendFiles),
  }
}

function normalizeDeployment(deployment) {
	if (!deployment) return null

	return {
		...deployment,
		id: deployment.id || deployment._id || deployment.deploymentId,
		status: deployment.status || 'queued',
		url: deployment.url || deployment.liveUrl || '',
		createdAt: deployment.createdAt || new Date().toISOString(),
	}
}

function applyUiTreeChange(prev, nextUiTree) {
  const currentUiTree = prev.currentProject?.uiTree || []

  return {
    uiTreeHistory: [...(prev.uiTreeHistory || []), currentUiTree],
    uiTreeFuture: [],
    currentProject: prev.currentProject
      ? {
        ...prev.currentProject,
        uiTree: nextUiTree,
      }
      : prev.currentProject,
  }
}

export const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  isLoadingProjects: false,
  isCreatingProject: false,
  isLoadingProject: false,
  error: '',
  uiTreeHistory: [],
  uiTreeFuture: [],

  fetchProjects: async () => {
    set({ isLoadingProjects: true, error: '' })

    try {
      const projects = await getProjects()
      set({ projects })
    } catch (error) {
      console.error('[Projects] fetchProjects failed', error)
      set({ error: error?.uiMessage || 'Could not load projects.' })
    } finally {
      set({ isLoadingProjects: false })
    }
  },

  createNewProject: async (name) => {
    set({ isCreatingProject: true, error: '' })

    try {
      const project = withFrontendFiles(await createProject({ name }))
      set((prev) => ({
        projects: project ? [project, ...prev.projects] : prev.projects,
        currentProject: project || prev.currentProject,
        uiTreeHistory: [],
        uiTreeFuture: [],
      }))
      return project
    } catch (error) {
      console.error('[Projects] createNewProject failed', error)
      set({ error: error?.uiMessage || 'Could not create project.' })
      throw error
    } finally {
      set({ isCreatingProject: false })
    }
  },

  loadProject: async (projectId) => {
    set({ isLoadingProject: true, error: '' })

    try {
      const project = withFrontendFiles(await getProjectById(projectId))
      set({ currentProject: project, uiTreeHistory: [], uiTreeFuture: [] })
      return project
    } catch (error) {
      console.error('[Projects] loadProject failed', error)
      set({ error: error?.uiMessage || 'Could not load project.' })
      throw error
    } finally {
      set({ isLoadingProject: false })
    }
  },

  setFrontendFiles: (frontendFiles) => {
    set((prev) => ({
      currentProject: prev.currentProject
        ? {
          ...prev.currentProject,
          files: {
            ...prev.currentProject.files,
            frontend: frontendFiles,
          },
        }
        : prev.currentProject,
    }))
  },

  updateFrontendFileContent: (path, content) => {
    set((prev) => {
      const currentFiles = prev.currentProject?.files?.frontend || []
      const nextFiles = currentFiles.map((file) => (
        file.path === path ? { ...file, content } : file
      ))

      return {
        currentProject: prev.currentProject
          ? {
            ...prev.currentProject,
            files: {
              ...prev.currentProject.files,
              frontend: nextFiles,
            },
          }
          : prev.currentProject,
      }
    })
  },

  setUiTree: (uiTree) => {
    set((prev) => ({
      uiTreeHistory: [],
      uiTreeFuture: [],
      currentProject: prev.currentProject
        ? {
          ...prev.currentProject,
          uiTree,
        }
        : prev.currentProject,
    }))
  },

  syncUiTreeFromFrontendFiles: () => {
    set((prev) => {
      const files = prev.currentProject?.files?.frontend || []
      const nextUiTree = files.length > 0 ? buildUiTreeFromFrontendFiles(files) : buildDefaultUiTree()

      return {
        uiTreeHistory: [],
        uiTreeFuture: [],
        currentProject: prev.currentProject
          ? {
            ...prev.currentProject,
            uiTree: nextUiTree,
          }
          : prev.currentProject,
      }
    })
  },

  addComponent: (type, index = null) => {
    set((prev) => {
      const currentUiTree = prev.currentProject?.uiTree || buildDefaultUiTree()
      const nextSection = createUiSection(type)
      const insertIndex = typeof index === 'number' ? Math.max(0, Math.min(index, currentUiTree.length)) : currentUiTree.length

      const nextUiTree = [
        ...currentUiTree.slice(0, insertIndex),
        nextSection,
        ...currentUiTree.slice(insertIndex),
      ]

      return applyUiTreeChange(prev, nextUiTree)
    })
  },

  updateComponent: (id, propsPatch) => {
    set((prev) => {
      const currentUiTree = prev.currentProject?.uiTree || []
      const nextUiTree = currentUiTree.map((section) => (
        section.id === id
          ? {
            ...section,
            props: {
              ...section.props,
              ...propsPatch,
            },
          }
          : section
      ))

      return applyUiTreeChange(prev, nextUiTree)
    })
  },

  deleteComponent: (id) => {
    set((prev) => {
      const currentUiTree = prev.currentProject?.uiTree || []
      const nextUiTree = currentUiTree.filter((section) => section.id !== id)

      return applyUiTreeChange(prev, nextUiTree)
    })
  },

  reorderComponents: (nextUiTree) => {
    set((prev) => applyUiTreeChange(prev, nextUiTree))
  },

  undoUiTree: () => {
    set((prev) => {
      const history = prev.uiTreeHistory || []
      if (history.length === 0 || !prev.currentProject) return prev

      const previousUiTree = history[history.length - 1]
      const nextHistory = history.slice(0, -1)

      return {
        uiTreeHistory: nextHistory,
        uiTreeFuture: [prev.currentProject.uiTree || [], ...(prev.uiTreeFuture || [])],
        currentProject: {
          ...prev.currentProject,
          uiTree: previousUiTree,
        },
      }
    })
  },

  redoUiTree: () => {
    set((prev) => {
      const future = prev.uiTreeFuture || []
      if (future.length === 0 || !prev.currentProject) return prev

      const nextUiTree = future[0]
      const nextFuture = future.slice(1)

      return {
        uiTreeHistory: [...(prev.uiTreeHistory || []), prev.currentProject.uiTree || []],
        uiTreeFuture: nextFuture,
        currentProject: {
          ...prev.currentProject,
          uiTree: nextUiTree,
        },
      }
    })
  },

  upsertDeployment: (deployment) => {
  set((prev) => {
    if (!prev.currentProject) return prev

    const normalizedDeployment = normalizeDeployment(deployment)
    if (!normalizedDeployment?.id) return prev

    const deployments = Array.isArray(prev.currentProject.deployments) ? prev.currentProject.deployments : []
    const nextDeployments = [
      normalizedDeployment,
      ...deployments.filter((item) => (item.id || item._id || item.deploymentId) !== normalizedDeployment.id),
    ]

    return {
      currentProject: {
        ...prev.currentProject,
        deployments: nextDeployments,
      },
    }
  })
  },
}))
