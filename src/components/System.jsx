import { useState, useRef } from 'react'
import { useStore } from '../StoreContext'

export default function System() {
  const { state, store } = useStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState(false)
  const fileRef = useRef(null)

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const ok = store.importState(ev.target.result)
      if (ok) {
        setImportSuccess(true)
        setImportError('')
        setTimeout(() => setImportSuccess(false), 3000)
      } else {
        setImportError('Invalid file format. Please use a valid backup JSON.')
      }
    }
    reader.onerror = () => setImportError('Failed to read file.')
    reader.readAsText(file)
  }

  const handleReset = () => {
    store.factoryReset()
    setShowConfirm(false)
  }

  const totalTasks = state.tasks.length
  const doneTasks = state.tasks.filter(t => t.status === 'done').length
  const totalProjects = state.projects.length
  const totalEvents = state.events.length
  const totalMemories = state.memories.length
  const totalDocs = state.docs.length
  const totalActivity = state.activity.length

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[15px] font-bold text-white font-mono tracking-wider">SYSTEM</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
        {/* Stats */}
        <div className="rounded-lg p-5" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
          <h3 className="text-[12px] font-bold text-white font-mono mb-4">DATA OVERVIEW</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded" style={{ background: '#1a1a1a' }}>
              <div className="text-[20px] font-bold text-white font-mono">{totalTasks}</div>
              <div className="text-[9px] font-mono text-[#666]">TOTAL TASKS</div>
            </div>
            <div className="p-3 rounded" style={{ background: '#1a1a1a' }}>
              <div className="text-[20px] font-bold font-mono" style={{ color: '#22c55e' }}>{doneTasks}</div>
              <div className="text-[9px] font-mono text-[#666]">COMPLETED</div>
            </div>
            <div className="p-3 rounded" style={{ background: '#1a1a1a' }}>
              <div className="text-[20px] font-bold text-white font-mono">{totalProjects}</div>
              <div className="text-[9px] font-mono text-[#666]">PROJECTS</div>
            </div>
            <div className="p-3 rounded" style={{ background: '#1a1a1a' }}>
              <div className="text-[20px] font-bold text-white font-mono">{totalEvents}</div>
              <div className="text-[9px] font-mono text-[#666]">EVENTS</div>
            </div>
            <div className="p-3 rounded" style={{ background: '#1a1a1a' }}>
              <div className="text-[20px] font-bold text-white font-mono">{totalMemories}</div>
              <div className="text-[9px] font-mono text-[#666]">MEMORIES</div>
            </div>
            <div className="p-3 rounded" style={{ background: '#1a1a1a' }}>
              <div className="text-[20px] font-bold text-white font-mono">{totalDocs}</div>
              <div className="text-[9px] font-mono text-[#666]">DOCUMENTS</div>
            </div>
          </div>
          <div className="mt-4 p-3 rounded flex items-center justify-between" style={{ background: '#1a1a1a' }}>
            <span className="text-[10px] font-mono text-[#666]">ACTIVITY LOG</span>
            <span className="text-[20px] font-bold font-mono" style={{ color: '#19c3ff' }}>{totalActivity}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="rounded-lg p-5 flex flex-col gap-4" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
          <h3 className="text-[12px] font-bold text-white font-mono mb-2">MANAGE DATA</h3>

          <div>
            <label className="text-[10px] font-mono text-[#666] block mb-2">BACKUP</label>
            <button onClick={() => store.exportState()}
              className="w-full px-4 py-3 text-[11px] font-mono rounded text-left transition-all hover:brightness-110"
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#22c55e' }}>
              📥 Export State (Download JSON)
            </button>
          </div>

          <div>
            <label className="text-[10px] font-mono text-[#666] block mb-2">RESTORE</label>
            <button onClick={() => fileRef.current?.click()}
              className="w-full px-4 py-3 text-[11px] font-mono rounded text-left transition-all hover:brightness-110"
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#f59e0b' }}>
              📤 Import State (Upload JSON)
            </button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            {importSuccess && <p className="text-[10px] font-mono mt-1" style={{ color: '#22c55e' }}>✅ Import successful!</p>}
            {importError && <p className="text-[10px] font-mono mt-1" style={{ color: '#ef4444' }}>❌ {importError}</p>}
          </div>

          <div>
            <label className="text-[10px] font-mono text-[#666] block mb-2">RESET</label>
            {!showConfirm ? (
              <button onClick={() => setShowConfirm(true)}
                className="w-full px-4 py-3 text-[11px] font-mono rounded text-left transition-all hover:brightness-110"
                style={{ background: '#1a1a1a', border: '1px solid #333', color: '#ef4444' }}>
                🗑️ Factory Reset (Restore Defaults)
              </button>
            ) : (
              <div className="p-4 rounded" style={{ background: '#1a1a1a', border: '1px solid #ef4444' }}>
                <p className="text-[11px] font-mono text-[#ef4444] mb-3">⚠️ This will delete ALL your data and restore defaults. Are you sure?</p>
                <div className="flex gap-2">
                  <button onClick={handleReset}
                    className="px-4 py-2 text-[10px] font-mono font-bold rounded" style={{ background: '#ef4444', color: '#fff' }}>
                    YES, RESET
                  </button>
                  <button onClick={() => setShowConfirm(false)}
                    className="px-4 py-2 text-[10px] font-mono rounded" style={{ background: '#252525', color: '#888' }}>
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}