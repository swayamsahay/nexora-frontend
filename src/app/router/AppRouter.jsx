import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../guards/ProtectedRoute'
import DashboardLayout from '../layouts/DashboardLayout'
import StudioLayout from '../layouts/StudioLayout'
import Landing from '../../pages/Landing'
import Login from '../../features/auth/LoginPage'
import Signup from '../../features/auth/SignupPage'
import Dashboard from '../../features/dashboard/DashboardPage'
import Studio from '../../features/studio/StudioPage'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route element={<StudioLayout />}>
          <Route path="/studio/:projectId" element={<Studio />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
