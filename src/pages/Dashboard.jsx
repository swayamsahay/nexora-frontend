import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageSkeleton from '../components/common/PageSkeleton'
import { useProjectStore } from '../store/useProjectStore'

function Dashboard() {
  const navigate = useNavigate()
  const projects = useProjectStore((state) => state.projects)
  const isLoadingProjects = useProjectStore((state) => state.isLoadingProjects)
  const isCreatingProject = useProjectStore((state) => state.isCreatingProject)
  const error = useProjectStore((state) => state.error)
  const fetchProjects = useProjectStore((state) => state.fetchProjects)
  const createNewProject = useProjectStore((state) => state.createNewProject)

  const [name, setName] = useState('')
  const [fieldError, setFieldError] = useState('')

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleCreateProject = async (event) => {
    event.preventDefault()
    setFieldError('')

    const trimmedName = name.trim()
    if (!trimmedName) {
      setFieldError('Project name is required.')
      return
    }

    try {
      const project = await createNewProject(trimmedName)
      setName('')

      if (project?._id || project?.id) {
        navigate(`/studio/${project._id || project.id}`)
      }
    } catch {
      // Project store already surfaces error.
    }
  }

  return (
    <section className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Phase 1</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Project dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Create a project and open the studio with Prompt, Code, and Preview tabs.</p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Create Project</h2>

        <form onSubmit={handleCreateProject} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="w-full">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter project name"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-slate-400 ${fieldError ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-white'}`}
            />
            {fieldError ? <p className="mt-2 text-xs font-medium text-rose-700">{fieldError}</p> : null}
          </div>

          <button
            type="submit"
            disabled={isCreatingProject}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isCreatingProject ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">Your Projects</h2>
          <button
            type="button"
            onClick={fetchProjects}
            disabled={isLoadingProjects}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
          >
            {isLoadingProjects ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        {isLoadingProjects ? <PageSkeleton /> : null}

        {!isLoadingProjects && projects.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            No projects yet. Create your first project to open the studio.
          </div>
        ) : null}

        {!isLoadingProjects && projects.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const id = project?._id || project?.id

              return (
                <article key={id || project?.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">{project?.name || 'Untitled project'}</h3>
                  <p className="mt-2 text-xs text-slate-500">Created: {project?.createdAt ? new Date(project.createdAt).toLocaleString() : 'N/A'}</p>
                  <button
                    type="button"
                    onClick={() => navigate(`/studio/${id}`)}
                    disabled={!id}
                    className="mt-4 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    Open Studio
                  </button>
                </article>
              )
            })}
          </div>
        ) : null}
      </section>
    </section>
  )
}

export default Dashboard
