import apiClient from './client'
import axiosRetry from 'axios-retry'
import { getApiErrorMessage } from '../utils/apiError'
import { clearToken, getToken } from '../auth/token'

let isInitialized = false

function readApiUrlWarnings() {
  const raw = import.meta.env.VITE_API_URL

  if (import.meta.env.DEV) {
    console.log('API URL:', raw)
  }

  if (!raw) {
    console.error('Missing VITE_API_URL environment variable.')
    return
  }

  if (raw !== raw.trim()) {
    console.error('VITE_API_URL has leading/trailing spaces. Remove spaces in Vercel env config.')
  }

  if (raw.endsWith('/')) {
    console.error('VITE_API_URL must not end with a trailing slash.')
  }
}

export function setupApiClient() {
  if (isInitialized) return

  readApiUrlWarnings()
  apiClient.defaults.timeout = 5000

  axiosRetry(apiClient, {
    retries: 2,
    retryDelay: axiosRetry.exponentialDelay,
    onRetry: (retryCount, error, requestConfig) => {
      const status = error?.response?.status
      const retryType = !error?.response ? 'network' : status >= 500 ? 'server' : 'other'
      const delayMs = axiosRetry.exponentialDelay(retryCount)

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('nexora:api-retry', {
            detail: {
              retryCount,
              url: requestConfig?.url,
              retryType,
              delayMs,
            },
          }),
        )
      }
    },
    retryCondition: (error) => {
      const status = error?.response?.status
      return axiosRetry.isNetworkOrIdempotentRequestError(error) || status === 503 || status === 504
    },
  })

  apiClient.interceptors.request.use(
    (config) => {
      const token = getToken()
      config.headers = config.headers || {}

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      if (import.meta.env.DEV) {
        const method = config.method?.toUpperCase?.() || 'GET'
        console.log('[API Request]', method, config.url)
      }

      return config
    },
    (error) => {
      console.error('[API Request Error]', error)
      return Promise.reject(error)
    },
  )

  apiClient.interceptors.response.use(
    (response) => {
      if (import.meta.env.DEV) {
        const method = response?.config?.method?.toUpperCase?.() || 'GET'
        console.log('[API Response]', method, response?.config?.url, response?.status)
      }
      return response
    },
    (error) => {
      const status = error?.response?.status
      const method = error?.config?.method?.toUpperCase?.() || 'GET'
      const url = error?.config?.url

      error.uiMessage = getApiErrorMessage(error)
      console.error('[API Error]', method, url, status || 'NO_RESPONSE', error.uiMessage)

      if (status === 401) {
        clearToken()

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('nexora:auth-expired'))

          if (!window.location.pathname.startsWith('/login')) {
            window.location.assign('/login')
          }
        }
      }

      return Promise.reject(error)
    },
  )

  isInitialized = true
}
