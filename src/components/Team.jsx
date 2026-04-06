import { useState } from 'react'
import { useTheme } from '../ThemeContext'
import { useStore } from '../StoreContext'

const departments = ['All', 'AI', 'Engineering', 'Design', 'Product', 'Infrastructure']
const statusConfig = {
  online: { color: 'var(--color-done)', bg: 'var(--color-done-bg)', label: 'Online' },
  away: { color: 'var(--color-high)', bg: 'var(--color-high-bg)', label: 'Away' },
  offline: { color: 'var(--text-tertiary)', bg: 'var(--bg-surface)', label: 'Offline' },
}

export default function Team() {
  const { state } = useStore()
  const { isLight } = useTheme()
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  const team = state.team
  const filteredTeam = filter === 'All' ? team : team.filter(m => m.department === filter)
  const onlineCount = team.filter(m => m.status === 'online').length
  const avgEfficiency = team.length > 0 ? Math.round(team.reduce((sum, m) => sum + m.stats.efficiency, 0) / team.length) : 0

  const accent = isLight ? '#007AFF' : 'var(--accent)'
  const primaryBtn = isLight ? { background: '#007AFF', color: '#fff', fontWeight: 600 } : { background: 'var(--accent)', color: '#000' }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[15px] font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>TEAM</h1>
          <div className="flex" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-pill)', padding: '2px' }}>
            {departments.map(d => (
              <button key={d} onClick={() => setFilter(d)}
                className="px-2.5 py-1 text-[10px] font-medium rounded-full transition-all"
                style={{
                  background: filter === d ? accent : 'transparent',
                  color: filter === d ? (isLight ? '#fff' : 'var(--bg-app)') : 'var(--text-secondary)',
                }}>
                {d.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <button className="px-4 py-2 text-[11px] font-semibold rounded-lg transition-all" style={primaryBtn}>+ INVITE</button>
      </div>
      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
        <div className="flex-1 grid grid-cols-3 gap-4 content-start overflow-auto">
          {filteredTeam.map(m => (
            <div key={m.id} onClick={() => setSelected(m)}
              className="rounded-lg p-4 cursor-pointer transition-all"
              style={{ background: 'var(--bg-card)', border: selected?.id === m.id ? `1px solid ${accent}` : '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}
              onMouseEnter={e => { if (selected?.id !== m.id) e.currentTarget.style.borderColor = accent }}
              onMouseLeave={e => { if (selected?.id !== m.id) e.currentTarget.style.borderColor = 'var(--border-card)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold"
                      style={{ background: m.avatarColor, color: '#fff' }}>{m.avatar}</div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                      style={{ background: statusConfig[m.status].color, borderColor: 'var(--bg-card)' }} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{m.name}</h3>
                    <p className="text-[10px]" style={{ color: m.avatarColor }}>{m.role}</p>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>{m.department}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                  <div className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{m.stats.tasks}</div>
                  <div className="text-[8px]" style={{ color: 'var(--text-tertiary)' }}>TASKS</div>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                  <div className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{m.stats.completed}</div>
                  <div className="text-[8px]" style={{ color: 'var(--text-tertiary)' }}>DONE</div>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                  <div className="text-[12px] font-bold" style={{ color: 'var(--color-done)' }}>{m.stats.efficiency}%</div>
                  <div className="text-[8px]" style={{ color: 'var(--text-tertiary)' }}>EFF</div>
                </div>
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{m.location} • since {m.joined}</div>
            </div>
          ))}
        </div>
        {/* Right Panel */}
        <div className="w-72 flex-shrink-0 rounded-lg overflow-hidden flex flex-col" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-card)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
            <h3 className="text-[11px] font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>TEAM STATS</h3>
          </div>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center"><div className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>{team.length}</div><div className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>MEMBERS</div></div>
              <div className="text-center"><div className="text-[18px] font-bold" style={{ color: 'var(--color-done)' }}>{onlineCount}</div><div className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>ONLINE</div></div>
              <div className="text-center"><div className="text-[18px] font-bold" style={{ color: accent }}>{avgEfficiency}%</div><div className="text-[9px]" style={{ color: 'var(--text-secondary)' }}>AVG EFF</div></div>
            </div>
          </div>
          {selected ? (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-bold" style={{ background: selected.avatarColor, color: '#fff' }}>{selected.avatar}</div>
                  <div><h3 className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{selected.name}</h3><p className="text-[11px]" style={{ color: selected.avatarColor }}>{selected.role}</p></div>
                </div>
                <div className="space-y-3 mb-4">
                  {Object.entries({ Status: statusConfig[selected.status].label, Department: selected.department, Location: selected.location, Email: selected.email, Joined: selected.joined }).map(([k,v]) => (
                    <div key={k} className="flex items-center justify-between"><span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{k}</span><span className="text-[10px]" style={{ color: 'var(--text-primary)' }}>{v}</span></div>
                  ))}
                </div>
                <div className="mb-4"><span className="text-[10px] block mb-2" style={{ color: 'var(--text-secondary)' }}>Current Project</span><div className="px-3 py-2 rounded-lg text-[11px]" style={{ background: 'var(--bg-surface)', color: accent }}>{selected.currentProject}</div></div>
                <div><span className="text-[10px] block mb-2" style={{ color: 'var(--text-secondary)' }}>Skills</span><div className="flex flex-wrap gap-1">{selected.skills.map(s => <span key={s} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>{s}</span>)}</div></div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4"><p className="text-[11px] text-center" style={{ color: 'var(--text-secondary)' }}>Select a team member to view details</p></div>
          )}
        </div>
      </div>
    </div>
  )
}
