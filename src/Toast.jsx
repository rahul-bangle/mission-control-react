// ============================================================
// mission-control-react/src/Toast.jsx
// Toast notifications — Phase 7.8
// ============================================================
import { useState, useEffect, createContext, useContext } from 'react'

const ToastContext = createContext()
let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type, duration }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className="px-4 py-3 rounded-lg text-[11px] font-mono flex items-center gap-3 min-w-[280px] shadow-lg"
            style={{
              background: t.type === 'success' ? '#0a2a0a' : t.type === 'error' ? '#2a0a0a' : t.type === 'warning' ? '#2a200a' : '#111111',
              border: `1px solid ${t.type === 'success' ? '#22c55e' : t.type === 'error' ? '#ef4444' : t.type === 'warning' ? '#f59e0b' : '#333'}`,
              color: t.type === 'success' ? '#22c55e' : t.type === 'error' ? '#ef4444' : t.type === 'warning' ? '#f59e0b' : '#fff',
            }}
            onClick={() => removeToast(t.id)}>
            <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : t.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <span className="flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="text-[8px]" style={{ color: '#666' }}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() { return useContext(ToastContext) }
export function toast(message, type, duration) { 
  // Global toast accessor without hook (for store callbacks)
  window._missionControlToast?.(message, type, duration)
}
