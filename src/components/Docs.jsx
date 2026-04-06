import { useState } from 'react'
import { useTheme } from '../ThemeContext'
import { useStore } from '../StoreContext'

const typeColors = { markdown: '#888888', pdf: '#ef4444', doc: '#3b82f6', spreadsheet: '#22c55e' }

export default function Docs() {
  const { state } = useStore()
  const { isLight } = useTheme()
  const docs = state.docs || []
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [search, setSearch] = useState('')

  const folders = [
    { id: 'projects', name: 'Projects', icon: '▣' },
    { id: 'meetings', name: 'Meeting Notes', icon: '◈' },
    { id: 'templates', name: 'Templates', icon: '◇' },
    { id: 'archive', name: 'Archive', icon: '◻' },
  ]

  const folderGroups = folders.map(f => ({
    ...f,
    docs: docs.filter(d => d.folder === f.id).filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()))
  })).filter(f => f.docs.length > 0 || !search)

  const totalCount = docs.length
  const recentDocs = [...docs].sort((a, b) => {
    const t = { '2h ago': 0, '1d ago': 1, '3d ago': 2, '1mo ago': 3, '1w ago': 4, '2w ago': 5 }
    return (t[a.modified] ?? 99) - (t[b.modified] ?? 99)
  }).slice(0, 5)

  const accent = isLight ? '#007AFF' : 'var(--accent)'
  const primaryBtn = isLight ? { background: '#007AFF', color: '#fff', fontWeight: 600 } : { background: 'var(--accent)', color: '#000' }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[15px] font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>DOCUMENTS</h1>
          <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
            {totalCount} docs
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search docs..."
            className="px-3 py-2 text-[11px] rounded-lg w-48"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)', outline: 'none' }} />
          <button className="px-4 py-2 text-[11px] font-semibold rounded-lg transition-all" style={primaryBtn}>+ NEW DOC</button>
        </div>
      </div>
      <div className="flex flex-1 gap-0 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 flex flex-col rounded-lg overflow-hidden" style={{ background: 'var(--bg-sidebar)', border: isLight ? '1px solid var(--border-sidebar)' : 'none' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
            <h3 className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>RECENT</h3>
          </div>
          <div className="p-2">
            {recentDocs.map(doc => (
              <div key={doc.id} onClick={() => setSelectedDoc(doc)}
                className="flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-all"
                style={{ background: selectedDoc?.id === doc.id ? 'var(--bg-selected)' : 'transparent', borderLeft: selectedDoc?.id === doc.id ? `2px solid ${accent}` : '2px solid transparent' }}
                onMouseEnter={e => { if (selectedDoc?.id !== doc.id) e.currentTarget.style.background = 'var(--bg-hover)' }}
                onMouseLeave={e => { if (selectedDoc?.id !== doc.id) e.currentTarget.style.background = 'transparent' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] truncate" style={{ color: 'var(--text-primary)' }}>{doc.name}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>{doc.modified}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t" style={{ borderColor: 'var(--border-default)' }}>
            <h3 className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>FOLDERS</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {folderGroups.map(folder => (
              <div key={folder.id}>
                <div className="flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-all"
                  style={{ background: 'var(--bg-surface)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}>
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>▼</span>
                  <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{folder.icon}</span>
                  <span className="text-[12px] flex-1" style={{ color: 'var(--text-primary)' }}>{folder.name}</span>
                  <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>{folder.docs.length}</span>
                </div>
                <div className="ml-4">
                  {folder.docs.map(doc => (
                    <div key={doc.id} onClick={() => setSelectedDoc(doc)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all"
                      style={{ background: selectedDoc?.id === doc.id ? 'var(--bg-selected)' : 'transparent' }}
                      onMouseEnter={e => { if (selectedDoc?.id !== doc.id) e.currentTarget.style.background = 'var(--bg-hover)' }}
                      onMouseLeave={e => { if (selectedDoc?.id !== doc.id) e.currentTarget.style.background = 'transparent' }}>
                      <div className="w-4 h-4 rounded flex items-center justify-center text-[6px] font-bold"
                        style={{ background: 'var(--bg-surface)', color: typeColors[doc.type] }}>M</div>
                      <span className="text-[11px] flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{doc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Detail */}
        <div className="flex-1 ml-4 rounded-lg overflow-hidden" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-card)' }}>
          {selectedDoc ? (
            <div className="h-full flex flex-col">
              <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>MD</div>
                  <div>
                    <h2 className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{selectedDoc.name}</h2>
                    <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                      <span>markdown</span><span>•</span><span>Last edited {selectedDoc.modified}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-[10px] rounded-lg transition-all" style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>EDIT</button>
                  <button className="px-3 py-1.5 text-[10px] rounded-lg transition-all" style={primaryBtn}>OPEN</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="space-y-4">
                  <h1 className="text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>{selectedDoc.name}</h1>
                  <div className="flex items-center gap-4 py-3" style={{ borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold"
                        style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
                        {selectedDoc.author === 'rahul' ? 'R' : selectedDoc.author === 'aria' ? '🦞' : selectedDoc.author?.toUpperCase().slice(0,2)}
                      </div>
                      <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{selectedDoc.author}</span>
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{selectedDoc.modified}</div>
                    <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{selectedDoc.size}</div>
                  </div>
                  <div>
                    <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      This document is ready for editing. Click the Edit button above to make changes,
                      or open in your default markdown editor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center"><div className="text-[48px] mb-4" style={{ color: 'var(--text-disabled)' }}>▤</div><p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Select a document to preview</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
