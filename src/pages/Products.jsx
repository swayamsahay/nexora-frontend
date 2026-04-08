import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import { useOwnerData } from '../hooks/useOwnerData'
import { formatCurrency } from '../utils/dashboard'

function Products() {
	const { products, loading, error, refreshProducts } = useOwnerData()

	return (
		<div className="space-y-6">
			<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
				<div className="flex items-center justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Catalog</p>
						<h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Products</h2>
						<p className="mt-2 text-sm text-slate-600">Monitor stock, pricing, and descriptions from a clean inventory board.</p>
					</div>
					<button type="button" onClick={refreshProducts} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Refresh</button>
				</div>
			</section>

			{loading ? <LoadingState message="Loading products..." /> : null}
			{error ? <ErrorState message={error} action={<button type="button" onClick={refreshProducts} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Try again</button>} /> : null}

			{!loading && !error && products.length === 0 ? (
				<EmptyState title="No products yet" message="Create products from the dashboard to see them appear here." />
			) : null}

			{!loading && !error && products.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{products.map((product) => {
						const stock = Number(product.stock || 0)

						return (
							<article key={product._id || product.id || product.name} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-lg font-semibold text-slate-950">{product.name}</p>
										<p className="mt-1 text-sm leading-6 text-slate-600">{product.description || 'No description added yet.'}</p>
									</div>
									<span className={`rounded-full px-3 py-1 text-xs font-semibold ${stock > 5 ? 'bg-emerald-50 text-emerald-700' : stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
										{stock > 5 ? 'Healthy' : stock > 0 ? 'Low stock' : 'Sold out'}
									</span>
								</div>

								<div className="mt-5 grid gap-3 sm:grid-cols-2">
									<div className="rounded-2xl bg-slate-50 p-4">
										<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Price</p>
										<p className="mt-1 text-lg font-semibold text-slate-950">{formatCurrency(product.price)}</p>
									</div>
									<div className="rounded-2xl bg-slate-50 p-4">
										<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Stock</p>
										<p className="mt-1 text-lg font-semibold text-slate-950">{stock}</p>
									</div>
								</div>
							</article>
						)
					})}
				</div>
			) : null}
		</div>
	)
}

export default Products