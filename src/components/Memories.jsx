import { useState } from 'react'
import { useStore } from '../StoreContext'

const categories = {
  work: { color: '#19c3ff', label: 'Work' },
  personal: { color: '#22c55e', label: 'Personal' },
  idea: { color: '#f59e0b', label: 'Ideas' },
  decision: { color: '#a855f7', label: 'Decisions' },
  learning: { color: '#06b6d4', label: 'Learning' },
}

export default function Memories() {
  const { state } = useStore()
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const memories = state.memories

  const filteredMemories = memories.filter(m => {
    const matchesCategory = filter === 'all' || m.category === filter
    const matchesSearch = !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const pinnedMemories = filteredMemories.filter(m => m.pinned)
  const regularMemories = filteredMemories.filter(m => !m.pinned)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[15px] font-bold text-white font-mono tracking-wider">MEMORIES</h1>
          <div className="flex gap-1">
            {['all', 'work', 'personal', 'idea', 'decision', 'learning'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-2 py-1 text-[10px] font-mono rounded transition-all"
                style={{ background: filter === f ? '#252525' : 'transparent', color: filter === f ? (categories[f]?.color || '#19c3ff') : '#666666', border: filter === f ? '1px solid #333333' : '1px solid transparent' }}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="px-3 py-2 text-[11px] font-mono rounded w-48"
            style={{ background: '#1a1a1a', border: '1px solid #333333', color: '#fff', outline: 'none' }} />
          <button className="px-4 py-2 text-[11px] font-mono font-semibold rounded transition-all hover:brightness-110"
            style={{ background: '#19c3ff', color: '#000' }}>+ CAPTURE</button>
        </div>
      </div>
      <div className="flex flex-1 gap-0 min-h-0 overflow-hidden">
        <div className="w-80 flex-shrink-0 flex flex-col rounded-lg overflow-hidden" style={{ background: '#111111' }}>
          <div className="p-4 border-b" style={{ borderColor: '#1a1a1a' }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#666]">FILTERED</span>
              <span className="text-[11px] font-mono" style={{ color: '#19c3ff' }}>{filteredMemories.length} entries</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {pinnedMemories.length > 0 && (
              <div className="mb-4">
                <div className="text-[9px] font-mono text-[#19c3ff] uppercase tracking-widest px-2 py-1 mb-2">PINNED</div>
                {pinnedMemories.map(memory => <MemoryItem key={memory.id} memory={memory} selected={selected?.id === memory.id} onClick={() => setSelected(selected?.id === memory.id ? null : memory)} />)}
              </div>
            )}
            {regularMemories.length > 0 && (
              <div>
                <div className="text-[9px] font-mono text-[#666] uppercase tracking-widest px-2 py-1 mb-2">TIMELINE</div>
                {regularMemories.map(memory => <MemoryItem key={memory.id} memory={memory} selected={selected?.id === memory.id} onClick={() => setSelected(selected?.id === memory.id ? null : memory)} />)}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 ml-4 rounded-lg overflow-hidden" style={{ background: '#111111' }}>
          {selected ? (
            <div className="h-full flex flex-col">
              <div className="p-5 border-b" style={{ borderColor: '#1a1a1a' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: categories[selected.category].color }} />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: `${categories[selected.category].color}15`, color: categories[selected.category].color }}>{categories[selected.category].label}</span>
                  {selected.pinned && <span className="text-[10px] font-mono" style={{ color: '#f59e0b' }}>★ PINNED</span>}
                </div>
                <h2 className="text-[16px] font-bold text-white font-mono mb-1">{selected.title}</h2>
                <div className="flex items-center gap-3 text-[10px] font-mono" style={{ color: '#666' }}>
                  <span>{selected.date}</span><span>•</span><span>{selected.time}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <p className="text-[12px] font-mono text-[#888] leading-relaxed mb-6">{selected.excerpt}</p>
                {selected.messages.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-mono text-[#666] uppercase tracking-wider">CONVERSATION</h3>
                    {selected.messages.map((msg, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold font-mono flex-shrink-0 mt-0.5" style={{ background: '#252525', color: '#888' }}>{msg.role[0]}</div>
                        <div className="flex-1">
                          <div className="text-[11px] font-mono font-semibold mb-1" style={{ color: '#19c3ff' }}>{msg.role}</div>
                          <div className="text-[12px] font-mono text-[#aaa] leading-relaxed">{msg.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex gap-2" style={{ borderColor: '#1a1a1a' }}>
                {selected.tags.map(tag => <span key={tag} className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: '#1a1a1a', color: '#666', border: '1px solid #2a2a2a' }}>#{tag}</span>)}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center"><div className="text-center"><div className="text-[48px] mb-4">◉</div><p className="text-[12px] font-mono text-[#666]">Select a memory to view details</p></div></div>
          )}
        </div>
      </div>
    </div>
  )
}

function MemoryItem({ memory, selected, onClick }) {
  return (
    <div onClick={onClick} className="p-3 rounded-lg cursor-pointer transition-all mb-2"
      style={{ background: selected ? '#252525' : 'transparent', borderLeft: selected ? `2px solid ${categories[memory.category].color}` : '2px solid transparent' }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#1a1a1a' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}>
      <div className="flex items-start gap-2">
        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: categories[memory.category].color }} />
        <div className="flex-1 min-w-0">
          <h4 className="text-[12px] font-mono text-white truncate mb-1">{memory.title}</h4>
          <p className="text-[10px] font-mono text-[#555] line-clamp-2 leading-relaxed">{memory.excerpt}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[9px] font-mono" style={{ color: '#444' }}>{memory.date}</span>
            {memory.pinned && <span style={{ color: '#f59e0b', fontSize: '8px' }}>★</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
