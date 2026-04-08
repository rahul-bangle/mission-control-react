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

  return (
    <div className="flex flex-col h-full fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center justify-between md:justify-start gap-4">
          <h1 className="text-[20px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>DOCUMENTS</h1>
          <span className="text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest bg-surface/50 border border-default fade-in" style={{ color: 'var(--text-secondary)' }}>
            {totalCount} TOTAL
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Filter resources..."
              className="px-4 py-2 text-[11px] font-medium rounded-xl w-full md:w-64 outline-none transition-all focus:ring-2 focus:ring-accent/20"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
          </div>
          <button className="px-5 py-2.5 text-[11px] font-bold rounded-xl bg-accent text-white shadow-lg shadow-accent/20 active:scale-95 transition-all whitespace-nowrap">+ NEW DOCUMENT</button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden relative">
        {/* Sidebar list */}
        <div className={`w-full md:w-80 flex-shrink-0 flex flex-col rounded-2xl overflow-hidden border border-default transition-all duration-300 ${selectedDoc ? 'hidden md:flex' : 'flex'}`} style={{ background: 'var(--bg-card)' }}>
          <div className="p-4 border-b flex items-center justify-between bg-surface/30">
             <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40">Library</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6">
            {recentDocs.length > 0 && !search && (
              <div className="fade-in">
                <h3 className="text-[9px] uppercase font-bold tracking-widest px-3 py-2 text-accent">Recently Modified</h3>
                <div className="space-y-1">
                  {recentDocs.map((doc, idx) => (
                    <div 
                      key={doc.id} onClick={() => setSelectedDoc(doc)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border group hover-lift ${selectedDoc?.id === doc.id ? 'bg-selected border-accent/20' : 'border-transparent hover:bg-surface/50'}`}
                      style={{ animationDelay: `${idx * 0.05}s` }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold border bg-card/50" 
                           style={{ color: typeColors[doc.type], borderColor: `${typeColors[doc.type]}30` }}>
                        {doc.type === 'markdown' ? 'MD' : doc.type === 'pdf' ? 'PF' : '??'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold truncate text-primary">{doc.name}</div>
                        <div className="text-[9px] opacity-40 uppercase tracking-tighter">{doc.modified}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {folderGroups.map((folder, fidx) => (
              <div key={folder.id} className="fade-in" style={{ animationDelay: `${(fidx + 1) * 0.1}s` }}>
                <h3 className="text-[9px] uppercase font-bold tracking-widest px-3 py-2 opacity-40">{folder.name}</h3>
                <div className="space-y-1">
                  {folder.docs.map(doc => (
                    <div 
                      key={doc.id} onClick={() => setSelectedDoc(doc)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all hover-lift ${selectedDoc?.id === doc.id ? 'bg-selected text-accent font-bold' : 'text-secondary hover:bg-surface/50'}`}>
                      <span className="text-[12px] opacity-60">📄</span>
                      <span className="text-[11px] flex-1 truncate">{doc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 relative">
          {selectedDoc ? (
            <div className="absolute inset-0 bg-card rounded-2xl border border-default overflow-hidden flex flex-col shadow-2xl fade-in slide-left">
              <div className="p-6 border-b flex items-center justify-between bg-surface/10">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedDoc(null)} className="md:hidden p-2 bg-surface rounded-xl text-secondary hover:text-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[13px] font-bold border bg-surface/50"
                      style={{ color: typeColors[selectedDoc.type], borderColor: `${typeColors[selectedDoc.type]}30` }}>
                      {selectedDoc.type?.toUpperCase().slice(0,2)}
                    </div>
                    <div>
                      <h2 className="text-[18px] font-bold text-primary">{selectedDoc.name}</h2>
                      <div className="flex items-center gap-2 text-[10px] text-tertiary">
                        <span className="font-mono uppercase">{selectedDoc.type}</span><span>•</span><span>{selectedDoc.modified}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                   <button className="hidden md:flex px-4 py-2 text-[11px] font-bold rounded-xl border border-default hover:bg-surface transition-all text-secondary">EDIT</button>
                   <button className="px-5 py-2.5 text-[11px] font-bold rounded-xl bg-accent text-white shadow-lg shadow-accent/20 transition-all active:scale-95">OPEN FULL EDITOR</button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <div className="max-w-3xl mx-auto space-y-10 fade-in">
                  <div className="space-y-4">
                    <h1 className="text-[40px] font-bold tracking-tight leading-[1.1] text-primary">{selectedDoc.name}</h1>
                    <div className="flex flex-wrap items-center gap-8 py-6 border-y border-default">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-default bg-surface flex items-center justify-center text-secondary font-bold">
                          {selectedDoc.author?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Owner</span>
                          <span className="text-[13px] font-bold text-primary">{selectedDoc.author}</span>
                        </div>
                      </div>
                      <div className="h-10 w-[1px] bg-default" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Last Updated</span>
                        <span className="text-[13px] font-bold text-primary">{selectedDoc.modified}</span>
                      </div>
                      <div className="flex flex-col ml-auto">
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">Storage</span>
                        <span className="text-[13px] font-bold text-primary">{selectedDoc.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[15px] leading-relaxed text-secondary space-y-6">
                    <p> This synchronized document is currently in "View-Only" mode. To make adjustments, please initialize the collaborative editor.</p>
                    <div className="p-12 rounded-3xl bg-surface/20 border-2 border-dashed border-default flex flex-col items-center justify-center text-center">
                       <span className="text-5xl mb-6 grayscale opacity-50">📂</span>
                       <h4 className="text-lg font-bold text-primary mb-2">Resource Preview</h4>
                       <p className="text-[12px] opacity-40 max-w-xs">Detailed content blocks are currently being hydrated from the cloud storage layer.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full hidden md:flex flex-1 items-center justify-center fade-in">
              <div className="text-center space-y-2 opacity-30">
                <div className="text-[80px] grayscale opacity-20">🗂️</div>
                <p className="text-[12px] font-bold tracking-widest uppercase opacity-40">Select a document to begin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
