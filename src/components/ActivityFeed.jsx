import { useState, useEffect } from 'react'
import { useTheme } from '../ThemeContext'
import { useStore } from '../StoreContext'

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)
const MenuIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const typeColors = {
  task: { text: 'var(--accent)', bg: 'var(--accent)15' },
  deploy: { text: 'var(--color-done)', bg: 'var(--color-done)15' },
  comment: { text: 'var(--color-review)', bg: 'var(--color-review)15' },
  mention: { text: 'var(--color-high)', bg: 'var(--color-high)15' },
}

export default function ActivityFeed({ isOpen, toggle }) {
  const { state, store } = useStore()
  const { isLight } = useTheme()
  const [filter, setFilter] = useState('all')
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const [internalOpen, setInternalOpen] = useState(true)
  const controlled = isOpen !== undefined
  const open = controlled ? isOpen : internalOpen
  const closeOrToggle = controlled ? toggle : () => setInternalOpen(o => !o)

  useEffect(() => {
    const unsub = store.on('activity:added', () => setLastUpdate(new Date()))
    return unsub
  }, [store])

  const accent = isLight ? '#007AFF' : 'var(--accent)'
  const activity = state.activity
  const filteredActivity = filter === 'all' ? activity : activity.filter(a => a.type === filter)
  const unreadCount = activity.filter(a => a.unread).length

  const markAllRead = () => {
    const updated = activity.map(a => ({ ...a, unread: false }))
    store.patchState({ activity: updated })
  }
  const markAsRead = (id) => {
    const updated = activity.map(a => a.id === id ? { ...a, unread: false } : a)
    store.patchState({ activity: updated })
  }

  const readPct = activity.length > 0 ? Math.round((activity.length - unreadCount) / activity.length * 100) : 0

  return (
    <aside className={`
      fixed top-0 right-0 h-full z-50 transition-all duration-300 transform
      md:relative md:transform-none md:translate-x-0 md:z-auto
      ${open ? 'translate-x-0 w-80 md:w-72' : 'translate-x-full w-0 md:w-0 overflow-hidden'}
      flex flex-col border-l flex-shrink-0
    `}
      style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border-default)' }}>
      
      {/* Mobile-only Close Overlay (Handled in App.jsx now, but we need a close button here too) */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex items-center gap-2">
          <button onClick={closeOrToggle} className="p-1 hover:bg-[var(--bg-hover)] rounded" aria-label="Close activity feed">
            <XIcon />
          </button>
          <span className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>ACTIVITY FEED</span>
          {unreadCount > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: accent, color: isLight ? '#fff' : 'var(--bg-app)' }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>LIVE</span>
        </div>
      </div>

      <div className="px-4 py-2 border-b flex gap-1 overflow-x-auto no-scrollbar" style={{ borderColor: 'var(--border-default)' }}>
        {['all', 'task', 'deploy', 'comment', 'mention'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-2 py-1 text-[9px] rounded transition-all whitespace-nowrap"
            style={{ background: filter === f ? 'var(--bg-surface)' : 'transparent', color: filter === f ? accent : 'var(--text-tertiary)' }}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {unreadCount > 0 && (
        <button onClick={markAllRead}
          className="px-4 py-2 text-[10px] text-left transition-colors font-bold"
          style={{ color: accent, borderBottom: '1px solid var(--border-default)' }}>
          Mark all as read
        </button>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        {filteredActivity.length === 0 && (
          <div className="text-[11px] text-center mt-12 opacity-40">
            <div className="text-3xl mb-2">🔭</div>
            No activity matched filters
          </div>
        )}
        {filteredActivity.map((entry, idx) => {
          const tc = typeColors[entry.type] || typeColors.task
          return (
            <div key={entry.id} onClick={() => markAsRead(entry.id)}
              className="py-3 transition-all cursor-pointer rounded-lg px-2 -mx-2 hover:bg-surface/50 mb-1"
              style={{
                borderBottom: idx < filteredActivity.length - 1 ? '1px solid var(--border-soft)' : 'none',
                background: entry.unread ? 'var(--bg-surface)' : 'transparent',
              }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-bold flex-shrink-0 mt-0.5 border"
                  style={{ background: tc.bg, color: tc.text, borderColor: `${tc.text}20` }}>
                  {entry.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] leading-relaxed" style={{ color: entry.unread ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {entry.action}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>{entry.time}</span>
                    {entry.unread && <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-sidebar)' }}>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-xl border bg-surface/30" style={{ borderColor: 'var(--border-soft)' }}>
            <div className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{activity.length}</div>
            <div className="text-[8px] uppercase tracking-tighter" style={{ color: 'var(--text-tertiary)' }}>Events</div>
          </div>
          <div className="text-center p-2 rounded-xl border bg-surface/30" style={{ borderColor: 'var(--border-soft)' }}>
            <div className="text-[13px] font-bold" style={{ color: accent }}>{unreadCount}</div>
            <div className="text-[8px] uppercase tracking-tighter" style={{ color: 'var(--text-tertiary)' }}>Unread</div>
          </div>
          <div className="text-center p-2 rounded-xl border bg-surface/30" style={{ borderColor: 'var(--border-soft)' }}>
            <div className="text-[13px] font-bold" style={{ color: 'var(--color-done)' }}>{readPct}%</div>
            <div className="text-[8px] uppercase tracking-tighter" style={{ color: 'var(--text-tertiary)' }}>Ratio</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
