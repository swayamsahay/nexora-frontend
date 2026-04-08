import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import EmptyState from '../components/EmptyState'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import MetricCard from '../components/dashboard/MetricCard'
import { useOwnerData } from '../hooks/useOwnerData'
import { buildTrendSeries, formatCurrency, formatCompactNumber } from '../utils/dashboard'

function Analytics() {
	const { products, orders, analytics, loading, error, refresh } = useOwnerData()
	const series = buildTrendSeries(orders)

	const hasSeries = series.length > 0

	return (
		<div className="space-y-6">
			<section className="grid gap-4 xl:grid-cols-3">
				<MetricCard label="Revenue" value={formatCurrency(analytics?.totalRevenue || 0)} note="Aggregate paid revenue" tone="cyan" />
				<MetricCard label="Orders" value={formatCompactNumber(analytics?.totalOrders || orders.length || 0)} note="All captured orders" tone="emerald" />
				<MetricCard label="Products" value={formatCompactNumber(analytics?.productCount || products.length || 0)} note="Catalog size" tone="amber" />
			</section>

			<div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Performance</p>
					<h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Analytics dashboard</h2>
				</div>
				<button type="button" onClick={refresh} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Refresh</button>
			</div>

			{loading ? <LoadingState message="Loading analytics..." /> : null}
			{error ? <ErrorState message={error} action={<button type="button" onClick={refresh} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Try again</button>} /> : null}

			{!loading && !error ? (
				<div className="grid gap-6 xl:grid-cols-2">
					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Revenue over time</p>
								<h3 className="mt-2 text-xl font-semibold text-slate-950">Trend line</h3>
							</div>
						</div>
						<div className="mt-6 h-80">
							{hasSeries ? (
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
								<EmptyState title="No trend data yet" message="Revenue chart will populate once orders are placed." />
							)}
						</div>
					</div>

					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Orders per day</p>
							<h3 className="mt-2 text-xl font-semibold text-slate-950">Order flow</h3>
						</div>
						<div className="mt-6 h-80">
							{hasSeries ? (
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
								<EmptyState title="No orders yet" message="This chart will show daily order counts when customers start buying." />
							)}
						</div>
					</div>
				</div>
			) : null}
		</div>
	)
}

export default Analytics