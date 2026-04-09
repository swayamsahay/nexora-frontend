const STATUS_META = {
  queued: { label: 'Queued', bar: 'bg-slate-400', tone: 'text-slate-700' },
  building: { label: 'Building', bar: 'bg-amber-500', tone: 'text-amber-700' },
  deploying: { label: 'Deploying', bar: 'bg-cyan-500', tone: 'text-cyan-700' },
  ready: { label: 'Live', bar: 'bg-emerald-500', tone: 'text-emerald-700' },
  failed: { label: 'Failed', bar: 'bg-rose-500', tone: 'text-rose-700' },
}

function getProgress(status) {
  if (status === 'ready') return 100
  if (status === 'deploying') return 78
  if (status === 'building') return 48
  if (status === 'queued') return 18
  return 100
}

function DeploymentModal({
  isOpen,
  deployment,
  phase,
  error,
  isRetrying,
  onClose,
  onRetry,
  onCopyUrl,
  onOpenUrl,
}) {
  if (!isOpen) return null

  const status = deployment?.status || phase || 'queued'
  const meta = STATUS_META[status] || STATUS_META.queued
  const progress = getProgress(status)
  const liveUrl = deployment?.url || ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Publish</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">Deployment status</h2>
            <p className={`mt-2 text-sm font-medium ${meta.tone}`}>{meta.label}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Close
          </button>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            <span>{status}</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className={`h-full rounded-full transition-all duration-500 ${meta.bar}`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          {error ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-rose-700">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                disabled={isRetrying}
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-950"
              >
                {isRetrying ? 'Retrying...' : 'Retry publish'}
              </button>
            </div>
          ) : null}

          {!error && status !== 'ready' ? (
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p>Deployment is running in the background. You can close this modal and come back later.</p>
              <p>Current phase: <span className="font-semibold text-slate-950 dark:text-slate-100">{status}</span></p>
            </div>
          ) : null}

          {status === 'ready' ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">Live URL</p>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block break-all text-sm text-cyan-700 underline decoration-cyan-300 underline-offset-4 hover:text-cyan-800"
                >
                  {liveUrl}
                </a>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onCopyUrl}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={onOpenUrl}
                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950"
                >
                  Open live site
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default DeploymentModal
