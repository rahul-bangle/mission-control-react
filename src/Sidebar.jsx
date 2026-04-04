export default function Sidebar({ active, setActive }) {
  const items = [
    { id: 'tasks', icon: '📋', label: 'Task Board' },
    { id: 'calendar', icon: '📅', label: 'Calendar' },
    { id: 'projects', icon: '📊', label: 'Projects' },
    { id: 'memories', icon: '🧠', label: 'Memories' },
    { id: 'docs', icon: '📄', label: 'Docs' },
    { id: 'team', icon: '👥', label: 'Team' },
    { id: 'office', icon: '🏢', label: 'Office' },
  ]
  return (
    <aside className="w-60 bg-[#111111] p-4 flex flex-col gap-1 flex-shrink-0">
      <div className="text-[#19c3ff] font-bold text-sm tracking-wider mb-5 px-3 flex items-center gap-2">
        🦞 MISSION CONTROL
      </div>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => setActive(item.id)}
          className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center gap-3 transition-all cursor-pointer
            ${active === item.id ? 'bg-[#252525] text-[#19c3ff]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </aside>
  )
}