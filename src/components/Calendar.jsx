import { useState, useRef, useEffect } from 'react'
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
  const [quickAddData, setQuickAddData] = useState({ title: '', time: '10:00 AM', type: 'meeting' })
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

  const accent = isLight ? '#007AFF' : 'var(--accent)'

  return (
    <div className="flex flex-col h-full fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 px-2">
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
            className="px-6 py-2.5 text-[11px] font-black rounded-[14px] border border-default hover:bg-surface/50 transition-all glass shadow-sm active:scale-95" 
            style={{ color: accent }}
          >
            TODAY
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 min-h-0 relative">
        <div className={`h-full w-full transition-all duration-300`}>
          {viewMode === 'month' ? (
            <div className="h-full flex flex-col bg-card rounded-[24px] border border-card overflow-hidden shadow-2xl glass">
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
                      className="p-1 border-r border-b border-default relative group cursor-pointer transition-all hover:bg-white/[0.03]"
                      style={{ 
                        background: isTodayCell ? `${accent}08` : (droppingOn === i ? 'rgba(255,255,255,0.05)' : 'transparent'),
                        boxShadow: droppingOn === i ? `inset 0 0 0 2px ${accent}40` : 'none'
                      }}>
                      <div className="flex justify-between p-1.5 items-start">
                        <span className={`text-[12px] font-semibold tabular-nums ${d.current ? 'text-primary' : 'text-disabled'}`}>{d.day}</span>
                        {isTodayCell && (
                          <div className="w-1.5 h-1.5 rounded-full bg-accent" style={{ boxShadow: `0 0 10px ${accent}` }} />
                        )}
                      </div>
                      <div className="space-y-1.5 px-1 pb-1 overflow-hidden">
                        {dayTasks.slice(0, 3).map(t => (
                          <div 
                            key={t.id}
                            draggable
                            onDragStart={(e) => { setDraggedTask(t); e.dataTransfer.setData('taskId', t.id); }}
                            onDragEnd={() => { setDraggedTask(null); setDroppingOn(null); }}
                            className="px-2 py-1 rounded-lg text-[9px] font-bold truncate border shadow-sm cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.02]"
                            style={{ 
                              background: getTaskColor(t, accent).bg, 
                              color: getTaskColor(t, accent).color, 
                              borderColor: `${getTaskColor(t, accent).color}40`,
                            }}
                          >
                            {t.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : viewMode === 'week' ? (
            <div className="h-full flex flex-col bg-card rounded-[24px] border border-card overflow-hidden shadow-2xl glass">
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
                         className="h-full border-r border-default last:border-r-0 relative"
                      >
                        {isToday(d) && <div className="absolute inset-0 bg-accent/[0.03] pointer-events-none" />}
                        {[...getEventsForDay(d), ...getTasksForDay(d)].map((item, idx) => {
                          const offset = timeToOffset(item.time || '9:00 AM') || 9
                          const isTask = !!item.priority
                          const tc = isTask ? getTaskColor(item, accent) : { bg: `${accent}15`, color: accent }
                          return (
                            <div 
                              key={item.id || idx}
                              draggable
                              onDragStart={(e) => { setDraggedTask(item); e.dataTransfer.setData('taskId', item.id); }}
                              onDragEnd={() => { setDraggedTask(null); setDroppingOn(null); }}
                              className="absolute left-1.5 right-1.5 p-3 rounded-2xl border shadow-xl z-10 cursor-grab active:cursor-grabbing overflow-hidden group glass transition-transform hover:scale-[1.02]"
                              style={{ 
                                top: offset * 70 + 4, 
                                height: 62, 
                                background: tc.bg, 
                                color: tc.color, 
                                borderColor: `${tc.color}40`, 
                                borderLeftWidth: 4 
                              }}
                            >
                              <div className="text-[11px] font-bold truncate leading-tight">{item.title}</div>
                              <div className="text-[9px] font-medium opacity-60 mt-1 flex items-center gap-1">
                                <span>●</span> {item.time || (isTask ? 'TASK' : '')}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col bg-card rounded-2xl border overflow-hidden glass">
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

      {/* Detail Overlay */}
      {selectedDay && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md fade-in"
          onClick={() => setSelectedDay(null)}
        >
          <div 
            className="w-full max-w-lg bg-card rounded-3xl p-8 border border-default shadow-2xl scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{monthNames[selectedDay.month]} {selectedDay.day}</h2>
                <p className="text-[11px] text-tertiary font-medium tracking-wide uppercase">Scheduled items</p>
              </div>
              <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-surface rounded-xl transition-colors">✕</button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {[...selectedDay.events, ...selectedDay.tasks].map((item, i) => {
                const isTask = !!item.priority
                const tc = isTask ? getTaskColor(item, accent) : { bg: 'var(--bg-surface)', color: accent }
                return (
                  <div key={i} className="p-4 rounded-2xl border flex items-center gap-4 group transition-all hover:bg-surface/50" style={{ background: tc.bg, borderColor: 'var(--border-default)' }}>
                    <div className="w-10 h-10 rounded-xl bg-card border flex items-center justify-center text-lg">{isTask ? '▣' : '📅'}</div>
                    <div className="flex-1">
                      <h4 className="text-[14px] font-bold">{item.title}</h4>
                      <p className="text-[11px] text-tertiary">{item.time || (isTask ? item.status.toUpperCase() : 'EVENT')}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-default flex gap-4">
              <button onClick={() => setShowQuickAdd(true)} className="flex-1 py-4 rounded-2xl text-[12px] font-bold bg-accent text-white shadow-lg shadow-accent/20 hover:opacity-90 transition-all">ADD ENTRY</button>
              <button onClick={() => setSelectedDay(null)} className="flex-1 py-4 rounded-2xl text-[12px] font-bold bg-surface border border-default">CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl fade-in"
          onClick={() => setShowQuickAdd(false)}
        >
          <div 
            className="w-full max-w-md bg-card rounded-3xl p-8 border border-default shadow-3xl scale-in"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-6">⚡ Quick Add Event</h3>
            <div className="space-y-4">
              <input type="text" placeholder="What's the plan?" autoFocus 
                value={quickAddData.title} onChange={e => setQuickAddData({...quickAddData, title: e.target.value})}
                className="w-full px-5 py-4 rounded-2xl bg-surface border border-default text-[14px] outline-none focus:border-accent transition-all" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="10:00 AM" value={quickAddData.time} onChange={e => setQuickAddData({...quickAddData, time: e.target.value})}
                  className="px-5 py-4 rounded-2xl bg-surface border border-default text-[14px]" />
                <select value={quickAddData.type} onChange={e => setQuickAddData({...quickAddData, type: e.target.value})}
                  className="px-5 py-4 rounded-2xl bg-surface border border-default text-[14px]">
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="review">Review</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowQuickAdd(false)} className="flex-1 py-4 rounded-2xl text-[12px] font-bold bg-surface">CANCEL</button>
              <button onClick={() => { handleQuickAdd(); setShowQuickAdd(false); m}} className="flex-1 py-4 rounded-2xl text-[12px] font-bold bg-accent text-white shadow-xl shadow-accent/20">CREATE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
