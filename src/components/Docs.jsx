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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center justify-between md:justify-start gap-4">
          <h1 className="text-[16px] font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>DOCUMENTS</h1>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
            {totalCount} TOTAL
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:flex-initial">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="px-3 py-2 text-[11px] rounded-lg w-full md:w-32 lg:w-48 outline-none"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)', color: 'var(--text-primary)' }} />
          </div>
          <button className="px-4 py-2 text-[11px] font-bold rounded-lg transition-all shadow-lg bg-accent text-white active:scale-95 whitespace-nowrap">+ NEW DOC</button>
        </div>
      </div>

      <div className="flex flex-1 gap-0 md:gap-4 min-h-0 overflow-hidden relative">
        {/* Sidebar list */}
        <div className={`
          w-full md:w-72 flex-shrink-0 flex flex-col rounded-xl overflow-hidden transition-all duration-300
          ${selectedDoc ? 'hidden md:flex' : 'flex'}
        `} style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border-card)' }}>
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
             <h3 className="text-[10px] uppercase font-bold tracking-[0.15em] opacity-50">Exploration</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-2 space-y-4">
              {recentDocs.length > 0 && !search && (
                <div>
                  <h3 className="text-[9px] uppercase font-bold tracking-widest px-3 py-2 text-accent">Recent Docs</h3>
                  <div className="space-y-1">
                    {recentDocs.map(doc => (
                      <div key={doc.id} onClick={() => setSelectedDoc(doc)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${selectedDoc?.id === doc.id ? 'bg-selected border-accent/20' : 'border-transparent hover:bg-surface/50'}`}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border bg-surface/50" 
                             style={{ color: typeColors[doc.type], borderColor: `${typeColors[doc.type]}20` }}>
                          {doc.type === 'markdown' ? 'MD' : doc.type === 'pdf' ? 'PDF' : 'DOC'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold truncate" style={{ color: 'var(--text-primary)' }}>{doc.name}</div>
                          <div className="text-[9px] opacity-40">{doc.modified}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-[9px] uppercase font-bold tracking-widest px-3 py-2 opacity-50">Storage Folders</h3>
                <div className="space-y-1">
                  {folderGroups.map(folder => (
                    <div key={folder.id}>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-surface/50 cursor-pointer">
                        <span className="text-[12px]">{folder.icon}</span>
                        <span className="text-[12px] flex-1 font-medium" style={{ color: 'var(--text-primary)' }}>{folder.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface" style={{ color: 'var(--text-tertiary)' }}>{folder.docs.length}</span>
                      </div>
                      <div className="ml-4 mt-1 border-l pl-2 space-y-1" style={{ borderColor: 'var(--border-default)' }}>
                        {folder.docs.map(doc => (
                          <div key={doc.id} onClick={() => setSelectedDoc(doc)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${selectedDoc?.id === doc.id ? 'bg-selected text-accent' : 'text-secondary hover:bg-surface/30'}`}>
                            <span className="text-[11px] flex-1 truncate">{doc.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className={`
          flex-1 md:rounded-xl overflow-hidden transition-all duration-300
          fixed inset-0 z-[60] md:relative md:inset-auto md:z-auto md:flex
          ${selectedDoc ? 'translate-x-0 opacity-100 flex' : 'translate-x-full opacity-0 md:translate-x-0 md:opacity-100 hidden'}
        `} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
          {selectedDoc ? (
            <div className="h-full flex flex-col w-full">
              <div className="p-4 md:p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)/30' }}>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedDoc(null)} className="md:hidden p-2 -ml-2 text-secondary hover:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold border bg-surface/50"
                      style={{ color: typeColors[selectedDoc.type], borderColor: `${typeColors[selectedDoc.type]}20` }}>
                      {selectedDoc.type?.toUpperCase().slice(0,2)}
                    </div>
                    <div>
                      <h2 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{selectedDoc.name}</h2>
                      <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                        <span className="font-mono">{selectedDoc.type}</span><span>•</span><span>{selectedDoc.modified}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button className="hidden md:flex p-2 px-3 text-[11px] font-bold rounded-lg border hover:bg-surface transition-all" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>EDIT</button>
                   <button className="p-2 px-4 text-[11px] font-bold rounded-lg bg-accent text-white hover:opacity-90 shadow-lg shadow-accent/20 transition-all">OPEN</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                <div className="max-w-2xl mx-auto space-y-8">
                  <h1 className="text-[28px] md:text-[36px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{selectedDoc.name}</h1>
                  <div className="flex flex-wrap items-center gap-6 py-4 border-y" style={{ borderColor: 'var(--border-default)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-soft)', color: 'var(--text-secondary)' }}>
                        {selectedDoc.author?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold opacity-40">Author</span>
                        <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{selectedDoc.author}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold opacity-40">Modified</span>
                      <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{selectedDoc.modified}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold opacity-40">File Size</span>
                      <span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{selectedDoc.size}</span>
                    </div>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-[14px] leading-loose opacity-70" style={{ color: 'var(--text-primary)' }}>
                      This document is synchronizing with the central repository. All changes are being tracked in real-time.
                      You can continue editing by clicking the pen icon or opening the full editor.
                    </p>
                    <div className="p-6 rounded-2xl bg-surface/30 border-2 border-dashed mt-10 flex flex-col items-center justify-center text-center" style={{ borderColor: 'var(--border-soft)' }}>
                       <div className="text-4xl mb-4">📄</div>
                       <p className="text-[12px] opacity-40">Markdown content preview not available for this record.</p>
                       <button className="mt-4 text-accent text-[12px] font-bold hover:underline">Download Original</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full hidden md:flex items-center justify-center opacity-30">
              <div className="text-center">
                <div className="text-[64px] mb-4">📂</div>
                <p className="text-[13px] font-medium">Select a resource to begin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

