import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'

function ForgotPassword() {
	const [email, setEmail] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async (event) => {
		event.preventDefault()

		if (!email.trim()) {
			setError('Email is required.')
			toast.error('Email is required')
			return
		}

		setError('')
		setIsLoading(true)

		setTimeout(() => {
			toast.success(`Reset link sent to ${email}`)
			setIsLoading(false)
		}, 700)
	}

	return (
		<main className="min-h-[calc(100vh-72px)] bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-12">
			<div className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
				<h1 className="text-2xl font-semibold tracking-tight text-slate-950">Forgot password</h1>
				<p className="mt-2 text-sm text-slate-600">Enter your email and we will send a reset link.</p>

				<form onSubmit={handleSubmit} className="mt-6 space-y-4">
					<div>
						<label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
						<input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400" />
					</div>

					<button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
						{isLoading ? 'Sending...' : 'Send Reset Link'}
					</button>
				</form>

				{error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

				<p className="mt-5 text-sm text-slate-600">Back to <Link to="/login" className="font-semibold text-slate-950 hover:text-slate-700">Login</Link></p>
			</div>
		</main>
	)
}

export default ForgotPassword