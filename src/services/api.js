import axios from 'axios'
import { clearToken, getToken } from '../utils/auth'
import { getApiErrorMessage } from '../utils/apiError'

const rawApiUrl = import.meta.env.VITE_API_URL

if (!rawApiUrl) {
  console.error('Missing VITE_API_URL environment variable')
}

const normalizedApiUrl = rawApiUrl?.replace(/\/+$/, '')
const apiBaseUrl = normalizedApiUrl
  ? (normalizedApiUrl.endsWith('/api') ? normalizedApiUrl : `${normalizedApiUrl}/api`)
  : undefined

const API = axios.create({
  baseURL: apiBaseUrl,
})

export const generateStore = (prompt) =>
  API.post('/ai/generate-store', { prompt })

export const generateDescription = (data) =>
  API.post('/ai/generate-description', data)

API.interceptors.request.use(
  (config) => {
    const token = getToken()

    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status

    if (status === 401) {
		clearToken()

		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('nexora:auth-expired'))
		}
    }

    error.uiMessage = getApiErrorMessage(error)
    console.error('[API Error]', error?.config?.method?.toUpperCase?.(), error?.config?.url, error.uiMessage)
    return Promise.reject(error)
  },
)

export default API
