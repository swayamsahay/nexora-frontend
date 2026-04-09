import API from './api'

function normalizeProjects(payload) {
  const projects = payload?.projects || payload?.data?.projects || payload?.data || payload
  return Array.isArray(projects) ? projects : []
}

function normalizeProject(payload) {
  return payload?.project || payload?.data?.project || payload?.data || payload || null
}

export async function createProject(input) {
  const response = await API.post('/api/projects', input)
  return normalizeProject(response?.data)
}

export async function getProjects() {
  const response = await API.get('/api/projects')
  return normalizeProjects(response?.data)
}

export async function getProjectById(projectId) {
  const response = await API.get(`/api/projects/${projectId}`)
  return normalizeProject(response?.data)
}
