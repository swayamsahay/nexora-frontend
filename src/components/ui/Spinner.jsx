function Spinner({ className = 'h-5 w-5' }) {
	return <span className={`inline-block animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 ${className}`} />
}

export default Spinner