import { useState, useEffect } from 'react'
import { useTheme } from '../ThemeContext'
import { useStore } from '../StoreContext'
import agentRegistry from '../agentRegistry'

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
  const [aiAgents, setAiAgents] = useState(agentRegistry.getAgents())

  useEffect(() => {
    const unsub = agentRegistry.subscribe(agents => setAiAgents(agents))
    return unsub
  }, [])

  const mappedAi = aiAgents.map(a => ({
    id: a.id,
    name: a.name,
    role: 'AI Assistant',
    department: 'AI',
    status: a.status === 'idle' ? 'away' : (a.status === 'active' || a.status === 'running' ? 'online' : 'offline'),
    avatar: '🤖',
    avatarColor: '#10b981',
    stats: { tasks: 0, completed: 0, efficiency: 100 },
    location: 'Cloud',
    joined: new Date(a.registeredAt || Date.now()).toLocaleDateString(),
    currentProject: a.currentTask || 'Awaiting instructions...',
    skills: a.skills || ['Node', 'React', 'Autonomous'],
    rawAgent: a
  }))

  const team = [...state.team, ...mappedAi]
  const filteredTeam = filter === 'All' ? team : team.filter(m => m.department === filter)
  const onlineCount = team.filter(m => m.status === 'online').length
  const avgEfficiency = team.length > 0 ? Math.round(team.reduce((sum, m) => sum + m.stats.efficiency, 0) / team.length) : 0

  const accent = isLight ? '#007AFF' : 'var(--accent)'
  const primaryBtn = isLight ? { background: '#007AFF', color: '#fff', fontWeight: 600 } : { background: 'var(--accent)', color: '#000' }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center justify-between md:justify-start gap-4">
          <h1 className="text-[16px] font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>TEAM</h1>
          <div className="flex no-scrollbar overflow-x-auto gap-1" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-pill)', padding: '2px' }}>
            {departments.map(d => (
              <button key={d} onClick={() => setFilter(d)}
                className="px-3 py-1 text-[10px] font-medium rounded-full transition-all whitespace-nowrap"
                style={{
                  background: filter === d ? accent : 'transparent',
                  color: filter === d ? (isLight ? '#fff' : 'var(--bg-app)') : 'var(--text-secondary)',
                }}>
                {d.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <button className="px-4 py-2 text-[11px] font-bold rounded-lg transition-all shadow-lg bg-accent text-white active:scale-95 whitespace-nowrap">+ INVITE</button>
      </div>

      <div className="flex flex-1 gap-0 md:gap-6 min-h-0 overflow-hidden relative">
        {/* Main Grid Section */}
        <div className={`
          flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start overflow-y-auto no-scrollbar pb-20 md:pb-0
          ${selected ? 'hidden md:grid' : 'grid'}
        `}>
          {/* Quick Stats Header for Mobile */}
          <div className="md:hidden col-span-full grid grid-cols-3 gap-2 mb-2">
            <div className="bg-card p-3 rounded-xl border border-soft text-center">
              <div className="text-[14px] font-bold">{team.length}</div>
              <div className="text-[8px] opacity-40 uppercase">Members</div>
            </div>
            <div className="bg-card p-3 rounded-xl border border-soft text-center">
              <div className="text-[14px] font-bold text-done">{onlineCount}</div>
              <div className="text-[8px] opacity-40 uppercase">Online</div>
            </div>
            <div className="bg-card p-3 rounded-xl border border-soft text-center">
              <div className="text-[14px] font-bold text-accent">{avgEfficiency}%</div>
              <div className="text-[8px] opacity-40 uppercase">Efficiency</div>
            </div>
          </div>

          {filteredTeam.map(m => (
            <div key={m.id} onClick={() => setSelected(m)}
              className="group rounded-xl p-4 cursor-pointer transition-all border relative overflow-hidden"
              style={{ 
                background: 'var(--bg-card)', 
                borderColor: selected?.id === m.id ? accent : 'var(--border-card)', 
                boxShadow: 'var(--shadow-card)' 
              }}>
              <div className="absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full opacity-5 transition-transform group-hover:scale-150" style={{ background: m.avatarColor }}></div>
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[16px] font-bold shadow-inner"
                      style={{ background: `${m.avatarColor}20`, color: m.avatarColor }}>{m.avatar}</div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4"
                      style={{ background: statusConfig[m.status].color, borderColor: 'var(--bg-card)' }} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{m.name}</h3>
                    <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{m.role}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>{m.department}</span>
                <span className="text-[9px] font-mono opacity-30">{m.location}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-3 border-t border-soft" style={{ borderColor: 'var(--border-default)' }}>
                 <div className="text-center">
                   <div className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{m.stats.tasks}</div>
                   <div className="text-[7px] uppercase font-bold opacity-30">Tasks</div>
                 </div>
                 <div className="text-center">
                   <div className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{m.stats.completed}</div>
                   <div className="text-[7px] uppercase font-bold opacity-30">Done</div>
                 </div>
                 <div className="text-center">
                   <div className="text-[12px] font-bold" style={{ color: 'var(--color-done)' }}>{m.stats.efficiency}%</div>
                   <div className="text-[7px] uppercase font-bold opacity-30">Eff</div>
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Overlay / Panel */}
        <div className={`
          flex-shrink-0 md:w-80 rounded-xl overflow-hidden flex flex-col transition-all duration-300
          fixed inset-0 z-[60] md:relative md:inset-auto md:z-auto md:flex
          ${selected ? 'translate-x-0 opacity-100 flex' : 'translate-x-full opacity-0 md:translate-x-0 md:opacity-100 hidden'}
        `} style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-card)' }}>
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)/30' }}>
            <h3 className="text-[11px] font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
              {selected ? 'MEMBER DETAILS' : 'TEAM STATISTICS'}
            </h3>
            <button onClick={() => setSelected(null)} className="md:hidden p-2 text-secondary hover:text-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          {!selected && (
            <div className="p-4 border-b hidden md:block" style={{ borderColor: 'var(--border-default)' }}>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center"><div className="text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>{team.length}</div><div className="text-[8px] font-bold opacity-40 uppercase">Total</div></div>
                <div className="text-center"><div className="text-[20px] font-bold text-done">{onlineCount}</div><div className="text-[8px] font-bold opacity-40 uppercase">Online</div></div>
                <div className="text-center"><div className="text-[20px] font-bold text-accent">{avgEfficiency}%</div><div className="text-[8px] font-bold opacity-40 uppercase">Efficiency</div></div>
              </div>
            </div>
          )}

          {selected ? (
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-[32px] font-bold mb-3 shadow-xl" style={{ background: `${selected.avatarColor}20`, color: selected.avatarColor, border: `1px solid ${selected.avatarColor}40` }}>{selected.avatar}</div>
                  <h3 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>{selected.name}</h3>
                  <p className="text-[12px] font-medium" style={{ color: selected.avatarColor }}>{selected.role}</p>
                </div>
                
                <div className="bg-surface/30 rounded-2xl p-4 border border-soft space-y-4 mb-6">
                  {Object.entries({ Status: statusConfig[selected.status].label, Department: selected.department, Location: selected.location, Joined: selected.joined }).map(([k,v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase opacity-40">{k}</span>
                      <span className="text-[11px] font-bold" style={{ color: k === 'Status' ? statusConfig[selected.status].color : 'var(--text-primary)' }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <span className="text-[10px] font-bold uppercase opacity-40 block mb-2 tracking-widest text-accent">Active Protocol</span>
                  <div className="px-4 py-3 rounded-xl border text-[11px] font-medium leading-relaxed" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
                    {selected.currentProject}
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-[10px] font-bold uppercase opacity-40 block mb-2 tracking-widest">Capabilities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selected.skills || []).map(s => <span key={s} className="text-[10px] px-3 py-1 rounded-lg border bg-surface/50 font-bold" style={{ borderColor: 'var(--border-soft)', color: 'var(--text-secondary)' }}>{s}</span>)}
                  </div>
                </div>
                
                {selected.department === 'AI' && selected.rawAgent?.canvas ? (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-3">
                       <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent">Live Stream</span>
                       <div className="flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-urgent animate-ping"></span>
                         <span className="text-[9px] font-bold uppercase opacity-40">Syncing</span>
                       </div>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-accent/5 blur-xl group-hover:bg-accent/10 transition-colors"></div>
                      <pre className="relative text-[10px] p-4 rounded-xl overflow-auto max-h-[400px] font-mono leading-relaxed border bg-black/40 backdrop-blur-md" 
                        style={{ color: 'var(--accent)', borderColor: 'var(--accent)30' }}>
                        {typeof selected.rawAgent.canvas === 'string' ? selected.rawAgent.canvas : JSON.stringify(selected.rawAgent.canvas, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex-1 hidden md:flex items-center justify-center p-8 opacity-30 text-center">
              <div>
                 <div className="text-6xl mb-4">👥</div>
                 <p className="text-[12px] font-medium leading-relaxed">Select a crew member to<br/>view tactical statistics</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
