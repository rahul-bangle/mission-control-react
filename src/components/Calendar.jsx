import { useState, useRef } from 'react'
import { useTheme } from '../ThemeContext'
import { useStore } from '../StoreContext'

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

function formatHour(h) {
  if (h === 0) return '12 AM'
  if (h === 12) return '12 PM'
  return h > 12 ? `${h - 12} PM` : `${h} AM`
}

function timeToOffset(timeStr) {
  if (!timeStr) return null
  const m = timeStr.match(/(\d+):?(\d+)?\s*(AM|PM)/i)
  if (!m) return null
  let h = parseInt(m[1])
  const mins = parseInt(m[2] || '0')
  const p = m[3].toUpperCase()
  if (p === 'PM' && h !== 12) h += 12
  if (p === 'AM' && h === 12) h = 0
  return h + mins / 60
}

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate() }
function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = getDaysInMonth(year, month)
  const prevMonthDays = new Date(year, month, 0).getDate()
  const grid = []
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(year, month, 1)
    d.setDate(d.getDate() - (i + 1))
    grid.push({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), current: false })
  }
  for (let i = 1; i <= daysInMonth; i++) grid.push({ day: i, month, year, current: true })
  const remaining = 42 - grid.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    grid.push({ day: i, month: d.getMonth(), year: d.getFullYear(), current: false })
  }
  return grid
}

