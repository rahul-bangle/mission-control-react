import { useState } from 'react'
import { useTheme } from '../ThemeContext'
import { useStore } from '../StoreContext'

const categories = {
  work: { color: 'var(--accent)', bg: 'var(--accent)20', label: 'Work' },
  personal: { color: 'var(--color-done)', bg: 'var(--color-done)20', label: 'Personal' },
  idea: { color: 'var(--color-high)', bg: 'var(--color-high)20', label: 'Ideas' },
  decision: { color: 'var(--color-review)', bg: 'var(--color-review)20', label: 'Decisions' },
  learning: { color: '#06b6d4', bg: '#06b6d420', label: 'Learning' },
}

export default function Memories() {
  const { state } = useStore()
  const { isLight } = useTheme()
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const memories = state.memories
  const filteredMemories = memories.filter(m => {
    const matchesCategory = filter === 'all' || m.category === filter
    const matchesSearch = !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const pinnedMemories = filteredMemories.filter(m => m.pinned)
  const regularMemories = filteredMemories.filter(m => !m.pinned)
  const accent = isLight ? '#007AFF' : 'var(--accent)'
  const primaryBtn = isLight ? { background: '#007AFF', color: '#fff', fontWeight: 600 } : { background: 'var(--accent)', color: '#000' }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center justify-between md:justify-start gap-4">
          <h1 className="text-[16px] font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>MEMORIES</h1>
          <div className="flex no-scrollbar overflow-x-auto" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-pill)', padding: '2px' }}>
            {['all', 'work', 'personal', 'idea'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-1 text-[10px] font-medium rounded-full transition-all whitespace-nowrap"
                style={{
                  background: filter === f ? accent : 'transparent',
                  color: filter === f ? (isLight ? '#fff' : 'var(--bg-app)') : 'var(--text-secondary)',
                }}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:flex-initial">
             <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="px-3 py-2 text-[11px] rounded-lg w-full md:w-32 lg:w-48 outline-none"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }} />
          </div>
          <button className="px-4 py-2 text-[11px] font-bold rounded-lg transition-all shadow-lg bg-accent text-white active:scale-95 whitespace-nowrap">
            + CAPTURE
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-0 md:gap-4 min-h-0 overflow-hidden relative">
        {/* Sidebar list */}
        <div className={`
          w-full md:w-80 flex-shrink-0 flex flex-col rounded-xl overflow-hidden transition-all duration-300
          ${selected ? 'hidden md:flex' : 'flex'}
        `} style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-card)' }}>
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Timeline</span>
            <span className="text-[10px] font-bold text-accent">{filteredMemories.length} ENTRIES</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {pinnedMemories.length > 0 && (
              <div className="mb-4">
                <div className="text-[9px] uppercase tracking-widest px-2 py-1 mb-1 opacity-50">Pinned</div>
                {pinnedMemories.map(memory => <MemoryItem key={memory.id} memory={memory} selected={selected?.id === memory.id} onClick={() => setSelected(memory)} />)}
              </div>
            )}
            {regularMemories.length > 0 && (
              <div>
                <div className="text-[9px] uppercase tracking-widest px-2 py-1 mb-1 opacity-50">Recent History</div>
                {regularMemories.map(memory => <MemoryItem key={memory.id} memory={memory} selected={selected?.id === memory.id} onClick={() => setSelected(memory)} />)}
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className={`
          flex-1 md:rounded-xl overflow-hidden transition-all duration-300
          fixed inset-0 z-[60] md:relative md:inset-auto md:z-auto md:flex
          ${selected ? 'translate-x-0 opacity-100 flex' : 'translate-x-full opacity-0 md:translate-x-0 md:opacity-100 hidden'}
        `} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
          {selected ? (
            <div className="h-full flex flex-col w-full">
              <div className="p-4 md:p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)/30' }}>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelected(null)} className="md:hidden p-2 -ml-2 text-secondary hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: categories[selected.category]?.bg, color: categories[selected.category]?.color }}>
                        {selected.category}
                      </span>
                      <span className="text-[9px] opacity-40 font-mono">{selected.date}</span>
                    </div>
                    <h2 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{selected.title}</h2>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button className="p-2 rounded-lg border hover:bg-surface transition-all" style={{ borderColor: 'var(--border-default)' }}>
                     <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                   </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                <p className="text-[13px] leading-relaxed mb-8 opacity-80" style={{ color: 'var(--text-primary)' }}>{selected.excerpt}</p>
                {selected.messages.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent border-b pb-2 flex items-center gap-2">
                       <span className="w-4 h-[1px] bg-accent"></span>
                       Source Conversation
                    </h3>
                    {selected.messages.map((msg, i) => (
                      <div key={i} className={`flex gap-3 group`}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 border"
                          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-soft)', color: msg.role === 'rahul' ? 'var(--text-primary)' : accent }}>
                          {msg.role[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold mb-1 opacity-40 uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>{msg.role}</div>
                          <div className="text-[13px] leading-relaxed p-3 rounded-xl border bg-surface/30 group-hover:bg-surface/50 transition-all" style={{ borderColor: 'var(--border-soft)' }}>{msg.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex flex-wrap gap-2 mt-auto" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-sidebar)' }}>
                {selected.tags.map(tag => <span key={tag} className="text-[10px] px-2.5 py-1 rounded-lg border bg-surface/50 font-medium"
                  style={{ borderColor: 'var(--border-soft)', color: 'var(--text-secondary)' }}>#{tag}</span>)}
              </div>
            </div>
          ) : (
            <div className="h-full hidden md:flex items-center justify-center opacity-30">
              <div className="text-center">
                <div className="text-[64px] mb-4">🔮</div>
                <p className="text-[13px] font-medium">Select a memory shard to expand</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MemoryItem({ memory, selected, onClick }) {
  const cat = categories[memory.category] || categories.work
  return (
    <div onClick={onClick} className="p-3 rounded-xl cursor-pointer transition-all mb-2 group relative border"
      style={{ 
        background: selected ? 'var(--bg-selected)' : 'transparent',
        borderColor: selected ? `${cat.color}40` : 'transparent'
      }}>
      <div className="flex items-start gap-3">
        <div className="w-1.5 h-full absolute left-0 top-0 rounded-l-xl transition-all" style={{ background: selected ? cat.color : 'transparent' }} />
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-[14px] flex-shrink-0 border bg-surface/50 group-hover:scale-105 transition-transform" 
             style={{ color: cat.color, borderColor: `${cat.color}20` }}>
          {memory.category === 'idea' ? '💡' : memory.category === 'work' ? '💼' : memory.category === 'personal' ? '👤' : '📝'}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-bold truncate mb-0.5" style={{ color: 'var(--text-primary)' }}>{memory.title}</h4>
          <p className="text-[11px] line-clamp-1 opacity-60 leading-relaxed">{memory.excerpt}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px] font-mono opacity-40">{memory.date}</span>
            {memory.pinned && <span className="text-accent text-[12px]">★</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

