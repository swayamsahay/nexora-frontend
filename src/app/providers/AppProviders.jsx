import AppErrorBoundary from '../../core/errors/AppErrorBoundary'
import { ThemeProvider } from './ThemeProvider'

function AppProviders({ children }) {
  return (
    <AppErrorBoundary>
      <ThemeProvider>{children}</ThemeProvider>
    </AppErrorBoundary>
  )
}

export default AppProviders
