import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import { setToken } from '../utils/auth'

function getPasswordStrength(password) {
	let score = 0
	if (password.length >= 8) score += 1
	if (/\d/.test(password)) score += 1
	if (/[^A-Za-z0-9]/.test(password)) score += 1
	if (score <= 1) return 'Weak'
	if (score === 2) return 'Medium'
	return 'Strong'
}

function Signup() {
	const navigate = useNavigate()
	const location = useLocation()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState('')
	const [formErrors, setFormErrors] = useState({})
	const [isLoading, setIsLoading] = useState(false)

	const strength = useMemo(() => getPasswordStrength(password), [password])

	const handleSubmit = async (event) => {
		event.preventDefault()
		setError('')

		const nextErrors = {}
		const trimmedEmail = email.trim()
		const trimmedPassword = password.trim()
		const trimmedConfirmPassword = confirmPassword.trim()

		if (!trimmedEmail) nextErrors.email = 'Email is required.'
		if (!trimmedPassword) nextErrors.password = 'Password is required.'
		if (trimmedPassword && trimmedPassword.length < 8) nextErrors.password = 'Use at least 8 characters.'
		if (!trimmedConfirmPassword) nextErrors.confirmPassword = 'Please confirm your password.'
		if (trimmedPassword !== trimmedConfirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'

		setFormErrors(nextErrors)

		if (Object.keys(nextErrors).length > 0) {
			toast.error('Please fix the highlighted fields.')
			return
		}

		setIsLoading(true)

		try {
			const response = await api.post('/auth/register', { email: trimmedEmail, password: trimmedPassword })
			const token = response?.data?.token || response?.data?.data?.token || response?.data?.accessToken || response?.data?.data?.accessToken

			if (token) {
				setToken(token)
			}

			toast.success('Account created successfully')
			navigate(location.state?.from || '/dashboard')
		} catch (err) {
			const message = err?.uiMessage || 'Could not create account. Please try again.'
			setError(message)
			toast.error(message)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<main className="min-h-[calc(100vh-72px)] bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-12">
			<div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
				<section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
					<p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">Nexora onboarding</p>
					<h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Create your account and launch faster.</h1>
					<p className="mt-4 max-w-md text-sm leading-6 text-slate-600">Set up your workspace once, then publish a storefront, manage catalog data, and monitor revenue in one flow.</p>
				</section>

				<section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
					<h2 className="text-2xl font-semibold tracking-tight text-slate-950">Create account</h2>
					<p className="mt-2 text-sm text-slate-600">Start building your store with Nexora.</p>

					<form onSubmit={handleSubmit} className="mt-6 space-y-4">
						<div>
							<label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
							<input id="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setFormErrors((prev) => ({ ...prev, email: '' })) }} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-slate-400 ${formErrors.email ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white'}`} autoComplete="email" />
							{formErrors.email ? <p className="mt-2 text-xs font-medium text-rose-600">{formErrors.email}</p> : null}
						</div>

						<div>
							<label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
							<input id="password" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setFormErrors((prev) => ({ ...prev, password: '' })) }} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-slate-400 ${formErrors.password ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white'}`} autoComplete="new-password" />
							{formErrors.password ? <p className="mt-2 text-xs font-medium text-rose-600">{formErrors.password}</p> : null}
						</div>

						<div>
							<label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
							<input id="confirmPassword" type="password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setFormErrors((prev) => ({ ...prev, confirmPassword: '' })) }} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-slate-400 ${formErrors.confirmPassword ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white'}`} autoComplete="new-password" />
							{formErrors.confirmPassword ? <p className="mt-2 text-xs font-medium text-rose-600">{formErrors.confirmPassword}</p> : null}
						</div>

						<div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
							Password strength: <span className="font-semibold text-slate-950">{password ? strength : 'Weak'}</span>
						</div>

						<button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
							{isLoading ? 'Creating account...' : 'Sign Up'}
						</button>
					</form>

					{error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

					<p className="mt-5 text-sm text-slate-600">Already have an account? <Link to="/login" className="font-semibold text-slate-950 hover:text-slate-700">Login</Link></p>
				</section>
			</div>
		</main>
	)
}

export default Signup