function MetricCard({ label, value, note, tone = 'slate' }) {
	const toneClasses = {
		slate: 'from-slate-950 to-slate-700 text-white',
		cyan: 'from-cyan-500 to-blue-600 text-white',
		emerald: 'from-emerald-500 to-teal-600 text-white',
		amber: 'from-amber-500 to-orange-600 text-white',
	}

	return (
		<div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
			<div className={`rounded-2xl bg-gradient-to-br px-4 py-5 ${toneClasses[tone] || toneClasses.slate}`}>
				<p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">{label}</p>
				<p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
				{note ? <p className="mt-2 text-sm text-white/80">{note}</p> : null}
			</div>
		</div>
	)
}

export default MetricCard