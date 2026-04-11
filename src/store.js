// ============================================================
// mission-control-react/src/store.js
// Single source of truth — now with Supabase sync
// ============================================================

import { supabase } from './lib/supabaseClient'

const STORAGE_KEY = 'mission-control-state'

const seedState = {
  tasks: [],
  projects: [],
  events: [],
  team: [],
  memories: [],
  docs: [],
  recurringEvents: [
    { id: 're1', title: 'Weekly Standup', time: '10:00 AM', type: 'meeting', color: '#19c3ff', active: true, rule: { type: 'weekly', dayOfWeek: 1 } },
    { id: 're2', title: 'Monthly Review', time: '3:00 PM', type: 'review', color: '#a855f7', active: true, rule: { type: 'monthly', dayOfMonth: 1 } },
    { id: 're3', title: 'Sprint Retro', time: '4:00 PM', type: 'meeting', color: '#f59e0b', active: true, rule: { type: 'weekly', dayOfWeek: 5 } },
  ],
  activity: [],
  cronJobs: [],
  agentEvents: [],
  nextTaskId: 1,
}

let state = JSON.parse(JSON.stringify(seedState))
const listeners = new Set()
const eventListeners = {}

// ─── Helpers ────────────────────────────────────────────────

function mapAgentEventToActivity(ae) {
  const typeIcons = {
    heartbeat: '💓',
    task_start: '🚀',
    task_complete: '✅',
    error: '⚠️',
    info: 'ℹ️'
  }
  return {
    id: ae.id,
    type: ae.event_type || 'task',
    icon: typeIcons[ae.event_type] || '🤖',
    action: `[${ae.agent || 'Aria'}] ${ae.message}`,
    time: 'just now',
    unread: true,
    timestamp: ae.created_at || new Date().toISOString()
  }
}

// ─── Supabase Helpers ─────────────────────────────────────

async function loadFromSupabase() {
  try {
    const [
      { data: tasks }, 
      { data: projects }, 
      { data: events }, 
      { data: team }, 
      { data: memories }, 
      { data: docs }, 
      { data: activity },
      { data: cronJobs },
      { data: agentEvents }
    ] = await Promise.all([
      supabase.from('tasks').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('events').select('*'),
      supabase.from('team').select('*'),
      supabase.from('memories').select('*'),
      supabase.from('docs').select('*'),
      supabase.from('activities').select('*').limit(50).order('timestamp', { ascending: false }),
      supabase.from('cron_jobs').select('*'),
      supabase.from('agent_events').select('*').limit(50).order('created_at', { ascending: false })
    ])
    
    // Safety check for nextTaskId based on max existing numeric ID if any
    let maxId = 0
    if (Array.isArray(tasks)) {
      tasks.forEach(t => {
        const numId = parseInt((t.id || '').replace('t', ''), 10)
        if (!isNaN(numId) && numId > maxId) maxId = numId
      })
    }

    // Merge agent events into activity feed visually
    const mappedAriaEvents = (agentEvents || []).map(mapAgentEventToActivity)
    const combinedActivity = [...(activity || []), ...mappedAriaEvents]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 100)

    return {
      ...seedState,
      tasks: Array.isArray(tasks) ? tasks.map(t => {
        const uiTask = { ...t }
        uiTask.tags = uiTask.tags || []
        uiTask.comments = uiTask.comments || []
        uiTask.subtasks = uiTask.subtasks || []
        uiTask.dependencies = uiTask.dependencies || []
        uiTask.dependsOn = uiTask.dependsOn || []
        
        if (uiTask.due_date !== undefined) {
          uiTask.dueDate = uiTask.due_date
          delete uiTask.due_date
        }
        if (uiTask.due_time !== undefined) {
          uiTask.dueTime = uiTask.due_time
          delete uiTask.due_time
        }
        return uiTask
      }) : [],
      projects: Array.isArray(projects) ? projects : [],
      events: Array.isArray(events) ? events : [],
      team: Array.isArray(team) ? team : [],
      memories: Array.isArray(memories) ? memories : [],
      docs: Array.isArray(docs) ? docs : [],
      activity: combinedActivity,
      cronJobs: Array.isArray(cronJobs) ? cronJobs : [],
      agentEvents: Array.isArray(agentEvents) ? agentEvents : [],
      nextTaskId: maxId + 1,
    }
  } catch (e) {
    console.warn('[Supabase] Load failed, using localStorage:', e)
    return null
  }
}

async function syncToSupabase(changes) {
  const { tasks } = changes
  if (tasks && Array.isArray(tasks)) {
    for (const task of tasks) {
      const dbTask = { ...task }
      if (dbTask.dueDate !== undefined) {
        dbTask.due_date = dbTask.dueDate
        delete dbTask.dueDate
      }
      if (dbTask.dueTime !== undefined) {
        dbTask.due_time = dbTask.dueTime
        delete dbTask.dueTime
      }
      delete dbTask.dependsOn
      
      const { error } = await supabase.from('tasks').upsert(dbTask)
      if (error) console.warn('[Supabase] Upsert error:', error)
    }
  }
}

