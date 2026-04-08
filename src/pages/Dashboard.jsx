import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api, { generateDescription } from '../services/api'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import MetricCard from '../components/dashboard/MetricCard'
import { useOwnerData } from '../hooks/useOwnerData'
import { buildProductStatusBreakdown, buildTrendSeries, formatCurrency, formatCompactNumber } from '../utils/dashboard'

function Dashboard() {
	const navigate = useNavigate()
	const { store, products, orders, analytics, loading, error, refresh } = useOwnerData()

	const [productForm, setProductForm] = useState({
		name: '',
		category: '',
		price: '',
		stock: '',
		description: '',
	})
	const [formErrors, setFormErrors] = useState({})
	const [isCreatingProduct, setIsCreatingProduct] = useState(false)
	const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
	const [deletingProductId, setDeletingProductId] = useState(null)

	const series = useMemo(() => buildTrendSeries(orders), [orders])
	const productBreakdown = useMemo(() => buildProductStatusBreakdown(products), [products])

	const totalRevenue = analytics?.totalRevenue ?? 0
	const totalOrders = analytics?.totalOrders ?? orders.length
	const totalProducts = analytics?.productCount ?? products.length

	const handleProductInputChange = (event) => {
		const { name, value } = event.target
		setProductForm((prev) => ({ ...prev, [name]: value }))
		setFormErrors((prev) => ({ ...prev, [name]: '' }))
	}

	const validateProduct = () => {
		const nextErrors = {}
		const name = productForm.name.trim()
		const description = productForm.description.trim()
		const price = Number(productForm.price)
		const stock = Number(productForm.stock)

		if (!name) nextErrors.name = 'Product name is required.'
		if (!description) nextErrors.description = 'Product description is required.'
		if (!Number.isFinite(price) || price <= 0) nextErrors.price = 'Price must be greater than zero.'
		if (!Number.isFinite(stock) || stock < 0) nextErrors.stock = 'Stock cannot be negative.'

		setFormErrors(nextErrors)
		return {
			isValid: Object.keys(nextErrors).length === 0,
			name,
			description,
			price,
			stock,
		}
	}

	const handleGenerateDescription = async () => {
		const name = productForm.name.trim()
		const category = productForm.category.trim()

		if (!name || !category) {
			toast.error('Product name and category are required to generate a description.')
			return
		}

		try {
			setIsGeneratingDescription(true)
			const res = await generateDescription({ name, category })
			setProductForm((prev) => ({
				...prev,
				description: res?.data?.data?.description || '',
			}))
			setFormErrors((prev) => ({ ...prev, description: '' }))
		} catch (err) {
			console.error(err)
			toast.error(err?.uiMessage || 'Could not generate description.')
		} finally {
			setIsGeneratingDescription(false)
		}
	}

	const handleCreateProduct = async (event) => {
		event.preventDefault()
		const validation = validateProduct()

		if (!validation.isValid) {
			toast.error('Please fix the highlighted fields.')
			return
		}

		setIsCreatingProduct(true)

		try {
			await api.post('/products', {
				name: validation.name,
				price: validation.price,
				stock: validation.stock,
				description: validation.description,
			})

			setProductForm({ name: '', category: '', price: '', stock: '', description: '' })
			setFormErrors({})
			await refresh()
			toast.success('Product created')
		} catch (err) {
			toast.error(err?.uiMessage || 'Could not create product.')
		} finally {
			setIsCreatingProduct(false)
		}
	}

	const handleDeleteProduct = async (productId) => {
		setDeletingProductId(productId)

		try {
			await api.delete(`/products/${productId}`)
			await refresh()
			toast.success('Product deleted')
		} catch (err) {
			toast.error(err?.uiMessage || 'Could not delete product.')
		} finally {
			setDeletingProductId(null)
		}
	}

	const hasStore = Boolean(store)
	const isEmptyWorkspace = !loading && !error && !hasStore

	return (
		<div className="space-y-6">
			<section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
				<div className="grid gap-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-7 text-white lg:grid-cols-[1.4fr_0.6fr] lg:px-8">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">Overview</p>
						<h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">A clean command center for your store.</h2>
						<p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Track revenue, manage products, and monitor orders from a single workspace built for daily use.</p>
					</div>

					<div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
							<p className="text-xs uppercase tracking-[0.2em] text-white/50">Store</p>
							<p className="mt-2 text-lg font-semibold">{store?.name || 'No store yet'}</p>
							<p className="mt-1 text-sm text-white/70">{store?.isPublished ? 'Published' : 'Draft'}</p>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
							<p className="text-xs uppercase tracking-[0.2em] text-white/50">Orders</p>
							<p className="mt-2 text-lg font-semibold">{formatCompactNumber(totalOrders)}</p>
							<p className="mt-1 text-sm text-white/70">Total order count</p>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
							<p className="text-xs uppercase tracking-[0.2em] text-white/50">Revenue</p>
							<p className="mt-2 text-lg font-semibold">{formatCurrency(totalRevenue)}</p>
							<p className="mt-1 text-sm text-white/70">Paid revenue</p>
						</div>
					</div>
				</div>
			</section>

			<section className="grid gap-4 xl:grid-cols-3">
				<MetricCard label="Total Revenue" value={formatCurrency(totalRevenue)} note="From paid and fulfilled orders" tone="cyan" />
				<MetricCard label="Total Orders" value={formatCompactNumber(totalOrders)} note="Captured customer orders" tone="emerald" />
				<MetricCard label="Total Products" value={formatCompactNumber(totalProducts)} note="Current catalog size" tone="amber" />
			</section>

			{loading ? <LoadingState message="Loading dashboard data..." /> : null}
			{error ? <ErrorState message={error} action={<button type="button" onClick={refresh} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Retry</button>} /> : null}
			{isEmptyWorkspace ? (
				<EmptyState
					title="No store connected"
					message="Create a store to unlock analytics, product management, and the public storefront."
					action={<button type="button" onClick={() => navigate('/create-store')} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Create store</button>}
				/>
			) : null}

			{!loading && !error && hasStore ? (
				<div className="grid gap-6 xl:grid-cols-2">
					<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Revenue over time</p>
								<h3 className="mt-2 text-xl font-semibold text-slate-950">Trend line</h3>
							</div>
						</div>
						<div className="mt-6 h-80">
							{series.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={series}>
										<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
										<XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
										<YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
										<Tooltip formatter={(value) => formatCurrency(value)} />
										<Legend />
										<Line type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={3} dot={{ r: 4 }} />
									</LineChart>
								</ResponsiveContainer>
							) : (
								<EmptyState title="No trend data yet" message="Revenue data will appear after orders are placed." />
							)}
						</div>
					</section>

					<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Orders per day</p>
							<h3 className="mt-2 text-xl font-semibold text-slate-950">Order flow</h3>
						</div>
						<div className="mt-6 h-80">
							{series.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={series}>
										<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
										<XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
										<YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} allowDecimals={false} />
										<Tooltip />
										<Legend />
										<Bar dataKey="orders" fill="#2563eb" radius={[10, 10, 0, 0]} />
									</BarChart>
								</ResponsiveContainer>
							) : (
								<EmptyState title="No orders yet" message="This chart will fill in as customers place orders." />
							)}
						</div>
					</section>
				</div>
			) : null}

			{!loading && !error && hasStore ? (
				<div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
					<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Product health</p>
								<h3 className="mt-2 text-xl font-semibold text-slate-950">Inventory mix</h3>
							</div>
						</div>
						<div className="mt-5 space-y-3">
							{productBreakdown.map((item) => (
								<div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
									<span className="font-medium text-slate-700">{item.label}</span>
									<span className="font-semibold text-slate-950">{item.value}</span>
								</div>
							))}
						</div>
					</section>

					<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Store</p>
								<h3 className="mt-2 text-xl font-semibold text-slate-950">{store.name}</h3>
								<p className="mt-1 text-sm text-slate-600">{store.description || 'Add a short description from Store settings.'}</p>
							</div>
							<button type="button" onClick={() => navigate('/builder')} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Open builder</button>
						</div>
						<div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
							<p className="font-semibold text-slate-950">Public link</p>
							<p className="mt-2 break-all">{window.location.origin}/store/{store.slug}</p>
						</div>
					</section>
				</div>
			) : null}

			{!loading && !error && hasStore ? (
				<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
					<div className="flex items-center justify-between gap-4">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Add product</p>
							<h3 className="mt-2 text-xl font-semibold text-slate-950">Create a new catalog item</h3>
						</div>
						<p className="text-sm text-slate-500">{products.length} products in catalog</p>
					</div>

					<form onSubmit={handleCreateProduct} className="mt-6 grid gap-4 md:grid-cols-2">
						<div>
							<label htmlFor="productName" className="mb-2 block text-sm font-medium text-slate-700">Name</label>
							<input id="productName" name="name" type="text" value={productForm.name} onChange={handleProductInputChange} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-slate-400 ${formErrors.name ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white'}`} />
							{formErrors.name ? <p className="mt-2 text-xs font-medium text-rose-600">{formErrors.name}</p> : null}
						</div>

						<div>
							<label htmlFor="productCategory" className="mb-2 block text-sm font-medium text-slate-700">Category</label>
							<input id="productCategory" name="category" type="text" value={productForm.category} onChange={handleProductInputChange} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-slate-400 ${formErrors.category ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white'}`} placeholder="e.g. Footwear, Accessories" />
							{formErrors.category ? <p className="mt-2 text-xs font-medium text-rose-600">{formErrors.category}</p> : null}
						</div>

						<div>
							<label htmlFor="productPrice" className="mb-2 block text-sm font-medium text-slate-700">Price</label>
							<input id="productPrice" name="price" type="number" min="0" step="0.01" value={productForm.price} onChange={handleProductInputChange} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-slate-400 ${formErrors.price ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white'}`} />
							{formErrors.price ? <p className="mt-2 text-xs font-medium text-rose-600">{formErrors.price}</p> : null}
						</div>

						<div>
							<label htmlFor="productStock" className="mb-2 block text-sm font-medium text-slate-700">Stock</label>
							<input id="productStock" name="stock" type="number" min="0" value={productForm.stock} onChange={handleProductInputChange} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-slate-400 ${formErrors.stock ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white'}`} />
							{formErrors.stock ? <p className="mt-2 text-xs font-medium text-rose-600">{formErrors.stock}</p> : null}
						</div>

						<div>
							<label htmlFor="productDescription" className="mb-2 block text-sm font-medium text-slate-700">Description</label>
							<textarea id="productDescription" name="description" value={productForm.description} onChange={handleProductInputChange} className={`min-h-28 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-slate-400 ${formErrors.description ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white'}`} />
							{formErrors.description ? <p className="mt-2 text-xs font-medium text-rose-600">{formErrors.description}</p> : null}
							<button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDescription || !productForm.name.trim() || !productForm.category.trim()} className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
								{isGeneratingDescription ? 'Generating...' : 'Generate Description'}
							</button>
						</div>

						<div className="md:col-span-2">
							<button type="submit" disabled={isCreatingProduct || !hasStore} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
								{isCreatingProduct ? 'Creating product...' : 'Add product'}
							</button>
						</div>
					</form>
				</section>
			) : null}

			{!loading && !error && products.length > 0 ? (
				<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
					<div className="flex items-center justify-between gap-4">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Catalog list</p>
							<h3 className="mt-2 text-xl font-semibold text-slate-950">Products in your store</h3>
						</div>
					</div>

					<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{products.map((product) => {
							const productId = product.id || product._id
							const stock = Number(product.stock || 0)

							return (
								<article key={productId || product.name} className="rounded-3xl border border-slate-200 bg-slate-50/60 p-5">
									<div className="flex items-start justify-between gap-3">
										<div>
											<p className="text-base font-semibold text-slate-950">{product.name}</p>
											<p className="mt-1 text-sm text-slate-600">{product.description || 'No description added yet.'}</p>
										</div>
										<span className={`rounded-full px-3 py-1 text-xs font-semibold ${stock > 5 ? 'bg-emerald-50 text-emerald-700' : stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
											{stock > 5 ? 'Healthy' : stock > 0 ? 'Low stock' : 'Sold out'}
										</span>
									</div>

									<div className="mt-4 grid grid-cols-2 gap-3 text-sm">
										<div className="rounded-2xl bg-white p-3">
											<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Price</p>
											<p className="mt-1 font-semibold text-slate-950">{formatCurrency(product.price)}</p>
										</div>
										<div className="rounded-2xl bg-white p-3">
											<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Stock</p>
											<p className="mt-1 font-semibold text-slate-950">{stock}</p>
										</div>
									</div>

									{productId ? (
										<button type="button" onClick={() => handleDeleteProduct(productId)} disabled={deletingProductId === productId} className="mt-4 rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60">
											{deletingProductId === productId ? 'Deleting...' : 'Delete product'}
										</button>
									) : null}
								</article>
							)
						})}
					</div>
				</section>
			) : null}

			{!loading && !error && orders.length > 0 ? (
				<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
					<div className="flex items-center justify-between gap-4">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Orders</p>
							<h3 className="mt-2 text-xl font-semibold text-slate-950">Recent customer orders</h3>
						</div>
					</div>

					<div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
						<table className="min-w-full divide-y divide-slate-200 text-sm">
							<thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
								<tr>
									<th className="px-5 py-4">Product</th>
									<th className="px-5 py-4">Quantity</th>
									<th className="px-5 py-4">Amount</th>
									<th className="px-5 py-4">Status</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 bg-white">
								{orders.slice(0, 6).map((order) => (
									<tr key={order.id || order._id || `${order.productId}-${order.createdAt}`}>
										<td className="px-5 py-4 font-medium text-slate-950">{order.productId}</td>
										<td className="px-5 py-4 text-slate-600">{order.quantity}</td>
										<td className="px-5 py-4 text-slate-600">{formatCurrency(order.totalAmount)}</td>
										<td className="px-5 py-4">
											<span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.status === 'paid' || order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' : order.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
												{order.status}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			) : null}
		</div>
	)
}

export default Dashboard