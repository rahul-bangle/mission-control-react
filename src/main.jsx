import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { StoreProvider } from './StoreContext'
import { ToastProvider } from './Toast'
import './index.css'

// Global toast accessor for store callbacks
window._missionControlToast = (message, type, duration) => {
  window.dispatchEvent(new CustomEvent('toast', { detail: { message, type, duration } }))
}

import { ThemeProvider } from './ThemeContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <ToastProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </ToastProvider>
  </ThemeProvider>
)
