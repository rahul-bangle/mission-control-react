export default function Office() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[15px] font-bold text-white font-mono tracking-wider">OFFICE</h1>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg p-5" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
          <h3 className="text-[12px] font-bold text-white font-mono mb-3">QUICK STATS</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-[11px] font-mono text-[#888]">Total Tasks</span><span className="text-[11px] font-mono text-[#19c3ff]">14</span></div>
            <div className="flex justify-between"><span className="text-[11px] font-mono text-[#888]">In Progress</span><span className="text-[11px] font-mono" style={{ color: '#f59e0b' }}>3</span></div>
            <div className="flex justify-between"><span className="text-[11px] font-mono text-[#888]">Active Projects</span><span className="text-[11px] font-mono text-[#19c3ff]">4</span></div>
            <div className="flex justify-between"><span className="text-[11px] font-mono text-[#888]">Team Online</span><span className="text-[11px] font-mono" style={{ color: '#22c55e' }}>4/6</span></div>
          </div>
        </div>
        <div className="rounded-lg p-5" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
          <h3 className="text-[12px] font-bold text-white font-mono mb-3">KEYBOARD SHORTCUTS</h3>
          <div className="space-y-1.5 text-[10px] font-mono">
            <div className="flex items-center gap-3"><span className="px-2 py-0.5 rounded" style={{ background: '#1a1a1a', color: '#19c3ff', fontSize: '9px' }}>Alt+1</span><span style={{ color: '#888' }}>Task Board</span></div>
            <div className="flex items-center gap-3"><span className="px-2 py-0.5 rounded" style={{ background: '#1a1a1a', color: '#19c3ff', fontSize: '9px' }}>Alt+2</span><span style={{ color: '#888' }}>Calendar</span></div>
            <div className="flex items-center gap-3"><span className="px-2 py-0.5 rounded" style={{ background: '#1a1a1a', color: '#19c3ff', fontSize: '9px' }}>Alt+3</span><span style={{ color: '#888' }}>Projects</span></div>
            <div className="flex items-center gap-3"><span className="px-2 py-0.5 rounded" style={{ background: '#1a1a1a', color: '#19c3ff', fontSize: '9px' }}>Alt+7</span><span style={{ color: '#888' }}>System</span></div>
            <div className="flex items-center gap-3"><span className="px-2 py-0.5 rounded" style={{ background: '#1a1a1a', color: '#19c3ff', fontSize: '9px' }}>n</span><span style={{ color: '#888' }}>New Task</span></div>
            <div className="flex items-center gap-3"><span className="px-2 py-0.5 rounded" style={{ background: '#1a1a1a', color: '#19c3ff', fontSize: '9px' }}>e</span><span style={{ color: '#888' }}>Export</span></div>
            <div className="flex items-center gap-3"><span className="px-2 py-0.5 rounded" style={{ background: '#1a1a1a', color: '#19c3ff', fontSize: '9px' }}>h</span><span style={{ color: '#888' }}>Toggle Help</span></div>
          </div>
        </div>
      </div>
      <div className="rounded-lg p-5 mt-4" style={{ background: '#111111', border: '1px solid #2a2a2a' }}>
        <h3 className="text-[12px] font-bold text-white font-mono mb-3">🦞 MISSION CONTROL v1.0 — PHASES 1-7 ✅</h3>
        <p className="text-[10px] font-mono text-[#555] mb-3">All foundational features shipped. System is production-ready.</p>
        <div className="flex gap-2 text-[9px] font-mono">
          <span className="px-2 py-1 rounded" style={{ background: '#22c55e20', color: '#22c55e' }}>✅ Phase 1: Store</span>
          <span className="px-2 py-1 rounded" style={{ background: '#22c55e20', color: '#22c55e' }}>✅ Phase 2: Dependencies</span>
          <span className="px-2 py-1 rounded" style={{ background: '#22c55e20', color: '#22c55e' }}>✅ Phase 3: Due Dates</span>
          <span className="px-2 py-1 rounded" style={{ background: '#22c55e20', color: '#22c55e' }}>✅ Phase 4: Subtasks</span>
          <span className="px-2 py-1 rounded" style={{ background: '#22c55e20', color: '#22c55e' }}>✅ Phase 5: Comments</span>
          <span className="px-2 py-1 rounded" style={{ background: '#22c55e20', color: '#22c55e' }}>✅ Phase 7: Sync</span>
        </div>
      </div>
    </div>
  )
}
