import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'

function ApiStatusBanner() {
  const [status, setStatus] = useState('checking')
  const [detail, setDetail] = useState('Checking backend connection...')

  const checkApiStatus = useCallback(async () => {
    setStatus('checking')
    setDetail('Checking backend connection...')

    try {
      console.log('[API Health] Calling GET /api/health')
      const response = await api.get('/api/health', { timeout: 5000 })

      if (response?.data?.status !== 'OK') {
        throw new Error('Invalid health response')
      }

      setStatus('connected')
      setDetail('Backend connected')
    } catch (err) {
      console.error('[API Health] Health check failed', err)

      setStatus('disconnected')
      if (!err?.response || err?.response?.status === 503 || err?.code === 'ECONNABORTED') {
        setDetail('Server waking up... please wait and retry.')
        return
      }

      setDetail('Backend disconnected. Health check failed. Verify backend and /api/health response.')
    }
  }, [])

  useEffect(() => {
    checkApiStatus()

    const intervalId = setInterval(() => {
      checkApiStatus()
    }, 15000)

    const handleApiRetry = (event) => {
      const url = event?.detail?.url || ''
      const retryCount = event?.detail?.retryCount || 0

      if (url.includes('/api/health')) {
        setStatus('checking')
        setDetail(`Retrying connection (attempt ${retryCount}/2)...`)
      }
    }

    window.addEventListener('nexora:api-retry', handleApiRetry)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('nexora:api-retry', handleApiRetry)
    }
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