function getWeekGrid(year, month, day) {
  const target = new Date(year, month, day)
  const dayOfWeek = target.getDay()
  const diff = target.getDate() - dayOfWeek
  const start = new Date(target.setDate(diff))
  const grid = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    grid.push({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), current: true })
  }
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
  const [viewDate, setViewDate] = useState(() => { const now = new Date(); return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() } })
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [viewMode, setViewMode] = useState('month')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddData, setQuickAddData] = useState({ title: '', time: '10:00 AM', type: 'meeting' })
  const [draggedTask, setDraggedTask] = useState(null)
  const [droppingOn, setDroppingOn] = useState(null)

  const grid = getMonthGrid(viewDate.year, viewDate.month)
  const weekGrid = getWeekGrid(viewDate.year, viewDate.month, viewDate.day)
  const events = state.events || []
  const tasks = state.tasks || []
  const today = new Date()

  const isToday = (d) => {
    const n = new Date();
    return d.day === n.getDate() && d.month === n.getMonth() && d.year === n.getFullYear()
  }

  const getEventsForDay = (d) => {
    return events.filter(e => {
      if (e.fullDate) return e.fullDate === `${d.year}-${String(d.month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
      return e.date === d.day && (d.month === viewDate.month || viewMode === 'week')
    })
  }

  const getTasksForDay = (d) => {
    return tasks.filter(t => {
      if (!t.dueDate) return false;
      const dd = new Date(t.dueDate);
      return dd.getDate() === d.day && dd.getMonth() === d.month && dd.getFullYear() === d.year
    })
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

  const handleDropOnDay = (d) => {
    if (!draggedTask) return
    const dueDate = `${d.year}-${String(d.month + 1).padStart(2,'0')}-${String(d.day).padStart(2,'0')}`
    store.patchState({ tasks: tasks.map(t => t.id === draggedTask.id ? { ...t, dueDate } : t) })
    store.addActivity({ icon: '📅', action: `Rescheduled "${draggedTask.title}" → ${dueDate}` })
    setDraggedTask(null)
    setDroppingOn(null)
  }

  const getConflicts = () => grid.filter(d => d.current && getEventsForDay(d).length >= 3).map(d => ({ day: d.day, count: getEventsForDay(d).length }))
  const conflicts = getConflicts()
  const upcomingEvents = events.filter(e => {
    const evDate = new Date(viewDate.year, viewDate.month, e.date)
    return evDate >= new Date(today.getFullYear(), today.getMonth(), today.getDate())
  }).slice(0, 7)

  const overdueTasks = tasks.filter(t => { if (!t.dueDate || t.status === 'done') return false; return new Date(t.dueDate) < new Date() })
  const eventCounts = { total: events.length, meetings: events.filter(e => e.type === 'meeting').length, deadlines: events.filter(e => e.type === 'deadline').length, reviews: events.filter(e => e.type === 'review').length }

  const accent = isLight ? '#007AFF' : 'var(--accent)'
  const prevBtn = { background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }
  const rowHeight = 60

  return (
    <div className="flex flex-col h-full overflow-hidden">


      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 shrink-0 gap-4 p-1">
        <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
          <h1 className="text-[16px] font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>CALENDAR</h1>
          <div className="flex" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-pill)', padding: '2px' }}>
            {['month','week','agenda'].map(vm => (
              <button key={vm} onClick={() => setViewMode(vm)}
                className="px-3 py-1.5 text-[10px] font-medium rounded-full transition-all"
                style={{ background: viewMode === vm ? accent : 'transparent', color: viewMode === vm ? (isLight ? '#fff' : 'var(--bg-app)') : 'var(--text-secondary)' }}>
                {vm === 'agenda' ? 'AG' : vm.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1">
            <button onClick={() => {
                if (viewMode === 'week') {
                  const d = new Date(viewDate.year, viewDate.month, viewDate.day - 7)
                  setViewDate({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() })
                } else {
                  setViewDate(p => ({ ...p, month: p.month === 0 ? 11 : p.month - 1, year: p.month === 0 ? p.year - 1 : p.year }))
                }
              }}
              className="px-2 py-1 text-[12px] rounded-lg" style={prevBtn}>◀</button>
            <span className="text-[12px] md:text-[13px] font-bold min-w-[100px] md:min-w-[120px] text-center" style={{ color: 'var(--text-primary)' }}>
              {monthNames[viewDate.month]} {viewDate.year}
            </span>
            <button onClick={() => {
                if (viewMode === 'week') {
                  const d = new Date(viewDate.year, viewDate.month, viewDate.day + 7)
                  setViewDate({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() })
                } else {
                  setViewDate(p => ({ ...p, month: p.month === 11 ? 0 : p.month + 1, year: p.month === 11 ? p.year + 1 : p.year }))
                }
              }}
              className="px-2 py-1 text-[12px] rounded-lg" style={prevBtn}>▶</button>
          </div>
          <button onClick={() => { const n = new Date(); setViewDate({ year: n.getFullYear(), month: n.getMonth(), day: n.getDate() }) }}
            className="px-3 py-1.5 text-[10px] rounded-lg font-bold" style={{ background: `${accent}20`, color: accent }}>Today</button>
        </div>
      </div>


      <div className="flex flex-1 gap-4 min-h-0 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          {viewMode === 'agenda' ? (
            <div className="flex-1 rounded-lg overflow-hidden flex flex-col" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-card)' }}>
              <div className="p-4 border-b shrink-0" style={{ borderColor: 'var(--border-default)' }}>
                <h3 className="text-[12px] font-bold text-primary">AGENDA — {monthNames[viewDate.month]} {viewDate.year}</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {overdueTasks.length > 0 && (
                  <div>
                    <h4 className="text-[10px] mb-2 font-bold" style={{ color: 'var(--color-urgent)' }}>🔥 OVERDUE TASKS</h4>
                    {overdueTasks.map(t => <div key={t.id} className="p-3 rounded-lg mb-2" style={{ background: 'var(--color-urgent-bg)', border: '1px solid var(--color-urgent)20' }}>
                      <span className="text-[11px] font-medium" style={{ color: 'var(--color-urgent)' }}>{t.title}</span>
                      <span className="text-[9px] ml-2 opacity-70" style={{ color: 'var(--color-urgent)' }}>{t.dueDate}</span>
                    </div>)}
                  </div>
                )}
                <div>
                  <h4 className="text-[10px] mb-2 font-bold" style={{ color: accent }}>📅 UPCOMING EVENTS</h4>
                  {upcomingEvents.map((ev, i) => (
                    <div key={i} onClick={() => setSelectedEvent(ev)} className="p-3 rounded-lg mb-2 cursor-pointer transition-colors hover:bg-surface" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
                        <span className="text-[11px] flex-1 font-medium text-primary">{ev.title}</span>
                        <span className="text-[10px] text-accent">{ev.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : viewMode === 'week' ? (
            <div className="flex-1 rounded-lg overflow-hidden flex flex-col border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
              {/* Day Headers */}
              <div className="flex shrink-0 border-b" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-column-header)' }}>
                <div className="w-10 md:w-16 shrink-0 flex items-center justify-center border-r text-[7px] md:text-[8px] font-bold" style={{ borderColor: 'var(--border-default)', color: 'var(--text-tertiary)' }}>
                  GMT+5:30
                </div>
                <div className="flex-1 flex md:grid md:grid-cols-7 overflow-x-auto snap-x snap-mandatory no-scrollbar" id="calendar-header-scroll">
                  {weekGrid.map((d, i) => {
                    const isTodayCell = isToday(d)
                    return (
                      <div key={i} className="py-2 flex flex-col items-center gap-1 border-r last:border-r-0 snap-center min-w-full md:min-w-0" style={{ borderColor: 'var(--border-soft)' }}>
                        <span className="text-[9px] uppercase tracking-widest font-bold opacity-60" style={{ color: isTodayCell ? accent : 'var(--text-tertiary)' }}>{dayNames[i]}</span>
                        <span className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full text-[12px] md:text-[13px] font-bold transition-all`}
                          style={isTodayCell ? { background: accent, color: '#fff' } : { color: 'var(--text-primary)' }}>
                          {d.day}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Grid Body */}
              <div className="flex-1 overflow-y-auto flex relative custom-scrollbar">
                {/* Hours Sidebar */}
                <div className="w-10 md:w-16 shrink-0 border-r" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-card)' }}>
                  {HOURS.map(h => (
                    <div key={h} className="text-[8px] md:text-[9px] text-right pr-2 md:pr-3 font-medium uppercase" style={{ height: `${rowHeight}px`, color: 'var(--text-tertiary)', paddingTop: '4px' }}>
                      {formatHour(h)}
                    </div>
                  ))}
                </div>

                {/* Grid Content */}
                <div className="flex-1 relative" style={{ minHeight: `${24 * rowHeight}px` }}>
                    {/* Grid Lines */}
                    <div className="absolute inset-0 pointer-events-none">
                      {HOURS.map(h => (
                        <div key={h} className="border-b" style={{ height: `${rowHeight}px`, borderColor: 'var(--border-soft)', opacity: 0.6 }}></div>
                      ))}
                    </div>
                    
                    {/* Vertical Lines (Desktop only or for swipe sync) */}
                    <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-7 pointer-events-none">
                      {weekGrid.map((_, i) => (
                        <div key={i} className="h-full border-r last:border-r-0 hidden md:block" style={{ borderColor: 'var(--border-soft)', opacity: 0.6 }}></div>
                      ))}
                    </div>

                  {/* Now Indicator */}
                  {isToday({ day: today.getDate(), month: today.getMonth(), year: today.getFullYear() }) && (
                    <div className="absolute left-0 right-0 z-40 flex items-center pointer-events-none"
                      style={{ top: `${(today.getHours() + today.getMinutes()/60) * rowHeight}px` }}>
                      <div className="w-2 h-2 rounded-full bg-urgent -translate-x-1"></div>
                      <div className="flex-1 h-[1px] bg-urgent opacity-40"></div>
                    </div>
                  )}

                  {/* Day Columns for Items */}
                  <div className="absolute inset-0 flex md:grid md:grid-cols-7 h-full overflow-x-auto snap-x snap-mandatory no-scrollbar md:overflow-visible"
                       onScroll={(e) => {
                         const header = document.getElementById('calendar-header-scroll');
                         if (header) header.scrollLeft = e.target.scrollLeft;
                       }}>
                    {weekGrid.map((d, i) => {
                      const dayEvents = getEventsForDay(d)
                      const dayTasks = getTasksForDay(d)
                      const isTodayCell = isToday(d)

                      return (
                        <div key={i} className="relative h-full min-w-full md:min-w-0 snap-center"
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => { e.stopPropagation(); if (draggedTask) handleDropOnDay(d.day) }}>

                          
                          {isTodayCell && <div className="absolute inset-0 z-0 bg-accent opacity-[0.06]"></div>}

                          {[...dayEvents, ...dayTasks].map((item, idx) => {
                            const offset = timeToOffset(item.time || '9:00 AM')
                            if (offset === null) return null

                            const isTask = !!item.priority
                            const tc = isTask ? getTaskColor(item, accent) : { bg: `${accent}15`, color: accent, border: accent }
                            
                            return (
                              <div key={item.id || idx}
                                onClick={e => { e.stopPropagation(); isTask ? null : setSelectedEvent(item) }}
                                className="absolute left-1 right-1 p-2 rounded-lg border text-[10px] shadow-sm transition-all hover:z-50 hover:scale-[1.02] cursor-pointer"
                                style={{
                                  top: `${offset * rowHeight + 2}px`,
                                  minHeight: `${Math.max(rowHeight - 4, 30)}px`,
                                  background: tc.bg,
                                  color: tc.color,
                                  borderColor: `${isTask ? tc.border : accent}30`,
                                  borderLeftWidth: '4px',
                                  zIndex: 20
                                }}>
                                <div className="font-bold truncate leading-tight">{item.title}</div>
                                <div className="opacity-70 text-[8px] mt-0.5">{item.time || (isTask ? 'Task' : '')}</div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 rounded-lg overflow-hidden flex flex-col border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)', boxShadow: 'var(--shadow-card)' }}>
              <div className="grid grid-cols-7 text-[10px] py-2 border-b font-bold uppercase tracking-widest" style={{ borderColor: 'var(--border-default)', color: 'var(--text-tertiary)', background: 'var(--bg-column-header)' }}>
                {dayNames.map(d => <div key={d} className="text-center" style={{ color: d === 'Sun' ? 'var(--color-urgent)' : 'inherit' }}>{d}</div>)}
              </div>
              <div className="flex-1 grid grid-cols-7 grid-rows-6">
                {grid.map((d, i) => {
                  const dayEvents = getEventsForDay(d)
                  const dayTasks = getTasksForDay(d)
                  const isTodayCell = isToday(d)
                  const hasFreeSlot = hasFreeSlotOnDay(d)
                  return (
                    <div key={i}
                      onClick={() => d.current && setSelectedDay({ ...d, events: dayEvents, tasks: dayTasks })}
                      onDragOver={e => { e.preventDefault(); setDroppingOn(i) }}
                      onDragLeave={() => setDroppingOn(null)}
                      onDrop={e => { e.stopPropagation(); if (draggedTask && d.current) handleDropOnDay(d) }}
                      className="p-1 cursor-pointer transition-colors border-r border-b relative group"
                      style={{
                        background: droppingOn === i && d.current
                          ? `${accent}18`
                          : isTodayCell ? `${accent}08` : 'transparent',
                        borderColor: 'var(--border-soft)',
                        boxShadow: droppingOn === i && d.current ? `inset 0 0 0 2px ${accent}60` : 'none',
                        transition: 'all 0.15s ease',
                      }}>
                      <div className="flex justify-between p-1">
                        <span className={`text-[10px] font-medium ${d.current ? 'text-primary' : 'text-disabled'}`}>{d.day}</span>
                        {isTodayCell && <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>}
                      </div>
                      <div className="space-y-0.5 px-0.5">
                        {dayTasks.slice(0, 2).map(t => (
                          <div
                            key={t.id}
                            draggable
                            onDragStart={e => { e.stopPropagation(); setDraggedTask(t) }}
                            onDragEnd={() => setDroppingOn(null)}
                            className="text-[8px] truncate px-1 py-0.5 rounded-md cursor-grab active:cursor-grabbing select-none"
                            style={{
                              background: getTaskColor(t, accent).bg,
                              color: getTaskColor(t, accent).color,
                              opacity: draggedTask?.id === t.id ? 0.4 : 1,
                              transition: 'opacity 0.15s',
                            }}
                          >
                            {t.title}
                          </div>
                        ))}
                        {dayEvents.slice(0, 1).map((ev, i) => (
                          <div key={i} className="text-[8px] truncate px-1 py-0.5 rounded-md" style={{ background: `${accent}15`, color: accent }}>
                            {ev.time} {ev.title}
                          </div>
                        ))}
                        {(dayTasks.length + dayEvents.length) > 3 && <div className="text-[8px] opacity-50 px-1">+{dayTasks.length + dayEvents.length - 3} more</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Overlay for Mobile */}
        <div className={`
          fixed inset-0 z-[70] md:relative md:z-10 md:inset-auto md:w-80 md:flex md:flex-col md:gap-4 md:translate-y-0 transition-all duration-300
          ${(selectedEvent || selectedDay) ? 'flex pointer-events-auto' : 'hidden md:flex pointer-events-none md:pointer-events-auto'}
        `}>
          {/* Mobile Backdrop */}
          <div className="absolute inset-0 bg-black/60 md:hidden backdrop-blur-sm" onClick={() => { setSelectedDay(null); setSelectedEvent(null); }}></div>
          
          <div className="relative mt-auto md:mt-0 w-full h-[70vh] md:h-full shrink-0 flex flex-col gap-4 p-4 md:p-0">

          {selectedEvent ? (
            <div className="rounded-xl p-5 border-2 flex flex-col gap-3" style={{ background: 'var(--bg-card)', borderColor: accent, boxShadow: `0 8px 30px ${accent}20` }}>
              <div className="flex justify-between items-start">
                <h3 className="text-[16px] font-bold text-primary">{selectedEvent.title}</h3>
                <button onClick={() => setSelectedEvent(null)} className="p-1 hover:bg-surface rounded-full transition-colors">✕</button>
              </div>
              <div className="space-y-4 mt-2">
                <div className="flex items-center gap-3 text-[13px]">
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface">📅</span>
                  <div className="flex flex-col">
                    <span className="text-secondary text-[11px] uppercase font-bold tracking-wider">Date</span>
                    <span className="text-primary">{monthNames[viewDate.month]} {selectedEvent.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[13px]">
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface">🕐</span>
                  <div className="flex flex-col">
                    <span className="text-secondary text-[11px] uppercase font-bold tracking-wider">Time</span>
                    <span className="text-accent font-bold">{selectedEvent.time}</span>
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-xl text-[12px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98]" 
                  style={{ background: accent, color: '#fff' }}>EDIT EVENT</button>
              </div>
            </div>
          ) : selectedDay ? (
            <div className="rounded-xl flex-1 flex flex-col border shadow-xl bg-card overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between bg-surface/50">
                <h3 className="text-[13px] font-bold text-primary">{monthNames[viewDate.month]} {selectedDay.day}, {viewDate.year}</h3>
                <button onClick={() => setSelectedDay(null)} className="text-secondary hover:text-primary transition-colors">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {selectedDay.tasks.length === 0 && selectedDay.events.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 opacity-40">
                    <span className="text-4xl mb-2">🏖️</span>
                    <p className="text-[11px]">Nothing scheduled today</p>
                  </div>
                )}
                {selectedDay.tasks.map(t => {
                  const tc = getTaskColor(t, accent)
                  return (
                    <div key={t.id} className="p-3 rounded-xl border-l-4 transition-transform hover:translate-x-1" style={{ background: tc.bg, borderColor: tc.border }}>
                      <div className="text-[12px] font-bold" style={{ color: tc.color }}>{t.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase" style={{ background: `${tc.border}30`, color: tc.color }}>{t.priority}</span>
                        <span className="text-[10px] opacity-60 text-primary">{t.status}</span>
                      </div>
                    </div>
                  )
                })}
                {selectedDay.events.map((ev, i) => (
                  <div key={i} className="p-3 rounded-xl bg-surface border border-transparent hover:border-accent/40 transition-all cursor-pointer" onClick={() => setSelectedEvent(ev)}>
                    <div className="text-accent font-bold text-[11px] mb-1">{ev.time}</div>
                    <div className="text-primary text-[12px] font-medium">{ev.title}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowQuickAdd(true)} className="m-4 py-3 rounded-xl border border-dashed border-accent/40 text-accent text-[11px] font-bold hover:bg-accent/5 transition-colors">+ ADD EVENT</button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
               {/* Quick Stats */}
              <div className="p-4 rounded-xl border bg-card space-y-3">
                <h4 className="text-[10px] font-bold text-secondary uppercase tracking-widest">Snapshot</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-surface">
                    <div className="text-[18px] font-bold text-accent">{eventCounts.meetings}</div>
                    <div className="text-[9px] text-secondary font-medium">Meetings</div>
                  </div>
                  <div className="p-3 rounded-xl bg-surface">
                    <div className="text-[18px] font-bold text-urgent">{overdueTasks.length}</div>
                    <div className="text-[9px] text-secondary font-medium">Overdue</div>
                  </div>
                </div>
              </div>

               {/* Recent/Next Events */}
              <div className="flex-1 rounded-xl border bg-card flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-surface/30">
                  <h3 className="text-[11px] font-bold tracking-widest text-primary uppercase">Upcoming</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                  {upcomingEvents.map((ev, i) => (
                    <div key={i} onClick={() => setSelectedEvent(ev)} className="p-3 rounded-xl border bg-surface/50 hover:bg-surface transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold text-accent">{ev.time}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-accent group-hover:scale-125 transition-transform"></div>
                      </div>
                      <h4 className="text-[12px] font-medium text-primary truncate">{ev.title}</h4>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>


      {showQuickAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-2xl border shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
             <div className="flex justify-between items-center">
              <h3 className="text-[18px] font-bold text-primary">⚡ Quick Add</h3>
              <button onClick={() => setShowQuickAdd(false)} className="text-secondary">✕</button>
             </div>
             <div className="space-y-3">
               <div className="space-y-1">
                 <label className="text-[10px] font-bold text-secondary uppercase px-1">Title</label>
                 <input type="text" value={quickAddData.title} onChange={e => setQuickAddData({ ...quickAddData, title: e.target.value })}
                  placeholder="Review meeting..." autoFocus className="w-full px-4 py-3 bg-surface border rounded-xl text-[13px] text-primary focus:border-accent outline-none transition-all" />
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-secondary uppercase px-1">Time</label>
                    <input type="text" value={quickAddData.time} onChange={e => setQuickAddData({ ...quickAddData, time: e.target.value })}
                    placeholder="10:00 AM" className="w-full px-4 py-3 bg-surface border rounded-xl text-[13px] text-primary focus:border-accent outline-none" />
                 </div>
                 <div className="space-y-1">
                  <label className="text-[10px] font-bold text-secondary uppercase px-1">Type</label>
                  <select value={quickAddData.type} onChange={e => setQuickAddData({ ...quickAddData, type: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border rounded-xl text-[13px] text-primary focus:border-accent outline-none">
                    <option value="meeting">Meeting</option>
                    <option value="deadline">Deadline</option>
                    <option value="review">Review</option>
                  </select>
                 </div>
               </div>
             </div>
             <div className="flex gap-3 pt-2">
               <button onClick={() => setShowQuickAdd(false)} className="flex-1 py-3 text-[12px] font-bold rounded-xl bg-surface text-secondary hover:text-primary transition-all">CANCEL</button>
               <button onClick={handleQuickAdd} className="flex-1 py-3 text-[12px] font-bold rounded-xl bg-accent text-white hover:opacity-90 shadow-lg shadow-accent/20 transition-all">CREATE EVENT</button>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}

