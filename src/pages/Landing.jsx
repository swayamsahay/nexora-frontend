import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

function Landing() {
	const navigate = useNavigate()

	const handleGetStarted = () => {
		navigate(isAuthenticated() ? '/dashboard' : '/login')
	}

	return (
		<main className="min-h-[calc(100vh-72px)] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.16),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-12">
			<div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
				<section className="max-w-2xl">
					<p className="inline-flex rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm backdrop-blur">Nexora Commerce Cloud</p>
					<h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">Build a modern storefront without fighting your dashboard.</h1>
					<p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">Launch products, manage orders, and publish a polished store experience from a single React workspace designed like a premium SaaS product.</p>

					<div className="mt-8 flex flex-wrap gap-3">
						<button type="button" onClick={handleGetStarted} className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800">Get started</button>
						<button type="button" onClick={() => navigate('/signup')} className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">Create account</button>
					</div>

					<div className="mt-10 grid gap-4 sm:grid-cols-3">
						{[
							['Dashboard-first', 'Manage the business from a single control center.'],
							['Analytics-ready', 'Track orders, revenue, and product health.'],
							['Storefront builder', 'Customize your public store before launch.'],
						].map(([title, description]) => (
							<div key={title} className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
								<p className="text-sm font-semibold text-slate-950">{title}</p>
								<p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
							</div>
						))}
					</div>
				</section>

				<section className="relative">
					<div className="absolute -left-8 top-10 h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl" />
					<div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />
					<div className="relative rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
						<div className="rounded-[1.5rem] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-950/20">
							<p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Dashboard preview</p>
							<div className="mt-4 grid gap-3 sm:grid-cols-3">
								{[
									['Revenue', '$48k'],
									['Orders', '1,284'],
									['Products', '96'],
								].map(([label, value]) => (
									<div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
										<p className="text-xs uppercase tracking-[0.2em] text-white/50">{label}</p>
										<p className="mt-2 text-2xl font-semibold">{value}</p>
									</div>
								))}
							</div>
							<div className="mt-6 rounded-3xl bg-white/5 p-4">
								<div className="grid gap-2 sm:grid-cols-2">
									<div className="h-40 rounded-2xl bg-gradient-to-t from-cyan-500/60 via-cyan-400/20 to-transparent" />
									<div className="h-40 rounded-2xl bg-gradient-to-t from-indigo-500/60 via-indigo-400/20 to-transparent" />
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>
		</main>
	)
}

export default Landing