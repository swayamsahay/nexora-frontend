import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { useOwnerData } from '../hooks/useOwnerData'

function Stores() {
	const navigate = useNavigate()
	const { store, loading, error, refreshStore } = useOwnerData()

	const handleCopySlug = async () => {
		if (!store?.slug) {
			toast.error('Store slug is not available yet')
			return
		}

		await navigator.clipboard.writeText(`${window.location.origin}/store/${store.slug}`)
		toast.success('Store link copied')
	}

	return (
		<div className="space-y-6">
			<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Store overview</p>
						<h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Your store shell</h2>
						<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Keep your storefront details, publication state, and public link in one place.</p>
					</div>
					<div className="flex gap-3">
						<button
							type="button"
							onClick={() => navigate('/create-store')}
							className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
						>
							Create store
						</button>
						<button
							type="button"
							onClick={refreshStore}
							className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
						>
							Refresh
						</button>
					</div>
				</div>
			</section>

			{loading ? <LoadingState message="Loading store data..." /> : null}
			{error ? <ErrorState message={error} action={<button type="button" onClick={refreshStore} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Try again</button>} /> : null}

			{!loading && !error && store ? (
				<div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Public store</p>
								<h3 className="mt-2 text-2xl font-semibold text-slate-950">{store.name}</h3>
								<p className="mt-2 text-sm leading-6 text-slate-600">{store.description || 'Add a short description to tell shoppers what makes your brand different.'}</p>
							</div>
							<span className={`rounded-full px-3 py-1 text-xs font-semibold ${store.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
								{store.isPublished ? 'Published' : 'Draft'}
							</span>
						</div>

						<div className="mt-6 grid gap-4 sm:grid-cols-2">
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Slug</p>
								<p className="mt-2 break-all text-sm font-medium text-slate-900">{store.slug}</p>
							</div>
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Public link</p>
								<p className="mt-2 break-all text-sm font-medium text-slate-900">{window.location.origin}/store/{store.slug}</p>
							</div>
						</div>

						<div className="mt-6 flex flex-wrap gap-3">
							<button type="button" onClick={handleCopySlug} className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Copy public link</button>
							<button type="button" onClick={() => navigate('/builder')} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Open builder</button>
						</div>
					</div>

					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Status</p>
						<div className="mt-4 space-y-4 text-sm text-slate-600">
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Publish state</p>
								<p className="mt-1 text-base font-semibold text-slate-950">{store.isPublished ? 'Live to customers' : 'Hidden from public view'}</p>
							</div>
							<div className="rounded-2xl bg-slate-50 p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Actions</p>
								<p className="mt-1 text-base font-semibold text-slate-950">Use Builder to update theme and layout</p>
							</div>
						</div>
					</div>
				</div>
			) : null}

			{!loading && !error && !store ? (
				<EmptyState
					title="No store yet"
					message="Create a store to unlock the dashboard, analytics, and public storefront."
					action={<button type="button" onClick={() => navigate('/create-store')} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Create store</button>}
				/>
			) : null}
		</div>
	)
}

export default Stores