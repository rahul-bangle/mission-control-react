import { useTheme } from '../ThemeContext'

export default function Sidebar({ active, setActive, isOpen, toggle }) {
  const { isLight } = useTheme()
  const items = [
    { id: 'tasks',    icon: '📋', label: 'Task Board' },
    { id: 'calendar', icon: '📅', label: 'Calendar' },
    { id: 'projects', icon: '📊', label: 'Projects' },
    { id: 'memories', icon: '🧠', label: 'Memories' },
    { id: 'docs',     icon: '📄', label: 'Docs' },
    { id: 'team',     icon: '👥', label: 'Team' },
    { id: 'office',   icon: '🏢', label: 'Office' },
    { id: 'usage',    icon: '📈', label: 'Usage' },
    { id: 'system',   icon: '⚙️', label: 'System' },
  ]

  const accent = isLight ? '#007AFF' : 'var(--accent)'

  return (
    <aside
      className={`fixed md:relative top-0 left-0 h-full flex flex-col z-[55] overflow-hidden whitespace-nowrap glass-sidebar transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
        isOpen ? 'w-[280px] opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-4'
      }`}
    >
      <div className="w-[280px] h-full p-6 flex flex-col gap-1">
        <div className="flex justify-between items-center mb-10 px-3">
          <div className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/30 font-bold">L</div>
            <span className="text-[14px] font-black tracking-[0.1em]" style={{ color: 'var(--text-primary)' }}>MISSION</span>
          </div>
          <button
            onClick={toggle}
            className="p-2 rounded-xl transition-all hover:bg-surface border border-default shadow-sm md:flex hidden"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto pr-3 custom-scrollbar">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full text-left px-4 py-3 rounded-2xl text-[13px] font-medium flex items-center gap-3.5 transition-all cursor-pointer relative group ${
                active === item.id ? 'shadow-sm' : 'hover:translate-x-1'
              }`}
              style={{
                background: active === item.id ? 'var(--bg-sidebar-selected)' : 'transparent',
                color: active === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: active === item.id ? '1px solid var(--border-default)' : '1px solid transparent'
              }}
            >
              <span className={`text-xl transition-transform group-hover:scale-110 ${active === item.id ? 'opacity-100' : 'opacity-60'}`}>{item.icon}</span>
              <span className={`tracking-tight ${active === item.id ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              {item.live && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
              )}
              
              {active === item.id && (
                <div 
                  className="absolute left-0 w-1.5 h-6 rounded-full bg-accent"
                  style={{ boxShadow: `0 0 12px ${accent}` }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-default/30">
          <div className="px-5 py-4 rounded-[20px] border flex flex-col gap-2.5 transition-all glass hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer" 
            style={{ borderColor: 'var(--border-soft)' }}
          >
            <div className="flex justify-between items-center">
               <p className="text-[9px] uppercase font-black tracking-[0.2em]" style={{ color: 'var(--text-tertiary)' }}>System Core</p>
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-sidebar bg-surface-2" />)}
              </div>
              <span className="text-[11px] font-bold tracking-tight text-primary">82% NOMINAL</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}


