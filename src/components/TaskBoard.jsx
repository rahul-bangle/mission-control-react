import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../ThemeContext'
import { useStore } from '../StoreContext'

const columns = [
  { id: 'backlog', label: 'BACKLOG' },
  { id: 'in-progress', label: 'IN PROGRESS' },
  { id: 'review', label: 'REVIEW' },
  { id: 'done', label: 'DONE' },
]

function getDueInfo(task) {
  if (!task.dueDate) return null
  const d1 = new Date(task.dueDate); d1.setHours(0,0,0,0)
  const d2 = new Date(); d2.setHours(0,0,0,0)
  const diff = Math.ceil((d1 - d2) / (1000*60*60*24))
  if (diff < 0) return { status: 'overdue', label: `${Math.abs(diff)}d overdue` }
  if (diff === 0) return { status: 'today', label: 'Due today' }
  if (diff <= 3) return { status: 'soon', label: `${diff}d left` }
  return { status: 'upcoming', label: `${diff}d left` }
}

function getStaleInfo(task, boardDate) {
  if (!task.dueDate || task.status === 'done') return null
  const origin = new Date(task.dueDate); origin.setHours(0, 0, 0, 0)
  const viewing = new Date(boardDate); viewing.setHours(0, 0, 0, 0)
  const diff = Math.ceil((viewing - origin) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return null
  if (diff === 1) return { level: 'warn', days: diff, label: '1d late', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' }
  if (diff <= 3) return { level: 'alert', days: diff, label: `${diff}d late`, color: '#f97316', bg: 'rgba(249,115,22,0.1)' }
  return { level: 'stale', days: diff, label: `STALE ${diff}d`, color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
}

const statusColors = {
  backlog: { text: 'var(--text-tertiary)', bg: 'var(--color-tag-bg)' },
  'in-progress': { text: 'var(--color-high)', bg: 'var(--color-high-bg)' },
  review: { text: 'var(--color-review)', bg: 'var(--color-review-bg)' },
  done: { text: 'var(--color-done)', bg: 'var(--color-done-bg)' },
}

const priorityPill = {
  urgent: { text: 'var(--color-urgent)', bg: 'var(--color-urgent-bg)' },
  high: { text: 'var(--color-high)', bg: 'var(--color-high-bg)' },
  medium: { text: 'var(--color-medium)', bg: 'var(--color-medium-bg)' },
  low: { text: 'var(--color-low)', bg: 'var(--color-low-bg)' },
}

export default function TaskBoard() {
  const { state, store } = useStore()
  const { isLight } = useTheme()
  const allTasks = state.tasks || []
  const team = state.team || []

  const [boardDate, setBoardDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [pickerViewDate, setPickerViewDate] = useState(() => { const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() } })
  const pickerRef = useRef(null)

  useEffect(() => {
    if (!showDatePicker) return
    const handler = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowDatePicker(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showDatePicker])

  const [filter, setFilter] = useState('all')
  const [dragId, setDragId] = useState(null)
  const [droppingOn, setDroppingOn] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const newTaskRef = useRef({ title: '', priority: 'medium', assignee: 'rahul', dueDate: boardDate })
  const [subtaskInput, setSubtaskInput] = useState('')
  const [commentInput, setCommentInput] = useState('')

  const updateTask = (id, changes) => {
    const task = allTasks.find(t => t.id === id)
    store.patchState({ tasks: allTasks.map(t => t.id === id ? { ...t, ...changes } : t) })
    store.addActivity({ icon: '▣', action: `Updated: ${task?.title?.slice(0, 30) || id}` })
  }

  const createTask = () => {
    if (!newTaskRef.current.dueDate) {
      alert('Please select a due date.');
      return;
    }
    const title = newTaskRef.current.title || 'New Task'
    const task = {
      id: store.nextId(), title, tags: [],
      priority: newTaskRef.current.priority, assignee: 'rahul',
      status: 'backlog', estimate: '1d', dueDate: newTaskRef.current.dueDate,
      comments: [], subtasks: [], dependencies: [], dependsOn: [],
    }
    store.patchState({ tasks: [...allTasks, task] })
    store.addActivity({ icon: '▣', action: `Created: ${title}` })
    setShowModal(false)
    newTaskRef.current = { title: '', priority: 'medium', assignee: 'rahul', dueDate: boardDate }
  }

  // Column Data logic
  const ownTasks = allTasks.filter(t => t.dueDate === boardDate)
  const carriedTasks = allTasks.filter(t => t.dueDate && t.dueDate < boardDate && t.status !== 'done')
  const todayStr = new Date().toISOString().slice(0, 10)
  const isViewingPast = boardDate < todayStr

  const colData = {
    'backlog': [
      ...carriedTasks.filter(t => !isViewingPast && (t.status === 'backlog' || t.status === 'pending')),
      ...ownTasks.filter(t => t.status === 'backlog' || t.status === 'pending')
    ],
    'in-progress': [
      ...carriedTasks.filter(t => !isViewingPast && t.status === 'in-progress'),
      ...ownTasks.filter(t => t.status === 'in-progress')
    ],
    'review': [
      ...carriedTasks.filter(t => !isViewingPast && t.status === 'review'),
      ...ownTasks.filter(t => t.status === 'review')
    ],
    'done': ownTasks.filter(t => t.status === 'done'),
  }

  const accent = isLight ? '#007AFF' : 'var(--accent)'
  const primaryBtnStyle = isLight
    ? { background: '#007AFF', color: '#fff', fontWeight: 600 }
    : { background: 'var(--accent)', color: '#000' }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4" style={{ color: 'var(--text-primary)' }}>
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-[18px] font-bold tracking-wider">TASK BOARD</h1>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{ownTasks.length} tasks scheduled</p>
          </div>

          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: showDatePicker ? (isLight ? '#007AFF15' : 'rgba(25,195,255,0.08)') : 'var(--bg-surface)',
                borderColor: showDatePicker ? accent : 'var(--border-default)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5"><path d="M3 4h18v18H3zM16 2v4M8 2v4M3 10h18"/></svg>
              <span className="text-[12px] font-bold">{new Date(boardDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </button>

            {showDatePicker && (
               <div className="absolute top-[110%] left-0 z-[200] p-4 bg-card rounded-2xl border border-default shadow-2xl glass transition-all">
                  <input 
                    type="date" 
                    value={boardDate} 
                    onChange={(e) => { setBoardDate(e.target.value); setShowDatePicker(false); }}
                    className="bg-transparent text-primary outline-none"
                  />
               </div>
            )}
          </div>
        </div>

        <button onClick={() => setShowModal(true)} className="px-4 py-2 text-[11px] font-bold rounded-xl shadow-lg active:scale-95" style={primaryBtnStyle}>+ NEW TASK</button>
      </div>

      <div className="flex h-full pb-6 overflow-x-auto no-scrollbar gap-5" id="kanban-board">
        {Object.entries(colData).map(([colId, tasks]) => (
          <div 
            key={colId} 
            data-column-id={colId}
            onDragOver={(e) => { e.preventDefault(); setDroppingOn(colId); }}
            onDragLeave={() => setDroppingOn(null)}
            onDrop={(e) => {
              const taskId = e.dataTransfer.getData('taskId');
              if (taskId) updateTask(taskId, { status: colId });
              setDragId(null); setDroppingOn(null);
            }}
            className="flex-1 min-w-[300px] flex flex-col rounded-[24px] border border-card glass transition-all duration-300" 
            style={{ 
              borderColor: droppingOn === colId ? accent : 'var(--border-soft)',
              background: droppingOn === colId ? 'rgba(255,255,255,0.05)' : 'var(--bg-sidebar)'
            }}
          >
            <div className="p-5 flex items-center justify-between border-b border-default">
              <h3 className="text-[12px] font-bold uppercase tracking-[0.15em]" style={{ color: statusColors[colId]?.text || 'var(--text-primary)' }}>{columns.find(c => c.id === colId)?.label || colId}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: statusColors[colId]?.bg || 'var(--bg-surface)', color: statusColors[colId]?.text || 'var(--text-tertiary)' }}>{tasks.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {tasks.map(task => {
                const pp = priorityPill[task.priority] || {}
                const due = getDueInfo(task)
                const stale = getStaleInfo(task, boardDate)
                const assignee = team.find(m => m.name?.toLowerCase() === task.assignee?.toLowerCase())
                const initials = task.assignee ? task.assignee.slice(0, 2).toUpperCase() : '?'
                const cardBg = isLight
                  ? (pp.bg ? pp.bg.replace('0.15', '0.06').replace('0.1', '0.06') : '#fff')
                  : 'var(--bg-card)'
                const staleMeta = stale || (due && due.status !== 'upcoming' ? { color: due.status === 'overdue' ? '#ef4444' : due.status === 'today' ? '#f97316' : '#f59e0b', label: due.label } : null)
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => { setDragId(task.id); e.dataTransfer.setData('taskId', task.id); }}
                    onDragEnd={() => { setDragId(null); setDroppingOn(null); }}
                    onClick={() => setSelectedTask(task)}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing relative group shadow-lg hover:-translate-y-1 ${
                      dragId === task.id ? 'opacity-40 grayscale scale-95' : 'opacity-100'
                    }`}
                    style={{
                      background: cardBg,
                      borderColor: dragId === task.id ? accent : (pp.text ? pp.text + '40' : 'var(--border-card)'),
                      borderLeftWidth: 3,
                      borderLeftColor: pp.text || 'var(--border-card)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg" style={pp}>{(task.priority || 'medium').toUpperCase()}</span>
                      <div className="flex items-center gap-2">
                        {staleMeta && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md" style={{ color: staleMeta.color, background: staleMeta.color + '18' }}>{staleMeta.label}</span>}
                        <span className="text-[9px] text-tertiary font-bold">{task.estimate}</span>
                      </div>
                    </div>
                    <h4 className="text-[13px] font-semibold mb-3 group-hover:text-accent transition-colors" style={{ color: 'var(--text-primary)' }}>{task.title}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                          style={{ background: pp.text || accent }}>
                          {initials}
                        </div>
                        {task.assignee && <span className="text-[9px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{task.assignee}</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: statusColors[task.status]?.bg, color: statusColors[task.status]?.text }}>
                          {task.status}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedTask(task); setShowDeleteConfirm(true); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-md flex items-center justify-center hover:bg-red-500/20 ml-1"
                          title="Delete task"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedTask(null)}>
          <div className="w-full max-w-lg bg-card rounded-2xl p-6 border shadow-2xl transition-all" style={{ background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-6">{selectedTask.title}</h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div>
                  <label className="text-[10px] text-tertiary uppercase font-bold block mb-2">Status</label>
                  <select defaultValue={selectedTask.status} onChange={e => updateTask(selectedTask.id, { status: e.target.value })} className="w-full bg-surface border border-default p-2 rounded-xl text-primary font-bold">
                    {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
               </div>
               <div>
                  <label className="text-[10px] text-tertiary uppercase font-bold block mb-2">Priority</label>
                  <select defaultValue={selectedTask.priority} onChange={e => updateTask(selectedTask.id, { priority: e.target.value })} className="w-full bg-surface border border-default p-2 rounded-xl text-primary font-bold">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
               </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(true)} className="flex-1 py-3 rounded-xl text-[11px] font-bold bg-urgent text-white">DELETE TASK</button>
              <button onClick={() => setSelectedTask(null)} className="flex-1 py-3 rounded-xl text-[11px] font-bold bg-surface border border-default text-secondary">CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-xs bg-card rounded-2xl p-6 border border-urgent/30 shadow-2xl text-center" style={{ background: 'var(--bg-card)' }}>
            <h3 className="font-bold mb-2">Delete Permanently?</h3>
            <p className="text-[11px] text-tertiary mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-surface text-secondary">CANCEL</button>
              <button onClick={() => { store.deleteTask(selectedTask.id); setSelectedTask(null); setShowDeleteConfirm(false); }} className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-urgent text-white">DELETE</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-sm bg-card rounded-2xl p-6 border shadow-2xl" style={{ background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">New Task</h2>
            <input type="text" placeholder="Title" onChange={e => newTaskRef.current.title = e.target.value} className="w-full bg-surface border border-default p-3 rounded-xl mb-4 text-primary outline-none focus:border-accent" />
            <div className="grid grid-cols-2 gap-3 mb-6">
               <select onChange={e => newTaskRef.current.priority = e.target.value} className="bg-surface border border-default p-2 rounded-xl text-primary text-xs">
                 <option value="medium">Medium</option>
                 <option value="low">Low</option>
                 <option value="high">High</option>
                 <option value="urgent">Urgent</option>
               </select>
               <input type="date" onChange={e => newTaskRef.current.dueDate = e.target.value} className="bg-surface border border-default p-2 rounded-xl text-primary text-xs" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-xl text-[11px] font-bold bg-surface text-secondary">CANCEL</button>
              <button onClick={createTask} className="flex-1 py-2 rounded-xl text-[11px] font-bold" style={primaryBtnStyle}>CREATE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}