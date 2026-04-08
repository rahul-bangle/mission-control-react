import { useState, useEffect } from 'react'
import { useTheme } from '../ThemeContext'
import { useStore } from '../StoreContext'
import { Sun, Moon } from 'lucide-react'

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const typeColors = {
  task: { text: 'var(--accent)', bg: 'rgba(0, 122, 255, 0.1)' },
  deploy: { text: 'var(--color-done)', bg: 'rgba(34, 197, 94, 0.1)' },
  comment: { text: 'var(--color-review)', bg: 'rgba(168, 85, 247, 0.1)' },
  mention: { text: 'var(--color-high)', bg: 'rgba(245, 158, 11, 0.1)' },
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
  const { theme, toggle: toggleTheme } = useTheme()

  const unreadCount = activity.filter(a => a.unread).length
  const filteredActivity = (filter === 'all' ? activity : activity.filter(a => a.type === filter))
    .filter(a => a.unread)

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
    <aside 
      className={`fixed md:relative top-0 right-0 h-full z-[55] flex flex-col border-l flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out`}
      style={{ 
        width: open ? (window.innerWidth < 768 ? '100%' : 320) : 0,
        opacity: open ? 1 : 0,
        background: 'var(--bg-sidebar)', 
        borderColor: 'var(--border-default)',
        pointerEvents: open ? 'auto' : 'none'
      }}
    >
      <div className="w-[320px] h-full flex flex-col">
        <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
          <div className="flex items-center gap-2">
            <button onClick={closeOrToggle} className="p-1 hover:bg-[var(--bg-hover)] rounded-lg transition-colors" aria-label="Close activity feed">
              <XIcon />
            </button>
            <span className="text-[11px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>ACTIVITY FEED</span>
            {unreadCount > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1 fade-in" style={{ background: accent, color: isLight ? '#fff' : 'var(--bg-app)' }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors group active:scale-90" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-orange-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
            </button>
          </div>
        </div>

        <div className="px-4 py-2 border-b flex gap-1 overflow-x-auto no-scrollbar" style={{ borderColor: 'var(--border-default)' }}>
          {['all', 'task', 'deploy', 'comment', 'mention'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-2 py-1 text-[9px] rounded-lg transition-all whitespace-nowrap font-medium active:scale-95"
              style={{ background: filter === f ? 'var(--bg-surface)' : 'transparent', color: filter === f ? accent : 'var(--text-tertiary)' }}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllRead} className="px-4 py-2 text-[10px] text-left font-bold border-b transition-colors slide-down fade-in" style={{ color: accent, borderColor: 'var(--border-default)' }}>
            Mark all as read
          </button>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          {filteredActivity.length === 0 && (
            <div className="text-[11px] text-center mt-12 opacity-40 fade-in">
              <div className="text-3xl mb-2">🔭</div>
              No unread activity
            </div>
          )}
          {filteredActivity.map((entry, idx) => {
            const tc = typeColors[entry.type] || typeColors.task
            return (
              <div 
                key={entry.id}
                onClick={() => markAsRead(entry.id)}
                className="py-3 px-3 rounded-xl cursor-pointer hover:bg-surface/60 transition-all border border-transparent hover:border-default mb-2 group fade-in will-change-transform"
                style={{ background: 'var(--bg-card)', animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[14px] font-bold flex-shrink-0 mt-0.5 border group-hover:scale-110 transition-transform"
                    style={{ background: tc.bg, color: tc.text, borderColor: `${tc.text}20` }}>
                    {entry.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] leading-snug font-medium" style={{ color: 'var(--text-primary)' }}>{entry.action}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] font-mono tracking-tighter" style={{ color: 'var(--text-tertiary)' }}>{entry.time}</span>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="px-4 py-4 border-t bg-surface/50" style={{ borderColor: 'var(--border-default)' }}>
          <div className="grid grid-cols-3 gap-2">
            {[
              { val: activity.length, label: 'Events', color: 'var(--text-primary)' },
              { val: unreadCount, label: 'Unread', color: accent },
              { val: `${readPct}%`, label: 'Ratio', color: 'var(--color-done)' }
            ].map((stat, i) => (
              <div key={i} className="text-center p-2 rounded-xl border bg-surface/30" style={{ borderColor: 'var(--border-soft)' }}>
                <div className="text-[13px] font-bold" style={{ color: stat.color }}>{stat.val}</div>
                <div className="text-[8px] uppercase tracking-tighter font-bold" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
