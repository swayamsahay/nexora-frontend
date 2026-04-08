import { Link, NavLink, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { clearToken, isAuthenticated } from '../utils/auth'

function Navbar() {
  const navigate = useNavigate()
  const authenticated = isAuthenticated()

  const handleLogout = () => {
    clearToken()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 text-lg font-bold tracking-tight text-slate-950">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-950/10">
            N
          </span>
          <span>Nexora</span>
        </Link>

        <div className="flex items-center gap-2">
          {authenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/builder"
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-950 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`
                }
              >
                Builder
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
