import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import AppRouter from './app/router/AppRouter'
import ApiStatusBanner from './components/ApiStatusBanner.jsx'
import { useBootstrapAuth } from './hooks/useBootstrapAuth'

function App() {
	useBootstrapAuth()

	useEffect(() => {
		const handleAuthExpired = () => {
			toast.error('Session expired. Please log in again.')
		}

		window.addEventListener('nexora:auth-expired', handleAuthExpired)

		return () => {
			window.removeEventListener('nexora:auth-expired', handleAuthExpired)
		}
	}, [])

	return (
		<div className="min-h-screen bg-slate-50">
			<ApiStatusBanner />
			<AppRouter />
		</div>
	)
}

export default App
