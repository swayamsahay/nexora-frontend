import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DARK_THEME, LIGHT_THEME, THEME_KEY } from '../../core/constants/theme'

const ThemeContext = createContext(null)

function readStoredTheme() {
  if (typeof window === 'undefined') return LIGHT_THEME
  const stored = localStorage.getItem(THEME_KEY)
  return stored === DARK_THEME ? DARK_THEME : LIGHT_THEME
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStoredTheme)

  useEffect(() => {
    const root = document.documentElement
    const isDark = theme === DARK_THEME
    root.classList.toggle('dark', isDark)
    root.dataset.theme = theme

    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch (error) {
      console.error('[Theme] Failed to persist theme', error)
    }
  }, [theme])

  const value = useMemo(() => ({
    theme,
    isDark: theme === DARK_THEME,
    setTheme,
    toggleTheme: () => setTheme((currentTheme) => (currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME)),
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
