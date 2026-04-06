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
  nextTaskId: 1,
}

let state = JSON.parse(JSON.stringify(seedState))
const listeners = new Set()
const eventListeners = {}

// ─── Supabase Helpers ─────────────────────────────────────

async function loadFromSupabase() {
  try {
    const [{ data: tasks }, { data: projects }, { data: events }, { data: team }, { data: memories }, { data: docs }, { data: activity }] = await Promise.all([
      supabase.from('tasks').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('events').select('*'),
      supabase.from('team').select('*'),
      supabase.from('memories').select('*'),
      supabase.from('docs').select('*'),
      supabase.from('activities').select('*').limit(50).order('timestamp', { ascending: false }),
    ])
    
    // Safety check for nextTaskId based on max existing numeric ID if any
    let maxId = 0
    if (Array.isArray(tasks)) {
      tasks.forEach(t => {
        const numId = parseInt((t.id || '').replace('t', ''), 10)
        if (!isNaN(numId) && numId > maxId) maxId = numId
      })
    }

    return {
      ...seedState,
      tasks: Array.isArray(tasks) ? tasks.map(t => {
        const uiTask = { ...t }
        // Ensure arrays are present even if null in DB
        uiTask.tags = uiTask.tags || []
        uiTask.comments = uiTask.comments || []
        uiTask.subtasks = uiTask.subtasks || []
        uiTask.dependencies = uiTask.dependencies || []
        uiTask.dependsOn = uiTask.dependsOn || []
        
        // Map due_date (DB) to dueDate (UI)
        if (uiTask.due_date !== undefined) {
          uiTask.dueDate = uiTask.due_date
          delete uiTask.due_date
        }
        return uiTask
      }) : [],
      projects: Array.isArray(projects) ? projects : [],
      events: Array.isArray(events) ? events : [],
      team: Array.isArray(team) ? team : [],
      memories: Array.isArray(memories) ? memories : [],
      docs: Array.isArray(docs) ? docs : [],
      activity: Array.isArray(activity) ? activity : [],
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
      // Map UI properties to DB schema
      if (dbTask.dueDate !== undefined) {
        dbTask.due_date = dbTask.dueDate
        delete dbTask.dueDate
      }
      // Ensure database-unfriendly properties are handled
      delete dbTask.dependsOn // Handled by separate logic if needed, or if it's a join table
      
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
    // Sync to Supabase in background
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
    state.activity = [act, ...state.activity].slice(0, 50)
    notifyListeners()
    store.emit('activity:added', act)
    saveState()
    // Sync activity to DB
    supabase.from('activities').insert([act]).then(({ error }) => {
      if (error) console.warn('[Supabase] Activity insert error:', error)
    })
  },

  exportState: () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mission-control-backup-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  },

  importState: (jsonStr) => {
    try {
      const imported = JSON.parse(jsonStr)
      state = { ...seedState, ...imported }
      notifyListeners()
      saveState()
      return true
    } catch (e) {
      console.error('[store] Import failed:', e)
      return false
    }
  },

  factoryReset: () => {
    state = JSON.parse(JSON.stringify(seedState))
    notifyListeners()
    localStorage.removeItem(STORAGE_KEY)
  },

  nextId: () => `t${state.nextTaskId++}`,

  // Dependency helpers
  checkCircular: (taskId, depId) => hasCircularDependency(state.tasks, taskId, depId),
  isBlocked: (taskId) => { 
    const task = state.tasks.find(t => t.id === taskId)
    return task ? isTaskBlocked(task, state.tasks) : false 
  },
  getBlockerCount: (taskId) => { 
    const task = state.tasks.find(t => t.id === taskId)
    return task ? getBlockerCount(task, state.tasks) : 0 
  },
  addDependency: (taskId, blockingId) => {
    if (hasCircularDependency(state.tasks, taskId, blockingId)) return { ok: false, reason: 'circular' }
    state.tasks = state.tasks.map(t => {
      if (t.id === taskId) return { ...t, dependencies: [...(t.dependencies || []), blockingId] }
      if (t.id === blockingId) return { ...t, dependsOn: [...(t.dependsOn || []), taskId] }
      return t
    })
    saveState(); notifyListeners()
    syncToSupabase({ tasks: state.tasks })
    return { ok: true }
  },
  removeDependency: (taskId, blockingId) => {
    state.tasks = state.tasks.map(t => {
      if (t.id === taskId) return { ...t, dependencies: (t.dependencies || []).filter(d => d !== blockingId) }
      if (t.id === blockingId) return { ...t, dependsOn: (t.dependsOn || []).filter(d => d !== taskId) }
      return t
    })
    saveState(); notifyListeners()
    syncToSupabase({ tasks: state.tasks })
    return { ok: true }
  },

  getDueStatus,
  doneEarly,
  getOverdueCount: () => state.tasks.filter(t => { 
    const s = getDueStatus(t)
    return s && s.status === 'overdue' 
  }).length,
  markDone: (taskId) => {
    state.tasks = state.tasks.map(t => t.id === taskId ? { ...t, status: 'done' } : t)
    saveState(); notifyListeners()
    store.addActivity({ icon: '✅', action: `Completed task: ${state.tasks.find(t => t.id === taskId)?.title?.slice(0,30) || taskId}` })
    syncToSupabase({ tasks: state.tasks })
  },
}

// Utility functions
function hasCircularDependency(allTasks, taskId, dependencyId, visited = new Set()) {
  if (taskId === dependencyId) return true
  if (visited.has(dependencyId)) return false
  visited.add(dependencyId)
  const depTask = allTasks.find(t => t.id === dependencyId)
  if (!depTask) return false
  if (depTask.dependencies) {
    return depTask.dependencies.some(dep => hasCircularDependency(allTasks, taskId, dep, visited))
  }
  return false
}

function isTaskBlocked(task, allTasks) {
  if (!task.dependencies || task.dependencies.length === 0) return false
  return task.dependencies.some(depId => {
    const blocker = allTasks.find(t => t.id === depId)
    return blocker && blocker.status !== 'done'
  })
}

function getBlockerCount(task, allTasks) {
  if (!task.dependencies || task.dependencies.length === 0) return 0
  return task.dependencies.filter(depId => {
    const blocker = allTasks.find(t => t.id === depId)
    return blocker && blocker.status !== 'done'
  }).length
}

function daysBetween(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1); d1.setHours(0,0,0,0)
  const d2 = new Date(dateStr2); d2.setHours(0,0,0,0)
  return Math.ceil((d1 - d2) / (1000*60*60*24))
}

function getDueStatus(task) {
  if (!task.dueDate || task.status === 'done') return null
  const today = new Date().toISOString().slice(0,10)
  const diff = daysBetween(task.dueDate, today)
  if (diff < 0) return { status: 'overdue', days: Math.abs(diff), label: `${Math.abs(diff)}d overdue` }
  if (diff === 0) return { status: 'today', days: 0, label: 'Due today' }
  if (diff <= 3) return { status: 'soon', days: diff, label: `${diff}d left` }
  return { status: 'upcoming', days: diff, label: `${diff}d left` }
}

function doneEarly(task) {
  if (task.status !== 'done' || !task.dueDate) return false
  const today = new Date().toISOString().slice(0,10)
  const diff = daysBetween(task.dueDate, today)
  return diff > 0
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch (e) { console.warn('[store] Save failed:', e) }
}

// Initial boot
initializeStore()

export default store
