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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[15px] font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>MEMORIES</h1>
          <div className="flex" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-pill)', padding: '2px' }}>
            {['all', 'work', 'personal', 'idea', 'decision', 'learning'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-2 py-1 text-[10px] font-medium rounded-full transition-all"
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
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search memories..."
            className="px-3 py-2 text-[11px] rounded-lg w-48"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)', outline: 'none' }} />
          <button className="px-4 py-2 text-[11px] font-semibold rounded-lg transition-all" style={primaryBtn}>+ CAPTURE</button>
        </div>
      </div>
      <div className="flex flex-1 gap-0 min-h-0 overflow-hidden">
        {/* Sidebar list */}
        <div className="w-80 flex-shrink-0 flex flex-col rounded-lg overflow-hidden" style={{ background: 'var(--bg-sidebar)', border: isLight ? '1px solid var(--border-sidebar)' : 'none' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>FILTERED</span>
              <span className="text-[11px]" style={{ color: accent }}>{filteredMemories.length} entries</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {pinnedMemories.length > 0 && (
              <div className="mb-4">
                <div className="text-[9px] uppercase tracking-widest px-2 py-1 mb-2" style={{ color: accent }}>PINNED</div>
                {pinnedMemories.map(memory => <MemoryItem key={memory.id} memory={memory} selected={selected?.id === memory.id} onClick={() => setSelected(selected?.id === memory.id ? null : memory)} />)}
              </div>
            )}
            {regularMemories.length > 0 && (
              <div>
                <div className="text-[9px] uppercase tracking-widest px-2 py-1 mb-2" style={{ color: 'var(--text-tertiary)' }}>TIMELINE</div>
                {regularMemories.map(memory => <MemoryItem key={memory.id} memory={memory} selected={selected?.id === memory.id} onClick={() => setSelected(selected?.id === memory.id ? null : memory)} />)}
              </div>
            )}
          </div>
        </div>
        {/* Detail panel */}
        <div className="flex-1 ml-4 rounded-lg overflow-hidden" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-card)' }}>
          {selected ? (
            <div className="h-full flex flex-col">
              <div className="p-5 border-b" style={{ borderColor: 'var(--border-default)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: categories[selected.category]?.color || 'var(--accent)' }} />
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: categories[selected.category]?.bg || 'var(--accent-bg)', color: categories[selected.category]?.color || 'var(--accent)' }}>
                    {categories[selected.category]?.label || 'Uncategorized'}
                  </span>
                  {selected.pinned && <span className="text-[10px]" style={{ color: 'var(--color-high)' }}>★ PINNED</span>}
                </div>
                <h2 className="text-[16px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{selected.title}</h2>
                <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                  <span>{selected.date}</span><span>•</span><span>{selected.time}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <p className="text-[12px] leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>{selected.excerpt}</p>
                {selected.messages.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>CONVERSATION</h3>
                    {selected.messages.map((msg, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 mt-0.5"
                          style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>{msg.role[0]}</div>
                        <div className="flex-1">
                          <div className="text-[11px] font-medium mb-1" style={{ color: accent }}>{msg.role}</div>
                          <div className="text-[12px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>{msg.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex gap-2" style={{ borderColor: 'var(--border-default)' }}>
                {selected.tags.map(tag => <span key={tag} className="text-[10px] px-2 py-1 rounded-full"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: isLight ? 'none' : '1px solid var(--border-default)' }}>#{tag}</span>)}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center"><div className="text-[48px] mb-4" style={{ color: 'var(--text-tertiary)' }}>◉</div><p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Select a memory to view details</p></div>
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
    <div onClick={onClick} className="p-3 rounded-lg cursor-pointer transition-all mb-2"
      style={{ background: selected ? 'var(--bg-selected)' : 'transparent', borderLeft: selected ? `2px solid ${cat.color}` : '2px solid transparent' }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--bg-hover)' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}>
      <div className="flex items-start gap-2">
        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: cat.color }} />
        <div className="flex-1 min-w-0">
          <h4 className="text-[12px] truncate mb-1" style={{ color: 'var(--text-primary)' }}>{memory.title}</h4>
          <p className="text-[10px] line-clamp-2 leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>{memory.excerpt}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[9px]" style={{ color: 'var(--text-disabled)' }}>{memory.date}</span>
            {memory.pinned && <span style={{ color: 'var(--color-high)', fontSize: '8px' }}>★</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
