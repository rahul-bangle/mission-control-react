import { useState, useEffect } from 'react'
import { useKeyboard, registerShortcut } from './useKeyboard'
import { useTheme } from './ThemeContext'
import Sidebar from './components/Sidebar'
import TaskBoard from './components/TaskBoard'
import Calendar from './components/Calendar'
import Projects from './components/Projects'
import Memories from './components/Memories'
import Docs from './components/Docs'
import Team from './components/Team'
import System from './components/System'
import Office from './components/Office'
import UsageDashboard from './components/UsageDashboard'
import ActivityFeed from './components/ActivityFeed'

const screenList = ['tasks', 'calendar', 'projects', 'memories', 'docs', 'team', 'office', 'usage', 'system']
const shortcuts = [
  { key: 'Alt+1', screen: 'tasks' },
  { key: 'Alt+2', screen: 'calendar' },
  { key: 'Alt+3', screen: 'projects' },
  { key: 'Alt+4', screen: 'memories' },
  { key: 'Alt+5', screen: 'docs' },
  { key: 'Alt+6', screen: 'team' },
  { key: 'Alt+7', screen: 'office' },
  { key: 'Alt+8', screen: 'usage' },
  { key: 'Alt+9', screen: 'system' },
]

function App({ store }) {
  const [screen, setScreen] = useState('tasks')
  const [sidebarOpen, setSidebarOpen] = useState(true) 
  const [activityOpen, setActivityOpen] = useState(false) 
  const { theme, toggle } = useTheme()

  const screens = {
    tasks: <TaskBoard />,
    calendar: <Calendar />,
    projects: <Projects />,
    memories: <Memories />,
    docs: <Docs />,
    team: <Team />,
    office: <Office />,
    usage: <UsageDashboard />,
    system: <System />,
  }

  useKeyboard({
    ...(shortcuts.reduce((acc, s) => { acc[s.key] = () => setScreen(s.screen); return acc }, {})),
    n: () => document.querySelector('[data-new-task]')?.click(),
    e: () => store?.exportState(),
  })

  const hasUnread = store?.state?.activity?.some(a => a.unread)

  return (
    <div className="flex h-screen font-mono relative overflow-hidden" style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      {/* Universal Header */}
      <header className="fixed top-0 left-0 right-0 h-16 z-[60] flex items-center justify-between px-6 backdrop-blur-xl border-b border-default" 
              style={{ background: 'var(--bg-app)', opacity: 0.95 }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="p-2.5 rounded-xl transition-all hover:bg-surface border border-default shadow-sm active:scale-95"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" className="transition-transform duration-300">
               {sidebarOpen ? (
                 <path d="M 3 16.5 L 17 2.5 M 3 2.5 L 17 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
               ) : (
                 <path d="M 2 5 L 18 5 M 2 10 L 18 10 M 2 15 L 18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
               )}
            </svg>
          </button>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold tracking-tighter" style={{ color: 'var(--accent)' }}>MISSION CONTROL</span>
            <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>{screen}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl transition-all hover:bg-surface border border-default shadow-sm active:scale-95 flex items-center justify-center overflow-hidden"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            {theme === 'dark' ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="fade-in">
                <circle cx="12" cy="12" r="5" strokeWidth="2" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="fade-in">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setActivityOpen(o => !o)}
            className="p-2.5 rounded-xl relative transition-all hover:bg-surface border border-default shadow-sm active:scale-95"
            style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {hasUnread && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-card shadow-sm fade-in" style={{ background: 'var(--accent)', borderColor: 'var(--bg-card)' }} />
            )}
          </button>
        </div>
      </header>

      {/* Backdrop for Mobile */}
      {(sidebarOpen || activityOpen) && (
        <div 
          className="fixed inset-0 bg-black/60 z-[50] md:hidden backdrop-blur-sm fade-in"
          onClick={() => { setSidebarOpen(false); setActivityOpen(false); }}
        />
      )}

      <Sidebar
        active={screen}
        setActive={(s) => { setScreen(s); if (window.innerWidth < 768) setSidebarOpen(false); }}
        isOpen={sidebarOpen}
        toggle={() => setSidebarOpen(o => !o)}
      />

      <main className="flex-1 flex flex-col overflow-hidden pt-16 min-w-0 transition-all duration-300">
        <div className="flex-1 p-6 md:p-10 overflow-auto no-scrollbar">
          <div key={screen} className="h-full fade-in">
             {screens[screen] || <div style={{ color: 'var(--text-tertiary)' }}>Component not found: {screen}</div>}
          </div>
        </div>
      </main>

      <ActivityFeed isOpen={activityOpen} toggle={() => setActivityOpen(o => !o)} />
    </div>
  )
}

export { shortcuts }
export default App
