import API from './api'

function readUser(payload) {
  return payload?.user || payload?.data?.user || payload?.data || null
}

export async function signup(payload) {
  const response = await API.post('/api/auth/signup', payload)
  return {
    token: response?.data?.token || response?.data?.data?.token || null,
    user: readUser(response?.data),
  }
}

export async function login(payload) {
  const response = await API.post('/api/auth/login', payload)
  return {
    token: response?.data?.token || response?.data?.data?.token || null,
    user: readUser(response?.data),
  }
}

export async function getMe() {
  const response = await API.get('/api/auth/me')
  return readUser(response?.data)
}
