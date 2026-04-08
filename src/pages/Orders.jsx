import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import { useOwnerData } from '../hooks/useOwnerData'
import { formatCurrency } from '../utils/dashboard'

function Orders() {
	const { orders, loading, error, refreshOrders } = useOwnerData()

	const paidCount = orders.filter((order) => ['paid', 'shipped', 'delivered'].includes(order.status)).length

	return (
		<div className="space-y-6">
			<section className="grid gap-4 md:grid-cols-3">
				{[
					{ label: 'Total orders', value: orders.length },
					{ label: 'Paid orders', value: paidCount },
					{ label: 'Pending orders', value: orders.filter((order) => order.status === 'pending').length },
				].map((metric) => (
					<div key={metric.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{metric.label}</p>
						<p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{metric.value}</p>
					</div>
				))}
			</section>

			<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
				<div className="flex items-center justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Orders</p>
						<h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Recent orders</h2>
					</div>
					<button type="button" onClick={refreshOrders} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Refresh</button>
				</div>
			</div>

			{loading ? <LoadingState message="Loading orders..." /> : null}
			{error ? <ErrorState message={error} action={<button type="button" onClick={refreshOrders} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Try again</button>} /> : null}

			{!loading && !error && orders.length === 0 ? (
				<EmptyState title="No orders yet" message="Orders will appear here after customers complete payments." />
			) : null}

			{!loading && !error && orders.length > 0 ? (
				<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
					<table className="min-w-full divide-y divide-slate-200 text-sm">
						<thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
							<tr>
								<th className="px-6 py-4">Product</th>
								<th className="px-6 py-4">Quantity</th>
								<th className="px-6 py-4">Amount</th>
								<th className="px-6 py-4">Status</th>
								<th className="px-6 py-4">Created</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 bg-white">
							{orders.map((order) => (
								<tr key={order._id || order.id || `${order.productId}-${order.createdAt}`}>
									<td className="px-6 py-4 font-medium text-slate-950">{order.productId}</td>
									<td className="px-6 py-4 text-slate-600">{order.quantity}</td>
									<td className="px-6 py-4 text-slate-600">{formatCurrency(order.totalAmount)}</td>
									<td className="px-6 py-4">
										<span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.status === 'paid' || order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' : order.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
											{order.status}
										</span>
									</td>
									<td className="px-6 py-4 text-slate-500">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown'}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : null}
		</div>
	)
}

export default Orders