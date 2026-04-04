import { useState } from 'react'
import { useStore } from '../StoreContext'

const folderIcons = { projects: '▣', meetings: '◈', templates: '◇', archive: '◻' }
const typeColors = { markdown: '#888888', pdf: '#ef4444', doc: '#3b82f6', spreadsheet: '#22c55e' }
const avatarColors = { rahul: { bg: '#19c3ff', text: '#000' }, aria: { bg: '#f59e0b', text: '#000' } }
const folders = [
  { id: 'projects', name: 'Projects', icon: '▣' },
  { id: 'meetings', name: 'Meeting Notes', icon: '◈' },
  { id: 'templates', name: 'Templates', icon: '◇' },
  { id: 'archive', name: 'Archive', icon: '◻' },
]

export default function Docs() {
  const { state } = useStore()
  const docs = state.docs || []
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [search, setSearch] = useState('')

  const folderGroups = folders.map(f => ({
    ...f,
    expanded: true,
    docs: docs.filter(d => d.folder === f.id).filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()))
  })).filter(f => f.docs.length > 0 || !search)

  const totalCount = docs.length
  const recentDocs = [...docs].sort((a, b) => {
    const t = { '2h ago': 0, '1d ago': 1, '3d ago': 2, '1d ago': 3, '3d ago': 4, '1w ago': 5, '2w ago': 6, '1mo ago': 7 }
    return (t[a.modified] ?? 99) - (t[b.modified] ?? 99)
  }).slice(0, 5)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[15px] font-bold text-white font-mono tracking-wider">DOCUMENTS</h1>
          <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: '#1a1a1a', color: '#666' }}>
            {totalCount} docs
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search docs..."
            className="px-3 py-2 text-[11px] font-mono rounded w-48"
            style={{ background: '#1a1a1a', border: '1px solid #333333', color: '#fff', outline: 'none' }} />
          <button className="px-4 py-2 text-[11px] font-mono font-semibold rounded transition-all hover:brightness-110"
            style={{ background: '#19c3ff', color: '#000' }}>+ NEW DOC</button>
        </div>
      </div>
      <div className="flex flex-1 gap-0 min-h-0 overflow-hidden">
        <div className="w-72 flex-shrink-0 flex flex-col rounded-lg overflow-hidden" style={{ background: '#111111' }}>
          <div className="p-4 border-b" style={{ borderColor: '#1a1a1a' }}>
            <h3 className="text-[10px] font-mono text-[#666] uppercase tracking-wider">RECENT</h3>
          </div>
          <div className="p-2">
            {recentDocs.map(doc => (
              <div key={doc.id} onClick={() => setSelectedDoc(doc)}
                className="flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-all"
                style={{ background: selectedDoc?.id === doc.id ? '#252525' : 'transparent', borderLeft: selectedDoc?.id === doc.id ? '2px solid #19c3ff' : '2px solid transparent' }}
                onMouseEnter={e => { if (selectedDoc?.id !== doc.id) e.currentTarget.style.background = '#1a1a1a' }}
                onMouseLeave={e => { if (selectedDoc?.id !== doc.id) e.currentTarget.style.background = 'transparent' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-mono text-white truncate">{doc.name}</div>
                  <div className="text-[9px] font-mono" style={{ color: '#555' }}>{doc.modified}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t" style={{ borderColor: '#1a1a1a' }}>
            <h3 className="text-[10px] font-mono text-[#666] uppercase tracking-wider">FOLDERS</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {folderGroups.map(folder => (
              <div key={folder.id}>
                <div className="flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-all" style={{ background: '#1a1a1a' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#252525'} onMouseLeave={e => e.currentTarget.style.background = '#1a1a1a'}>
                  <span className="text-[10px]" style={{ color: '#666' }}>▼</span>
                  <span className="text-[12px]" style={{ color: '#888' }}>{folder.icon}</span>
                  <span className="text-[12px] font-mono text-white flex-1">{folder.name}</span>
                  <span className="text-[9px] font-mono" style={{ color: '#555' }}>{folder.docs.length}</span>
                </div>
                <div className="ml-4">
                  {folder.docs.map(doc => (
                    <div key={doc.id} onClick={() => setSelectedDoc(doc)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all"
                      style={{ background: selectedDoc?.id === doc.id ? '#252525' : 'transparent' }}
                      onMouseEnter={e => { if (selectedDoc?.id !== doc.id) e.currentTarget.style.background = '#1a1a1a' }}
                      onMouseLeave={e => { if (selectedDoc?.id !== doc.id) e.currentTarget.style.background = 'transparent' }}>
                      <div className="w-4 h-4 rounded flex items-center justify-center text-[6px] font-bold"
                        style={{ background: '#252525', color: typeColors[doc.type] }}>M</div>
                      <span className="text-[11px] font-mono text-[#888] flex-1 truncate">{doc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 ml-4 rounded-lg overflow-hidden" style={{ background: '#111111' }}>
          {selectedDoc ? (
            <div className="h-full flex flex-col">
              <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#1a1a1a' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold" style={{ background: '#252525', color: '#888' }}>MD</div>
                  <div>
                    <h2 className="text-[14px] font-bold text-white font-mono">{selectedDoc.name}</h2>
                    <div className="flex items-center gap-2 text-[10px] font-mono" style={{ color: '#666' }}>
                      <span>markdown</span><span>•</span><span>Last edited {selectedDoc.modified}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-[10px] font-mono rounded" style={{ border: '1px solid #333', color: '#888' }}>EDIT</button>
                  <button className="px-3 py-1.5 text-[10px] font-mono rounded" style={{ background: '#19c3ff', color: '#000' }}>OPEN</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="space-y-4">
                  <h1 className="text-[20px] font-bold text-white font-mono">{selectedDoc.name}</h1>
                  <div className="flex items-center gap-4 py-3" style={{ borderTop: '1px solid #1a1a1a', borderBottom: '1px solid #1a1a1a' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold"
                        style={{ background: avatarColors[selectedDoc.author]?.bg || '#666', color: avatarColors[selectedDoc.author]?.text || '#fff' }}>
                        {selectedDoc.author === 'rahul' ? 'R' : selectedDoc.author === 'aria' ? '🦞' : selectedDoc.author?.toUpperCase().slice(0,2)}
                      </div>
                      <span className="text-[11px] font-mono" style={{ color: '#888' }}>{selectedDoc.author}</span>
                    </div>
                    <div className="text-[11px] font-mono" style={{ color: '#555' }}>{selectedDoc.modified}</div>
                    <div className="text-[11px] font-mono" style={{ color: '#555' }}>{selectedDoc.size}</div>
                  </div>
                  <div>
                    <p className="text-[12px] font-mono text-[#888] leading-relaxed">
                      This document is ready for editing. Click the Edit button above to make changes,
                      or open in your default markdown editor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center"><div className="text-[48px] mb-4" style={{ color: '#333' }}>▤</div><p className="text-[12px] font-mono text-[#666]">Select a document to preview</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}