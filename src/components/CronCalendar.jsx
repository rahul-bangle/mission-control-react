import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { useStore } from '../StoreContext';
import { Zap, Clock, Calendar as CalIcon, Activity } from 'lucide-react';

// --- Utils ---
const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const stringToColor = (str) => {
  if (!str) return { bg: '#2C2C2E', text: '#fff', border: '#FF9500' };
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    { bg: '#FF9500', text: '#000', border: '#FF9500', name: 'orange' }, // Apple Orange
    { bg: '#FF3B30', text: '#fff', border: '#FF3B30', name: 'red' },    // Apple Red
    { bg: '#34C759', text: '#000', border: '#34C759', name: 'green' },  // Apple Green
    { bg: '#007AFF', text: '#fff', border: '#007AFF', name: 'blue' },   // Apple Blue
    { bg: '#AF52DE', text: '#fff', border: '#AF52DE', name: 'purple' }, // Apple Purple
    { bg: '#5856D6', text: '#fff', border: '#5856D6', name: 'indigo' }, // Apple Indigo
    { bg: '#FFD60A', text: '#000', border: '#FFD60A', name: 'yellow' }, // Apple Yellow
  ];
  return colors[Math.abs(hash) % colors.length];
};

const formatTimeLabel = (h) => {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour} ${ampm}`;
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):?(\d+)?\s*(am|pm)/i);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2] || '0');
  const p = match[3].toLowerCase();
  if (p === 'pm' && h < 12) h += 12;
  if (p === 'am' && h === 12) h = 0;
  return h * 60 + m;
};

const CronCalendar = () => {
  const { state } = useStore();
  const { isLight, theme } = useTheme();
  const [viewMode, setViewMode] = useState('week');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const cronJobs = state.cronJobs || [];
  const todayIndex = currentTime.getDay();
  const isDark = theme === 'dark' || !isLight;

  // Process data for multi-column grid
  const processedData = useMemo(() => {
    const dayColumns = dayNames.map(() => []);

    // If no real data, use some high-info placeholders for the "Pro" look
    const rawJobs = cronJobs.length > 0 ? cronJobs : [
      { id: '1', name: 'Trend Radar', schedule: 'Every 15 min', time: '8:30 am' },
      { id: '2', name: 'Morning Kickoff', schedule: 'Daily', time: '9:00 am' },
      { id: '3', name: 'Reaction Poller', schedule: 'Every 5 min', time: '10:15 am' },
      { id: '4', name: 'Growth Scan', schedule: 'Hourly', time: '10:30 am' },
      { id: '5', name: 'Security Audit', schedule: 'Nightly', time: '11:00 pm' },
    ];

    dayNames.forEach((_, dayIdx) => {
      rawJobs.forEach((job) => {
        // Spread the same task across multiple days for "Same Task Same Color" visibility
        const minutes = parseTimeToMinutes(job.time || '10:00 am');
        dayColumns[dayIdx].push({
          ...job,
          startMins: minutes,
          duration: 60, // Default 60 min slots
          color: stringToColor(job.name)
        });
      });

      // Sort by start time
      dayColumns[dayIdx].sort((a, b) => a.startMins - b.startMins);

      // Simple collision grouping for side-by-side
      const groups = [];
      dayColumns[dayIdx].forEach(item => {
        let placed = false;
        for (const group of groups) {
          const lastInGroup = group[group.length - 1];
          if (item.startMins < lastInGroup.startMins + lastInGroup.duration) {
            group.push(item);
            placed = true;
            break;
          }
        }
        if (!placed) groups.push([item]);
      });

      groups.forEach(group => {
        group.forEach((item, idx) => {
          item.colWidth = 100 / group.length;
          item.colLeft = idx * item.colWidth;
        });
      });
    });

    return dayColumns;
  }, [cronJobs]);

  const alwaysRunning = cronJobs.filter(j => j.schedule?.toLowerCase().includes('min') || j.schedule?.toLowerCase().includes('every'));

  const ROW_HEIGHT = 80;
  const timeToString = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: isDark ? '#000000' : '#F5F5F7' }}>
      {/* HEADER: ALWAYS RUNNING STATUS */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-default z-30 shadow-sm" style={{ background: isDark ? '#111111' : '#FFFFFF' }}>
        <div className="flex items-center gap-2 pr-6 border-r border-default">
          <Zap className="w-4 h-4 text-blue-500 fill-blue-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Always Running</span>
        </div>
        
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
          {alwaysRunning.length === 0 ? (
             <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest italic flex items-center gap-2">
               <Activity className="w-3 h-3" /> System Standby
             </span>
          ) : (
            alwaysRunning.map(job => (
              <div key={job.id} className="flex items-center gap-3 px-4 py-1.5 rounded-sm border border-default whitespace-nowrap" 
                   style={{ background: isDark ? '#1C1C1E' : '#F2F2F7' }}>
                <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{job.name}</span>
                <div className="w-[1px] h-3 bg-default" />
                <span className="text-[9px] font-bold text-accent uppercase">{job.schedule}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DASHBOARD NAVBAR */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-default z-20" style={{ background: isDark ? '#000000' : '#FFFFFF' }}>
        <div className="flex flex-col">
          <h2 className="text-[22px] font-black tracking-tighter text-primary">STRATEGY TIMELINE</h2>
          <span className="text-[9px] font-bold opacity-30 uppercase tracking-[0.3em]">AI Autonomous Operations Orchestrator</span>
        </div>
        
        <div className="flex bg-surface/50 p-1 rounded-sm border border-default">
          <button onClick={() => setViewMode('today')} className={`px-5 py-1.5 text-[10px] font-black transition-all ${viewMode === 'today' ? 'bg-surface shadow-sm text-primary' : 'opacity-40 hover:opacity-100'}`}>TODAY</button>
          <button onClick={() => setViewMode('week')} className={`px-5 py-1.5 text-[10px] font-black transition-all ${viewMode === 'week' ? 'bg-surface shadow-sm text-primary' : 'opacity-40 hover:opacity-100'}`}>WEEKLY</button>
        </div>
      </div>

      {/* TIMELINE GRID CONTAINER */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="flex min-w-[1200px] h-full">
          {/* Hour Labels Side Column (Fixed) */}
          <div className="w-16 flex-shrink-0 border-r border-default sticky left-0 z-40" style={{ background: isDark ? '#000000' : '#FFFFFF' }}>
            {HOURS.map(h => (
              <div key={h} className="relative" style={{ height: ROW_HEIGHT }}>
                <span className="absolute -top-2.5 left-0 right-0 text-center text-[10px] font-bold opacity-20 tabular-nums">
                  {formatTimeLabel(h)}
                </span>
              </div>
            ))}
          </div>

          {/* Core Vertical Grid Columns */}
          <div className="flex-1 grid grid-cols-7 relative">
            {dayNames.map((day, i) => {
              if (viewMode === 'today' && i !== todayIndex) return null;
              const isToday = i === todayIndex;
              const dateObj = new Date();
              dateObj.setDate(currentTime.getDate() + (i - todayIndex));
              
              return (
                <div key={day} className={`relative border-r border-default min-h-full ${isToday ? 'bg-accent/[0.03]' : ''}`}>
                  {/* Day Column Header Overlay */}
                  <div className={`sticky top-0 z-30 py-4 flex flex-col items-center gap-1 border-b ${isToday ? 'border-accent bg-accent/[0.08]' : 'border-default bg-surface/10'}`}
                       style={{ background: isDark ? (isToday ? '#1C1C1E' : '#050505') : '#FAFAFA' }}>
                    <span className={`text-[10px] font-black tracking-widest ${isToday ? 'text-accent' : 'opacity-40'}`}>{day}</span>
                    <span className={`text-[20px] font-black leading-none ${isToday ? 'text-accent' : 'text-primary'}`}>{dateObj.getDate()}</span>
                  </div>

                  {/* Vertical Slots and Tasks Area */}
                  <div className="relative w-full" style={{ height: HOURS.length * ROW_HEIGHT }}>
                    {/* Hourly Horizontal Separators */}
                    {HOURS.map(h => (
                      <div key={h} className="border-b border-default/20" style={{ height: ROW_HEIGHT }} />
                    ))}

                    {/* Rendered Cron Job Tiles */}
                    {processedData[i].map((task, idx) => (
                      <div
                        key={`${task.id}-${idx}`}
                        className="absolute px-[1px] py-[1px] group cursor-pointer transition-all duration-300 hover:z-40"
                        style={{
                          top: (task.startMins / 60) * ROW_HEIGHT,
                          height: (task.duration / 60) * ROW_HEIGHT,
                          left: `${task.colLeft}%`,
                          width: `${task.colWidth}%`,
                        }}
                      >
                        <div className="w-full h-full rounded-sm p-3 flex flex-col justify-between overflow-hidden border border-black/20 shadow-xl transition-all hover:scale-[1.02] hover:brightness-125 active:scale-95"
                             style={{ background: task.color.bg, borderLeft: `4px solid ${task.color.border}` }}>
                          <span className="text-[12px] font-black leading-tight tracking-tighter truncate uppercase" 
                                style={{ color: task.color.text }}>
                            {task.name}
                          </span>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-[9px] font-black opacity-60 flex items-center gap-1.5"
                                  style={{ color: task.color.text }}>
                              <Clock className="w-2.5 h-2.5" />
                              {task.time || '10:00 AM'}
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: task.color.text }} />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* LIVE CURRENT TIME INDICATOR (Only for Today) */}
                    {isToday && (
                      <div className="absolute left-0 right-0 z-50 pointer-events-none flex items-center"
                           style={{ top: ((currentTime.getHours() * 60 + currentTime.getMinutes()) / 60) * ROW_HEIGHT }}>
                        <div className="w-3 h-3 rounded-full bg-red-600 -ml-1.5 shadow-[0_0_15px_red]" />
                        <div className="flex-1 h-[2px] bg-red-600 shadow-[0_0_10px_red] opacity-100" />
                        <div className="px-2 py-1 bg-red-600 text-white text-[9px] font-black rounded-sm shadow-2xl ml-auto mr-2 translate-y-[-50%]">
                          {timeToString(currentTime)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronCalendar;
