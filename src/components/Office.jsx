import { useTheme } from '../ThemeContext'

export default function Office() {
  const { isLight } = useTheme()
  const accent = isLight ? '#007AFF' : 'var(--accent)'
  const pillStyle = { background: 'var(--bg-surface)', color: accent, fontSize: '9px' }

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[15px] font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>OFFICE</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Stats */}
        <div className="rounded-lg p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-[12px] font-bold mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>QUICK STATS</h3>
          <div className="space-y-4">
            {[
              { label: 'Total Tasks', value: '14', color: accent },
              { label: 'In Progress', value: '3', color: 'var(--color-high)' },
              { label: 'Active Projects', value: '4', color: accent },
              { label: 'Team Online', value: '4/6', color: 'var(--color-done)' }
            ].map(stat => (
              <div key={stat.label} className="flex justify-between items-center group">
                <span className="text-[11px] opacity-70 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
                <span className="text-[12px] font-bold font-mono" style={{ color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="rounded-lg p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-[12px] font-bold mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>KEYBOARD SHORTCUTS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2">
            {[
              ['Alt+1', 'Task Board'],
              ['Alt+2', 'Calendar'],
              ['Alt+3', 'Projects'],
              ['Alt+7', 'System'],
              ['n', 'New Task'],
              ['e', 'Export'],
              ['h', 'Toggle Help']
            ].map(([k, v]) => (
              <div key={k} className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded font-mono font-bold shadow-sm" style={pillStyle}>{k}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Version & Phases */}
      <div className="rounded-lg p-5 mt-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>🦞 MISSION CONTROL v1.0</h3>
            <p className="text-[10px] mt-1 opacity-60" style={{ color: 'var(--text-tertiary)' }}>All foundational features shipped. System is production-ready.</p>
          </div>
          <span className="text-[16px]">✅</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            'Phase 1: Store',
            'Phase 2: Dependencies',
            'Phase 3: Due Dates',
            'Phase 4: Subtasks',
            'Phase 5: Comments',
            'Phase 7: Sync'
          ].map(p => (
            <div key={p} className="px-2 py-3 rounded-lg flex flex-col items-center justify-center text-center gap-2 border" 
              style={{ background: 'var(--color-done-bg)', borderColor: 'var(--color-done)20', color: 'var(--color-done)' }}>
              <span className="text-[12px]">✅</span>
              <span className="text-[9px] font-bold leading-tight line-clamp-2">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
