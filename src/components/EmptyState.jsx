function EmptyState({ title = 'Nothing here yet', message = 'No data available.', action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm text-slate-600">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mt-2 max-w-xl leading-6 text-slate-600">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export default EmptyState
