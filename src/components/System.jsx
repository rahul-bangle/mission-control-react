import { useState } from 'react'
import { useTheme } from '../ThemeContext'
import { useStore } from '../StoreContext'

export default function System() {
  const { state, store } = useStore()
  const { isLight } = useTheme()
  const [showConfirm, setShowConfirm] = useState(false)

  const clearAll = () => { store.factoryReset(); setShowConfirm(false) }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-[20px] font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>MISSION CONTROL</h1>
        <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>v1.0 — All Phases Shipped</p>
      </div>
      <div className="w-24 h-24 rounded-full flex items-center justify-center text-[48px]"
        style={{ background: 'var(--bg-surface)' }}>🦞</div>
      <div className="rounded-lg p-5 max-w-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
        <h3 className="text-[11px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>SETTINGS</h3>
        <button onClick={() => store.importState()}
          className="w-full py-2.5 text-[10px] mb-2 rounded-lg transition-all"
          style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>📥 IMPORT STATE</button>
        <button onClick={() => store.exportState()}
          className="w-full py-2.5 text-[10px] mb-2 rounded-lg transition-all"
          style={{ background: 'var(--bg-surface)', color: 'var(--color-done)' }}>📤 EXPORT STATE</button>
        <button onClick={() => setShowConfirm(true)}
          className="w-full py-2.5 text-[10px] rounded-lg transition-all"
          style={{ background: 'var(--color-urgent-bg)', color: 'var(--color-urgent)' }}>🗑️ CLEAR ALL DATA</button>
      </div>
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowConfirm(false)}>
          <div className="rounded-lg p-5" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-card)' }}>
            <h3 className="text-[13px] font-bold mb-2" style={{ color: 'var(--color-urgent)' }}>⚠️ Clear Everything?</h3>
            <p className="text-[10px] mb-4" style={{ color: 'var(--text-secondary)' }}>This is irreversible. All tasks, projects, and memories will be deleted.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 text-[10px] rounded-lg"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={clearAll} className="flex-1 py-2 text-[10px] rounded-lg"
                style={{ background: 'var(--color-urgent)', color: '#fff' }}>Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
