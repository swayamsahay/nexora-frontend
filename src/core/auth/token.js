const TOKEN_KEY = 'token'

export function getToken() {
  if (typeof window === 'undefined') return null

  try {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return null
    return token
  } catch (error) {
    console.error('[Auth] Failed to read token from storage', error)
    return null
  }
}

export function setToken(token) {
  if (typeof window === 'undefined' || !token) return

  try {
    localStorage.setItem(TOKEN_KEY, token)
    console.log('[Auth] Token stored')
  } catch (error) {
    console.error('[Auth] Failed to persist token', error)
  }
}

export function clearToken() {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(TOKEN_KEY)
    console.log('[Auth] Token cleared')
  } catch (error) {
    console.error('[Auth] Failed to clear token', error)
  }
}

export function isAuthenticated() {
  const authenticated = Boolean(getToken())
  console.log('[Auth] isAuthenticated:', authenticated)
  return authenticated
}
