import API from './api'
import { ensureFrontendFiles } from '../utils/frontendFiles'

export async function generateFrontendFromPrompt(prompt) {
  const response = await API.post('/api/ai/generate-frontend', { prompt })
  const files = response?.data?.files || response?.data?.data?.files || []
  return ensureFrontendFiles(files)
}
