// ============================================================
// mission-control-react/src/useKeyboard.js
// Keyboard shortcuts — Phase 7.7
// ============================================================
import { useEffect, useRef } from 'react'

const shortcuts = {}

export function registerShortcut(key, fn, desc) {
  shortcuts[key.toLowerCase()] = { fn, desc }
}

export function useKeyboard(shortcutsMap) {
  const fnRef = useRef(shortcutsMap)
  fnRef.current = shortcutsMap

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return
      const key = e.key.toLowerCase()
      const combo = `${e.ctrlKey ? 'ctrl+' : ''}${e.metaKey ? 'meta+' : ''}${key}`
      if (fnRef.current[key]) { e.preventDefault(); fnRef.current[key]() }
      else if (fnRef.current[combo]) { e.preventDefault(); fnRef.current[combo]() }
      // Alt+number for screen navigation
      if (e.altKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault()
        const screenIdx = parseInt(e.key) - 1
        const screens = ['tasks', 'calendar', 'projects', 'memories', 'docs', 'team', 'system']
        if (fnRef.current['navigate'] && screens[screenIdx]) {
          fnRef.current['navigate'](screens[screenIdx])
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}

export function getShortcutsList() {
  return Object.entries(shortcuts).map(([key, { desc }]) => ({ key, desc }))
}
