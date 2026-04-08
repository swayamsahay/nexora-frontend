import Spinner from './ui/Spinner'

function LoadingState({ message = 'Loading...' }) {
	return (
		<div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm backdrop-blur">
			<Spinner className="h-4 w-4" />
			<span>{message}</span>
		</div>
	)
}

export default LoadingState
