import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { setupApiClient } from './services/apiClientSetup'

setupApiClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: '16px',
            background: '#0f172a',
            color: '#ffffff',
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
