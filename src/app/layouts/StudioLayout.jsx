import { Outlet } from 'react-router-dom'
import ThemeToggle from '../../components/common/ThemeToggle'

function StudioLayout() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-6 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between rounded-3xl border border-slate-200 bg-white/90 px-5 py-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Studio workspace</p>
          <h1 className="text-lg font-semibold text-slate-950 dark:text-slate-100">Visual Builder</h1>
        </div>
        <ThemeToggle />
      </div>

      <main className="mx-auto w-full max-w-7xl py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default StudioLayout
