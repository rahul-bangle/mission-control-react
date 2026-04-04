import { useState } from 'react'
import { useKeyboard, registerShortcut } from './useKeyboard'
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
  const [activityOpen, setActivityOpen] = useState(true)

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

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-mono relative">
      {/* Overlay hamburger to open sidebar when closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute top-4 left-4 z-40 p-2 rounded bg-[#111111] border border-[#333]"
          aria-label="Open sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <Sidebar
        active={screen}
        setActive={setScreen}
        isOpen={sidebarOpen}
        toggle={() => setSidebarOpen(o => !o)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-8 overflow-auto">
          {screens[screen] || <div style={{ color: '#555' }}>Coming soon: {screen}</div>}
        </div>
      </div>

      <ActivityFeed />
    </div>
  )
}

export { shortcuts }
export default App
