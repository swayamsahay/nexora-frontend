import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

function Landing() {
	const navigate = useNavigate()
	const token = useAuthStore((state) => state.token)

	const handleGetStarted = () => {
		navigate(token ? '/dashboard' : '/login')
	}

	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.16),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-12">
			<div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
				<section className="rounded-[2rem] border border-slate-200 bg-white/80 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Nexora Phase 1</p>
					<h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Stable SaaS foundation for auth, projects, and studio.</h1>
					<p className="mt-4 text-base leading-7 text-slate-600">Sign up, create projects, and open a focused studio with Prompt, Code, and Preview tabs.</p>

					<div className="mt-8 flex flex-wrap gap-3">
						<button type="button" onClick={handleGetStarted} className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800">{token ? 'Open Dashboard' : 'Get Started'}</button>
						<button type="button" onClick={() => navigate('/signup')} className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Create account</button>
					</div>
				</section>

				<section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
					<p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">What you get</p>
					<ul className="mt-5 space-y-3 text-sm text-slate-200">
						<li>JWT-based auth flow with protected routes</li>
						<li>Project dashboard with create + list + open</li>
						<li>Studio tabs: Prompt, Code, Preview</li>
						<li>Stable API integration via /api/auth/* and /api/projects/*</li>
					</ul>
				</section>
			</div>
		</main>
	)
}

export default Landing