import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { clearToken, isAuthenticated } from '../../utils/auth'
import ThemeToggle from '../common/ThemeToggle'

const titleMap = {
	'/dashboard': 'Dashboard',
	'/stores': 'Stores',
	'/products': 'Products',
	'/orders': 'Orders',
	'/analytics': 'Analytics',
	'/builder': 'Builder',
	'/create-store': 'Create Store',
}

const subtitleMap = {
	'/dashboard': 'Overview of your revenue, orders, and inventory health.',
	'/stores': 'Store settings, brand status, and publication controls.',
	'/products': 'Track catalog health and product availability.',
	'/orders': 'Monitor customer orders and fulfillment status.',
	'/analytics': 'Revenue and performance trends at a glance.',
	'/builder': 'Shape your storefront layout before publishing.',
	'/create-store': 'Create your first store and start selling.',
}

function Header() {
	const location = useLocation()
	const navigate = useNavigate()

	const currentPath = useMemo(() => location.pathname, [location.pathname])
	const pageTitle = titleMap[currentPath] || 'Dashboard'
	const pageSubtitle = subtitleMap[currentPath] || 'Manage your storefront from one workspace.'

	const handleLogout = () => {
		clearToken()
		toast.success('Logged out successfully')
		navigate('/login')
	}

	return (
		<header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
			<div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Nexora workspace</p>
						<h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{pageTitle}</h1>
						<p className="mt-1 text-sm text-slate-600">{pageSubtitle}</p>
					</div>

					<div className="flex items-center gap-3">
						<ThemeToggle />
						{isAuthenticated() ? (
							<>
								<button
									type="button"
									onClick={() => navigate('/create-store')}
									className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
								>
									Create store
								</button>
								<button
									type="button"
									onClick={handleLogout}
									className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800"
								>
									Logout
								</button>
							</>
						) : null}
					</div>
				</div>

				<div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
					{['/dashboard', '/stores', '/products', '/orders', '/analytics', '/builder'].map((path) => (
						<button
							key={path}
							type="button"
							onClick={() => navigate(path)}
							className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
								currentPath === path
									? 'bg-slate-950 text-white'
									: 'bg-slate-100 text-slate-600 hover:bg-slate-200'
								}`}
						>
							{titleMap[path]}
						</button>
					))}
				</div>
			</div>
		</header>
	)
}

export default Header