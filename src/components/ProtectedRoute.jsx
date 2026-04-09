import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

function ProtectedRoute({ children }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    console.warn('[Auth] Protected route blocked:', location.pathname)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export default ProtectedRoute
