import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../ThemeContext'
import { useStore } from '../StoreContext'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Clock, 
  Calendar as CalIcon, 
  MoreHorizontal, 
  CheckCircle2, 
  AlertCircle,
  Tag,
  MapPin
} from 'lucide-react';
import { checkCollision } from '../utils/validation';
import { TIME_OPTIONS, getAvailableTimes } from '../utils/constants';

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
  const grid = []
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(year, month, 1)
    d.setDate(d.getDate() - (i + 1))
    grid.push({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), current: false })
  }
  for (let i = 1; i <= daysInMonth; i++) grid.push({ day: i, month: month, year: year, current: true })
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
  if (t.status === 'done') return { bg: 'var(--color-done-bg)', color: 'var(--color-done)' }
  const colors = { urgent: 'var(--color-urgent-bg)', high: 'var(--color-high-bg)', medium: 'var(--color-medium-bg)', low: 'var(--color-low-bg)' }
  const tcolors = { urgent: 'var(--color-urgent)', high: 'var(--color-high)', medium: 'var(--color-medium)', low: 'var(--color-low)' }
  return { bg: colors[t.priority] || 'var(--bg-surface)', color: tcolors[t.priority] || accent }
}

export default function Calendar() {
  const { state, store } = useStore()
  const { isLight } = useTheme()
  const [viewDate, setViewDate] = useState(() => { const now = new Date(); return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() } })
  const [selectedDay, setSelectedDay] = useState(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddData, setQuickAddData] = useState({ title: '', time: '10:00am', type: 'meeting' })
  const [viewMode, setViewMode] = useState('month')
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
  const isPastDay = (d) => {
    const n = new Date();
    const current = new Date(n.getFullYear(), n.getMonth(), n.getDate());
    const target = new Date(d.year, d.month, d.day);
    return target < current;
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

  const handleDropOnDay = (d) => {
    if (!draggedTask) return
    const dueDate = `${d.year}-${String(d.month + 1).padStart(2,'0')}-${String(d.day).padStart(2,'0')}`
    store.patchState({ tasks: tasks.map(t => t.id === draggedTask.id ? { ...t, dueDate } : t) })
    store.addActivity({ icon: '📅', action: `Rescheduled "${draggedTask.title}" → ${dueDate}` })
    setDraggedTask(null)
    setDroppingOn(null)
  }

  const scrollCooldown = useRef(0)
  const handleWheel = (e) => {
    // Only allow month-scrolling logic in month view mode
    if (viewMode !== 'month') return

    const now = Date.now()
    if (now - scrollCooldown.current < 400) return
    if (Math.abs(e.deltaY) < 20) return

    scrollCooldown.current = now
    if (e.deltaY > 0) {
      const d = new Date(viewDate.year, viewDate.month + 1, 1)
      setViewDate({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() })
    } else {
      const d = new Date(viewDate.year, viewDate.month - 1, 1)
      setViewDate({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() })
    }
  }

  const handleQuickAdd = () => {
    if (!quickAddData.title) return
    const day = quickAddData.date || viewDate.day
    const date = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    const collision = checkCollision(tasks, events, date, quickAddData.time);
    if (collision) {
      alert(`Collision Detected: Already scheduled for ${collision.type} "${collision.title}"`);
      return;
    }

    const newEvent = {
      id: Date.now(),
      title: quickAddData.title,
      time: quickAddData.time,
      type: quickAddData.type,
      fullDate: `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
    
    const updatedEvents = [...(state.events || []), newEvent]
    store.patchState({ events: updatedEvents })
    store.addActivity({ icon: '📅', action: `Quick Add: ${quickAddData.title}` })
    setQuickAddData({ title: '', time: '10:00 AM', type: 'meeting' })
  }

  const accent = isLight ? '#007AFF' : 'var(--accent)'

  return (
    <div className="flex flex-col h-full fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4 px-2">
        <div className="flex items-center gap-8">
           <div className="flex flex-col">
              <h1 className="text-[24px] font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Calendar</h1>
              <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest leading-loose">Schedule Overview</span>
           </div>
          <div className="flex p-1 rounded-xl bg-surface/30 border border-default glass shadow-sm">
            {['month','week','agenda'].map(vm => (
              <button key={vm} onClick={() => setViewMode(vm)}
                className={`relative px-5 py-1.5 text-[10px] font-black rounded-lg transition-all z-10 ${viewMode === vm ? 'shadow-lg' : ''}`}
                style={{ 
                  color: viewMode === vm ? (isLight ? '#fff' : '#000') : 'var(--text-tertiary)',
                  background: viewMode === vm ? accent : 'transparent'
                }}>
                {vm.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface/30 rounded-[14px] border border-default overflow-hidden glass shadow-sm">
            <button onClick={() => {
                const d = viewMode === 'week' ? new Date(viewDate.year, viewDate.month, viewDate.day - 7) : new Date(viewDate.year, viewDate.month - 1, 1)
                setViewDate({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() })
              }} className="px-4 py-2.5 hover:bg-surface/50 text-secondary transition-colors text-xs active:scale-95">◀</button>
            <div className="px-6 py-2.5 text-[12px] font-black min-w-[160px] text-center border-x border-default/30 tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {monthNames[viewDate.month].toUpperCase()} {viewDate.year}
            </div>
            <button onClick={() => {
                const d = viewMode === 'week' ? new Date(viewDate.year, viewDate.month, viewDate.day + 7) : new Date(viewDate.year, viewDate.month + 1, 1)
                setViewDate({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() })
              }} className="px-4 py-2.5 hover:bg-surface/50 text-secondary transition-colors text-xs active:scale-95">▶</button>
          </div>
          <button 
            onClick={() => { const n = new Date(); setViewDate({ year: n.getFullYear(), month: n.getMonth(), day: n.getDate() }) }}
            className="px-6 py-2 text-[10px] font-black rounded border border-default hover:bg-surface/50 transition-all active:scale-95" 
            style={{ color: accent }}
          >
            TODAY
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 min-h-0 relative" onWheel={handleWheel}>
        <div className={`h-full w-full transition-all duration-300`}>
          {viewMode === 'month' ? (
            <div className="h-full flex flex-col bg-card rounded-none border border-default overflow-hidden">
              <div className="grid grid-cols-7 border-b border-default bg-surface/20">
                {dayNames.map(d => (
                  <div key={d} className="py-4 text-center text-[10px] font-bold tracking-[0.2em] text-tertiary uppercase">{d}</div>
                ))}
              </div>
              <div className="flex-1 grid grid-cols-7 grid-rows-6 relative">
                {grid.map((d, i) => {
                  const dayEvents = getEventsForDay(d)
                  const dayTasks = getTasksForDay(d)
                  const isTodayCell = isToday(d)
                  
                  return (
                    <div 
                      key={i} 
                      onDragOver={(e) => { e.preventDefault(); setDroppingOn(i); }}
                      onDragLeave={() => setDroppingOn(null)}
                      onDrop={(e) => {
                        const taskId = e.dataTransfer.getData('taskId');
                        if (taskId) handleDropOnDay(d);
                      }}
                      onClick={() => d.current && setSelectedDay({ ...d, events: dayEvents, tasks: dayTasks })}
                      className="p-1 border-r border-b border-default relative group cursor-pointer transition-all hover:bg-white/[0.03] min-h-[100px]"
                      style={{ 
                        background: isTodayCell ? `${accent}08` : (droppingOn === i ? 'rgba(255,255,255,0.05)' : 'transparent'),
                        boxShadow: droppingOn === i ? `inset 0 0 0 2px ${accent}40` : 'none'
                      }}>
                      <div className="flex justify-center p-1.5 items-center">
                        <span className={`text-[12px] font-semibold tabular-nums ${d.current ? 'text-primary' : 'text-disabled'}`}>
                          {d.day === 1 ? `${monthNames[d.month].slice(0, 3)} ${d.day}` : d.day}
                        </span>
                        {isTodayCell && (
                          <div className="ml-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] text-white shadow-lg" style={{ boxShadow: `0 0 10px ${accent}` }}>
                            {d.day}
                          </div>
                        )}
                        {isTodayCell && <style>{`.is-today-num { display: none; }`}</style>}
                      </div>
                      <div className="hidden">{isTodayCell && <span className="is-today-num">{d.day}</span>}</div>
                      <div className="space-y-0.5 px-1.5 pb-1 overflow-hidden">
                        {[...dayEvents, ...dayTasks].slice(0, 4).map((item, idx) => {
                          const isTask = !!item.priority
                          const tc = isTask ? getTaskColor(item, accent) : { color: accent }
                          return (
                            <div 
                              key={item.id || idx}
                              draggable
                              onDragStart={(e) => { setDraggedTask(item); e.dataTransfer.setData('taskId', item.id); }}
                              onDragEnd={() => { setDraggedTask(null); setDroppingOn(null); }}
                              className="flex items-center gap-1.5 text-[10px] font-medium transition-colors hover:bg-surface/50 rounded px-1 py-0.5 cursor-grab active:cursor-grabbing truncate"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              <span className="text-[8px] flex-shrink-0" style={{ color: tc.color }}>●</span>
                              {(item.time || item.dueTime) && <span className="opacity-40 flex-shrink-0 tabular-nums lowercase">{item.time || item.dueTime}</span>}
                              <span className="truncate">{item.title}</span>
                            </div>
                          )
                        })}
                        {[...dayEvents, ...dayTasks].length > 4 && (
                          <div className="text-[9px] font-black opacity-30 px-1 mt-1">
                            +{[...dayEvents, ...dayTasks].length - 4} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : viewMode === 'week' ? (
            <div className="h-full flex flex-col bg-card rounded-none border border-default overflow-hidden">
              <div className="flex border-b border-default bg-surface/20">
                <div className="w-16 border-r border-default flex items-center justify-center text-[10px] font-bold text-tertiary tracking-widest">TIME</div>
                <div className="flex-1 grid grid-cols-7">
                  {weekGrid.map((d, i) => (
                    <div key={i} className="py-4 text-center flex flex-col items-center gap-1 border-r border-default last:border-r-0">
                      <span className="text-[10px] font-bold text-tertiary uppercase tracking-tight">{dayNames[i]}</span>
                      <span className={`w-9 h-9 flex items-center justify-center rounded-xl text-[14px] font-bold transition-all ${isToday(d) ? 'bg-accent text-white shadow-lg shadow-accent/40 scale-110' : 'text-primary'}`}>
                        {d.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                <div className="flex min-h-full">
                  <div className="w-16 border-r border-default bg-surface/5">
                    {HOURS.map(h => (
                      <div key={h} className="h-[70px] text-[10px] text-center pt-2 text-tertiary font-medium border-b border-default/30">
                        {formatHour(h)}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 grid grid-cols-7 relative">
                    {HOURS.map(h => (
                      <div key={h} className="absolute w-full border-b pointer-events-none" style={{ top: h * 70, borderColor: 'var(--border-soft)' }} />
                    ))}
                    {weekGrid.map((d, i) => (
                      <div key={i} 
                         onDragOver={(e) => { e.preventDefault(); setDroppingOn(i); }}
                         onDragLeave={() => setDroppingOn(null)}
                         onDrop={(e) => {
                            const taskId = e.dataTransfer.getData('taskId');
                            if (taskId) handleDropOnDay(d);
                         }}
                         className="h-full border-r border-slate-100 last:border-r-0 relative min-h-[1680px]"
                      >
                        {isToday(d) && <div className="absolute inset-0 bg-blue-50/10 pointer-events-none" />}
                        
                        {/* Render Events */}
                        {getEventsForDay(d).map(event => {
                          const offset = timeToOffset(event.time) || 0;
                          return (
                            <div
                              key={event.id}
                              className="absolute left-1 right-1 rounded-lg p-2 text-[10px] font-bold overflow-hidden border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md z-10"
                              style={{
                                top: (offset * 70) + 2,
                                height: '60px',
                                borderLeftColor: event.color || '#3b82f6',
                                borderLeftWidth: '4px',
                                color: '#1e293b'
                              }}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <Clock size={10} className="text-slate-400" />
                                <span>{event.time}</span>
                              </div>
                              <div className="truncate">{event.title}</div>
                            </div>
                          );
                        })}

                        {/* Render Tasks */}
                        {getTasksForDay(d).map((task, idx) => {
                          const offset = timeToOffset(task.dueTime) || 0;
                          return (
                            <div
                              key={task.id}
                              className="absolute left-1 right-1 rounded-lg p-2 text-[10px] font-bold overflow-hidden border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md z-10"
                              style={{
                                top: task.dueTime ? (offset * 70) + 2 : (10 + idx * 35),
                                height: task.dueTime ? '60px' : '30px',
                                borderLeftColor: task.color || '#10b981',
                                borderLeftWidth: '4px',
                                color: '#1e293b'
                              }}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <Clock size={10} className="text-slate-400" />
                                <span>{task.dueTime || 'No Time'}</span>
                              </div>
                              <div className="truncate">{task.title}</div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col bg-card rounded-none border border-default overflow-hidden shadow-none">
              <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
                <section>
                  <h3 className="text-[10px] font-bold text-accent tracking-[0.2em] uppercase mb-4">Agenda View</h3>
                  {/* Agenda content simplified for performance */}
                  <p className="text-secondary text-sm">Select month or week for full scheduling.</p>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- SaaS LEVEL MODAL: DAY DETAIL (Image 1 Style) --- */}
      {selectedDay && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={() => setSelectedDay(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-400 overflow-hidden text-slate-900">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center shadow-sm">
                  <CalIcon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {monthNames[viewDate.month]} {selectedDay.day}, {viewDate.year}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium tracking-tight">Daily Schedule Overview</p>
                </div>
              </div>
              <button onClick={() => setSelectedDay(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-8 min-h-[300px] flex flex-col items-center justify-center bg-white">
              {[...selectedDay.events, ...selectedDay.tasks].length > 0 ? (
                <div className="w-full space-y-4">
                  {selectedDay.events.map(event => (
                    <div key={event.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-2 h-10 rounded-full bg-blue-500" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                        <p className="text-xs text-slate-500">{event.time || 'All Day'}</p>
                      </div>
                    </div>
                  ))}
                  {selectedDay.tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-2 h-10 rounded-full bg-emerald-500" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                        <p className="text-xs text-slate-500">Task • {task.dueTime || 'No Time'} • {task.priority}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto border border-slate-100 shadow-sm">
                    <CalIcon size={32} className="text-slate-300" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">No activities planned</h4>
                    <p className="text-sm text-slate-500 max-w-[240px] mx-auto leading-relaxed">
                      This day is currently clear. Enjoy your time or add something new.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-50 flex gap-4 bg-white">
              {!isPastDay(selectedDay) && (
                <button 
                  onClick={() => {
                    setQuickAddData(prev => ({ ...prev, date: selectedDay.day }));
                    setShowQuickAdd(true);
                    setSelectedDay(null);
                  }}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Create Entry
                </button>
              )}
              <button 
                onClick={() => setSelectedDay(null)}
                className={`flex-1 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all ${isPastDay(selectedDay) ? 'w-full' : ''}`}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SaaS LEVEL MODAL: QUICK ADD (Image 4 Style) --- */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" onClick={() => setShowQuickAdd(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
            
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white text-slate-900">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                  <Plus size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">New Schedule Entry</h3>
              </div>
              <button onClick={() => setShowQuickAdd(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6 text-slate-900">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Event Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Q2 Planning Session"
                  value={quickAddData.title}
                  onChange={e => setQuickAddData({...quickAddData, title: e.target.value})}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Time</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      value={quickAddData.time}
                      onChange={e => setQuickAddData({...quickAddData, time: e.target.value})}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-black text-slate-900 appearance-none cursor-pointer"
                    >
                      {getAvailableTimes(`${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(quickAddData.date || viewDate.day).padStart(2, '0')}`).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select 
                      value={quickAddData.type}
                      onChange={e => setQuickAddData({...quickAddData, type: e.target.value})}
                      className="w-full pl-12 pr-8 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 appearance-none cursor-pointer"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="review">Review</option>
                      <option value="personal">Personal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-100 flex items-start gap-4">
                <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[12px] text-blue-600 font-medium leading-relaxed">
                  This event will be shared with the team leads and added to the collaborative workspace.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-white">
              <button 
                onClick={() => setShowQuickAdd(false)}
                className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors ml-4"
              >
                Cancel
              </button>
              <button 
                onClick={() => { handleQuickAdd(); setShowQuickAdd(false); }}
                className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95 transition-all outline-none"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
