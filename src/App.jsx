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
  const [sidebarOpen, setSidebarOpen] = useState(false) // Default closed on mobile, open on md
  const [activityOpen, setActivityOpen] = useState(true)
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

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-open')
    } else {
      document.body.classList.remove('sidebar-open')
    }
  }, [sidebarOpen])

  useKeyboard({
    ...(shortcuts.reduce((acc, s) => { acc[s.key] = () => setScreen(s.screen); return acc }, {})),
    n: () => document.querySelector('[data-new-task]')?.click(),
    e: () => store?.exportState(),
  })

  return (
    <div className="flex h-screen font-mono relative overflow-hidden" style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      {/* Mobile Backdrop Overlay (Sidebar) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-all"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Backdrop Overlay (Activity) */}
      {activityOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm transition-all"
          onClick={() => setActivityOpen(false)}
        />
      )}

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 z-40 flex items-center justify-between px-4" 
           style={{ background: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-default)' }}>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg"
          aria-label="Open sidebar"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-input)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-primary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-[12px] font-bold tracking-tighter text-[#19c3ff]">🦞 MISSION CONTROL</span>
        <button
          onClick={() => setActivityOpen(true)}
          className="p-2 rounded-lg relative"
          aria-label="Open activity feed"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-input)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-primary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {store?.state?.activity?.some(a => a.unread) && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse border border-white"></span>
          )}
        </button>
      </div>


      <Sidebar
        active={screen}
        setActive={(s) => { setScreen(s); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
        toggle={() => setSidebarOpen(o => !o)}
      />

      <div className="flex-1 flex flex-col overflow-hidden pt-14 md:pt-0">
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {screens[screen] || <div style={{ color: 'var(--text-tertiary)' }}>Coming soon: {screen}</div>}
        </div>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full transition-all hover:scale-110 shadow-lg"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
        aria-label="Toggle theme"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <span style={{ fontSize: '18px' }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
      </button>

      <ActivityFeed isOpen={activityOpen} toggle={() => setActivityOpen(o => !o)} />

    </div>
  )
}


export { shortcuts }
export default App
