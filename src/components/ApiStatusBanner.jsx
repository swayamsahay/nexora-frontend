import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'

function ApiStatusBanner() {
  const [status, setStatus] = useState('checking')
  const [detail, setDetail] = useState('Checking backend connection...')

  const checkApiStatus = useCallback(async () => {
    setStatus('checking')
    setDetail('Checking backend connection...')

    try {
      console.log('[API Health] Calling GET /health')
      await api.get('/health', { timeout: 3500 })
      setStatus('connected')
      setDetail('Backend connected')
    } catch (err) {
      console.error('[API Health] Health check failed', err)

      if (err?.response) {
        setStatus('connected')
        setDetail('Backend reachable (health route not available)')
        return
      }

      setStatus('disconnected')
      setDetail('Backend disconnected. Check VITE_API_URL and backend deployment status.')
    }
  }, [])

  useEffect(() => {
    checkApiStatus()

    const intervalId = setInterval(() => {
      checkApiStatus()
    }, 15000)

    return () => clearInterval(intervalId)
  }, [checkApiStatus])

  const isConnected = status === 'connected'
  const isChecking = status === 'checking'

  return (
    <div
      className={`border-b px-4 py-2 text-sm ${
        isConnected
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : isChecking
            ? 'border-amber-200 bg-amber-50 text-amber-800'
            : 'border-red-200 bg-red-50 text-red-800'
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <p className="font-medium">
          {isConnected ? 'API Status: Connected' : isChecking ? 'API Status: Checking...' : 'API Status: Disconnected'}
        </p>
        <div className="flex items-center gap-3">
          <p>{detail}</p>
          <button
            type="button"
            onClick={checkApiStatus}
            disabled={isChecking}
            className="rounded-md border border-current/30 px-2 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChecking ? 'Checking...' : 'Retry'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApiStatusBanner