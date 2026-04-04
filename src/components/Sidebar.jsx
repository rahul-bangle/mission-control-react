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
      className={`fixed top-0 left-0 h-full bg-[#111111] p-4 flex flex-col gap-1 z-30 transition-all duration-300 md:relative md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-60 flex-shrink-0`}
    >
      <div className="flex justify-between items-center text-[#19c3ff] font-bold text-sm tracking-wider mb-5 px-3">
        <span className="flex items-center gap-2">🦞 MISSION CONTROL</span>
        <button
          onClick={toggle}
          className="p-1 rounded hover:bg-[#252525] md:hidden"
          aria-label="Close menu"
        >
          <XIcon />
        </button>
      </div>

      {!isOpen && (
        <button
          onClick={toggle}
          className="absolute top-5 -right-8 p-2 bg-[#111111] rounded-r-lg md:hidden"
          aria-label="Toggle menu"
        >
          <MenuIcon />
        </button>
      )}

      {items.map(item => (
        <button
          key={item.id}
          onClick={() => {
            setActive(item.id)
            toggle()
          }}
          className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center gap-3 transition-all cursor-pointer ${
            active === item.id ? 'bg-[#252525] text-[#19c3ff]' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}

      {isOpen && (
        <div
          onClick={toggle}
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
        />
      )}
    </aside>
  )
}
