import { useState, useRef } from 'react'
import { useTheme } from '../ThemeContext'
import { useStore } from '../StoreContext'

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

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

function getTaskColor(t, accent) {
  if (t.status === 'done') return { bg: 'var(--color-done-bg)', color: 'var(--color-done)', border: 'var(--color-done)' }
  const colors = { urgent: 'var(--color-urgent-bg)', high: 'var(--color-high-bg)', medium: 'var(--color-medium-bg)', low: 'var(--color-low-bg)' }
  const tcolors = { urgent: 'var(--color-urgent)', high: 'var(--color-high)', medium: 'var(--color-medium)', low: 'var(--color-low)' }
  return { bg: colors[t.priority] || 'var(--bg-surface)', color: tcolors[t.priority] || accent, border: tcolors[t.priority] || accent }
}

export default function Calendar() {
  const { state, store } = useStore()
  const { isLight } = useTheme()
  const [viewDate, setViewDate] = useState(() => { const now = new Date(); return { year: now.getFullYear(), month: now.getMonth(), date: now.getDate() } })
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [viewMode, setViewMode] = useState('month')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddData, setQuickAddData] = useState({ title: '', time: '10:00 AM', type: 'meeting' })
  const [draggedTask, setDraggedTask] = useState(null)

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
  const hasFreeSlotOnDay = (d) => getEventsForDay(d).length === 0 && getTasksForDay(d).length === 0
  const hasEmptyDay = grid.filter(d => d.current && hasFreeSlotOnDay(d)).length > 10

  const handleQuickAdd = () => {
    if (!quickAddData.title.trim() || !selectedDay) return
    const newEvent = { date: selectedDay.day, title: quickAddData.title, time: quickAddData.time, type: quickAddData.type }
    store.patchState({ events: [...events, { ...newEvent, color: 'var(--accent)' }] })
    store.addActivity({ icon: '📅', action: `Added event: ${quickAddData.title}` })
    setShowQuickAdd(false)
    setQuickAddData({ title: '', time: '10:00 AM', type: 'meeting' })
  }

  const handleDropOnDay = (dayNum) => {
    if (!draggedTask) return
    const dueDate = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    store.patchState({ tasks: tasks.map(t => t.id === draggedTask.id ? { ...t, dueDate } : t) })
    store.addActivity({ icon: '📅', action: `Set due date for "${draggedTask.title}" to ${dueDate}` })
    setDraggedTask(null)
  }

  const getConflicts = () => grid.filter(d => d.current && getEventsForDay(d).length >= 3).map(d => ({ day: d.day, count: getEventsForDay(d).length }))
  const conflicts = getConflicts()
  const upcomingEvents = events.filter(e => e.date >= viewDate.date).slice(0, 7)
  const overdueTasks = tasks.filter(t => { if (!t.dueDate || t.status === 'done') return false; return new Date(t.dueDate) < new Date() })
  const eventCounts = { total: events.length, meetings: events.filter(e => e.type === 'meeting').length, deadlines: events.filter(e => e.type === 'deadline').length, reviews: events.filter(e => e.type === 'review').length }

  const accent = isLight ? '#007AFF' : 'var(--accent)'
  const prevBtn = { background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-[15px] font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>CALENDAR</h1>
          <div className="flex" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-pill)', padding: '2px' }}>
            {['month','week','agenda'].map(vm => (
              <button key={vm} onClick={() => setViewMode(vm)}
                className="px-3 py-1.5 text-[10px] font-medium rounded-full transition-all"
                style={{ background: viewMode === vm ? accent : 'transparent', color: viewMode === vm ? (isLight ? '#fff' : 'var(--bg-app)') : 'var(--text-secondary)' }}>
                {vm.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasEmptyDay && viewMode === 'month' && (
            <button onClick={() => setShowQuickAdd(true)} className="px-3 py-1.5 text-[10px] rounded-lg"
              style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
              ⚡ {conflicts.length > 0 ? `${conflicts.length} conflicts` : 'Free slots'}
            </button>
          )}
          <button onClick={() => setViewDate(p => ({ ...p, month: p.month === 0 ? 11 : p.month - 1, year: p.month === 0 ? p.year - 1 : p.year }))}
            className="px-2 py-1 text-[12px] rounded-lg" style={prevBtn}>◀</button>
          <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{monthNames[viewDate.month]} {viewDate.year}</span>
          <button onClick={() => setViewDate(p => ({ ...p, month: p.month === 11 ? 0 : p.month + 1, year: p.month === 11 ? p.year + 1 : p.year }))}
            className="px-2 py-1 text-[12px] rounded-lg" style={prevBtn}>▶</button>
          <button onClick={() => { const n = new Date(); setViewDate({ year: n.getFullYear(), month: n.getMonth(), date: n.getDate() }) }}
            className="px-3 py-1.5 text-[10px] rounded-lg" style={{ background: `${accent}20`, color: accent }}>Today</button>
        </div>
      </div>

      {conflicts.length > 0 && viewMode === 'month' && (
        <div className="mb-3 p-2 rounded-lg flex items-center gap-2" style={{ background: 'var(--color-high-bg)', border: '1px solid var(--color-high)20' }}>
          <span className="text-[10px]">⚠️</span>
          <span className="text-[10px]" style={{ color: 'var(--color-high)' }}>AI detected {conflicts.length} day{conflicts.length > 1 ? 's' : ''} with 3+ events: {conflicts.slice(0, 3).map(c => `Day ${c.day}`).join(', ')}</span>
        </div>
      )}

      <div className="flex flex-1 gap-0 min-h-0 overflow-hidden">
        {viewMode === 'agenda' ? (
          <div className="flex-1 rounded-lg overflow-hidden flex flex-col" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-card)' }}>
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
              <h3 className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>AGENDA — {monthNames[viewDate.month]} {viewDate.year}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {overdueTasks.length > 0 && (
                <div>
                  <h4 className="text-[10px] mb-2" style={{ color: 'var(--color-urgent)' }}>🔥 OVERDUE TASKS</h4>
                  {overdueTasks.map(t => <div key={t.id} className="p-3 rounded-lg mb-2" style={{ background: 'var(--color-urgent-bg)', border: '1px solid var(--color-urgent)20' }}>
                    <span className="text-[11px]" style={{ color: 'var(--color-urgent)' }}>{t.title}</span>
                    <span className="text-[9px] ml-2" style={{ color: 'var(--color-urgent)' }}>{t.dueDate}</span>
                  </div>)}
                </div>
              )}
              <div>
                <h4 className="text-[10px] mb-2" style={{ color: accent }}>📅 UPCOMING EVENTS</h4>
                {upcomingEvents.map((ev, i) => (
                  <div key={i} onClick={() => setSelectedEvent(ev)} className="p-3 rounded-lg mb-2 cursor-pointer" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
                      <span className="text-[11px] flex-1" style={{ color: 'var(--text-primary)' }}>{ev.title}</span>
                      <span className="text-[10px]" style={{ color: accent }}>{ev.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : viewMode === 'week' ? (
          <div className="flex-1 rounded-lg overflow-hidden flex flex-col" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-card)' }}>
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
              <h3 className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>WEEK VIEW</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {grid.filter(d => d.current).slice(0, 7).map((d, idx) => (
                <div key={idx} className="p-2 rounded-lg mb-1" style={{ background: isToday(d) ? `${accent}10` : 'var(--bg-surface)' }}>
                  <div className="text-[10px] font-bold mb-1" style={{ color: isToday(d) ? accent : 'var(--text-secondary)' }}>
                    {dayNames[new Date(viewDate.year, viewDate.month, d.day).getDay()]} {d.day}
                  </div>
                  {getEventsForDay(d).map((ev, i) => (
                    <div key={i} className="px-1 py-0.5 rounded mb-0.5 text-[9px]" style={{ background: `${accent}20`, color: accent }}>{ev.time} {ev.title}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 rounded-lg overflow-hidden flex flex-col" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-card)' }}>
            <div className="grid grid-cols-7 text-[10px] py-2 border-b" style={{ borderColor: 'var(--border-default)', color: 'var(--text-tertiary)' }}>
              {dayNames.map(d => <div key={d} className="text-center" style={{ color: d === 'Sun' ? 'var(--color-urgent)' : 'var(--text-tertiary)' }}>{d}</div>)}
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
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = `${accent}08` }}
                    onDragLeave={e => { e.currentTarget.style.background = isTodayCell ? `${accent}10` : 'transparent' }}
                    onDrop={e => { e.stopPropagation(); if (draggedTask) handleDropOnDay(d.day) }}
                    className="p-1 cursor-pointer transition-all relative min-h-0"
                    style={{ background: isTodayCell ? `${accent}10` : 'transparent', border: '1px solid var(--border-soft)' }}>
                    <span className="text-[9px]" style={{ color: isTodayCell ? accent : d.current ? 'var(--text-secondary)' : 'var(--text-disabled)' }}>{d.day}</span>
                    {hasFreeSlot && d.current && <span className="absolute bottom-0.5 right-1 text-[6px]" style={{ color: 'var(--color-done)40' }}>+ available</span>}
                    {d.current && (
                      <div className="mt-0.5 space-y-0.5">
                        {dayTasks.slice(0, 2).map(t => {
                          const tc = getTaskColor(t, accent)
                          return (
                            <div key={t.id} draggable onDragStart={() => setDraggedTask(t)}
                              className="text-[7px] truncate px-1 py-0.5 rounded overflow-hidden cursor-grab"
                              style={{ background: tc.bg, color: tc.color }}>
                              {t.title}
                            </div>
                          )
                        })}
                        {dayEvents.slice(0, 1).map((ev, i) => (
                          <div key={`ev-${i}`} onClick={e => { e.stopPropagation(); setSelectedEvent(ev) }}
                            className="text-[7px] truncate px-1 py-0.5 rounded overflow-hidden cursor-pointer"
                            style={{ background: `${accent}20`, color: accent }}>
                            {ev.time} {ev.title}
                          </div>
                        ))}
                        {(dayTasks.length + dayEvents.length) > 3 && <div className="text-[7px] px-1" style={{ color: 'var(--text-disabled)' }}>+{dayTasks.length + dayEvents.length - 3} more</div>}
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
            <div className="rounded-lg overflow-hidden flex-1 flex flex-col" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: `2px solid ${accent}` }}>
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
                <h3 className="text-[12px] font-bold" style={{ color: accent }}>{selectedEvent.title}</h3>
                <button onClick={() => setSelectedEvent(null)} className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>✕</button>
              </div>
              <div className="p-4 space-y-3">
                <div className="text-[11px]" style={{ color: 'var(--text-primary)' }}>📅 {monthNames[viewDate.month]} {selectedEvent.date}</div>
                <div className="text-[11px]" style={{ color: accent }}>🕐 {selectedEvent.time}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Type: {selectedEvent.type || 'event'}</div>
              </div>
            </div>
          ) : selectedDay ? (
            <div className="rounded-lg overflow-hidden flex-1 flex flex-col" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-card)' }}>
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-default)' }}>
                <h3 className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{monthNames[viewDate.month]} {selectedDay.day}</h3>
                <button onClick={() => setSelectedDay(null)} className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {selectedDay.tasks.length === 0 && selectedDay.events.length === 0 && (
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Nothing scheduled</p>
                )}
                {selectedDay.tasks.map(t => {
                  const tc = getTaskColor(t, accent)
                  return (
                    <div key={t.id} className="p-2 rounded-lg cursor-grab" draggable onDragStart={() => setDraggedTask(t)}
                      style={{ background: tc.bg, borderLeft: `2px solid ${tc.border}` }}>
                      <span className="text-[10px]" style={{ color: tc.color }}>{t.title}</span>
                      <span className="text-[9px] ml-2" style={{ color: 'var(--text-secondary)' }}>{t.status}</span>
                    </div>
                  )
                })}
                {selectedDay.events.map((ev, i) => (
                  <div key={i} className="p-2 rounded-lg cursor-pointer" onClick={() => setSelectedEvent(ev)}
                    style={{ background: 'var(--bg-surface)', borderLeft: `2px solid ${accent}` }}>
                    <span className="text-[10px]" style={{ color: accent }}>{ev.time}</span>
                    <span className="text-[10px] ml-2" style={{ color: 'var(--text-primary)' }}>{ev.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : showQuickAdd ? (
            <div className="rounded-lg overflow-hidden flex-1 flex flex-col p-4" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-card)' }}>
              <h3 className="text-[12px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>⚡ QUICK ADD</h3>
              <input type="text" value={quickAddData.title} onChange={e => setQuickAddData({ ...quickAddData, title: e.target.value })}
                placeholder="Event title..." autoFocus
                className="w-full px-3 py-2 text-[11px] rounded-lg mb-3"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }} />
              <input type="text" value={quickAddData.time} onChange={e => setQuickAddData({ ...quickAddData, time: e.target.value })}
                placeholder="Time..." className="w-full px-3 py-2 text-[11px] rounded-lg mb-3"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none' }} />
              <select value={quickAddData.type} onChange={e => setQuickAddData({ ...quickAddData, type: e.target.value })}
                className="w-full px-3 py-2 text-[10px] rounded-lg mb-3"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                <option value="meeting" style={{ background: 'var(--bg-card)' }}>Meeting</option>
                <option value="deadline" style={{ background: 'var(--bg-card)' }}>Deadline</option>
                <option value="review" style={{ background: 'var(--bg-card)' }}>Review</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => setShowQuickAdd(false)} className="flex-1 py-2 text-[10px] rounded-lg" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>CANCEL</button>
                <button onClick={handleQuickAdd} className="flex-1 py-2 text-[10px] rounded-lg" style={{ background: accent, color: isLight ? '#fff' : 'var(--bg-app)' }}>ADD</button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden flex-1 flex flex-col" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-card)' }}>
              <div className="p-4 border-b" style={{ borderColor: 'var(--border-default)' }}>
                <h3 className="text-[11px] font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>UPCOMING EVENTS</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Next 7 days</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {upcomingEvents.map((ev, i) => (
                  <div key={i} onClick={() => setSelectedEvent(ev)} className="p-3 rounded-lg transition-all cursor-pointer" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: accent }} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>{ev.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px]" style={{ color: accent }}>{monthNames[viewDate.month].slice(0, 3)} {ev.date}</span>
                          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{ev.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {overdueTasks.length > 0 && (
                  <div className="mt-2 p-3 rounded-lg" style={{ background: 'var(--color-urgent-bg)', border: '1px solid var(--color-urgent)20' }}>
                    <h4 className="text-[10px] mb-2" style={{ color: 'var(--color-urgent)' }}>🔥 OVERDUE ({overdueTasks.length})</h4>
                    {overdueTasks.slice(0, 3).map(t => <div key={t.id} className="text-[10px] truncate" style={{ color: 'var(--color-urgent)' }}>{t.title}</div>)}
                  </div>
                )}
              </div>
              <div className="p-4 border-t space-y-1.5" style={{ borderColor: 'var(--border-default)' }}>
                <h4 className="text-[10px] mb-2" style={{ color: 'var(--text-secondary)' }}>THIS MONTH</h4>
                {Object.entries({ 'Total Events': eventCounts.total, Meetings: eventCounts.meetings, Deadlines: eventCounts.deadlines, Reviews: eventCounts.reviews }).map(([k,v]) => (
                  <div key={k} className="flex items-center justify-between"><span className="text-[11px]" style={{ color: 'var(--text-primary)' }}>{k}</span><span className="text-[11px]" style={{ color: accent }}>{v}</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
