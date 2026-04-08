import { useState } from 'react'
import { useTheme } from '../ThemeContext'
import { useStore } from '../StoreContext'

const statusConfig = {
  active: { label: 'ACTIVE', color: 'var(--accent)', bg: 'rgba(0,122,255,0.1)' },
  review: { label: 'IN REVIEW', color: 'var(--color-review)', bg: 'var(--color-review-bg)' },
  paused: { label: 'PAUSED', color: 'var(--color-high)', bg: 'var(--color-high-bg)' },
  completed: { label: 'COMPLETED', color: 'var(--color-done)', bg: 'var(--color-done-bg)' },
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
    const total = state.tasks.filter(t => p.name.toLowerCase().includes(t.title.split(' ')[0].toLowerCase()) || p.owner === t.assignee).length
    const progress = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : p.progress
    return { ...p, progress }
  })

  const filteredProjects = projects
    .filter(p => filter === 'all' || p.status === filter)
    .sort((a, b) => sortBy === 'progress' ? b.progress - a.progress : sortBy === 'name' ? a.name.localeCompare(b.name) : b.tasks.completed - a.tasks.completed)

  const accent = isLight ? '#007AFF' : 'var(--accent)'

  return (
    <div className="flex flex-col h-full fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
        <div className="flex items-center gap-8">
           <div className="flex flex-col">
              <h1 className="text-[24px] font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Projects</h1>
              <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest leading-loose">Mission Management</span>
           </div>
          <div className="flex p-1 rounded-xl bg-surface/30 border border-default glass shadow-sm">
            {['all', 'active', 'completed'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`relative px-5 py-1.5 text-[10px] font-black rounded-lg transition-all z-10 ${filter === f ? 'shadow-lg' : ''}`}
                style={{ 
                  color: filter === f ? (isLight ? '#fff' : '#000') : 'var(--text-tertiary)',
                  background: filter === f ? accent : 'transparent'
                }}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-5 py-3 text-[11px] font-bold rounded-[14px] bg-surface/30 border border-default outline-none focus:border-accent transition-all glass cursor-pointer"
            style={{ color: 'var(--text-primary)' }}>
            <option value="progress">SORT BY PROGRESS</option>
            <option value="name">SORT BY NAME</option>
          </select>
          <button 
            className="px-6 py-3 text-[11px] font-black rounded-[14px] text-white shadow-xl shadow-accent/20 active:scale-95 transition-all flex items-center gap-2"
            style={{ background: accent }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
            NEW PROJECT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 flex-1 min-h-0 overflow-auto no-scrollbar pb-20 px-2">
        {filteredProjects.map((p, idx) => (
          <div 
            key={p.id}
            className="rounded-[24px] overflow-hidden flex flex-col glass border border-card cursor-pointer group shadow-lg transition-all hover-lift will-change-transform fade-in"
            style={{ background: 'var(--bg-sidebar)', animationDelay: `${idx * 0.05}s` }}
          >
            <div className="p-7 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-5">
                 <div className="flex flex-col gap-1">
                    <h3 className="text-[16px] font-black tracking-tight text-primary group-hover:text-accent transition-colors">{p.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: avatarColors[p.owner]?.bg || accent }} />
                      <span className="text-[10px] font-bold text-tertiary uppercase tracking-tighter">{p.owner}</span>
                    </div>
                 </div>
                <span className="text-[9px] px-3 py-1 rounded-full font-black tracking-widest border"
                  style={{ 
                    background: `${statusConfig[p.status]?.color}15` || 'var(--bg-surface)', 
                    color: statusConfig[p.status]?.color || 'var(--text-secondary)',
                    borderColor: `${statusConfig[p.status]?.color}40`
                  }}>
                  {statusConfig[p.status]?.label || 'UNKNOWN'}
                </span>
              </div>
              <p className="text-[12px] text-tertiary mb-8 leading-relaxed line-clamp-3 font-medium opacity-80">{p.description}</p>
              
              <div className="mb-8 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-tertiary uppercase tracking-[0.15em]">Health Score</span>
                  <span className="text-[12px] font-black" style={{ color: accent }}>{p.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface/30 overflow-hidden border border-default/50 glass">
                  <div 
                    className="h-full rounded-full shadow-[0_0_12px_rgba(0,122,255,0.3)] transition-all duration-1000" 
                    style={{ background: accent, width: `${p.progress}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-3.5 rounded-[20px] bg-surface/20 border border-default/30 text-center glass group-hover:bg-accent/5 transition-colors">
                  <div className="text-[14px] font-black text-primary">{p.tasks.completed}/{p.tasks.total}</div>
                  <div className="text-[8px] font-black text-tertiary tracking-tighter uppercase mt-0.5">Tasks</div>
                </div>
                <div className="p-3.5 rounded-[20px] bg-surface/20 border border-default/30 text-center glass group-hover:bg-accent/5 transition-colors">
                  <div className="text-[14px] font-black text-primary">{p.members}</div>
                  <div className="text-[8px] font-black text-tertiary tracking-tighter uppercase mt-0.5">Team</div>
                </div>
                <div className="p-3.5 rounded-[20px] bg-surface/20 border border-default/30 text-center glass group-hover:bg-accent/5 transition-colors">
                  <div className="text-[14px] font-black text-primary">{p.daysLeft}d</div>
                  <div className="text-[8px] font-black text-tertiary tracking-tighter uppercase mt-0.5">Delta</div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-5 border-t border-default/30">
                <div className="flex -space-x-2.5">
                  {p.tags.slice(0, 3).map(t => (
                    <span key={t} className="text-[9px] px-2.5 py-1 rounded-full bg-sidebar/50 border border-default text-tertiary font-bold glass">{t}</span>
                  ))}
                </div>
                <div 
                  className="w-10 h-10 rounded-[14px] flex items-center justify-center text-[12px] font-black border border-default shadow-lg overflow-hidden transition-all hover:rotate-6 hover:scale-110 cursor-pointer"
                  style={{ background: avatarColors[p.owner]?.bg || 'var(--bg-surface)', color: avatarColors[p.owner]?.text || 'var(--text-tertiary)' }}>
                  {p.owner === 'rahul' ? 'R' : p.owner === 'aria' ? 'A' : p.owner[0].toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
