import Sidebar from './Sidebar'
import Header from './Header'

function Layout({ children }) {
	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
			<Sidebar />
			<div className="min-h-screen lg:pl-72">
				<Header />
				<main className="px-4 py-6 sm:px-6 lg:px-8">
					<div className="mx-auto w-full max-w-7xl">{children}</div>
				</main>
			</div>
		</div>
	)
}

export default Layout