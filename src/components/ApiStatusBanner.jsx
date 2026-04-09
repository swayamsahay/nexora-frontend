import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'

function ApiStatusBanner() {
  const [status, setStatus] = useState('checking')
  const [detail, setDetail] = useState('Checking backend connection...')
  const [retryState, setRetryState] = useState(null)

  const checkApiStatus = useCallback(async () => {
    setStatus('checking')
    setDetail('Checking backend connection...')
    setRetryState(null)

    try {
      console.log('[API Health] Calling GET /api/health')
      const response = await api.get('/api/health', { timeout: 5000 })

      if (response?.data?.status !== 'OK') {
        throw new Error('Invalid health response')
      }

      setStatus('connected')
      setDetail('Backend connected')
      setRetryState(null)
    } catch (err) {
      console.error('[API Health] Health check failed', err)

      setStatus('disconnected')
      const isNetworkIssue = !err?.response || err?.code === 'ECONNABORTED'
      const statusCode = err?.response?.status
      const isServerIssue = typeof statusCode === 'number' && statusCode >= 500

      if (isNetworkIssue || isServerIssue) {
        setRetryState(null)
        setDetail('Unable to connect to server. Please try again later.')
        return
      }

      setRetryState(null)
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
      const retryType = event?.detail?.retryType || 'other'
      const delayMs = event?.detail?.delayMs || 0

      if (url.includes('/api/health')) {
        setRetryState((prev) => {
          if (prev?.attempt === retryCount && prev?.type === retryType) {
            return prev
          }

          return {
            attempt: retryCount,
            type: retryType,
            delayMs,
          }
        })

        setStatus('checking')

        if (retryType === 'network') {
          setDetail(`Network issue. Retrying connection (attempt ${retryCount}/2) in ${Math.ceil(delayMs / 1000)}s...`)
          return
        }

        if (retryType === 'server') {
          setDetail(`Server issue. Retrying connection (attempt ${retryCount}/2) in ${Math.ceil(delayMs / 1000)}s...`)
          return
        }

        setDetail(`Retrying connection (attempt ${retryCount}/2) in ${Math.ceil(delayMs / 1000)}s...`)
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
          <p>
            {detail}
            {retryState ? ` [attempt ${retryState.attempt}/2]` : ''}
          </p>
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