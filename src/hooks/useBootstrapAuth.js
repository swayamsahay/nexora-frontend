import { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'

export function useBootstrapAuth() {
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth)

  useEffect(() => {
    bootstrapAuth()
  }, [bootstrapAuth])
}
