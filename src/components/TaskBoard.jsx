import { useState, useRef } from 'react'
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

const teamAvatars = {
  rahul: { bg: 'var(--accent)', text: 'R' },
  aria: { bg: 'var(--color-high)', text: '🦞' },
}

export default function TaskBoard() {
  const { state, store } = useStore()
  const { isLight } = useTheme()
  const allTasks = state.tasks || []
  const team = state.team || []

  const [filter, setFilter] = useState('all')
  const [dragId, setDragId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [depModal, setDepModal] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)

  const newTaskRef = useRef({ title: '', priority: 'medium', assignee: 'rahul', dueDate: null })
  const [subtaskInput, setSubtaskInput] = useState('')
  const [commentInput, setCommentInput] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const assigneeList = team.map(m => ({
    id: m.name === 'Aria' ? 'aria' : m.name.toLowerCase().split(' ')[0],
    displayName: m.name.includes(' ') ? m.name.split(' ').map(n => n[0]).join('') : (m.name === 'Aria' ? '🦞' : m.name[0].toUpperCase()),
    color: m.avatarColor,
    name: m.name,
  }))

  const blockedCount = allTasks.filter(t => t.dependencies?.some(d => { const b = allTasks.find(x => x.id === d); return b?.status !== 'done' })).length
  const overdueCount = allTasks.filter(t => getDueInfo(t)?.status === 'overdue').length
  const dueTodayCount = allTasks.filter(t => getDueInfo(t)?.status === 'today').length

  const updateTask = (id, changes) => {
    const task = allTasks.find(t => t.id === id)
    store.patchState({ tasks: allTasks.map(t => t.id === id ? { ...t, ...changes } : t) })
    store.addActivity({ icon: '▣', action: `Updated: ${task?.title?.slice(0, 30) || id}` })
  }

  const createTask = () => {
    const title = newTaskRef.current.title || 'New Task'
    const task = {
      id: store.nextId(), title, tags: [],
      priority: newTaskRef.current.priority, assignee: newTaskRef.current.assignee,
      status: 'backlog', estimate: '1d', dueDate: newTaskRef.current.dueDate || null,
      comments: [], subtasks: [], dependencies: [], dependsOn: [],
    }
    store.patchState({ tasks: [...allTasks, task] })
    store.addActivity({ icon: '▣', action: `Created: ${title}` })
    setShowModal(false)
    newTaskRef.current = { title: '', priority: 'medium', assignee: 'rahul', dueDate: null }
  }

  const toggleSubtask = (taskId, sid) => {
    const task = allTasks.find(t => t.id === taskId)
    if (!task) return
    const subs = task.subtasks.map(s => s.id === sid ? { ...s, completed: !s.completed } : s)
    const allDone = subs.length > 0 && subs.every(s => s.completed)
    store.patchState({ tasks: allTasks.map(t => t.id === taskId ? { ...t, subtasks: subs, status: allDone ? 'done' : t.status } : t) })
    if (allDone) store.addActivity({ icon: '✅', action: `Auto-completed: ${task.title.slice(0,30)}` })
  }

  const addSubtask = (taskId) => {
    if (!subtaskInput.trim()) return
    const task = allTasks.find(t => t.id === taskId)
    const ns = { id: `st-${Date.now()}`, title: subtaskInput.trim(), completed: false }
    store.patchState({ tasks: allTasks.map(t => t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), ns] } : t) })
    store.addActivity({ icon: '☐', action: `Subtask → ${task?.title?.slice(0,30)}` })
    setSubtaskInput('')
  }

  const addComment = (taskId) => {
    if (!commentInput.trim()) return
    const task = allTasks.find(t => t.id === taskId)
    const c = { id: `c-${Date.now()}`, role: 'Rahul', text: commentInput.trim(), time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}), read: true }
    store.patchState({ tasks: allTasks.map(t => t.id === taskId ? { ...t, comments: [...(t.comments || []), c] } : t) })
    store.addActivity({ icon: '💬', action: `Comment on: ${task?.title?.slice(0,30)}` })
    setCommentInput('')
  }

  const colData = {
    'backlog': allTasks.filter(t => t.status === 'backlog'),
    'in-progress': allTasks.filter(t => t.status === 'in-progress'),
    'review': allTasks.filter(t => t.status === 'review'),
    'done': allTasks.filter(t => t.status === 'done'),
  }

  const accent = isLight ? '#007AFF' : 'var(--accent)'
  const primaryBtnStyle = isLight
    ? { background: '#007AFF', color: '#fff', fontWeight: 600 }
    : { background: 'var(--accent)', color: '#000' }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4" style={{ color: 'var(--text-primary)' }}>
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-[18px] font-bold tracking-wider">TASK BOARD</h1>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{allTasks.length} tasks synced</p>
          </div>
          <div className="hidden md:flex" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-pill)', padding: '2px' }}>
            {['all', 'urgent'].map(fId => (
              <button key={fId} onClick={() => setFilter(fId)}
                className="px-3 py-1.5 text-[10px] font-medium rounded-full transition-all"
                style={{
                  background: filter === fId ? accent : 'transparent',
                  color: filter === fId ? (isLight ? '#fff' : 'var(--bg-app)') : 'var(--text-secondary)',
                }}>
                {fId === 'all' ? `ALL (${allTasks.length})` : 'URGENT'}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Filter & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {overdueCount > 0 && <span className="text-[9px] px-2 py-1 rounded-full" style={priorityPill.urgent}>🔥 {overdueCount}</span>}
          {dueTodayCount > 0 && <span className="text-[9px] px-2 py-1 rounded-full" style={priorityPill.high}>📅 {dueTodayCount}</span>}
          
          <div className="flex-1"></div>

          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 text-[10px] font-bold rounded-lg transition-all shadow-lg active:scale-95"
            style={primaryBtnStyle}>+ NEW TASK</button>
        </div>
      </div>

      {/* Mobile Column Tabs */}
      <div className="md:hidden flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
        {columns.map(c => (
          <button
            key={c.id}
            onClick={() => {
              const el = document.getElementById(`col-${c.id}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            }}
            className="flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-bold border transition-all"
            style={{ 
              background: 'var(--bg-surface)', 
              borderColor: 'var(--border-default)',
              color: 'var(--text-secondary)'
            }}
          >
            {c.label} ({colData[c.id].length})
          </button>
        ))}
      </div>


      {/* Kanban Columns */}
      <div className="flex gap-4 h-full pb-6 overflow-x-auto snap-x snap-mandatory no-scrollbar md:snap-none">
        {Object.entries(colData).map(([colId, tasks]) => (
          <div key={colId} id={`col-${colId}`} className="flex-1 min-w-[85vw] md:min-w-0 flex flex-col snap-center"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (dragId) { updateTask(dragId, { status: colId }); setDragId(null) } }}>
            <div className="flex items-center justify-between mb-4 px-3 py-2"
              style={{ background: 'var(--bg-column-header)', borderRadius: 'var(--radius-card)' }}>
              <h3 className="text-[11px] font-bold tracking-wider" style={{ color: statusColors[colId]?.text || 'var(--text-tertiary)' }}>
                {columns.find(c => c.id === colId)?.label || colId.toUpperCase()} ({tasks.length})
              </h3>
            </div>
            <div className="space-y-2 overflow-y-auto flex-1">
              {tasks
                .filter(t => filter === 'all' || t.priority === 'urgent')
                .map(task => {
                  const isBlocked = task.dependencies?.some(d => { const b = allTasks.find(x => x.id === d); return b?.status !== 'done' })
                  const blockerCount = task.dependencies?.filter(d => { const b = allTasks.find(x => x.id === d); return b?.status !== 'done' }).length || 0
                  const dueInfo = getDueInfo(task)
                  const isOverdue = dueInfo?.status === 'overdue'
                  const isToday = dueInfo?.status === 'today'
                  const doneEarly = task.status === 'done' && dueInfo?.status === 'done-early'

                  return (
                    <div key={task.id} draggable onDragStart={() => setDragId(task.id)}
                      onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                      className="p-3 rounded-lg cursor-pointer transition-all"
                      style={{
                        background: 'var(--bg-card)',
                        boxShadow: 'var(--shadow-card)',
                        border: `1px solid ${isOverdue ? 'var(--color-urgent-bg)' : 'var(--border-card)'}`,
                        opacity: isBlocked ? 0.5 : 1,
                        animation: isOverdue ? 'pulse-red 2s ease-in-out infinite' : doneEarly ? 'sparkle-green 1.5s ease-in-out infinite' : 'none',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = isLight ? '0 4px 16px rgba(0,0,0,0.12)' : '0 4px 16px rgba(0,0,0,0.5)' }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}>

                      {/* Badges row */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {isOverdue && <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={priorityPill.urgent}>🔥 {dueInfo.label}</span>}
                        {isToday && <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={priorityPill.high}>📅 {dueInfo.label}</span>}
                        {isBlocked && <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={statusColors.review}>🔒 blocked</span>}
                        {doneEarly && <span className="text-[8px]" style={{ color: 'var(--color-done)' }}>✨ done early</span>}
                      </div>

                      {/* Priority + meta */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[8px] px-2 py-0.5 rounded-full font-medium" style={priorityPill[task.priority] || priorityPill.medium}>
                          {task.priority}
                        </span>
                        <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>{task.estimate}</span>
                        {task.subtasks?.length > 0 && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
                            ☐ {task.subtasks.filter(s=>s.completed).length}/{task.subtasks.length}
                          </span>
                        )}
                        {task.comments?.length > 0 && (
                          <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>💬 {task.comments.length}</span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-[12px] mb-2 leading-snug"
                        style={{ color: 'var(--text-primary)', fontWeight: isToday ? 600 : 400 }}>
                        {task.title}
                      </h4>

                      {/* Subtask progress */}
                      {task.subtasks?.length > 0 && (
                        <div className="w-full h-1 rounded-full mb-2 overflow-hidden" style={{ background: 'var(--color-progress-bg)' }}>
                          <div className="h-1 rounded-full transition-all"
                            style={{
                              width: `${(task.subtasks.filter(s=>s.completed).length / task.subtasks.length) * 100}`,
                              background: task.subtasks.every(s=>s.completed) ? 'var(--color-done)' : accent,
                            }}></div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {task.tags?.map(tag => (
                          <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>{tag}</span>
                        ))}
                      </div>

                      {/* Footer: avatar + status select */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold"
                          style={{ background: teamAvatars[task.assignee]?.bg || 'var(--bg-surface)', color: teamAvatars[task.assignee]?.text || 'var(--text-tertiary)' }}>
                          {teamAvatars[task.assignee]?.text || task.assignee?.[0]?.toUpperCase()}
                        </div>
                        <select value={task.status} onChange={e => { e.stopPropagation(); updateTask(task.id, { status: e.target.value }) }}
                          className="text-[9px] px-2 py-0.5 rounded-full"
                          style={{ background: statusColors[task.status]?.bg || 'var(--bg-surface)', color: statusColors[task.status]?.text || 'var(--text-secondary)', border: 'none' }}
                          onClick={e => e.stopPropagation()}>
                          {columns.map(c => <option key={c.id} value={c.id} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>{c.label}</option>)}
                        </select>
                      </div>

                      {/* Dependencies button */}
                      <button onClick={e => { e.stopPropagation(); setDepModal(task) }}
                        className="w-full mt-2 text-[8px] text-center py-1 rounded-lg transition-all"
                        style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                        onMouseEnter={e => e.currentTarget.style.color = accent}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                        🔗 Dependencies ({task.dependencies?.length || 0})
                      </button>
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <div className="fixed inset-0 flex items-end md:items-center justify-center z-[60]" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setSelectedTask(null)}>
          <div className="rounded-t-2xl md:rounded-xl p-6 w-full md:w-[500px] max-h-[90vh] overflow-y-auto transition-transform"
            style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: `1px solid var(--border-default)` }}
            onClick={e => e.stopPropagation()}>

            <div className="flex justify-between items-start mb-1">
              <h3 className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{selectedTask.title}</h3>
              <button onClick={() => setSelectedTask(null)} className="text-[16px] leading-none" style={{ color: 'var(--text-tertiary)' }}>✕</button>
            </div>
            <div className="flex gap-3 mb-4 text-[10px]">
              <span className="px-2 py-0.5 rounded-full" style={priorityPill[selectedTask.priority] || priorityPill.medium}>{selectedTask.priority}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{selectedTask.assignee}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Due:</span>
                <input type="date" value={selectedTask.dueDate || ''}
                  onChange={e => updateTask(selectedTask.id, { dueDate: e.target.value })}
                  className="text-[10px] px-2 py-0.5 rounded-lg outline-none"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }} />
                {getDueInfo(selectedTask) && (
                  <span style={{ color: getDueInfo(selectedTask).status === 'overdue' ? 'var(--color-urgent)' : 'var(--color-high)' }}>
                    ({getDueInfo(selectedTask).label})
                  </span>
                )}
              </div>
            </div>

            {/* Subtasks */}
            <div className="mb-4">
              <h4 className="text-[10px] mb-2" style={{ color: 'var(--text-tertiary)' }}>☐ SUBTASKS ({selectedTask.subtasks?.filter(s=>s.completed).length || 0}/{selectedTask.subtasks?.length || 0})</h4>
              {selectedTask.subtasks?.length > 0 && (
                <div className="space-y-1 mb-2">
                  {selectedTask.subtasks.map(st => (
                    <div key={st.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                      <input type="checkbox" checked={st.completed} onChange={() => toggleSubtask(selectedTask.id, st.id)} style={{ accentColor: accent }} />
                      <span className="text-[11px]" style={{ color: st.completed ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: st.completed ? 'line-through' : 'none' }}>{st.title}</span>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={e => { e.preventDefault(); addSubtask(selectedTask.id) }}>
                <div className="flex gap-2">
                  <input value={subtaskInput} onChange={e => setSubtaskInput(e.target.value)} type="text" placeholder="Add subtask..."
                    className="flex-1 px-3 py-1.5 text-[10px] rounded-lg"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }} />
                  <button type="submit" className="px-3 py-1.5 text-[10px] rounded-lg" style={primaryBtnStyle}>ADD</button>
                </div>
              </form>
            </div>

            {/* Comments */}
            <div className="mb-4">
              <h4 className="text-[10px] mb-2" style={{ color: 'var(--text-tertiary)' }}>💬 COMMENTS ({selectedTask.comments?.length || 0})</h4>
              {selectedTask.comments?.length > 0 && (
                <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
                  {selectedTask.comments.map(c => (
                    <div key={c.id} className="px-3 py-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-medium" style={{ color: c.role === 'Rahul' ? accent : 'var(--color-high)' }}>{c.role}</span>
                        <span className="text-[9px]" style={{ color: 'var(--text-tertiary)' }}>{c.time}</span>
                      </div>
                      <p className="text-[11px]" style={{ color: 'var(--text-primary)' }}>{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={e => { e.preventDefault(); addComment(selectedTask.id) }}>
                <div className="flex gap-2">
                  <input value={commentInput} onChange={e => setCommentInput(e.target.value)} name="comment" type="text" placeholder="Add comment..."
                    className="flex-1 px-3 py-1.5 text-[10px] rounded-lg"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }} />
                  <button type="submit" className="px-3 py-1.5 text-[10px] rounded-lg" style={primaryBtnStyle}>SEND</button>
                </div>
              </form>
            </div>

            <button onClick={() => setSelectedTask(null)}
              className="w-full py-2 text-[10px] rounded-lg transition-all mb-2"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>CLOSE</button>

            <button onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-2 text-[10px] font-bold rounded-lg transition-all border border-transparent hover:border-urgent/50"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-urgent)' }}>
              DELETE TASK
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-xs p-6 rounded-2xl border text-center animate-in zoom-in-95 duration-200"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--color-urgent)40', boxShadow: '0 0 40px rgba(239, 68, 68, 0.2)' }}>
            <div className="w-12 h-12 rounded-full bg-urgent/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-[14px] font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Permanent Deletion?</h3>
            <p className="text-[11px] mb-6 px-2" style={{ color: 'var(--text-tertiary)' }}>
              This will erase <strong>{selectedTask?.title}</strong> from the database. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 text-[11px] font-bold rounded-xl transition-all"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
                CANCEL
              </button>
              <button 
                onClick={() => {
                  store.deleteTask(selectedTask.id)
                  setSelectedTask(null)
                  setShowDeleteConfirm(false)
                }}
                className="flex-1 py-2.5 text-[11px] font-bold rounded-xl transition-all shadow-lg shadow-urgent/20"
                style={{ background: 'var(--color-urgent)', color: '#fff' }}>
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dependency Modal */}
      {depModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setDepModal(null)}>
          <div className="rounded-xl p-6 w-96" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-default)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>🔗 Dependencies</h3>
              <button onClick={() => setDepModal(null)} className="text-[16px] leading-none" style={{ color: 'var(--text-tertiary)' }}>✕</button>
            </div>
            <p className="text-[11px] mb-3" style={{ color: 'var(--text-secondary)' }}>{depModal.title}</p>
            <div className="mb-4">
              <p className="text-[9px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>Blocked By</p>
              {depModal.dependencies?.length === 0 && <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>No blockers</p>}
              {depModal.dependencies.map(depId => {
                const blocker = allTasks.find(t => t.id === depId)
                if (!blocker) return null
                const resolved = blocker.status === 'done'
                return (
                  <div key={depId} className="flex items-center justify-between py-1.5 px-2 rounded-lg mb-1"
                    style={{ background: resolved ? 'var(--color-done-bg)' : 'var(--color-urgent-bg)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px]">{resolved ? '✅' : '🔒'}</span>
                      <span className="text-[10px]" style={{ color: resolved ? 'var(--color-done)' : 'var(--color-urgent)' }}>{blocker.title.slice(0,35)}</span>
                    </div>
                    <button onClick={() => { store.removeDependency(depModal.id, depId); setDepModal({ ...depModal, dependencies: depModal.dependencies.filter(d => d !== depId) }) }}
                      className="text-[8px] px-2 py-0.5 rounded-lg" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>✕</button>
                  </div>
                )
              })}
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>Add Blocker</p>
              <select className="w-full text-[10px] px-2 py-1.5 rounded-lg mb-2"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
                onChange={e => { if (e.target.value) { store.addDependency(depModal.id, e.target.value); setDepModal({ ...depModal, dependencies: [...(depModal.dependencies || []), e.target.value] }); e.target.value = '' } }}>
                <option value="" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Select a task...</option>
                {allTasks.filter(t => t.id !== depModal.id && !(depModal.dependencies || []).includes(t.id)).map(t => (
                  <option key={t.id} value={t.id} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>{t.title.slice(0,40)} [{t.status}]</option>
                ))}
              </select>
            </div>
            <button onClick={() => setDepModal(null)}
              className="w-full mt-4 py-2 text-[10px] rounded-lg transition-all" style={primaryBtnStyle}>CLOSE</button>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-end md:items-center justify-center z-[60]" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setShowModal(false)}>
          <div className="rounded-t-2xl md:rounded-xl p-6 w-full md:w-96 transition-transform" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-default)' }} onClick={e => e.stopPropagation()}>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>CREATE TASK</h3>
              <button onClick={() => setShowModal(false)} className="text-[16px] leading-none" style={{ color: 'var(--text-tertiary)' }}>✕</button>
            </div>
            <input type="text" placeholder="Task title..." autoFocus
              onChange={e => newTaskRef.current.title = e.target.value}
              className="w-full px-3 py-2 text-[11px] rounded-lg mb-3"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }} />
            <select onChange={e => newTaskRef.current.priority = e.target.value}
              className="w-full px-3 py-2 text-[11px] rounded-lg mb-3"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }}>
              <option value="medium" style={{ background: 'var(--bg-card)' }}>Medium</option>
              <option value="low" style={{ background: 'var(--bg-card)' }}>Low</option>
              <option value="high" style={{ background: 'var(--bg-card)' }}>High</option>
              <option value="urgent" style={{ background: 'var(--bg-card)' }}>🔴 Urgent</option>
            </select>
            <select onChange={e => newTaskRef.current.assignee = e.target.value}
              className="w-full px-3 py-2 text-[11px] rounded-lg mb-3"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }}>
              {assigneeList.map(a => <option key={a.id} value={a.id} style={{ background: 'var(--bg-card)' }}>{a.name}</option>)}
            </select>
            <input type="date" placeholder="Due date"
              onChange={e => newTaskRef.current.dueDate = e.target.value}
              className="w-full px-3 py-2 text-[11px] rounded-lg mb-3"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }} />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2 text-[10px] rounded-lg transition-all"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>CANCEL</button>
              <button onClick={createTask}
                className="flex-1 py-2 text-[10px] rounded-lg transition-all"
                style={primaryBtnStyle}>CREATE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
