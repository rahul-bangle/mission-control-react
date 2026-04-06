import { useState } from 'react'

const MenuIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function Sidebar({ active, setActive, isOpen, toggle }) {
  const items = [
    { id: 'tasks', icon: '📋', label: 'Task Board' },
    { id: 'calendar', icon: '📅', label: 'Calendar' },
    { id: 'projects', icon: '📊', label: 'Projects' },
    { id: 'memories', icon: '🧠', label: 'Memories' },
    { id: 'docs', icon: '📄', label: 'Docs' },
    { id: 'team', icon: '👥', label: 'Team' },
    { id: 'office', icon: '🏢', label: 'Office' },
    { id: 'usage', icon: '📈', label: 'Usage' },
    { id: 'system', icon: '⚙️', label: 'System' },
  ]

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-[#111111] p-5 flex flex-col gap-1 z-50 transition-all duration-300 transform md:relative md:translate-x-0 md:transform-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64 flex-shrink-0`}
      style={{ borderRight: '1px solid var(--border-default)' }}
    >
      <div className="flex justify-between items-center text-[#19c3ff] font-bold text-sm tracking-wider mb-8 px-2">
        <span className="flex items-center gap-2">🦞 MISSION CONTROL</span>
        <button
          onClick={toggle}
          className="p-1 rounded hover:bg-[#252525] md:hidden"
          aria-label="Close menu"
        >
          <XIcon />
        </button>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full text-left px-4 py-3 rounded-xl text-[13px] flex items-center gap-3 transition-all cursor-pointer border ${
              active === item.id 
                ? 'bg-[#252525] text-[#19c3ff] border-[#19c3ff30]' 
                : 'text-gray-500 border-transparent hover:bg-[#1a1a1a] hover:text-gray-300'
            }`}
          >
            <span className="text-lg opacity-80">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-[#252525]">
        <div className="px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#333]">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[11px] text-gray-300 font-mono">System Online</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

