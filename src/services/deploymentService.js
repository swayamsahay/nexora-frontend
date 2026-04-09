import API from './api'

function normalizeDeployment(payload) {
  return payload?.deployment || payload?.data?.deployment || payload?.data || payload || null
}

export async function publishProject(projectId, payload = {}) {
  const response = await API.post(`/api/projects/${projectId}/publish`, payload)
  return normalizeDeployment(response?.data)
}

export async function getDeploymentStatus(projectId, deploymentId) {
  const response = await API.get(`/api/projects/${projectId}/deployment/${deploymentId}`)
  return normalizeDeployment(response?.data)
}

export async function rollbackDeployment(projectId, deploymentId) {
  const response = await API.post(`/api/projects/${projectId}/deployments/${deploymentId}/rollback`)
  return normalizeDeployment(response?.data)
}
