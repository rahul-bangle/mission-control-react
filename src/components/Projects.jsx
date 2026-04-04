import { useState } from 'react'
import { useStore } from '../StoreContext'

const statusConfig = {
  active: { label: 'ACTIVE', color: '#19c3ff' },
  review: { label: 'IN REVIEW', color: '#a855f7' },
  paused: { label: 'PAUSED', color: '#f59e0b' },
  completed: { label: 'COMPLETED', color: '#22c55e' },
}
const avatarColors = { rahul: { bg: '#3b82f6', text: '#fff' }, aria: { bg: '#8b5cf6', text: '#fff' } }

export default function Projects() {
  const { state, store } = useStore()
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[15px] font-bold text-white font-mono tracking-wider">PROJECTS</h1>
          <div className="flex gap-1">
            {['all', 'active', 'review', 'paused', 'completed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-2.5 py-1 text-[10px] font-mono rounded transition-all"
                style={{ background: filter === f ? '#252525' : 'transparent', color: filter === f ? '#19c3ff' : '#666666', border: filter === f ? '1px solid #333333' : '1px solid transparent' }}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-[10px] font-mono rounded cursor-pointer"
            style={{ background: '#1a1a1a', border: '1px solid #333333', color: '#888888' }}>
            <option value="progress">Sort: Progress</option><option value="name">Sort: Name</option><option value="tasks">Sort: Tasks</option>
          </select>
          <button className="px-4 py-2 text-[11px] font-mono font-semibold rounded transition-all hover:brightness-110" style={{ background: '#19c3ff', color: '#000' }}>+ NEW PROJECT</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0 overflow-auto">
        {filteredProjects.map(p => (
          <div key={p.id} className="rounded-lg overflow-hidden flex flex-col transition-all cursor-pointer" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#19c3ff'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.transform = 'translateY(0)' }}>
            <div className="h-1 w-full" style={{ background: p.color }} />
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-[13px] font-bold text-white font-mono">{p.name}</h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded font-semibold" style={{ background: `${statusConfig[p.status].color}15`, color: statusConfig[p.status].color }}>{statusConfig[p.status].label}</span>
              </div>
              <p className="text-[11px] font-mono text-[#666] mb-4 leading-relaxed">{p.description}</p>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5"><span className="text-[10px] font-mono text-[#666]">Progress</span><span className="text-[10px] font-mono font-semibold" style={{ color: p.color }}>{p.progress}%</span></div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: '#252525' }}><div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: p.color }} /></div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded" style={{ background: '#252525' }}><div className="text-[12px] font-bold text-white font-mono">{p.tasks.completed}/{p.tasks.total}</div><div className="text-[8px] font-mono text-[#666]">TASKS</div></div>
                <div className="text-center p-2 rounded" style={{ background: '#252525' }}><div className="text-[12px] font-bold text-white font-mono">{p.members}</div><div className="text-[8px] font-mono text-[#666]">MEMBERS</div></div>
                <div className="text-center p-2 rounded" style={{ background: '#252525' }}>
                  <div className="text-[12px] font-bold font-mono" style={{ color: p.daysLeft === 0 ? '#22c55e' : '#fff' }}>{p.daysLeft === 0 ? 'DONE' : p.daysLeft + 'd'}</div><div className="text-[8px] font-mono text-[#666]">LEFT</div></div>
              </div>
              <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid #252525' }}>
                <div className="flex gap-1">{p.tags.map(t => <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: '#252525', color: '#888' }}>{t}</span>)}</div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold font-mono" style={{ background: avatarColors[p.owner]?.bg || '#666', color: avatarColors[p.owner]?.text || '#fff' }}>{p.owner === 'rahul' ? 'R' : p.owner === 'aria' ? 'A' : p.owner}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}