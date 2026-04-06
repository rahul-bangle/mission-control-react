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
    return {
      ...seedState,
      tasks: Array.isArray(tasks) ? tasks : [],
      projects: Array.isArray(projects) ? projects : [],
      events: Array.isArray(events) ? events : [],
      team: Array.isArray(team) ? team : [],
      memories: Array.isArray(memories) ? memories : [],
      docs: Array.isArray(docs) ? docs : [],
      activity: Array.isArray(activity) ? activity : [],
      nextTaskId: 1,
    }
  } catch (e) {
    console.warn('[Supabase] Load failed, using localStorage:', e)
    return null
  }
}

async function syncToSupabase(changes) {
  const { tasks } = changes
  if (tasks) {
    for (const task of tasks) {
      const { error } = await supabase.from('tasks').upsert(task)
      if (error) console.warn('[Supabase] Upsert error:', error)
    }
  }
}

async function initializeStore() {
  // Try loading from Supabase first
  const supabaseData = await loadFromSupabase()
  if (supabaseData) {
    state = supabaseData
    console.log('[store] Loaded from Supabase')
  } else {
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        state = { ...seedState, ...parsed }
        console.log('[store] Loaded from localStorage')
      }
    } catch (e) {
      console.warn('[store] LocalStorage load failed:', e)
    }
  }
  notifyListeners()
}
// ─────────────────────────────────────────────────────────────

function notifyListeners() {
  const snapshot = JSON.parse(JSON.stringify(state))
  listeners.forEach(fn => fn(snapshot))
}

export const store = {
  getState: () => JSON.parse(JSON.stringify(state)),
  patchState: async (partial) => {
    const old = JSON.parse(JSON.stringify(state))
    state = { ...state, ...partial }
    notifyListeners()
    // Background syncing
    const changes = partial
    try {
      await syncToSupabase(changes)
      // Save to localStorage as backup
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch (e) { console.warn('[store] Save failed:', e) }
    } catch (e) {
      console.warn('[store] Supabase sync error:', e)
    }
  },
  subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn) },

  // ─── Activity Feed ─────────────────────────────────────
  addActivity: (entry) => {
    const act = {
      id: 'act-' + Date.now(),
      type: entry.type || 'task',
      icon: entry.icon || '▣',
      action: entry.action,
      time: 'just now',
      unread: true,
      timestamp: Date.now(),
      ...entry.extra
    }
    state.activity = [act, ...state.activity].slice(0, 50)
    notifyListeners()
    store.emit('activity:added', act)
    // Sync activity to Supabase
    supabase.from('activities').upsert([act]).then(({ error }) => {
      if (error) console.warn('[Supabase] Activity upsert error:', error)
    })
  },
  emit: (eventName, ...args) => { (eventListeners[eventName] || []).forEach(fn => fn(...args)) },
  on: (eventName, fn) => {
    if (!eventListeners[eventName]) eventListeners[eventName] = []
    eventListeners[eventName].push(fn)
    return () => { eventListeners[eventName] = (eventListeners[eventName] || []).filter(f => f !== fn) }
  },
  // ─────────────────────────────────────────────────────────────

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
      supabase.from('tasks').upsert(state.tasks)
      supabase.from('projects').upsert(state.projects)
      supabase.from('events').upsert(state.events)
      supabase.from('team').upsert(state.team)
      supabase.from('memories').upsert(state.memories)
      supabase.from('docs').upsert(state.docs)
      return true
    } catch (e) { console.error('[store] Import failed:', e); return false }
  },

  factoryReset: () => {
    state = JSON.parse(JSON.stringify(seedState))
    notifyListeners()
    localStorage.removeItem(STORAGE_KEY)
  },

  // ─── Realtime subscription (listen for changes) ─────────────
  _subscription: null,
  connectRealtime() {
    if (this._subscription) return
    this._subscription = supabase
      .channel('global-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        console.log('[Realtime] tasks change:', payload)
        // Refresh tasks list from server or merge
        this.loadFromSupabase().then(newState => {
          if (newState) {
            state = newState
            notifyListeners()
          }
        })
      })
      .subscribe()
  },
  // ─────────────────────────────────────────────────────────────

  nextId: () => `t${state.nextTaskId++}`,

  // Dependency helpers
  checkCircular: (taskId, depId) => hasCircularDependency(state.tasks, taskId, depId),
  isBlocked: (taskId) => { const task = state.tasks.find(t => t.id === taskId); return task ? isTaskBlocked(task, state.tasks) : false },
  getBlockerCount: (taskId) => { const task = state.tasks.find(t => t.id === taskId); return task ? getBlockerCount(task, state.tasks) : 0 },
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

  // Due date helpers (Phase 3)
  getDueStatus,
  doneEarly,
  getOverdueCount: () => state.tasks.filter(t => { const s = getDueStatus(t); return s && s.status === 'overdue' }).length,
  markDone: (taskId) => {
    state.tasks = state.tasks.map(t => t.id === taskId ? { ...t, status: 'done' } : t)
    notifyListeners()
    store.addActivity({ icon: '✅', action: `Completed task: ${state.tasks.find(t => t.id === taskId)?.title?.slice(0,30) || taskId}` })
    syncToSupabase({ tasks: state.tasks })
  },
}

// keep existing utility functions unchanged
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

// Initialize on first load
initializeStore()

export default store
