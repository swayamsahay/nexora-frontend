import EmptyState from '../../EmptyState'
import { formatCurrency } from '../../../utils/dashboard'

function ProductsSection({ section, products = [], onBuy, buyingProductId = null, showCheckout = false, theme = {} }) {
	return (
		<section className="rounded-3xl border p-6" style={{ borderColor: `${theme.accent || '#0f172a'}33`, backgroundColor: '#ffffff' }}>
			<h3 className="text-xl font-semibold" style={{ color: theme.text || '#0f172a' }}>
				{section?.title || 'Products'}
			</h3>
			<p className="mt-2 text-sm" style={{ color: `${theme.text || '#0f172a'}cc` }}>
				{section?.description || 'Discover our latest catalog'}
			</p>

			{products.length === 0 ? (
				<div className="mt-4">
					<EmptyState title="No products yet" message="Add products in dashboard to populate this section." />
				</div>
			) : (
				<div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{products.map((product) => {
						const productId = product._id || product.id

						return (
							<article key={productId || product.name} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
								<p className="text-base font-semibold text-slate-950">{product.name}</p>
								<p className="mt-1 text-sm text-slate-600">{product.description || 'No description available.'}</p>
								<p className="mt-3 text-sm font-semibold text-slate-900">{formatCurrency(product.price)}</p>
								<p className="text-xs text-slate-500">Stock: {product.stock}</p>

								{showCheckout && onBuy ? (
									<button
										type="button"
										onClick={() => onBuy(product)}
										disabled={buyingProductId === productId}
										className="mt-3 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
									>
										{buyingProductId === productId ? 'Processing...' : 'Buy now'}
									</button>
								) : null}
							</article>
						)
					})}
				</div>
			)}
		</section>
	)
}

export default ProductsSection