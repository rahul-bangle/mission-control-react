import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../ThemeContext'
import { useStore } from '../StoreContext'
import { 
  X, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar as CalIcon,
  ChevronRight,
  MoreHorizontal,
  Tag,
  MapPin,
  Layout,
  Filter,
  User
} from 'lucide-react';
import { checkCollision } from '../utils/validation';
import { TIME_OPTIONS, getAvailableTimes } from '../utils/constants';

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

  const [boardDate, setBoardDate] = useState(() => new Date().toISOString().slice(0, 10))
  const boardDateRef = useRef(null)

  const [dragId, setDragId] = useState(null)
  const [droppingOn, setDroppingOn] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const newTaskRef = useRef({ title: '', priority: 'medium', assignee: 'rahul', dueDate: boardDate, dueTime: '10:00am' })

  const updateTask = (id, changes) => {
    const task = allTasks.find(t => t.id === id)
    const updatedTasks = allTasks.map(t => t.id === id ? { ...t, ...changes } : t)
    store.patchState({ tasks: updatedTasks })
    store.addActivity({ icon: '▣', action: `Updated: ${task?.title?.slice(0, 30) || id}` })
    
    // Live update the modal state too
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask(prev => ({ ...prev, ...changes }))
    }
  }

  const createTask = () => {
    if (!newTaskRef.current.dueDate) {
      alert('Please select a due date.');
      return;
    }
    const todayStr = new Date().toLocaleDateString('en-CA');
    if (newTaskRef.current.dueDate < todayStr) {
      alert('Cannot schedule for a past date.');
      return;
    }
    const collision = checkCollision(allTasks, state.events, newTaskRef.current.dueDate, newTaskRef.current.dueTime);
    if (collision) {
      alert(`Collision Detected: Already scheduled for ${collision.type} "${collision.title}"`);
      return;
    }
    const title = newTaskRef.current.title || 'New Task'
    const task = {
      id: store.nextId(), title, tags: [],
      priority: newTaskRef.current.priority, assignee: 'rahul',
      status: 'backlog', estimate: '1d', dueDate: newTaskRef.current.dueDate,
      dueTime: newTaskRef.current.dueTime,
      comments: [], subtasks: [], dependencies: [], dependsOn: [],
    }
    store.patchState({ tasks: [...allTasks, task] })
    store.addActivity({ icon: '▣', action: `Created: ${title}` })
    setShowModal(false)
    newTaskRef.current = { title: '', priority: 'medium', assignee: 'rahul', dueDate: boardDate, dueTime: '10:00am' }
  }

  const ownTasks = allTasks.filter(t => t.dueDate === boardDate)
  const carriedTasks = allTasks.filter(t => t.dueDate && t.dueDate < boardDate && t.status !== 'done')
  const unscheduledTasks = allTasks.filter(t => !t.dueDate && t.status !== 'done')
  
  const todayStr = new Date().toISOString().slice(0, 10)
  const isViewingPast = boardDate < todayStr

  const colData = {
    'backlog': [
      ...unscheduledTasks.filter(t => t.status === 'backlog' || t.status === 'pending'),
      ...carriedTasks.filter(t => !isViewingPast && (t.status === 'backlog' || t.status === 'pending')),
      ...ownTasks.filter(t => t.status === 'backlog' || t.status === 'pending')
    ],
    'in-progress': [
      ...unscheduledTasks.filter(t => t.status === 'in-progress'),
      ...carriedTasks.filter(t => !isViewingPast && t.status === 'in-progress'),
      ...ownTasks.filter(t => t.status === 'in-progress')
    ],
    'review': [
      ...unscheduledTasks.filter(t => t.status === 'review'),
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 px-2" style={{ color: 'var(--text-primary)' }}>
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-[18px] font-bold tracking-wider">TASK BOARD</h1>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{ownTasks.length} tasks scheduled</p>
          </div>

          <div className="relative">
            <button
              onClick={() => boardDateRef.current.showPicker()}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all hover:bg-white/50 active:scale-[0.98] cursor-pointer shadow-sm"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-default)',
              }}
            >
              <CalIcon size={14} style={{ color: accent }} />
              <span className="text-[12px] font-bold">
                {new Date(boardDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </button>
            <input 
              ref={boardDateRef}
              type="date" 
              value={boardDate} 
              onChange={(e) => setBoardDate(e.target.value)}
              className="absolute inset-0 opacity-0 pointer-events-none"
            />
          </div>
        </div>

        <button onClick={() => setShowModal(true)} className="px-4 py-2 text-[11px] font-bold rounded shadow-sm active:scale-95" style={primaryBtnStyle}>+ NEW TASK</button>
      </div>

      {carriedTasks.length > 0 && !isViewingPast && (
        <div className="mx-2 mb-4 p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
            <AlertCircle size={14} className="text-blue-600" />
          </div>
          <p className="text-[11px] font-bold text-blue-800 tracking-wide uppercase">
            {carriedTasks.length} pending tasks from previous days have been migrated to {new Date(boardDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        </div>
      )}

      <div className="flex h-full pb-6 overflow-x-auto no-scrollbar border border-default rounded-none" id="kanban-board">
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
            className={`flex-1 min-w-[260px] flex flex-col border-r border-default last:border-r-0 transition-all duration-200`}
            style={{ 
              background: droppingOn === colId ? 'var(--bg-hover)' : 'transparent'
            }}
          >
            <div className="p-3 flex items-center justify-between bg-surface/10 border-b border-default">
              <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: statusColors[colId]?.text || 'var(--text-primary)' }}>{columns.find(c => c.id === colId)?.label || colId}</h3>
              <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center justify-center font-bold" style={{ background: 'var(--border-soft)', color: 'var(--text-tertiary)' }}>{tasks.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {tasks.map(task => {
                const pp = priorityPill[task.priority] || {}
                const due = getDueInfo(task)
                const stale = getStaleInfo(task, boardDate)
                const initials = task.assignee ? task.assignee.slice(0, 2).toUpperCase() : '?'
                const staleMeta = stale || (due && due.status !== 'upcoming' ? { color: due.status === 'overdue' ? '#ef4444' : due.status === 'today' ? '#f97316' : '#f59e0b', label: due.label } : null)
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => { setDragId(task.id); e.dataTransfer.setData('taskId', task.id); }}
                    onDragEnd={() => { setDragId(null); setDroppingOn(null); }}
                    onClick={() => setSelectedTask(task)}
                    className={`p-3 border-b border-default transition-all duration-150 cursor-pointer relative group ${
                      dragId === task.id ? 'opacity-40 grayscale' : 'opacity-100'
                    } ${task.dueDate && task.dueDate < boardDate ? 'opacity-60 grayscale-[0.3]' : ''}`}
                    style={{
                      background: 'var(--bg-card)',
                      borderLeftWidth: 2,
                      borderLeftColor: pp.text || 'transparent'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded" style={pp}>{(task.priority || 'medium').toUpperCase()}</span>
                      <div className="flex items-center gap-2">
                        {staleMeta && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ color: staleMeta.color, background: staleMeta.color + '18' }}>{staleMeta.label}</span>}
                        <span className="text-[9px] text-tertiary font-bold">{task.estimate}</span>
                      </div>
                    </div>
                    <h4 className="text-[13px] font-semibold mb-1 group-hover:text-accent transition-colors" style={{ color: 'var(--text-primary)' }}>{task.title}</h4>
                    <div className="flex items-center gap-1.5 mb-3 opacity-80">
                      <Clock size={10} className="text-slate-400" />
                      <span className="text-[10px] font-medium text-slate-500">{task.dueTime || 'No Time'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                          style={{ background: pp.text || accent }}>
                          {initials}
                        </div>
                        {task.assignee && <span className="text-[9px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{task.assignee}</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: statusColors[task.status]?.bg, color: statusColors[task.status]?.text }}>
                          {task.status}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedTask(task); setShowDeleteConfirm(true); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center hover:bg-red-500/20 ml-1"
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

      {selectedTask && !showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={() => setSelectedTask(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300 overflow-hidden text-slate-900">
            
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center shadow-sm">
                  <Layout size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Task Details</h3>
                  <p className="text-xs text-slate-500 font-medium">Reference: {selectedTask.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">{selectedTask.title}</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Layout size={12} className="text-slate-500" /> Status
                  </label>
                  <select 
                    value={selectedTask.status} 
                    onChange={e => updateTask(selectedTask.id, { status: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-500/10 transition-all appearance-none cursor-pointer"
                  >
                    {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Filter size={12} className="text-slate-500" /> Priority
                  </label>
                  <select 
                    value={selectedTask.priority} 
                    onChange={e => updateTask(selectedTask.id, { priority: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-500/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <User size={12} className="text-slate-500" /> Assignee
                  </label>
                  <select 
                    value={selectedTask.assignee || ''} 
                    onChange={e => updateTask(selectedTask.id, { assignee: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-500/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {(store.getState().team || []).map(u => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <CalIcon size={12} className="text-slate-500" /> Due Date
                  </label>
                  <input 
                    type="date" 
                    value={selectedTask.dueDate || ''} 
                    min={new Date().toLocaleDateString('en-CA')}
                    onChange={e => updateTask(selectedTask.id, { dueDate: e.target.value })} 
                    onClick={e => e.currentTarget.showPicker()}
                    onKeyDown={e => e.preventDefault()}
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-500/10 transition-all appearance-none cursor-pointer [color-scheme:light]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Clock size={12} className="text-slate-500" /> Due Time
                  </label>
                  <select 
                    value={selectedTask.dueTime || ''} 
                    onChange={e => {
                      const collision = checkCollision(allTasks, state.events, selectedTask.dueDate, e.target.value, selectedTask.id);
                      if (collision) {
                        alert(`Collision: Already scheduled for ${collision.type} "${collision.title}"`);
                        return;
                      }
                      updateTask(selectedTask.id, { dueTime: e.target.value });
                    }} 
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-500/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select Time</option>
                    {getAvailableTimes(selectedTask.dueDate).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-50 flex gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(true)} 
                className="flex-1 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Delete
              </button>
              <button 
                onClick={() => setSelectedTask(null)} 
                className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION - Image 1 Style */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-10 text-center animate-in zoom-in-95 duration-400">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6 shadow-sm">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Permanently delete?</h3>
            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
              This task will be removed from your queue and this action cannot be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => { store.deleteTask(selectedTask.id); setSelectedTask(null); setShowDeleteConfirm(false); }} 
                className="w-full py-4 bg-red-600 text-white rounded-2xl text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-500/20 active:scale-95 transition-all outline-none"
              >
                Delete Permanently
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)} 
                className="w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all outline-none"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW TASK MODAL - Image 4 Style */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-4 duration-300 overflow-hidden text-slate-900">
            
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                  <Plus size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">New Task</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Title</label>
                <input 
                  type="text" 
                  placeholder="What needs careful attention?" 
                  onChange={e => newTaskRef.current.title = e.target.value} 
                  className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Filter size={12} className="text-blue-500" /> Priority
                  </label>
                  <select 
                    defaultValue="medium"
                    onChange={e => newTaskRef.current.priority = e.target.value} 
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-900 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                  >
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <CalIcon size={12} className="text-blue-500" /> Due Date
                  </label>
                  <input 
                    type="date" 
                    defaultValue={boardDate}
                    min={new Date().toLocaleDateString('en-CA')}
                    onChange={e => newTaskRef.current.dueDate = e.target.value} 
                    onClick={e => e.currentTarget.showPicker()}
                    onKeyDown={e => e.preventDefault()}
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none [color-scheme:light] cursor-pointer" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Clock size={12} className="text-blue-500" /> Time
                  </label>
                  <select 
                    defaultValue="11:00am"
                    onChange={e => newTaskRef.current.dueTime = e.target.value} 
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer" 
                  >
                    {getAvailableTimes(boardDate).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                <AlertCircle size={20} className="text-slate-500 shrink-0 mt-0.5" />
                <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                  Priority determines execution order. High priority tasks are prioritized by the autonomous agent queue.
                </p>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-50 flex items-center justify-between">
              <button 
                onClick={() => setShowModal(false)} 
                className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-4"
              >
                Cancel
              </button>
              <button 
                onClick={createTask} 
                className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95 transition-all outline-none"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}