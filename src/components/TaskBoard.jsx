import { useState, useRef } from 'react'
import { useStore } from '../StoreContext'

const columns = [
  { id: 'backlog', label: 'BACKLOG', color: '#666666' },
  { id: 'in-progress', label: 'IN PROGRESS', color: '#f59e0b' },
  { id: 'review', label: 'REVIEW', color: '#a855f7' },
  { id: 'done', label: 'DONE', color: '#22c55e' },
]

const priorityColors = {
  urgent: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#22c55e',
}

const teamAvatars = {
  rahul: { bg: '#19c3ff', text: 'R' },
  aria: { bg: '#f59e0b', text: '🦞' },
}

function daysBetween(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1); d1.setHours(0,0,0,0)
  const d2 = new Date(dateStr2); d2.setHours(0,0,0,0)
  return Math.ceil((d1 - d2) / (1000*60*60*24))
}

function getDueInfo(task) {
  if (!task.dueDate) return null
  const today = new Date().toISOString().slice(0,10)
  const diff = daysBetween(task.dueDate, today)
  if (task.status === 'done') return diff >= 0 ? { status: 'done-early', label: 'Done on time' } : { status: 'done-late', label: 'Done late' }
  if (diff < 0) return { status: 'overdue', days: Math.abs(diff), label: `${Math.abs(diff)}d overdue` }
  if (diff === 0) return { status: 'today', label: 'Due today' }
  if (diff <= 3) return { status: 'soon', days: diff, label: `${diff}d left` }
  return { status: 'upcoming', days: diff, label: `${diff}d left` }
}

