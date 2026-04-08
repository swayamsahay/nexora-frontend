import { NavLink } from 'react-router-dom'

const navItems = [
	{ to: '/dashboard', label: 'Dashboard' },
	{ to: '/stores', label: 'Stores' },
	{ to: '/products', label: 'Products' },
	{ to: '/orders', label: 'Orders' },
	{ to: '/analytics', label: 'Analytics' },
	{ to: '/builder', label: 'Builder' },
]

function Sidebar() {
	return (
		<aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-white/10 bg-slate-950/95 px-5 py-6 text-slate-100 shadow-2xl shadow-slate-950/40 backdrop-blur-xl lg:flex lg:flex-col">
			<div className="flex items-center gap-3 px-1">
				<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-sm font-black text-white shadow-lg shadow-cyan-500/30">
					N
				</div>
				<div>
					<p className="text-lg font-semibold tracking-tight text-white">Nexora</p>
					<p className="text-xs text-slate-400">SaaS commerce platform</p>
				</div>
			</div>

			<nav className="mt-10 space-y-2">
				{navItems.map((item) => (
					<NavLink
						key={item.to}
						to={item.to}
						className={({ isActive }) =>
							`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition ${
								isActive
									? 'border-cyan-400/40 bg-white/10 text-white shadow-lg shadow-cyan-500/10'
									: 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
								}`
						}
					>
						<span>{item.label}</span>
						<span className="h-2 w-2 rounded-full bg-cyan-300/80" />
					</NavLink>
				))}
			</nav>

			<div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
				<p className="text-xs uppercase tracking-[0.24em] text-slate-500">Workspace</p>
				<p className="mt-2 text-base font-semibold text-white">Production dashboard</p>
				<p className="mt-2 leading-6 text-slate-400">Manage stores, products, orders, and analytics from one polished shell.</p>
			</div>
		</aside>
	)
}

export default Sidebar