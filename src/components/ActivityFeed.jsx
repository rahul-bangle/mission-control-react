import { useState, useEffect } from 'react'
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
  task: '#19c3ff', deploy: '#22c55e', comment: '#a855f7', mention: '#f59e0b',
}

export default function ActivityFeed({ isOpen, toggle }) {
  const { state, store } = useStore()
  const [filter, setFilter] = useState('all')
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // If not controlled by parent, use internal state
  const [internalOpen, setInternalOpen] = useState(true)
  const controlled = isOpen !== undefined
  const open = controlled ? isOpen : internalOpen
  const closeOrToggle = controlled ? toggle : () => setInternalOpen(o => !o)

  useEffect(() => {
    const unsub = store.on('activity:added', () => setLastUpdate(new Date()))
    return unsub
  }, [store])

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

  return (
    <aside className={`flex flex-col h-full border-l flex-shrink-0 transition-all duration-300 ${open ? 'w-72' : 'w-0 overflow-hidden'}`} style={{ background: '#111111', borderColor: '#1a1a1a' }}>
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#1a1a1a' }}>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-white font-mono">ACTIVITY</span>
          {unreadCount > 0 && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#19c3ff', color: '#000' }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activity.length > 0 ? (
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></div>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-[#555]"></div>
          )}
          <span className="text-[9px] font-mono" style={{ color: '#555' }}>
            {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="px-4 py-2 border-b flex gap-1" style={{ borderColor: '#1a1a1a' }}>
        {['all', 'task', 'deploy', 'comment', 'mention'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-2 py-1 text-[9px] font-mono rounded transition-all"
            style={{ background: filter === f ? '#1a1a1a' : 'transparent', color: filter === f ? '#19c3ff' : '#555' }}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {unreadCount > 0 && (
        <button onClick={markAllRead}
          className="px-4 py-2 text-[10px] font-mono text-left hover:bg-[#1a1a1a] transition-colors"
          style={{ color: '#19c3ff', borderBottom: '1px solid #1a1a1a' }}>
          Mark all as read
        </button>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {filteredActivity.length === 0 && (
          <div className="text-[11px] font-mono text-[#555] text-center mt-8">
            No activity yet. Start moving tasks!
          </div>
        )}
        {filteredActivity.map((entry, idx) => (
          <div key={entry.id} onClick={() => markAsRead(entry.id)}
            className="py-3 transition-all cursor-pointer rounded"
            style={{
              borderBottom: idx < filteredActivity.length - 1 ? '1px solid #1a1a1a' : 'none',
              background: entry.unread ? '#1a1a1a' : 'transparent',
              marginLeft: entry.unread ? '-12px' : '0',
              marginRight: entry.unread ? '-12px' : '0',
              paddingLeft: entry.unread ? '12px' : '0',
              paddingRight: entry.unread ? '12px' : '0',
            }}
            onMouseEnter={e => { if (!entry.unread) e.currentTarget.style.background = '#1a1a1a' }}
            onMouseLeave={e => { if (!entry.unread) e.currentTarget.style.background = 'transparent' }}>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                style={{ background: `${typeColors[entry.type] || '#19c3ff'}15`, color: typeColors[entry.type] || '#19c3ff' }}>
                {entry.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-mono leading-snug" style={{ color: entry.unread ? '#fff' : '#888' }}>
                  {entry.action}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-mono" style={{ color: '#555' }}>
                    {entry.time}
                  </span>
                  {entry.unread && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#19c3ff' }} />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t" style={{ borderColor: '#1a1a1a' }}>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded" style={{ background: '#1a1a1a' }}>
            <div className="text-[12px] font-bold text-white font-mono">{activity.length}</div>
            <div className="text-[8px] font-mono text-[#555]">TOTAL</div>
          </div>
          <div className="text-center p-2 rounded" style={{ background: '#1a1a1a' }}>
            <div className="text-[12px] font-bold font-mono" style={{ color: '#19c3ff' }}>{unreadCount}</div>
            <div className="text-[8px] font-mono text-[#555]">NEW</div>
          </div>
          <div className="text-center p-2 rounded" style={{ background: '#1a1a1a' }}>
            <div className="text-[12px] font-bold font-mono" style={{ color: '#22c55e' }}>
              {activity.length > 0 ? Math.round((activity.length - unreadCount) / activity.length * 100) : 0}%
            </div>
            <div className="text-[8px] font-mono text-[#555]">READ</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
