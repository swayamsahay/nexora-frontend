import API from './api'

export const generateStore = (prompt) =>
  API.post('/api/ai/generate-store', { prompt })

export const generateDescription = (data) =>
  API.post('/api/ai/generate-description', data)
