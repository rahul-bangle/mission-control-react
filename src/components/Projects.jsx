import { useState } from 'react'
import { useTheme } from '../ThemeContext'
import { useStore } from '../StoreContext'

const statusConfig = {
  active: { label: 'ACTIVE', color: 'var(--accent)', bg: 'var(--accent-bg, var(--accent)20)' },
  review: { label: 'IN REVIEW', color: 'var(--color-review)', bg: 'var(--color-review-bg, var(--color-review)20)' },
  paused: { label: 'PAUSED', color: 'var(--color-high)', bg: 'var(--color-high-bg, var(--color-high)20)' },
  completed: { label: 'COMPLETED', color: 'var(--color-done)', bg: 'var(--color-done-bg, var(--color-done)20)' },
}
const avatarColors = {
  rahul: { bg: '#3b82f6', text: '#fff' },
  aria: { bg: '#8b5cf6', text: '#fff' },
}

export default function Projects() {
  const { state, store } = useStore()
  const { isLight } = useTheme()
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('progress')

  const projects = state.projects.map(p => {
    const done = state.tasks.filter(t => p.name.toLowerCase().includes(t.title.split(' ')[0].toLowerCase()) || p.owner === t.assignee)
      .filter(t => t.status === 'done').length
    const total = state.tasks.length
    const progress = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : p.progress
    return { ...p, progress }
  })

  const filteredProjects = projects
    .filter(p => filter === 'all' || p.status === filter)
    .sort((a, b) => sortBy === 'progress' ? b.progress - a.progress : sortBy === 'name' ? a.name.localeCompare(b.name) : b.tasks.completed - a.tasks.completed)

  const accent = isLight ? '#007AFF' : 'var(--accent)'
  const primaryBtn = isLight ? { background: '#007AFF', color: '#fff', fontWeight: 600 } : { background: 'var(--accent)', color: '#000' }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[15px] font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>PROJECTS</h1>
          <div className="flex" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-pill)', padding: '2px' }}>
            {['all', 'active', 'review', 'paused', 'completed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-2.5 py-1 text-[10px] font-medium rounded-full transition-all"
                style={{
                  background: filter === f ? accent : 'transparent',
                  color: filter === f ? (isLight ? '#fff' : 'var(--bg-app)') : 'var(--text-secondary)',
                }}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-[10px] rounded-lg cursor-pointer"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>
            <option value="progress" style={{ background: 'var(--bg-card)' }}>Sort: Progress</option>
            <option value="name" style={{ background: 'var(--bg-card)' }}>Sort: Name</option>
            <option value="tasks" style={{ background: 'var(--bg-card)' }}>Sort: Tasks</option>
          </select>
          <button className="px-4 py-2 text-[11px] font-semibold rounded-lg transition-all"
            style={primaryBtn}>+ NEW PROJECT</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0 overflow-auto">
        {filteredProjects.map(p => (
          <div key={p.id} className="rounded-lg overflow-hidden flex flex-col transition-all cursor-pointer"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            {/* No colored top border */}
            <div className="h-0"></div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{p.name}</h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: statusConfig[p.status]?.bg || 'var(--color-done-bg)', color: statusConfig[p.status]?.color || 'var(--color-done)' }}>
                  {statusConfig[p.status]?.label || 'UNKNOWN'}
                </span>
              </div>
              <p className="text-[11px] mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{p.description}</p>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Progress</span>
                  <span className="text-[10px] font-semibold" style={{ color: accent }}>{p.progress}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-progress-bg)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: accent }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                  <div className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{p.tasks.completed}/{p.tasks.total}</div>
                  <div className="text-[8px]" style={{ color: 'var(--text-tertiary)' }}>TASKS</div>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                  <div className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{p.members}</div>
                  <div className="text-[8px]" style={{ color: 'var(--text-tertiary)' }}>MEMBERS</div>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                  <div className="text-[12px] font-bold">{p.daysLeft === 0 ? <span style={{ color: 'var(--color-done)' }}>DONE</span> : <span style={{ color: 'var(--text-primary)' }}>{p.daysLeft}d</span>}</div>
                  <div className="text-[8px]" style={{ color: 'var(--text-tertiary)' }}>LEFT</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
                <div className="flex gap-1">{p.tags.map(t => <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>{t}</span>)}</div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{ background: avatarColors[p.owner]?.bg || 'var(--bg-surface)', color: avatarColors[p.owner]?.text || 'var(--text-tertiary)' }}>
                  {p.owner === 'rahul' ? 'R' : p.owner === 'aria' ? 'A' : p.owner}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
