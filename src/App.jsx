import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Navbar from './components/Navbar.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Stores from './pages/Stores.jsx'
import Products from './pages/Products.jsx'
import Orders from './pages/Orders.jsx'
import Analytics from './pages/Analytics.jsx'
import PublicStore from './pages/PublicStore.jsx'
import CreateStore from './pages/CreateStore.jsx'
import Builder from './pages/Builder.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ApiStatusBanner from './components/ApiStatusBanner.jsx'
import Layout from './components/layout/Layout.jsx'

const protectedPaths = ['/dashboard', '/stores', '/products', '/orders', '/analytics', '/builder', '/create-store']

function App() {
	const location = useLocation()
	const showPublicNavbar = !protectedPaths.some((path) => location.pathname.startsWith(path))

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
			{showPublicNavbar ? <Navbar /> : null}
			<ApiStatusBanner />
			<Routes>
				<Route path="/" element={<Landing />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/forgot-password" element={<ForgotPassword />} />
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<Layout>
								<Dashboard />
							</Layout>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/stores"
					element={
						<ProtectedRoute>
							<Layout>
								<Stores />
							</Layout>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/products"
					element={
						<ProtectedRoute>
							<Layout>
								<Products />
							</Layout>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/orders"
					element={
						<ProtectedRoute>
							<Layout>
								<Orders />
							</Layout>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/analytics"
					element={
						<ProtectedRoute>
							<Layout>
								<Analytics />
							</Layout>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/create-store"
					element={
						<ProtectedRoute>
							<Layout>
								<CreateStore />
							</Layout>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/builder"
					element={
						<ProtectedRoute>
							<Layout>
								<Builder />
							</Layout>
						</ProtectedRoute>
					}
				/>
				<Route path="/store/:slug" element={<PublicStore />} />
			</Routes>
		</div>
	)
}

export default App
