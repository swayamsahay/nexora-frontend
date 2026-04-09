function formatDate(value) {
  if (!value) return 'Just now'
  return new Date(value).toLocaleString()
}

function DeploymentHistory({ deployments, onRollback, isRollingBackId }) {
  if (!Array.isArray(deployments) || deployments.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        No deployments yet. Publish your project to create the first live URL.
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Deployment history</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-950 dark:text-slate-100">Recent publishes</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{deployments.length} total</p>
      </div>

      <div className="mt-4 space-y-3">
        {deployments.map((deployment) => {
          const deploymentId = deployment.id || deployment._id || deployment.deploymentId
          const status = deployment.status || 'queued'
          const liveUrl = deployment.url || deployment.liveUrl || ''

          return (
            <article key={deploymentId || liveUrl || formatDate(deployment.createdAt)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">{liveUrl ? 'Live deployment' : 'Deployment'}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(deployment.createdAt)}</p>
                  {liveUrl ? (
                    <a href={liveUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm text-cyan-700 underline decoration-cyan-300 underline-offset-4 hover:text-cyan-800">
                      {liveUrl}
                    </a>
                  ) : null}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === 'ready' ? 'bg-emerald-50 text-emerald-700' : status === 'failed' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                    {status}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRollback(deployment)}
                    disabled={!deploymentId || isRollingBackId === deploymentId}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {isRollingBackId === deploymentId ? 'Rolling back...' : 'Rollback'}
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default DeploymentHistory
