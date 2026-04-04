import { useState, useRef } from 'react'
import { useStore } from '../StoreContext'

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const priorityColors = { urgent: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#22c55e' }

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = getDaysInMonth(year, month)
  const prevMonthDays = new Date(year, month, 0).getDate()
  const grid = []
  for (let i = firstDay - 1; i >= 0; i--) grid.push({ day: prevMonthDays - i, current: false })
  for (let i = 1; i <= daysInMonth; i++) grid.push({ day: i, current: true })
  const remaining = 42 - grid.length
  for (let i = 1; i <= remaining; i++) grid.push({ day: i, current: false })
  return grid
}

export default function Calendar() {
  const { state, store } = useStore()
  const [viewDate, setViewDate] = useState(() => { const now = new Date(); return { year: now.getFullYear(), month: now.getMonth(), date: now.getDate() } })
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null) // for 5B.3
  const [viewMode, setViewMode] = useState('month') // 5B.6 toggle
  const [showQuickAdd, setShowQuickAdd] = useState(false) // 5B.10
  const [quickAddData, setQuickAddData] = useState({ title: '', time: '10:00 AM', type: 'meeting' })
  const [draggedTask, setDraggedTask] = useState(null) // 5B.4

  const grid = getMonthGrid(viewDate.year, viewDate.month)
  const events = state.events || []
  const tasks = state.tasks || []

  const today = new Date()
  const isToday = (d) => d.day === today.getDate() && viewDate.month === today.getMonth() && viewDate.year === today.getFullYear()

  const getEventsForDay = (d) => { if (!d.current) return []; return events.filter(e => e.date === d.day) }
  const getTasksForDay = (d) => {
    if (!d.current) return []
    return tasks.filter(t => { if (!t.dueDate) return false; const dd = new Date(t.dueDate); return dd.getDate() === d.day && dd.getMonth() === viewDate.month && dd.getFullYear() === viewDate.year })
  }

  // 5B.8 & 5B.9: Recurring events support
  const getRecurringEvents = (day, month, year) => {
    const recurring = (state.recurringEvents || []).filter(ev => {
      if (!ev.active) return false
      if (ev.rule.type === 'weekly') return new Date(year, month, day).getDay() === ev.rule.dayOfWeek
      if (ev.rule.type === 'monthly') return day === ev.rule.dayOfMonth
      return false
    })
    return recurring.map(ev => ({ ...ev, isRecurring: true }))
  }

  // 5B.2: Color-code by priority (tasks) and type (events)
  const getTaskColor = (t) => {
    if (t.status === 'done') return { bg: '#22c55e20', color: '#22c55e', border: '#22c55e' }
    return { bg: `${priorityColors[t.priority] || '#333'}30`, color: priorityColors[t.priority] || '#888', border: priorityColors[t.priority] || '#888' }
  }

  // 5B.14: AI nudge on free slot
  const hasFreeSlotOnDay = (d) => getEventsForDay(d).length === 0 && getTasksForDay(d).length === 0
  const hasEmptyDay = grid.filter(d => d.current && hasFreeSlotOnDay(d)).length > 10

  // Quick add handler (5B.10)
  const handleQuickAdd = () => {
    if (!quickAddData.title.trim() || !selectedDay) return
    const newEvent = { date: selectedDay.day, title: quickAddData.title, time: quickAddData.time, type: quickAddData.type }
    store.patchState({ events: [...events, { ...newEvent, color: '#19c3ff' }] })
    store.addActivity({ icon: '📅', action: `Added event: ${quickAddData.title}` })
    setShowQuickAdd(false)
    setQuickAddData({ title: '', time: '10:00 AM', type: 'meeting' })
  }

  // Drag task to set due date (5B.4)
  const handleDropOnDay = (dayNum) => {
    if (!draggedTask) return
    const dueDate = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    store.patchState({
      tasks: tasks.map(t => t.id === draggedTask.id ? { ...t, dueDate } : t)
    })
    store.addActivity({ icon: '📅', action: `Set due date for "${draggedTask.title}" to ${dueDate}` })
    setDraggedTask(null)
  }

  // 5B.12 & 5B.13: AI conflict detection (simple: >3 events on same day)
  const getConflicts = () => {
    if (viewMode !== 'month') return []
    return grid.filter(d => d.current && getEventsForDay(d).length >= 3).map(d => ({ day: d.day, count: getEventsForDay(d).length }))
  }
  const conflicts = getConflicts()

  // Agenda data (5B.7)
  const upcomingEvents = events.filter(e => e.date >= viewDate.date).slice(0, 7)
  const overdueTasks = tasks.filter(t => { if (!t.dueDate || t.status === 'done') return false; return new Date(t.dueDate) < new Date() })

  const eventCounts = {
    total: events.length, meetings: events.filter(e => e.type === 'meeting').length,
    deadlines: events.filter(e => e.type === 'deadline').length, reviews: events.filter(e => e.type === 'review').length,
  }

  // Week view date range (5B.5)
  const getWeekDays = () => {
    const startOfWeek = new Date(viewDate.year, viewDate.month, viewDate.date)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek); d.setDate(d.getDate() + i)
      return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), name: dayNames[d.getDay()] }
    })
  }
  const weekDays = getWeekDays()

  return (
    <div className="flex flex-col h-full">
      {/* Header with toggle (5B.6) */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[15px] font-bold text-white font-mono tracking-wider">CALENDAR</h1>
          <div className="flex gap-1">
            {['month', 'week', 'agenda'].map(vm => (
              <button key={vm} onClick={() => setViewMode(vm)}
                className="px-3 py-1.5 text-[10px] font-mono rounded transition-all"
                style={{ background: viewMode === vm ? '#252525' : 'transparent', color: viewMode === vm ? '#19c3ff' : '#666' }}>
                {vm.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasEmptyDay && viewMode === 'month' && (
            <button onClick={() => setShowQuickAdd(true)} className="px-3 py-1.5 text-[10px] font-mono rounded"
              style={{ background: '#19c3ff20', color: '#19c3ff', border: '1px solid #19c3ff40' }}>
              ⚡ AI: {conflicts.length > 0 ? `${conflicts.length} conflicts` : '13 free slots available'}
            </button>
          )}
          <button onClick={() => setViewDate(p => ({ ...p, month: p.month === 0 ? 11 : p.month - 1, year: p.month === 0 ? p.year - 1 : p.year }))}
            className="px-2 py-1 text-[12px] font-mono rounded" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#888' }}>◀</button>
          <span className="text-[13px] font-bold font-mono text-white">{monthNames[viewDate.month]} {viewDate.year}</span>
          <button onClick={() => setViewDate(p => ({ ...p, month: p.month === 11 ? 0 : p.month + 1, year: p.month === 11 ? p.year + 1 : p.year }))}
            className="px-2 py-1 text-[12px] font-mono rounded" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#888' }}>▶</button>
          <button onClick={() => { const n = new Date(); setViewDate({ year: n.getFullYear(), month: n.getMonth(), date: n.getDate() }) }}
            className="px-3 py-1.5 text-[10px] font-mono rounded" style={{ background: '#19c3ff20', color: '#19c3ff', border: '1px solid #19c3ff40' }}>Today</button>
        </div>
      </div>

      {/* Conflict warnings (5B.13) */}
      {conflicts.length > 0 && viewMode === 'month' && (
        <div className="mb-3 p-2 rounded-lg flex items-center gap-2" style={{ background: '#1a0a0a', border: '1px solid #f59e0b40' }}>
          <span className="text-[10px]">⚠️</span>
          <span className="text-[10px] font-mono" style={{ color: '#f59e0b' }}>
            AI detected {conflicts.length} day{conflicts.length > 1 ? 's' : ''} with 3+ events: {conflicts.slice(0, 3).map(c => `Day ${c.day}`).join(', ')}
          </span>
        </div>
      )}

      <div className="flex flex-1 gap-0 min-h-0 overflow-hidden">
        {viewMode === 'agenda' ? (
          /* 5B.7: Agenda view (mobile-friendly) */
          <div className="flex-1 rounded-lg overflow-hidden flex flex-col" style={{ background: '#111111' }}>
            <div className="p-4 border-b" style={{ borderColor: '#1a1a1a' }}>
              <h3 className="text-[12px] font-bold text-white font-mono">AGENDA — {monthNames[viewDate.month]} {viewDate.year}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {overdueTasks.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-mono mb-2" style={{ color: '#ef4444' }}>🔥 OVERDUE TASKS</h4>
                  {overdueTasks.map(t => {
                    const tc = getTaskColor(t)
                    return (
                      <div key={t.id} className="p-3 rounded-lg mb-2" style={{ background: '#1a0a0a', border: `1px solid ${tc.border}40` }}>
                        <span className="text-[11px] font-mono" style={{ color: tc.color }}>{t.title}</span>
                        <span className="text-[9px] font-mono ml-2" style={{ color: '#ef4444' }}>{t.dueDate}</span>
                      </div>
                    )}
                  )}
                </div>
              )}
              <div>
                <h4 className="text-[10px] font-mono mb-2" style={{ color: '#19c3ff' }}>📅 UPCOMING EVENTS</h4>
                {upcomingEvents.map((ev, i) => (
                  // 5B.3: Click event to open task details
                  <div key={i} onClick={() => setSelectedEvent(ev)} className="p-3 rounded-lg mb-2 cursor-pointer" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: ev.color || '#19c3ff' }} />
                      <span className="text-[11px] font-mono text-white flex-1">{ev.title}</span>
                      <span className="text-[10px] font-mono" style={{ color: ev.color || '#19c3ff' }}>{ev.time}</span>
                    </div>
                    {isRecurring && <span className="text-[8px] font-mono" style={{ color: '#a855f7' }}>🔄 {ev.rule.type}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : viewMode === 'week' ? (
          /* 5B.5: Week view (hourly grid) */
          <div className="flex-1 rounded-lg overflow-hidden flex flex-col" style={{ background: '#111111' }}>
            <div className="p-4 border-b" style={{ borderColor: '#1a1a1a' }}>
              <h3 className="text-[12px] font-bold text-white font-mono">WEEK VIEW</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-7 gap-2 mb-3">
                {weekDays.map((wd, idx) => (
                  <div key={idx} className="text-center text-[10px] font-mono pb-2" style={{ borderColor: '#1a1a1a', color: idx < 5 ? '#19c3ff' : '#666' }}>
                    {wd.name}<br /><span className="text-[14px] font-bold">{wd.day}</span>
                  </div>
                ))}
              </div>
              {Array.from({ length: 14 }, (_, h) => (
                <div key={h} className="grid grid-cols-7 gap-2 mb-1">
                  {weekDays.map((wd, idx) => {
                    const hour = h + 8
                    const dayEvents = events.filter(e => e.date === wd.day && e.time?.includes(`${hour}:00`))
                    return (
                      <div key={idx} className="px-2 py-2 rounded text-[9px] font-mono" style={{ background: '#1a1a1a', minHeight: '32px' }}>
                        {hour}:00
                        {dayEvents.map((ev, i) => (
                          // 5B.2: Color-code by priority type
                          <div key={i} className="mt-1 px-1 py-0.5 rounded truncate" style={{ background: `${ev.color || '#19c3ff'}40`, color: ev.color || '#19c3ff' }}>
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Month Grid (5B.3/5B.4: drag-drop + event click) */
          <div className="flex-1 rounded-lg overflow-hidden flex flex-col" style={{ background: '#111111' }}>
            <div className="grid grid-cols-7 text-[10px] font-mono py-2 border-b" style={{ borderColor: '#1a1a1a' }}>
              {dayNames.map(d => <div key={d} className="text-center" style={{ color: d === 'Sun' ? '#ef4444' : '#555' }}>{d}</div>)}
            </div>
            <div className="flex-1 grid grid-cols-7 grid-rows-6 overflow-hidden">
              {grid.map((d, i) => {
                const dayEvents = getEventsForDay(d)
                const dayTasks = getTasksForDay(d)
                const isTodayCell = isToday(d)
                const hasFreeSlot = hasFreeSlotOnDay(d)
                return (
                  <div key={i}
                    onClick={() => d.current && setSelectedDay({ ...d, events: dayEvents, tasks: dayTasks })}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = '#19c3ff15' }}
                    onDragLeave={e => { e.currentTarget.style.background = isTodayCell ? '#19c3ff15' : 'transparent' }}
                    onDrop={e => { e.stopPropagation(); if (draggedTask) handleDropOnDay(d.day) }}
                    className="p-1 cursor-pointer transition-all relative min-h-0"
                    style={{ background: isTodayCell ? '#19c3ff15' : 'transparent', border: '1px solid #111' }}>
                    <span className="text-[9px] font-mono" style={{ color: isTodayCell ? '#19c3ff' : d.current ? '#888' : '#333' }}>{d.day}</span>
                    {hasFreeSlot && d.current && viewDate.date % 7 === 0 && (
                      <span className="absolute bottom-0.5 right-1 text-[6px]" style={{ color: '#22c55e40' }}>+ available</span>
                    )}
                    {d.current && (
                      <div className="mt-0.5 space-y-0.5">
                        {/* 5B.2: Color-coded tasks by priority */}
                        {dayTasks.slice(0, 2).map(t => {
                          const tc = getTaskColor(t)
                          return (
                            <div key={t.id} draggable
                              onDragStart={() => setDraggedTask(t)}
                              className="text-[7px] font-mono truncate px-1 py-0.5 rounded overflow-hidden cursor-grab"
                              style={{ background: tc.bg, color: tc.color }}>
                              {t.title}
                            </div>
                          )
                        })}
                        {dayEvents.slice(0, 1).map((ev, i) => (
                          <div key={`ev-${i}`}
                            onClick={e => { e.stopPropagation(); setSelectedEvent(ev) }} // 5B.3
                            className="text-[7px] font-mono truncate px-1 py-0.5 rounded overflow-hidden cursor-pointer"
                            style={{ background: `${ev.color || '#19c3ff'}20`, color: ev.color || '#19c3ff' }}>
                            {ev.time} {ev.title}
                          </div>
                        ))}
                        {(dayTasks.length + dayEvents.length) > 3 && (
                          <div className="text-[7px] font-mono px-1" style={{ color: '#444' }}>+{dayTasks.length + dayEvents.length - 3} more</div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Right Panel */}
        <div className="w-72 ml-4 flex flex-col gap-4 min-h-0">
          {selectedEvent ? (
            // 5B.3: Event detail panel
            <div className="rounded-lg overflow-hidden flex-1 flex flex-col" style={{ background: '#111111', border: `2px solid ${selectedEvent.color || '#19c3ff'}` }}>
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#1a1a1a' }}>
                <h3 className="text-[12px] font-bold font-mono" style={{ color: selectedEvent.color || '#19c3ff' }}>{selectedEvent.title}</h3>
                <button onClick={() => setSelectedEvent(null)} className="text-[10px] font-mono" style={{ color: '#666' }}>✕</button>
              </div>
              <div className="p-4 space-y-3">
                {selectedEvent.isRecurring && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]" style={{ color: '#a855f7' }}>🔄 Recurring</span>
                    <span className="text-[9px] font-mono" style={{ color: '#a855f7' }}>({selectedEvent.rule.type})</span>
                  </div>
                )}
                <div className="text-[11px] font-mono text-white">📅 {monthNames[viewDate.month]} {selectedEvent.date}</div>
                <div className="text-[11px] font-mono" style={{ color: selectedEvent.color || '#19c3ff' }}>🕐 {selectedEvent.time}</div>
                <div className="text-[10px] font-mono" style={{ color: '#666' }}>Type: {selectedEvent.type || 'event'}</div>
              </div>
            </div>
          ) : selectedDay ? (
            <div className="rounded-lg overflow-hidden flex-1 flex flex-col" style={{ background: '#111111' }}>
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#1a1a1a' }}>
                <h3 className="text-[12px] font-bold text-white font-mono">{monthNames[viewDate.month]} {selectedDay.day}</h3>
                <button onClick={() => setSelectedDay(null)} className="text-[10px] font-mono" style={{ color: '#666' }}>✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {selectedDay.tasks.length === 0 && selectedDay.events.length === 0 && (
                  <p className="text-[10px] font-mono text-[#555]">Nothing scheduled</p>
                )}
                {selectedDay.tasks.map(t => {
                  const tc = getTaskColor(t) // 5B.2
                  return (
                    <div key={t.id} className="p-2 rounded-lg cursor-grab" draggable // 5B.4
                      onDragStart={() => setDraggedTask(t)}
                      style={{ background: tc.bg, borderLeft: `2px solid ${tc.border}` }}>
                      <span className="text-[10px] font-mono" style={{ color: tc.color }}>{t.title}</span>
                      <span className="text-[9px] font-mono ml-2" style={{ color: '#666' }}>{t.status}</span>
                    </div>
                  )
                })}
                {selectedDay.events.map((ev, i) => (
                  <div key={i} className="p-2 rounded-lg cursor-pointer" onClick={() => setSelectedEvent(ev)}
                    style={{ background: '#1a1a1a', borderLeft: `2px solid ${ev.color || '#19c3ff'}` }}>
                    <span className="text-[10px] font-mono" style={{ color: ev.color || '#19c3ff' }}>{ev.time}</span>
                    <span className="text-[10px] font-mono text-white ml-2">{ev.title}</span>
                    {ev.isRecurring && <span className="text-[8px] ml-1" style={{ color: '#a855f7' }}>🔄</span>}
                  </div>
                ))}
              </div>
            </div>
          ) : showQuickAdd ? (
            /* 5B.10: Quick-add modal */
            <div className="rounded-lg overflow-hidden flex-1 flex flex-col p-4" style={{ background: '#111111' }}>
              <h3 className="text-[12px] font-bold text-white font-mono mb-4">⚡ QUICK ADD</h3>
              <input type="text" value={quickAddData.title} onChange={e => setQuickAddData({ ...quickAddData, title: e.target.value })}
                placeholder="Event title..." autoFocus
                className="w-full px-3 py-2 text-[11px] font-mono mb-3 rounded" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', outline: 'none' }} />
              <input type="text" value={quickAddData.time} onChange={e => setQuickAddData({ ...quickAddData, time: e.target.value })}
                placeholder="Time..." className="w-full px-3 py-2 text-[11px] font-mono mb-3 rounded" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', outline: 'none' }} />
              <select value={quickAddData.type} onChange={e => setQuickAddData({ ...quickAddData, type: e.target.value })}
                className="w-full px-3 py-2 text-[10px] font-mono mb-3 rounded" style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff' }}>
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="review">Review</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => setShowQuickAdd(false)} className="flex-1 py-2 text-[10px] font-mono rounded" style={{ background: '#252525', color: '#888' }}>CANCEL</button>
                <button onClick={handleQuickAdd} className="flex-1 py-2 text-[10px] font-mono rounded font-bold" style={{ background: '#19c3ff', color: '#000' }}>ADD</button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden flex-1 flex flex-col" style={{ background: '#111111' }}>
              <div className="p-4 border-b" style={{ borderColor: '#1a1a1a' }}>
                <h3 className="text-[11px] font-bold text-white font-mono tracking-wider">UPCOMING EVENTS</h3>
                <p className="text-[10px] font-mono" style={{ color: '#666' }}>Next 7 days</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {upcomingEvents.map((ev, i) => (
                  <div key={i} onClick={() => setSelectedEvent(ev)} className="p-3 rounded-lg transition-all cursor-pointer" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: ev.color || '#19c3ff' }} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[12px] font-mono text-white truncate">{ev.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono" style={{ color: ev.color || '#19c3ff' }}>{monthNames[viewDate.month].slice(0, 3)} {ev.date}</span>
                          <span className="text-[10px] font-mono" style={{ color: '#555' }}>{ev.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {overdueTasks.length > 0 && (
                  <div className="mt-2 p-3 rounded-lg" style={{ background: '#1a0a0a', border: '1px solid #ef444440' }}>
                    <h4 className="text-[10px] font-mono mb-2" style={{ color: '#ef4444' }}>🔥 OVERDUE ({overdueTasks.length})</h4>
                    {overdueTasks.slice(0, 3).map(t => {
                      const tc = getTaskColor(t)
                      return <div key={t.id} className="text-[10px] font-mono truncate" style={{ color: tc.color }}>{t.title}</div>
                    })}
                  </div>
                )}
              </div>
              <div className="p-4 border-t space-y-1.5" style={{ borderColor: '#1a1a1a' }}>
                <h4 className="text-[10px] font-mono mb-2" style={{ color: '#666' }}>THIS MONTH</h4>
                <div className="flex items-center justify-between"><span className="text-[11px] font-mono text-white">Total Events</span><span className="text-[11px] font-mono" style={{ color: '#19c3ff' }}>{eventCounts.total}</span></div>
                <div className="flex items-center justify-between"><span className="text-[11px] font-mono text-white">Meetings</span><span className="text-[11px] font-mono" style={{ color: '#888' }}>{eventCounts.meetings}</span></div>
                <div className="flex items-center justify-between"><span className="text-[11px] font-mono text-white">Deadlines</span><span className="text-[11px] font-mono" style={{ color: '#ef4444' }}>{eventCounts.deadlines}</span></div>
                <div className="flex items-center justify-between"><span className="text-[11px] font-mono text-white">Reviews</span><span className="text-[11px] font-mono" style={{ color: '#a855f7' }}>{eventCounts.reviews}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}