export default function TaskBoard() {
  const { state, store } = useStore()
  const allTasks = state.tasks || []
  const team = state.team || []

  const [filter, setFilter] = useState('all')
  const [dragId, setDragId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [depModal, setDepModal] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)

  const newTaskRef = useRef({ title: '', priority: 'medium', assignee: 'rahul' })

  const assigneeList = team.map(m => ({
    id: m.name === 'Aria' ? 'aria' : m.name.toLowerCase().split(' ')[0],
    displayName: m.name.includes(' ') ? m.name.split(' ').map(n => n[0]).join('') : (m.name === 'Aria' ? '🦞' : m.name[0].toUpperCase()),
    color: m.avatarColor,
    name: m.name,
  }))

  const blockedCount = allTasks.filter(t => {
    if (!t.dependencies?.length) return false
    return t.dependencies.some(d => { const b = allTasks.find(x => x.id === d); return b?.status !== 'done' })
  }).length

  const overdueCount = allTasks.filter(t => { const d = getDueInfo(t); return d?.status === 'overdue' }).length
  const dueTodayCount = allTasks.filter(t => { const d = getDueInfo(t); return d?.status === 'today' }).length

  const updateTask = (taskId, changes) => {
    const task = allTasks.find(t => t.id === taskId)
    const newTasks = allTasks.map(t => t.id === taskId ? { ...t, ...changes } : t)
    store.patchState({ tasks: newTasks })
    store.addActivity({ icon: '▣', action: `Updated task: ${task?.title?.slice(0, 30) || taskId}` })
  }

  const createTask = () => {
    const task = {
      id: store.nextId(), title: newTaskRef.current.title || 'New Task', tags: [],
      priority: newTaskRef.current.priority, assignee: newTaskRef.current.assignee,
      status: 'backlog', estimate: '1d', dueDate: null,
      comments: [], subtasks: [], dependencies: [], dependsOn: [],
    }
    store.patchState({ tasks: [...allTasks, task] })
    store.addActivity({ icon: '▣', action: `Created: ${task.title}` })
    setShowModal(false)
    newTaskRef.current = { title: '', priority: 'medium', assignee: 'rahul' }
  }

  const toggleSubtask = (taskId, subtaskId) => {
    const task = allTasks.find(t => t.id === taskId)
    if (!task) return
    const newSubtasks = task.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st)
    const allDone = newSubtasks.length > 0 && newSubtasks.every(st => st.completed)
    store.patchState({
      tasks: allTasks.map(t => t.id === taskId ? {
        ...t, subtasks: newSubtasks,
        status: allDone ? 'done' : t.status,
      } : t)
    })
    if (allDone) store.addActivity({ icon: '✅', action: `Auto-completed: ${task.title.slice(0,30)}` })
  }

  const addSubtask = (taskId, title) => {
    if (!title.trim()) return
    const task = allTasks.find(t => t.id === taskId)
    store.patchState({
      tasks: allTasks.map(t => t.id === taskId ? {
        ...t, subtasks: [...(t.subtasks || []), { id: `st-${Date.now()}`, title: title.trim(), completed: false }]
      } : t)
    })
    store.addActivity({ icon: '☐', action: `Added subtask to: ${task?.title?.slice(0,30)}` })
  }

  const addComment = (taskId, text, role) => {
    if (!text.trim()) return
    const task = allTasks.find(t => t.id === taskId)
    const comment = { id: `c-${Date.now()}`, role, text: text.trim(), time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}), read: true }
    store.patchState({
      tasks: allTasks.map(t => t.id === taskId ? { ...t, comments: [...(t.comments || []), comment] } : t)
    })
    store.addActivity({ icon: '💬', action: `${role} commented on: ${task?.title?.slice(0,30)}` })
  }

  const colData = {
    'backlog': allTasks.filter(t => t.status === 'backlog'),
    'in-progress': allTasks.filter(t => t.status === 'in-progress'),
    'review': allTasks.filter(t => t.status === 'review'),
    'done': allTasks.filter(t => t.status === 'done'),
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-[18px] font-bold text-white font-mono tracking-wider">TASK BOARD</h1>
            <p className="text-[10px] font-mono" style={{ color: '#4a5568' }}>{allTasks.length} tasks across 4 columns</p>
          </div>
          <div className="flex gap-2">
            {['all', 'urgent'].map(fId => (
              <button key={fId} onClick={() => setFilter(fId)}
                className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded transition-all ${filter === fId ? 'ring-1 ring-[#19c3ff]' : ''}`}
                style={{ background: filter === fId ? '#252525' : 'transparent', color: filter === fId ? '#19c3ff' : '#4a5568' }}>
                {fId === 'all' ? `ALL (${allTasks.length})` : `🔴 URGENT (${allTasks.filter(t => t.priority === 'urgent').length})`}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {overdueCount > 0 && <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: '#ef444420', color: '#ef4444' }}>🔥 {overdueCount} overdue</span>}
          {dueTodayCount > 0 && <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: '#f59e0b20', color: '#f59e0b' }}>📅 {dueTodayCount} today</span>}
          {blockedCount > 0 && <span className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: '#a855f720', color: '#a855f7' }}>🔒 {blockedCount} blocked</span>}
          <button onClick={() => store.exportState()} style={{ background: '#1a1a1a', color: '#22c55e', border: '1px solid #333' }}
            className="px-4 py-2 text-[10px] font-mono rounded hover:brightness-110">📥 EXPORT</button>
          <button onClick={() => setShowModal(true)} style={{ background: '#19c3ff', color: '#000' }}
            className="px-4 py-2 text-[10px] font-mono font-bold rounded hover:brightness-110">+ NEW TASK</button>
        </div>
      </div>

      <div className="flex gap-4 h-full pb-6">
        {Object.entries(colData).map(([colId, tasks]) => (
          <div key={colId} className="flex-1 min-w-0 flex flex-col"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (dragId) { updateTask(dragId, { status: colId }); setDragId(null) } }}>
            <div className="flex items-center justify-between mb-4 pb-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
              <h3 className="text-[12px] font-bold font-mono tracking-wider" style={{ color: colId === 'done' ? '#22c55e' : colId === 'review' ? '#a855f7' : colId === 'in-progress' ? '#f59e0b' : '#4a5568' }}>
                {colId === 'in-progress' ? 'IN PROGRESS' : colId.toUpperCase()} ({tasks.length})
              </h3>
            </div>
            <div className="space-y-2 overflow-y-auto flex-1">
              {tasks.map(task => {
                const isBlocked = task.dependencies?.some(d => { const b = allTasks.find(x => x.id === d); return b?.status !== 'done' })
                const blockerCount = task.dependencies?.filter(d => { const b = allTasks.find(x => x.id === d); return b?.status !== 'done' }).length || 0
                const dueInfo = getDueInfo(task)
                const isOverdue = dueInfo?.status === 'overdue'
                const isToday = dueInfo?.status === 'today'
                const doneEarly = task.status === 'done' && dueInfo?.status === 'done-early'

                return (
                  <div key={task.id} draggable onDragStart={() => setDragId(task.id)}
                    onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                    className="p-3 rounded-lg cursor-pointer transition-all hover:translate-y-[-1px] relative"
                    style={{
                      background: isOverdue ? '#1a0808' : doneEarly ? '#081a08' : '#1a1a1a',
                      border: `1px solid ${isOverdue ? '#ef444460' : isToday ? '#f59e0b60' : doneEarly ? '#22c55e60' : '#222222'}`,
                      opacity: isBlocked ? 0.5 : 1,
                      animation: isOverdue ? 'pulse-red 2s ease-in-out infinite' : doneEarly ? 'sparkle-green 1.5s ease-in-out infinite' : 'none',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = isOverdue ? '#ef4444' : '#19c3ff' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isOverdue ? '#ef444460' : isToday ? '#f59e0b60' : doneEarly ? '#22c55e60' : '#222222' }}>
                    {isOverdue && <div className="absolute top-2 right-2 text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ background: '#ef444430', color: '#ef4444' }}>🔥 {dueInfo.label}</div>}
                    {isToday && <div className="absolute top-2 right-2 text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ background: '#f59e0b30', color: '#f59e0b' }}>📅 {dueInfo.label}</div>}
                    {doneEarly && <div className="absolute top-2 right-2 text-[8px]" style={{ color: '#22c55e' }}>✨</div>}
                    {isBlocked && <div className="absolute top-2 right-2 text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ background: '#ef444430', color: '#ef4444' }}>🔒 {blockerCount}</div>}

                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: priorityColors[task.priority] }} />
                      <span className="text-[9px] font-bold font-mono uppercase" style={{ color: priorityColors[task.priority] }}>{task.priority}</span>
                      <span className="text-[9px] font-mono" style={{ color: '#333' }}>|</span>
                      <span className="text-[9px] font-mono" style={{ color: '#333' }}>{task.estimate}</span>
                      {task.subtasks?.length > 0 && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: '#252525', color: '#4a5568' }}>☐ {task.subtasks.filter(s=>s.completed).length}/{task.subtasks.length}</span>}
                      {task.comments?.length > 0 && <span className="text-[9px]" style={{ color: '#4a5568' }}>💬 {task.comments.length}</span>}
                    </div>
                    <h4 className="text-[12px] font-mono text-white mb-2 leading-snug" style={{ textDecoration: isOverdue ? 'line-through' : 'none', textDecorationColor: '#ef4444' }}>{task.title}</h4>
                    {task.subtasks?.length > 0 && (
                      <div className="w-full h-1 rounded mb-2" style={{ background: '#252525' }}>
                        <div className="h-1 rounded" style={{ width: `${(task.subtasks.filter(s=>s.completed).length / task.subtasks.length) * 100}%`, background: task.subtasks.every(s=>s.completed) ? '#22c55e' : '#19c3ff' }}></div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {task.tags?.map(tag => <span key={tag} className="text-[8px] font-mono px-1.5 py-0.5 rounded" style={{ background: '#252525', color: '#4a5568' }}>{tag}</span>)}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold"
                        style={{ background: teamAvatars[task.assignee]?.bg || '#333', color: teamAvatars[task.assignee]?.text || '#fff' }}>
                        {teamAvatars[task.assignee]?.text || task.assignee?.[0]?.toUpperCase()}
                      </div>
                      <select value={task.status} onChange={e => { e.stopPropagation(); updateTask(task.id, { status: e.target.value }) }}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: '#252525', color: '#888', border: '1px solid #333' }}
                        onClick={e => e.stopPropagation()}>
                        {columns.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                      </select>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setDepModal(task) }} className="w-full mt-2 text-[8px] font-mono text-center py-1 rounded transition-all"
                      style={{ background: '#252525', color: '#4a5568', border: '1px solid #333' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#19c3ff'}
                      onMouseLeave={e => e.currentTarget.style.color = '#4a5568'}>
                      🔗 Dependencies ({task.dependencies?.length || 0})
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Panel — Subtasks + Comments (Phase 4+5) */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setSelectedTask(null)}>
          <div className="rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto" style={{ background: '#111111', border: '1px solid #333' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-[14px] font-bold text-white font-mono mb-1">{selectedTask.title}</h3>
            <div className="flex gap-3 mb-4 text-[10px] font-mono text-[#666]">
              <span style={{ color: priorityColors[selectedTask.priority] }}>{selectedTask.priority}</span>
              <span>{selectedTask.assignee}</span>
              {getDueInfo(selectedTask) && <span style={{ color: getDueInfo(selectedTask).status === 'overdue' ? '#ef4444' : '#f59e0b' }}>{getDueInfo(selectedTask).label}</span>}
            </div>

            {/* Subtasks Section */}
            <div className="mb-4">
              <h4 className="text-[10px] font-mono text-[#666] mb-2">☐ SUBTASKS ({selectedTask.subtasks?.filter(s=>s.completed).length || 0}/{selectedTask.subtasks?.length || 0})</h4>
              {selectedTask.subtasks?.length > 0 && (
                <div className="space-y-1 mb-2">
                  {selectedTask.subtasks.map(st => (
                    <div key={st.id} className="flex items-center gap-2 px-2 py-1.5 rounded" style={{ background: '#1a1a1a' }}>
                      <input type="checkbox" checked={st.completed} onChange={() => toggleSubtask(selectedTask.id, st.id)} className="cursor-pointer" />
                      <span className="text-[11px] font-mono" style={{ color: st.completed ? '#555' : '#fff', textDecoration: st.completed ? 'line-through' : 'none' }}>{st.title}</span>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={e => { e.preventDefault(); const input = e.target.elements.st; addSubtask(selectedTask.id, input.value); input.value = '' }}>
                <input name="st" type="text" placeholder="Add subtask..." className="w-full px-2 py-1.5 text-[10px] font-mono rounded"
                  style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', outline: 'none' }} />
              </form>
            </div>

            {/* Comments Section */}
            <div className="mb-4">
              <h4 className="text-[10px] font-mono text-[#666] mb-2">💬 COMMENTS ({selectedTask.comments?.length || 0})</h4>
              {selectedTask.comments?.length > 0 && (
                <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
                  {selectedTask.comments.map(c => (
                    <div key={c.id} className="px-3 py-2 rounded" style={{ background: '#1a1a1a' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold" style={{ color: c.role === 'Rahul' ? '#19c3ff' : '#f59e0b' }}>{c.role}</span>
                        <span className="text-[9px] font-mono text-[#444]">{c.time}</span>
                      </div>
                      <p className="text-[11px] font-mono text-[#ccc]">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={e => { e.preventDefault(); const input = e.target.elements.comment; addComment(selectedTask.id, input.value, 'Rahul'); input.value = '' }}>
                <div className="flex gap-2">
                  <input name="comment" type="text" placeholder="Add comment..." className="flex-1 px-2 py-1.5 text-[10px] font-mono rounded"
                    style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', outline: 'none' }} />
                  <button type="submit" className="px-3 py-1.5 text-[10px] font-mono rounded" style={{ background: '#19c3ff', color: '#000' }}>SEND</button>
                </div>
              </form>
            </div>

            <button onClick={() => setSelectedTask(null)} className="w-full py-2 text-[10px] font-mono rounded" style={{ background: '#252525', color: '#888' }}>CLOSE</button>
          </div>
        </div>
      )}

      {/* Dependency Modal */}
      {depModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setDepModal(null)}>
          <div className="rounded-lg p-6 w-96" style={{ background: '#111111', border: '1px solid #333' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-[14px] font-bold text-white font-mono mb-4">🔗 Dependencies</h3>
            <p className="text-[11px] font-mono text-[#888] mb-3">{depModal.title}</p>
            <div className="mb-4">
              <p className="text-[9px] font-mono text-[#666] uppercase tracking-wider mb-2">Blocked By</p>
              {depModal.dependencies?.length === 0 && <p className="text-[10px] font-mono text-[#444]">No blockers</p>}
              {depModal.dependencies.map(depId => {
                const blocker = allTasks.find(t => t.id === depId)
                if (!blocker) return null
                const resolved = blocker.status === 'done'
                return (
                  <div key={depId} className="flex items-center justify-between py-1.5 px-2 rounded mb-1" style={{ background: resolved ? '#0a1a0a' : '#1a0a0a' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px]">{resolved ? '✅' : '🔒'}</span>
                      <span className="text-[10px] font-mono" style={{ color: resolved ? '#22c55e' : '#ef4444' }}>{blocker.title.slice(0,35)}</span>
                    </div>
                    <button onClick={() => { store.removeDependency(depModal.id, depId); setDepModal({ ...depModal, dependencies: depModal.dependencies.filter(d => d !== depId) }) }}
                      className="text-[8px] font-mono px-2 py-0.5 rounded" style={{ background: '#333', color: '#888' }}>✕</button>
                  </div>
                )
              })}
            </div>
            <div>
              <p className="text-[9px] font-mono text-[#666] uppercase tracking-wider mb-2">Add Blocker</p>
              <select className="w-full text-[10px] font-mono px-2 py-1.5 rounded mb-2" style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333' }}
                onChange={e => { if (e.target.value) { store.addDependency(depModal.id, e.target.value); setDepModal({ ...depModal, dependencies: [...(depModal.dependencies || []), e.target.value] }); e.target.value = '' } }}>
                <option value="">Select a task...</option>
                {allTasks.filter(t => t.id !== depModal.id && !(depModal.dependencies || []).includes(t.id)).map(t => (
                  <option key={t.id} value={t.id}>{t.title.slice(0,40)} [{t.status}]</option>
                ))}
              </select>
            </div>
            <button onClick={() => setDepModal(null)} className="w-full mt-4 py-2 text-[10px] font-mono rounded" style={{ background: '#19c3ff', color: '#000' }}>CLOSE</button>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="rounded-lg p-6 w-96" style={{ background: '#111111', border: '1px solid #333' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-[14px] font-bold text-white font-mono mb-4">CREATE TASK</h3>
            <input type="text" placeholder="Task title..." autoFocus
              onChange={e => newTaskRef.current.title = e.target.value}
              className="w-full px-3 py-2 text-[11px] font-mono mb-3 rounded"
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', outline: 'none' }} />
            <select onChange={e => newTaskRef.current.priority = e.target.value}
              className="w-full px-3 py-2 text-[11px] font-mono mb-3 rounded"
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', outline: 'none' }}>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="high">High</option>
              <option value="urgent">🔴 Urgent</option>
            </select>
            <select onChange={e => newTaskRef.current.assignee = e.target.value}
              className="w-full px-3 py-2 text-[11px] font-mono mb-3 rounded"
              style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', outline: 'none' }}>
              {assigneeList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-[10px] font-mono rounded" style={{ background: '#252525', color: '#888' }}>CANCEL</button>
              <button onClick={createTask} className="flex-1 py-2 text-[10px] font-mono font-bold rounded" style={{ background: '#19c3ff', color: '#000' }}>CREATE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}