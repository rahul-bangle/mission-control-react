import { useTheme } from '../ThemeContext'

export default function Sidebar({ isOpen, active, setActive }) {
  const items = [
    { id: 'tasks',    icon: '📋', label: 'Task Board' },
    { id: 'calendar', icon: '📅', label: 'Calendar' },
    { id: 'cron',     icon: '🕒', label: 'Cron History' },
    { id: 'projects', icon: '📊', label: 'Projects' },
    { id: 'memories', icon: '🧠', label: 'Memories' },
    { id: 'docs',     icon: '📄', label: 'Docs' },
    { id: 'team',     icon: '👥', label: 'Team' },
    { id: 'office',   icon: '🏢', label: 'Office' },
    { id: 'usage',    icon: '📈', label: 'Usage' },
    { id: 'system',   icon: '⚙️', label: 'System' },
  ]

  return (
    <aside
      className={`fixed md:relative top-0 left-0 h-full flex flex-col z-[55] overflow-hidden whitespace-nowrap glass-sidebar transition-all duration-300 ease-in-out ${
        isOpen ? 'w-[220px] opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-4'
      }`}
    >
      <div className="w-[220px] h-full p-4 flex flex-col">
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center text-[11px] text-white font-bold">M</div>
            <span className="text-[11px] font-black tracking-widest" style={{ color: 'var(--text-primary)' }}>CONTROL</span>
          </div>
        </div>

        <div className="flex-1 space-y-0.5 overflow-y-auto custom-scrollbar">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full text-left px-3 py-1.5 transition-all cursor-pointer relative group flex items-center gap-3 ${
                active === item.id ? '' : 'hover:bg-surface/50'
              }`}
              style={{
                background: active === item.id ? 'var(--bg-sidebar-selected)' : 'transparent',
                color: active === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-pill)'
              }}
            >
              <span className={`text-base transition-transform ${active === item.id ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`}>{item.icon}</span>
              <span className={`text-[12px] tabular-nums tracking-tight ${active === item.id ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              
              {active === item.id && (
                <div 
                  className="absolute left-0 w-1 h-4 rounded-full bg-accent"
                />
              )}
            </button>
          ))}
        </div>

      </div>
    </aside>
  )
}


