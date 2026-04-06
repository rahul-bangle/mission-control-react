import { useTheme } from '../ThemeContext'

export default function Office() {
  const { isLight } = useTheme()
  const accent = isLight ? '#007AFF' : 'var(--accent)'
  const pillStyle = { background: 'var(--bg-surface)', color: accent, fontSize: '9px' }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[15px] font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>OFFICE</h1>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-[12px] font-bold mb-3" style={{ color: 'var(--text-primary)' }}>QUICK STATS</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Total Tasks</span><span className="text-[11px]" style={{ color: accent }}>14</span></div>
            <div className="flex justify-between"><span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>In Progress</span><span className="text-[11px]" style={{ color: 'var(--color-high)' }}>3</span></div>
            <div className="flex justify-between"><span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Active Projects</span><span className="text-[11px]" style={{ color: accent }}>4</span></div>
            <div className="flex justify-between"><span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Team Online</span><span className="text-[11px]" style={{ color: 'var(--color-done)' }}>4/6</span></div>
          </div>
        </div>
        <div className="rounded-lg p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-[12px] font-bold mb-3" style={{ color: 'var(--text-primary)' }}>KEYBOARD SHORTCUTS</h3>
          <div className="space-y-1.5 text-[10px]">
            {[['Alt+1','Task Board'],['Alt+2','Calendar'],['Alt+3','Projects'],['Alt+7','System'],['n','New Task'],['e','Export'],['h','Toggle Help']].map(([k,v]) => (
              <div key={k} className="flex items-center gap-3"><span className="px-2 py-0.5 rounded" style={pillStyle}>{k}</span><span style={{ color: 'var(--text-secondary)' }}>{v}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-lg p-5 mt-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
        <h3 className="text-[12px] font-bold mb-3" style={{ color: 'var(--text-primary)' }}>🦞 MISSION CONTROL v1.0 — PHASES 1-7 ✅</h3>
        <p className="text-[10px] mb-3" style={{ color: 'var(--text-tertiary)' }}>All foundational features shipped. System is production-ready.</p>
        <div className="flex gap-2 text-[9px]">
          {['Phase 1: Store','Phase 2: Dependencies','Phase 3: Due Dates','Phase 4: Subtasks','Phase 5: Comments','Phase 7: Sync'].map(p => (
            <span key={p} className="px-2 py-1 rounded" style={{ background: 'var(--color-done-bg)', color: 'var(--color-done)' }}>✅ {p}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
