import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { setToken } from '../utils/auth'

function Login() {
	const navigate = useNavigate()
	const location = useLocation()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [formErrors, setFormErrors] = useState({})

	const handleSubmit = async (event) => {
		event.preventDefault()
		setError('')

		const nextErrors = {}
		const trimmedEmail = email.trim()
		const trimmedPassword = password.trim()

		if (!trimmedEmail) nextErrors.email = 'Email is required.'
		if (!trimmedPassword) nextErrors.password = 'Password is required.'

		setFormErrors(nextErrors)

		if (Object.keys(nextErrors).length > 0) {
			return
		}

		setIsLoading(true)

		try {
			const response = await api.post('/auth/login', { email: trimmedEmail, password: trimmedPassword })
			const token = response?.data?.token || response?.data?.data?.token || response?.data?.accessToken || response?.data?.data?.accessToken

			if (!token) {
				throw new Error('Token not found in response')
			}

			setToken(token)
			toast.success('Welcome back')
			navigate(location.state?.from || '/dashboard')
		} catch (err) {
			const message = err?.uiMessage || err?.message || 'Login failed. Please check your credentials.'
			setError(message)
			toast.error(message)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<main className="min-h-[calc(100vh-72px)] bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-12">
			<div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
				<section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Nexora</p>
					<h1 className="mt-4 text-4xl font-semibold tracking-tight">Sign in to your commerce workspace.</h1>
					<p className="mt-4 max-w-md text-sm leading-6 text-slate-300">Manage products, orders, analytics, and your public storefront from a single production-ready dashboard.</p>
				</section>

				<section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
					<h2 className="text-2xl font-semibold tracking-tight text-slate-950">Login</h2>
					<p className="mt-2 text-sm text-slate-600">Use your account to continue managing your store.</p>

					<form onSubmit={handleSubmit} className="mt-6 space-y-4">
						<div>
							<label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
							<input id="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setFormErrors((prev) => ({ ...prev, email: '' })) }} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-slate-400 ${formErrors.email ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white'}`} autoComplete="email" />
							{formErrors.email ? <p className="mt-2 text-xs font-medium text-rose-600">{formErrors.email}</p> : null}
						</div>

						<div>
							<label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
							<input id="password" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setFormErrors((prev) => ({ ...prev, password: '' })) }} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-slate-400 ${formErrors.password ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white'}`} autoComplete="current-password" />
							{formErrors.password ? <p className="mt-2 text-xs font-medium text-rose-600">{formErrors.password}</p> : null}
						</div>

						<button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
							{isLoading ? 'Logging in...' : 'Login'}
						</button>
					</form>

					<div className="mt-5 flex items-center justify-between gap-4 text-sm">
						<Link to="/signup" className="font-semibold text-slate-950 hover:text-slate-700">Create account</Link>
						<Link to="/forgot-password" className="font-semibold text-slate-600 hover:text-slate-950">Forgot password?</Link>
					</div>

					{error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
				</section>
			</div>
		</main>
	)
}

export default Login