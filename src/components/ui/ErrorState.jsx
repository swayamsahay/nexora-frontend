function ErrorState({ title = 'Something went wrong', message, action }) {
	return (
		<div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-sm text-rose-900 shadow-sm">
			<p className="text-base font-semibold">{title}</p>
			{message ? <p className="mt-2 text-rose-700">{message}</p> : null}
			{action ? <div className="mt-4">{action}</div> : null}
		</div>
	)
}

export default ErrorState