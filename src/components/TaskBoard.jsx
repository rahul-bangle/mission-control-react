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
  if (diff < 0) return { status: 'overdue', label: "${Math.abs(diff)}d overdue" }
  if (diff === 0) return { status: 'today', label: 'Due today' }
  if (diff <= 3) return { status: 'soon', label: "${diff}d left" }
  return { status: 'upcoming', label: "${diff}d left" }
}

function getStaleInfo(task, boardDate) {
  if (!task.dueDate || task.status === 'done') return null
  const origin = new Date(task.dueDate); origin.setHours(0, 0, 0, 0)
  const viewing = new Date(boardDate); viewing.setHours(0, 0, 0, 0)
  const diff = Math.ceil((viewing - origin) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return null
  if (diff === 1) return { level: 'warn', days: diff, label: '1d late', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' }
  if (diff <= 3) return { level: 'alert', days: diff, label: "${diff}d late", color: '#f97316', bg: 'rgba(249,115,22,0.1)' }
  return { level: 'stale', days: diff, label: "STALE ${diff}d", color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
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
  const [showModal, setShowModal] = useState(false)
  const [depModal, setDepModal] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)

  const newTaskRef = useRef({ title: '', priority: 'medium', assignee: 'rahul', dueDate: boardDate })
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
    store.addActivity({ icon: '▣', action: "Updated: ${task?.title?.slice(0, 30) || id}" })
  }

  const createTask = () => {
    if (!newTaskRef.current.dueDate) {
      alert('Please select a due date. Every task must be scheduled on the timeline.');
      return;
    }
    const title = newTaskRef.current.title || 'New Task'
    const task = {
      id: store.nextId(), title, tags: [],
      priority: newTaskRef.current.priority, assignee: newTaskRef.current.assignee,
      status: 'backlog', estimate: '1d', dueDate: newTaskRef.current.dueDate,
      comments: [], subtasks: [], dependencies: [], dependsOn: [],
    }
    store.patchState({ tasks: [...allTasks, task] })
    store.addActivity({ icon: '▣', action: "Created: ${title}" })
    setShowModal(false)
    newTaskRef.current = { title: '', priority: 'medium', assignee: 'rahul', dueDate: boardDate }
  }

  const toggleSubtask = (taskId, sid) => {
    const task = allTasks.find(t => t.id === taskId)
    if (!task) return
    const subs = task.subtasks.map(s => s.id === sid ? { ...s, completed: !s.completed } : s)
    const allDone = subs.length > 0 && subs.every(s => s.completed)
    store.patchState({ tasks: allTasks.map(t => t.id === taskId ? { ...t, subtasks: subs, status: allDone ? 'done' : t.status } : t) })
    if (allDone) store.addActivity({ icon: '✅', action: "Auto-completed: ${task.title.slice(0,30)}" })
  }

  const addSubtask = (taskId) => {
    if (!subtaskInput.trim()) return
    const task = allTasks.find(t => t.id === taskId)
    const ns = { id: "st-${Date.now()}", title: subtaskInput.trim(), completed: false }
    store.patchState({ tasks: allTasks.map(t => t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), ns] } : t) })
    store.addActivity({ icon: '☐', action: "Subtask → ${task?.title?.slice(0,30)}" })
    setSubtaskInput('')
  }

  const addComment = (taskId) => {
    if (!commentInput.trim()) return
    const task = allTasks.find(t => t.id === taskId)
    const c = { id: "c-${Date.now()}", role: 'Rahul', text: commentInput.trim(), time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'}), read: true }
    store.patchState({ tasks: allTasks.map(t => t.id === taskId ? { ...t, comments: [...(t.comments || []), c] } : t) })
    store.addActivity({ icon: '💬', action: "Comment on: ${task?.title?.slice(0,30)}" })
    setCommentInput('')
  }

  // ── Carry-forward logic ────────────────────────────────────────
  // Tasks explicitly on this date
  const ownTasks = allTasks.filter(t => t.dueDate === boardDate)

  // Tasks from a past date that are still unfinished (exclude done, exclude no-date)
  const carriedTasks = allTasks.filter(t =>
    t.dueDate &&
    t.dueDate < boardDate &&
    t.status !== 'done'
  )

  // On a past date we show own tasks only (with ghost style)
  // On today/future we also pull in carried tasks
  const todayStr = new Date().toISOString().slice(0, 10)
  const isViewingPast = boardDate < todayStr

  // Build carried sets (for present/future only)
  const carriedInProgress = isViewingPast ? [] : carriedTasks.filter(t => t.status === 'in-progress')
  const carriedReview     = isViewingPast ? [] : carriedTasks.filter(t => t.status === 'review')
  const carriedBacklog    = isViewingPast ? [] : carriedTasks.filter(t => t.status === 'backlog' || t.status === 'pending')

  // Deduplicate helpers (own tasks take priority)
  const ownIds = new Set(ownTasks.map(t => t.id))
  const filterCarried = arr => arr.filter(t => !ownIds.has(t.id))

  const colData = {
    'backlog': [
      ...filterCarried(carriedBacklog),   // carried first — high priority
      ...ownTasks.filter(t => t.status === 'backlog' || t.status === 'pending'),
    ],
    'in-progress': [
      ...filterCarried(carriedInProgress),
      ...ownTasks.filter(t => t.status === 'in-progress'),
    ],
    'review': [
      ...filterCarried(carriedReview),
      ...ownTasks.filter(t => t.status === 'review'),
    ],
    'done': ownTasks.filter(t => t.status === 'done'), // done never carries forward
  }

  // Helper to know if a task is a carried-in task (not originally on boardDate)
  const isCarried = (task) => task.dueDate !== boardDate
  const isPastGhost = (task) => isViewingPast && task.dueDate === boardDate && task.status !== 'done'

  const accent = isLight ? '#007AFF' : 'var(--accent)'
  const primaryBtnStyle = isLight
    ? { background: '#007AFF', color: '#fff', fontWeight: 600 }
    : { background: 'var(--accent)', color: '#000' }

  // Flat list for header count display
  const dateFilteredTasks = [...new Set(Object.values(colData).flat())]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4" style={{ color: 'var(--text-primary)' }}>
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-[18px] font-bold tracking-wider">TASK BOARD</h1>
            <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{ownTasks.length} tasks · {Object.values(colData).flat().filter(t => isCarried(t)).length} carried</p>
          </div>

          {/* Premium Date Picker */}
          <div className="relative" ref={pickerRef}>
            {/* Trigger Button */}
            <button
              onClick={() => {
                setPickerViewDate(() => {
                  const d = new Date(boardDate)
                  return { year: d.getFullYear(), month: d.getMonth() }
                })
                setShowDatePicker(p => !p)
              }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: showDatePicker ? (isLight ? '#007AFF15' : 'rgba(25,195,255,0.08)') : 'var(--bg-surface)',
                borderColor: showDatePicker ? accent : 'var(--border-default)',
                boxShadow: showDatePicker ? "0 0 0 2px ${accent}30" : 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>
                {new Date(boardDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ color: 'var(--text-tertiary)', transform: showDatePicker ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Dropdown Calendar */}
            {showDatePicker && (() => {
              const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
              const dayNames = ['Mo','Tu','We','Th','Fr','Sa','Su']
              const { year, month } = pickerViewDate
              const firstDay = new Date(year, month, 1).getDay()
              const adjustedFirst = (firstDay === 0 ? 7 : firstDay) - 1
              const daysInMonth = new Date(year, month + 1, 0).getDate()
              const todayStr = new Date().toISOString().slice(0, 10)
              const prevMonthDays = new Date(year, month, 0).getDate()
              const cells = []
              for (let i = adjustedFirst - 1; i >= 0; i--) {
                const d = prevMonthDays - i
                cells.push({ day: d, current: false, dateStr: "${year}-${String(month === 0 ? 12 : month).padStart(2,'0')}-${String(d).padStart(2,'0')}" })
              }
              for (let d = 1; d <= daysInMonth; d++) {
                cells.push({ day: d, current: true, dateStr: "${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}" })
              }
              const remaining = 42 - cells.length
              for (let d = 1; d <= remaining; d++) {
                cells.push({ day: d, current: false, dateStr: "${year}-${String(month === 11 ? 1 : month+2).padStart(2,'0')}-${String(d).padStart(2,'0')}" })
              }
              return (
                <div
                  className="absolute top-[calc(100%+8px)] left-0 z-[200] rounded-2xl overflow-hidden"
                  style={{
                    width: '300px',
                    background: isLight ? '#fff' : 'rgba(14,17,25,0.98)',
                    border: '1px solid var(--border-default)',
                    boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${accent}20",
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Calendar Header */}
                  <div className="px-4 pt-4 pb-3" style={{ background: accent }}>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setPickerViewDate(p => {
                            const d = new Date(p.year, p.month - 1)
                            return { year: d.getFullYear(), month: d.getMonth() }
                          })}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all text-white text-[12px] font-bold"
                        >‹</button>
                      </div>
                      <span className="text-[13px] font-bold text-white">
                        {monthNames[month]}, {year}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setPickerViewDate(p => {
                            const d = new Date(p.year, p.month + 1)
                            return { year: d.getFullYear(), month: d.getMonth() }
                          })}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all text-white text-[12px] font-bold"
                        >›</button>
                      </div>
                    </div>
                  </div>

                  {/* Day Names */}
                  <div className="grid grid-cols-7 px-3 pt-3 pb-1">
                    {dayNames.map(d => (
                      <div key={d} className="text-center text-[10px] font-bold py-1"
                        style={{ color: (d === 'Sa' || d === 'Su') ? 'var(--color-urgent)' : 'var(--text-tertiary)' }}>
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Day Grid */}
                  <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
                    {cells.map((cell, i) => {
                      const isSelected = cell.dateStr === boardDate
                      const isToday = cell.dateStr === todayStr
                      const isFaded = !cell.current
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (cell.current) {
                              setBoardDate(cell.dateStr)
                              setShowDatePicker(false)
                            }
                          }}
                          className="w-9 h-9 mx-auto flex items-center justify-center rounded-lg text-[12px] font-medium transition-all hover:scale-110"
                          style={{
                            background: isSelected ? accent : isToday ? "${accent}20" : 'transparent',
                            color: isSelected ? '#fff' : isFaded ? 'var(--text-tertiary)' : isToday ? accent : 'var(--text-primary)',
                            fontWeight: isSelected || isToday ? '700' : '500',
                            opacity: isFaded ? 0.35 : 1,
                            cursor: cell.current ? 'pointer' : 'default',
                          }}
                        >
                          {cell.day}
                        </button>
                      )
                    })}
                  </div>

                  {/* Footer */}
                  <div className="px-4 pb-4 flex gap-2">
                    <button
                      onClick={() => {
                        setBoardDate(todayStr)
                        setShowDatePicker(false)
                      }}
                      className="flex-1 py-2 rounded-xl text-[11px] font-bold transition-all hover:opacity-80"
                      style={{ background: "${accent}15", color: accent }}
                    >
                      Today
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>

          <div className="hidden md:flex" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-pill)', padding: '2px' }}>
            {['all', 'urgent'].map(fId => (
              <button key={fId} onClick={() => setFilter(fId)}
                className="px-3 py-1.5 text-[10px] font-medium rounded-full transition-all"
                style={{
                  background: filter === fId ? accent : 'transparent',
                  color: filter === fId ? (isLight ? '#fff' : 'var(--bg-app)') : 'var(--text-secondary)',
                }}>
                {fId === 'all' ? "ALL (${allTasks.length})" : 'URGENT'}
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
              const el = document.getElementById("col-${c.id}");
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
      <div className="flex h-full pb-6 overflow-x-auto snap-x snap-mandatory no-scrollbar md:snap-none"
        style={{ borderRadius: 'var(--radius-card)', border: '1px solid var(--border-default)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
        {Object.entries(colData).map(([colId, tasks], colIndex) => (
          <div key={colId} id={"col-${colId}"}
            className="flex-1 min-w-[85vw] md:min-w-0 flex flex-col snap-center"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (dragId) { updateTask(dragId, { status: colId }); setDragId(null) } }}
            style={{
              borderRight: colIndex < Object.keys(colData).length - 1 ? '1px solid var(--border-default)' : 'none',
            }}>
            <div className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--border-default)' }}>
              <h3 className="text-[11px] font-bold tracking-wider" style={{ color: statusColors[colId]?.text || 'var(--text-tertiary)' }}>
                {columns.find(c => c.id === colId)?.label || colId.toUpperCase()}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ background: (statusColors[colId]?.bg || 'var(--color-tag-bg)'), color: (statusColors[colId]?.text || 'var(--text-tertiary)') }}>
                {tasks.length}
              </span>
            </div>
            <div className="space-y-2 overflow-y-auto flex-1 p-3">
              {tasks
                .filter(t => filter === 'all' || t.priority === 'urgent')
                .map(task => {
                  const isBlocked = task.dependencies?.some(d => { const b = allTasks.find(x => x.id === d); return b?.status !== 'done' })
                  const blockerCount = task.dependencies?.filter(d => { const b = allTasks.find(x => x.id === d); return b?.status !== 'done' }).length || 0
                  const dueInfo = getDueInfo(task)
                  const isOverdue = dueInfo?.status === 'overdue'
                  const isToday = dueInfo?.status === 'today'
                  const doneEarly = task.status === 'done' && dueInfo?.status === 'done-early'
                  const stale = getStaleInfo(task, boardDate)
                  const carried = isCarried(task)
                  const ghost = isPastGhost(task)

                  const cardBorderColor = stale ? stale.color
                    : isOverdue && !carried ? 'var(--color-urgent)'
                    : ghost ? 'var(--border-default)'
                    : 'var(--border-card)'
                  const cardBg = stale ? stale.bg
                    : ghost ? (isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)')
                    : 'var(--bg-card)'

                  return (
                    <div key={task.id} draggable onDragStart={() => setDragId(task.id)}
                      onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                      className={"p-3 rounded-lg cursor-pointer transition-all"}
                      style={{
                        background: cardBg,
                        boxShadow: stale ? "0 0 0 1.5px 35, var(--shadow-card)" : 'var(--shadow-card)',
                        border: "1.5px  ",
                        borderLeft: stale ? "3px solid " : undefined,
                        opacity: ghost ? 0.45 : isBlocked ? 0.5 : 1,
                        animation: isOverdue && !stale && !carried ? 'pulse-red 2s ease-in-out infinite' : doneEarly ? 'sparkle-green 1.5s ease-in-out infinite' : 'none',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = ghost ? '0.7' : '1'; e.currentTarget.style.boxShadow = isLight ? '0 4px 16px rgba(0,0,0,0.12)' : '0 4px 16px rgba(0,0,0,0.5)' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = ghost ? '0.45' : isBlocked ? '0.5' : '1'; e.currentTarget.style.boxShadow = stale ? "0 0 0 1.5px 35, var(--shadow-card)" : 'var(--shadow-card)' }}>

                      {/* Badges row */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {ghost && <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-surface)', color: 'var(--text-tertiary)', border: '1px dashed var(--border-default)' }}>↗ Carried</span>}
                        {carried && !ghost && stale && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: stale.bg, color: stale.color, border: "1px solid 50" }}>
                            {stale.level === 'stale' ? '🔴' : stale.level === 'alert' ? '🟠' : '🟡'} {stale.label}
                          </span>
                        )}
                        {carried && !ghost && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
                            ↗ {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {!carried && isOverdue && <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={priorityPill.urgent}>🔥 {dueInfo.label}</span>}
                        {!carried && isToday && <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={priorityPill.high}>📅 {dueInfo.label}</span>}
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
                              width: "${(task.subtasks.filter(s=>s.completed).length / task.subtasks.length) * 100}",
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
            style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: "1px solid var(--border-default)" }}
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
              defaultValue={boardDate}
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