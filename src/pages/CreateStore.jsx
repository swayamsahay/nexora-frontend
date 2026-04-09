import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'

function CreateStore() {
	const navigate = useNavigate()
	const [name, setName] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [fieldError, setFieldError] = useState('')

	const handleSubmit = async (event) => {
		event.preventDefault()
		setError('')

		if (!name.trim()) {
			setFieldError('Store name is required.')
			return
		}

		setFieldError('')
		setIsLoading(true)

		try {
			await api.post('/api/stores', { name: name.trim() })
			toast.success('Store created successfully')
			navigate('/dashboard')
		} catch (err) {
			const message = err?.uiMessage || 'Could not create store. Please try again.'
			setError(message)
			toast.error(message)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
			<h1 className="text-2xl font-semibold tracking-tight text-slate-950">Create Store</h1>
			<p className="mt-2 text-sm text-slate-600">Start your storefront in one quick step.</p>

			<form onSubmit={handleSubmit} className="mt-6 space-y-4">
				<div>
					<label htmlFor="storeName" className="mb-2 block text-sm font-medium text-slate-700">Store Name</label>
					<input id="storeName" type="text" value={name} onChange={(event) => { setName(event.target.value); setFieldError('') }} className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-slate-400 ${fieldError ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white'}`} />
					{fieldError ? <p className="mt-2 text-xs font-medium text-rose-600">{fieldError}</p> : null}
				</div>

				<button type="submit" disabled={isLoading} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">
					{isLoading ? 'Creating...' : 'Create Store'}
				</button>
			</form>

			{error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
		</div>
	)
}

export default CreateStore