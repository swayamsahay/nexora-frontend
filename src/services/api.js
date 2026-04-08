import axios from 'axios'
import { clearToken, getToken } from '../utils/auth'
import { getApiErrorMessage } from '../utils/apiError'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: apiBaseUrl,
})

export const generateStore = (prompt) =>
	axios.post('/api/ai/generate-store', { prompt })

export const generateDescription = (data) =>
	axios.post('/api/ai/generate-description', data)

api.interceptors.request.use(
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

api.interceptors.response.use(
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

export default api
