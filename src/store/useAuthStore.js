import { create } from 'zustand'
import { getMe } from '../services/authService'
import { clearToken, getToken, setToken } from '../utils/auth'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: getToken(),
  isBootstrapping: false,

  setAuth: ({ user, token }) => {
    if (token) {
      setToken(token)
    }

    set((prev) => ({
      user: user ?? prev.user,
      token: token ?? prev.token,
    }))
  },

  logout: () => {
    clearToken()
    set({ user: null, token: null })
  },

  bootstrapAuth: async () => {
    const token = get().token || getToken()

    if (!token) {
      set({ user: null, token: null, isBootstrapping: false })
      return
    }

    set({ token, isBootstrapping: true })

    try {
      const user = await getMe()
      set({ user, token })
    } catch (error) {
      console.error('[Auth] bootstrapAuth failed', error)
      clearToken()
      set({ user: null, token: null })
    } finally {
      set({ isBootstrapping: false })
    }
  },
}))
