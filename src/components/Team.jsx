import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../StoreContext'

const departmentColors = { AI: '#f59e0b', Engineering: '#3b82f6', Design: '#a855f7', Product: '#22c55e', Infrastructure: '#f59e0b' }
const departments = ['All', 'AI', 'Engineering', 'Design', 'Product', 'Infrastructure']
const statusConfig = { online: { color: '#22c55e', label: 'Online' }, away: { color: '#f59e0b', label: 'Away' }, offline: { color: '#666666', label: 'Offline' } }

export default function Team() {
  const { state } = useStore()
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  const team = state.team
  const filteredTeam = filter === 'All' ? team : team.filter(m => m.department === filter)
  const onlineCount = team.filter(m => m.status === 'online').length
  const avgEfficiency = team.length > 0 ? Math.round(team.reduce((sum, m) => sum + m.stats.efficiency, 0) / team.length) : 0

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[15px] font-bold text-white font-mono tracking-wider">TEAM</h1>
          <div className="flex gap-1">
            {departments.map(d => (
              <button key={d} onClick={() => setFilter(d)}
                className="px-2.5 py-1 text-[10px] font-mono rounded transition-all"
                style={{ background: filter === d ? '#252525' : 'transparent', color: filter === d ? '#19c3ff' : '#666666', border: filter === d ? '1px solid #333333' : '1px solid transparent' }}>
                {d.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <button className="px-4 py-2 text-[11px] font-mono font-semibold rounded transition-all hover:brightness-110"
          style={{ background: '#19c3ff', color: '#000' }}>+ INVITE</button>
      </div>
      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
        <div className="flex-1 grid grid-cols-3 gap-4 content-start overflow-auto">
          {filteredTeam.map(m => (
            <div key={m.id} onClick={() => setSelected(m)}
              className="rounded-lg p-4 cursor-pointer transition-all"
              style={{ background: '#1a1a1a', border: selected?.id === m.id ? '1px solid #19c3ff' : '1px solid #2a2a2a' }}
              onMouseEnter={e => { if (selected?.id !== m.id) e.currentTarget.style.borderColor = '#444' }}
              onMouseLeave={e => { if (selected?.id !== m.id) e.currentTarget.style.borderColor = '#2a2a2a' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-bold font-mono"
                      style={{ background: m.avatarColor, color: '#fff' }}>{m.avatar}</div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                      style={{ background: statusConfig[m.status].color, borderColor: '#1a1a1a' }} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-white font-mono">{m.name}</h3>
                    <p className="text-[10px] font-mono" style={{ color: m.avatarColor }}>{m.role}</p>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded" style={{ background: `${departmentColors[m.department]}15`, color: departmentColors[m.department] }}>{m.department}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 rounded" style={{ background: '#111111' }}><div className="text-[12px] font-bold text-white font-mono">{m.stats.tasks}</div><div className="text-[8px] font-mono text-[#555]">TASKS</div></div>
                <div className="text-center p-2 rounded" style={{ background: '#111111' }}><div className="text-[12px] font-bold text-white font-mono">{m.stats.completed}</div><div className="text-[8px] font-mono text-[#555]">DONE</div></div>
                <div className="text-center p-2 rounded" style={{ background: '#111111' }}><div className="text-[12px] font-bold font-mono" style={{ color: '#22c55e' }}>{m.stats.efficiency}%</div><div className="text-[8px] font-mono text-[#555]">EFF</div></div>
              </div>
              <div className="text-[10px] font-mono" style={{ color: '#555' }}>{m.location} • since {m.joined}</div>
            </div>
          ))}
        </div>
        <div className="w-72 flex-shrink-0 rounded-lg overflow-hidden flex flex-col" style={{ background: '#111111' }}>
          <div className="p-4 border-b" style={{ borderColor: '#1a1a1a' }}><h3 className="text-[11px] font-bold text-white font-mono tracking-wider">TEAM STATS</h3></div>
          <div className="p-4 border-b" style={{ borderColor: '#1a1a1a' }}>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center"><div className="text-[18px] font-bold text-white font-mono">{team.length}</div><div className="text-[9px] font-mono text-[#666]">MEMBERS</div></div>
              <div className="text-center"><div className="text-[18px] font-bold font-mono" style={{ color: '#22c55e' }}>{onlineCount}</div><div className="text-[9px] font-mono text-[#666]">ONLINE</div></div>
              <div className="text-center"><div className="text-[18px] font-bold font-mono" style={{ color: '#19c3ff' }}>{avgEfficiency}%</div><div className="text-[9px] font-mono text-[#666]">AVG EFF</div></div>
            </div>
          </div>
          {selected ? (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-bold font-mono" style={{ background: selected.avatarColor, color: '#fff' }}>{selected.avatar}</div>
                  <div><h3 className="text-[14px] font-bold text-white font-mono">{selected.name}</h3><p className="text-[11px] font-mono" style={{ color: selected.avatarColor }}>{selected.role}</p></div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between"><span className="text-[10px] font-mono text-[#666]">Status</span><span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: `${statusConfig[selected.status].color}15`, color: statusConfig[selected.status].color }}>{statusConfig[selected.status].label}</span></div>
                  <div className="flex items-center justify-between"><span className="text-[10px] font-mono text-[#666]">Department</span><span className="text-[10px] font-mono text-white">{selected.department}</span></div>
                  <div className="flex items-center justify-between"><span className="text-[10px] font-mono text-[#666]">Location</span><span className="text-[10px] font-mono text-white">{selected.location}</span></div>
                  <div className="flex items-center justify-between"><span className="text-[10px] font-mono text-[#666]">Email</span><span className="text-[10px] font-mono text-white">{selected.email}</span></div>
                  <div className="flex items-center justify-between"><span className="text-[10px] font-mono text-[#666]">Joined</span><span className="text-[10px] font-mono text-white">{selected.joined}</span></div>
                </div>
                <div className="mb-4"><span className="text-[10px] font-mono text-[#666] block mb-2">Current Project</span><div className="px-3 py-2 rounded text-[11px] font-mono" style={{ background: '#1a1a1a', color: '#19c3ff' }}>{selected.currentProject}</div></div>
                <div><span className="text-[10px] font-mono text-[#666] block mb-2">Skills</span><div className="flex flex-wrap gap-1">{selected.skills.map(s => <span key={s} className="text-[9px] font-mono px-2 py-0.5 rounded" style={{ background: '#252525', color: '#888' }}>{s}</span>)}</div></div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4"><p className="text-[11px] font-mono text-[#666] text-center">Select a team member to view details</p></div>
          )}
        </div>
      </div>
    </div>
  )
}