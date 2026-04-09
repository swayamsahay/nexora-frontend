import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

function ProtectedRoute() {
	const location = useLocation()
	const token = useAuthStore((state) => state.token)
	const isBootstrapping = useAuthStore((state) => state.isBootstrapping)

	if (isBootstrapping) {
		return <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Checking session...</div>
	}

	if (!token) {
		console.warn('[Auth] Protected route blocked:', location.pathname)
		return <Navigate to="/login" replace state={{ from: location.pathname }} />
	}

	return <Outlet />
}

export default ProtectedRoute