async function initializeStore() {
  const supabaseData = await loadFromSupabase()
  if (supabaseData) {
    state = supabaseData
    console.log('[store] Loaded from Supabase')
  } else {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        state = { ...seedState, ...JSON.parse(raw) }
        console.log('[store] Loaded from localStorage')
      }
    } catch (e) {
      console.warn('[store] LocalStorage load failed:', e)
    }
  }
  notifyListeners()
}

function notifyListeners() {
  const snapshot = JSON.parse(JSON.stringify(state))
  listeners.forEach(fn => fn(snapshot))
}

export const store = {
  getState: () => JSON.parse(JSON.stringify(state)),
  patchState: async (partial) => {
    state = { ...state, ...partial }
    notifyListeners()
    syncToSupabase(partial).catch(e => console.warn('[store] Sync error:', e))
    saveState()
  },
  subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn) },
  on: (eventName, fn) => {
    if (!eventListeners[eventName]) eventListeners[eventName] = []
    eventListeners[eventName].push(fn)
    return () => { eventListeners[eventName] = (eventListeners[eventName] || []).filter(f => f !== fn) }
  },
  emit: (eventName, ...args) => { (eventListeners[eventName] || []).forEach(fn => fn(...args)) },

  addActivity: (entry) => {
    const act = {
      id: 'act-' + Date.now(),
      type: entry.type || 'task',
      icon: entry.icon || '▣',
      action: entry.action,
      time: 'just now',
      unread: true,
      timestamp: new Date().toISOString(),
      ...entry.extra
    }
    state.activity = [act, ...state.activity].slice(0, 100)
    notifyListeners()
    store.emit('activity:added', act)
    saveState()
    supabase.from('activities').insert([act]).select('*').single().then(({ data, error }) => {
      if (error) console.warn('[Supabase] Activity insert error:', error)
    })
  },

  saveState,
  nextId: () => `t${state.nextTaskId++}`,
  markDone: (taskId) => {
    state.tasks = state.tasks.map(t => t.id === taskId ? { ...t, status: 'done' } : t)
    saveState(); notifyListeners()
    store.addActivity({ icon: '✅', action: `Completed task: ${state.tasks.find(t => t.id === taskId)?.title?.slice(0,30) || taskId}` })
    syncToSupabase({ tasks: state.tasks })
  },
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch (e) { console.warn('[store] Save failed:', e) }
}

// Initial boot
initializeStore()

// ─── Supabase Realtime ────────────────────────────────────────

// Tasks
supabase.channel('tasks-live')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, ({ new: updated }) => {
    state.tasks = state.tasks.map(t => {
      if (t.id !== updated.id) return t
      const mapped = { ...updated, dueDate: updated.due_date, dueTime: updated.due_time }
      delete mapped.due_date
      delete mapped.due_time
      return { ...t, ...mapped }
    })
    notifyListeners()
  })
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, ({ new: created }) => {
    const mapped = { 
      ...created, 
      dueDate: created.due_date, 
      dueTime: created.due_time,
      tags: created.tags || [], 
      subtasks: created.subtasks || [], 
      comments: created.comments || [], 
      dependencies: created.dependencies || [] 
    }
    delete mapped.due_date
    delete mapped.due_time
    if (!state.tasks.find(t => t.id === mapped.id)) {
      state.tasks = [mapped, ...state.tasks]
      notifyListeners()
    }
  })
  .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks' }, ({ old }) => {
    state.tasks = state.tasks.filter(t => t.id !== old.id)
    notifyListeners()
  })
  .subscribe()

// Cron Jobs
supabase.channel('cron-live')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'cron_jobs' }, async () => {
    const { data } = await supabase.from('cron_jobs').select('*')
    if (data) state.cronJobs = data
    notifyListeners()
  })
  .subscribe()

// Agent Events (Aria's logs)
supabase.channel('agent-events-live')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_events' }, ({ new: ae }) => {
    state.agentEvents = [ae, ...state.agentEvents].slice(0, 100)
    // Map to activity feed
    const act = mapAgentEventToActivity(ae)
    state.activity = [act, ...state.activity].slice(0, 100)
    notifyListeners()
    store.emit('activity:added', act)
  })
  .subscribe()

// Activities (Manual/UI logs)
supabase.channel('activities-live')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, ({ new: act }) => {
    if (!state.activity.find(a => a.id === act.id)) {
      state.activity = [{ ...act, unread: true }, ...state.activity].slice(0, 100)
      notifyListeners()
      store.emit('activity:added', act)
    }
  })
  .subscribe()

export default store
