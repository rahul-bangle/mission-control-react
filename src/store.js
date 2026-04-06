// ============================================================
// mission-control-react/src/store.js
// Single source of truth
// ============================================================

const STORAGE_KEY = 'mission-control-state'

function daysFromNow(n) {
  const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10)
}

const seedState = {
  tasks: [
    { id: 't1', title: 'Implement OAuth2 integration for Slack', tags: ['feature', 'backend'], priority: 'high', assignee: 'rahul', status: 'backlog', estimate: '3d', dueDate: daysFromNow(7), comments: [], subtasks: [], dependencies: [], dependsOn: [] },
    { id: 't2', title: 'Fix memory leak in websocket handler', tags: ['bug', 'critical'], priority: 'urgent', assignee: 'aria', status: 'backlog', estimate: '1d', dueDate: daysFromNow(-2), comments: [], subtasks: [], dependencies: [], dependsOn: [] },
    { id: 't3', title: 'Design system tokens audit', tags: ['design', 'docs'], priority: 'low', assignee: 'rahul', status: 'backlog', estimate: '2d', dueDate: daysFromNow(14), comments: [], subtasks: [], dependencies: [], dependsOn: [] },
    { id: 't4', title: 'Setup Postgres monitoring dashboard', tags: ['infra', 'monitoring'], priority: 'medium', assignee: 'rahul', status: 'backlog', estimate: '2d', dueDate: daysFromNow(5), comments: [], subtasks: [], dependencies: ['t1'], dependsOn: [] },
    { id: 't5', title: 'Build notification service', tags: ['feature', 'backend'], priority: 'high', assignee: 'aria', status: 'in-progress', estimate: '4d', dueDate: daysFromNow(3), comments: [], subtasks: [], dependencies: [], dependsOn: ['t1'] },
    { id: 't6', title: 'Integrate Stripe billing webhooks', tags: ['feature', 'payments'], priority: 'urgent', assignee: 'rahul', status: 'in-progress', estimate: '2d', dueDate: daysFromNow(0), comments: [], subtasks: [], dependencies: [], dependsOn: [] },
    { id: 't7', title: 'Refactor auth middleware', tags: ['refactor', 'backend'], priority: 'medium', assignee: 'aria', status: 'in-progress', estimate: '3d', dueDate: daysFromNow(10), comments: [], subtasks: [], dependencies: ['t5'], dependsOn: [] },
    { id: 't8', title: 'User onboarding flow v2', tags: ['feature', 'frontend'], priority: 'high', assignee: 'rahul', status: 'review', estimate: '3d', dueDate: daysFromNow(-1), comments: [], subtasks: [], dependencies: [], dependsOn: [] },
    { id: 't9', title: 'API rate limiting implementation', tags: ['security', 'backend'], priority: 'high', assignee: 'rahul', status: 'review', estimate: '2d', dueDate: daysFromNow(2), comments: [], subtasks: [], dependencies: ['t1'], dependsOn: [] },
    { id: 't10', title: 'Database connection pooling', tags: ['infra', 'performance'], priority: 'medium', assignee: 'aria', status: 'review', estimate: '2d', dueDate: null, comments: [], subtasks: [], dependencies: ['t4'], dependsOn: [] },
    { id: 't11', title: 'Deploy staging environment', tags: ['devops', 'infra'], priority: 'medium', assignee: 'rahul', status: 'done', estimate: '1d', dueDate: daysFromNow(-5), comments: [], subtasks: [], dependencies: [], dependsOn: [] },
    { id: 't12', title: 'Write API documentation', tags: ['docs'], priority: 'low', assignee: 'rahul', status: 'done', estimate: '2d', dueDate: daysFromNow(-3), comments: [], subtasks: [], dependencies: [], dependsOn: [] },
    { id: 't13', title: 'Setup CI/CD pipeline', tags: ['devops', 'infra'], priority: 'high', assignee: 'aria', status: 'done', estimate: '2d', dueDate: daysFromNow(-7), comments: [], subtasks: [], dependencies: [], dependsOn: [] },
    { id: 't14', title: 'Mobile responsive fixes', tags: ['bug', 'frontend'], priority: 'medium', assignee: 'rahul', status: 'done', estimate: '1d', dueDate: daysFromNow(-4), comments: [], subtasks: [], dependencies: [], dependsOn: [] },
  ],
  projects: [
    { id: 'p1', name: 'Phoenix Rebrand', status: 'active', description: 'Complete visual identity overhaul for Q2 product launch', progress: 68, color: '#19c3ff', tasks: { total: 24, completed: 16 }, members: 5, daysLeft: 18, tags: ['design', 'branding'], owner: 'rahul' },
    { id: 'p2', name: 'API Gateway v3', status: 'active', description: 'Build scalable API gateway with rate limiting and caching', progress: 45, color: '#a855f7', tasks: { total: 32, completed: 14 }, members: 3, daysLeft: 25, tags: ['backend', 'infra'], owner: 'rahul' },
    { id: 'p3', name: 'Mobile App Beta', status: 'review', description: 'Cross-platform mobile app for field operations', progress: 82, color: '#22c55e', tasks: { total: 18, completed: 15 }, members: 4, daysLeft: 7, tags: ['mobile', 'react-native'], owner: 'aria' },
    { id: 'p4', name: 'Data Pipeline', status: 'active', description: 'Real-time ETL pipeline for analytics dashboard', progress: 31, color: '#f59e0b', tasks: { total: 28, completed: 9 }, members: 2, daysLeft: 42, tags: ['data', 'python'], owner: 'rahul' },
    { id: 'p5', name: 'Security Audit', status: 'paused', description: 'Third-party security assessment and compliance review', progress: 15, color: '#ef4444', tasks: { total: 12, completed: 2 }, members: 3, daysLeft: 60, tags: ['security', 'compliance'], owner: 'rahul' },
    { id: 'p6', name: 'Onboarding Flow', status: 'completed', description: 'Redesigned user onboarding with progress tracking', progress: 100, color: '#22c55e', tasks: { total: 20, completed: 20 }, members: 4, daysLeft: 0, tags: ['frontend', 'ux'], owner: 'aria' },
  ],
  events: [
    { date: 5, title: 'Sprint Planning', time: '10:00 AM', type: 'meeting', color: '#19c3ff' },
    { date: 7, title: 'Design Review', time: '2:00 PM', type: 'review', color: '#a855f7' },
    { date: 10, title: 'Q2 Goals Due', time: '5:00 PM', type: 'deadline', color: '#ef4444' },
    { date: 12, title: 'Team Standup', time: '9:30 AM', type: 'meeting', color: '#19c3ff' },
    { date: 15, title: 'Client Presentation', time: '11:00 AM', type: 'meeting', color: '#19c3ff' },
    { date: 18, title: 'Performance Review', time: '3:00 PM', type: 'review', color: '#a855f7' },
    { date: 22, title: 'Launch v2.0', time: '12:00 PM', type: 'deadline', color: '#22c55e' },
    { date: 25, title: 'Architecture Sync', time: '1:00 PM', type: 'meeting', color: '#19c3ff' },
    { date: 28, title: 'Monthly Retrospective', time: '4:00 PM', type: 'meeting', color: '#f59e0b' },
    { date: 30, title: 'Budget Review', time: '10:00 AM', type: 'review', color: '#a855f7' },
  ],
  team: [
    { id: 'm1', name: 'Aria', role: 'Main Coordinator', department: 'AI', status: 'online', avatar: '🦞', avatarColor: '#f59e0b', location: 'Cloud', joined: '2024', stats: { tasks: 15, completed: 89, efficiency: 94 }, currentProject: 'API Gateway v3', email: 'aria@mission-control.io', skills: ['React', 'Python', 'Research', 'Writing'] },
    { id: 'm2', name: 'Sarah Park', role: 'Backend Engineer', department: 'Engineering', status: 'away', avatar: 'SP', avatarColor: '#3b82f6', location: 'Seattle', joined: 'Nov 2024', stats: { tasks: 15, completed: 89, efficiency: 91 }, currentProject: 'API Gateway v3', email: 'sarah.p@company.io', skills: ['Python', 'Go', 'Kubernetes'] },
    { id: 'm3', name: 'James Wilson', role: 'Product Manager', department: 'Product', status: 'online', avatar: 'JW', avatarColor: '#22c55e', location: 'Austin', joined: 'Feb 2024', stats: { tasks: 6, completed: 124, efficiency: 88 }, currentProject: 'Data Pipeline', email: 'james.w@company.io', skills: ['Strategy', 'Analytics', 'Roadmapping'] },
    { id: 'm4', name: 'Priya Sharma', role: 'DevOps Engineer', department: 'Infrastructure', status: 'offline', avatar: 'PS', avatarColor: '#f59e0b', location: 'London', joined: 'Aug 2024', stats: { tasks: 9, completed: 56, efficiency: 96 }, currentProject: 'Security Audit', email: 'priya.s@company.io', skills: ['AWS', 'Terraform', 'CI/CD'] },
    { id: 'm5', name: 'David Lee', role: 'Frontend Engineer', department: 'Engineering', status: 'online', avatar: 'DL', avatarColor: '#ec4899', location: 'Toronto', joined: 'Dec 2024', stats: { tasks: 11, completed: 38, efficiency: 92 }, currentProject: 'Onboarding Flow', email: 'david.l@company.io', skills: ['Vue.js', 'TypeScript', 'Testing'] },
    { id: 'm6', name: 'Marcus Chen', role: 'Senior Designer', department: 'Design', status: 'online', avatar: 'MC', avatarColor: '#a855f7', location: 'New York', joined: 'Mar 2025', stats: { tasks: 8, completed: 32, efficiency: 98 }, currentProject: 'Mobile App Beta', email: 'marcus.c@company.io', skills: ['Figma', 'UI/UX', 'Motion'] },
  ],
  memories: [
    { id: 'mem1', category: 'decision', title: 'Switch to monorepo architecture', excerpt: 'After evaluating complexity vs benefits, decided to consolidate all packages into a single repository with pnpm workspaces.', date: 'Apr 4, 2026', time: '2:34 PM', tags: ['architecture', 'devops'], pinned: true, messages: [] },
    { id: 'mem2', category: 'work', title: 'Q2 OKRs finalized with leadership', excerpt: 'Key objectives: 3 major product launches, 40% infrastructure cost reduction, NPS score above 60.', date: 'Apr 3, 2026', time: '11:20 AM', tags: ['strategy', 'planning'], pinned: true, messages: [] },
    { id: 'mem3', category: 'learning', title: 'Discovered new caching patterns', excerpt: 'Read about cache-aside vs write-through strategies. Implemented hybrid approach for the API gateway.', date: 'Apr 2, 2026', time: '4:15 PM', tags: ['backend', 'performance'], pinned: false, messages: [] },
    { id: 'mem4', category: 'idea', title: 'AI-powered code review bot', excerpt: 'Concept for automated PR reviews using LLM. Could flag potential bugs, style issues, and suggest improvements.', date: 'Apr 1, 2026', time: '9:00 AM', tags: ['ai', 'automation'], pinned: false, messages: [] },
    { id: 'mem5', category: 'personal', title: 'Weekly reflection: progress on health goals', excerpt: 'Maintained workout streak for 3 weeks. Need to improve sleep schedule - averaging 6 hours instead of 7.5 target.', date: 'Mar 31, 2026', time: '8:00 PM', tags: ['health', 'reflection'], pinned: false, messages: [] },
    { id: 'mem6', category: 'work', title: 'Contractor onboarding complete', excerpt: 'Alex Chen joined as senior backend engineer. Completed security training and got access to staging environment.', date: 'Mar 29, 2026', time: '3:30 PM', tags: ['team', 'onboarding'], pinned: false, messages: [] },
    { id: 'mem7', category: 'decision', title: 'PostgreSQL over MongoDB for main DB', excerpt: 'After load testing, PostgreSQL showed 40% better performance for our query patterns. Migrating schema next week.', date: 'Mar 28, 2026', time: '1:45 PM', tags: ['database', 'architecture'], pinned: false, messages: [] },
  ],
  docs: [
    { id: 'd1', name: 'Phoenix Rebrand Spec', type: 'markdown', modified: '2h ago', author: 'rahul', size: '12KB', folder: 'projects' },
    { id: 'd2', name: 'API Gateway Requirements', type: 'markdown', modified: '1d ago', author: 'rahul', size: '8KB', folder: 'projects' },
    { id: 'd3', name: 'Mobile App PRD', type: 'markdown', modified: '3d ago', author: 'aria', size: '15KB', folder: 'projects' },
    { id: 'd4', name: 'Sprint Planning 04-05', type: 'markdown', modified: '1d ago', author: 'rahul', size: '4KB', folder: 'meetings' },
    { id: 'd5', name: 'Design Review 04-01', type: 'markdown', modified: '3d ago', author: 'rahul', size: '6KB', folder: 'meetings' },
    { id: 'd6', name: 'Architecture Sync 03-28', type: 'markdown', modified: '1w ago', author: 'rahul', size: '5KB', folder: 'meetings' },
    { id: 'd7', name: 'Client Kickoff 03-25', type: 'markdown', modified: '2w ago', author: 'rahul', size: '7KB', folder: 'meetings' },
    { id: 'd8', name: 'PR Template', type: 'markdown', modified: '1mo ago', author: 'rahul', size: '2KB', folder: 'templates' },
    { id: 'd9', name: 'Bug Report Template', type: 'markdown', modified: '1mo ago', author: 'rahul', size: '3KB', folder: 'templates' },
    { id: 'd10', name: 'Q1 Retrospective', type: 'markdown', modified: '1mo ago', author: 'rahul', size: '9KB', folder: 'archive' },
  ],
  recurringEvents: [ // 5B.8 & 5B.9
    { id: 're1', title: 'Weekly Standup', time: '10:00 AM', type: 'meeting', color: '#19c3ff', active: true, rule: { type: 'weekly', dayOfWeek: 1 } },
    { id: 're2', title: 'Monthly Review', time: '3:00 PM', type: 'review', color: '#a855f7', active: true, rule: { type: 'monthly', dayOfMonth: 1 } },
    { id: 're3', title: 'Sprint Retro', time: '4:00 PM', type: 'meeting', color: '#f59e0b', active: true, rule: { type: 'weekly', dayOfWeek: 5 } },
  ],
  activity: [],
  nextTaskId: 15,
}

let state = loadState()
const listeners = new Set()
const eventListeners = {}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...seedState, ...parsed }
    }
  } catch (e) { console.warn('[store] Load failed:', e) }
  return JSON.parse(JSON.stringify(seedState))
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch (e) { console.warn('[store] Save failed:', e) }
}

// === DUE DATE UTILS (Phase 3) ===

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

// Check if done early (completed before due date) — 3.4
function doneEarly(task) {
  if (task.status !== 'done' || !task.dueDate) return false
  const today = new Date().toISOString().slice(0,10)
  const diff = daysBetween(task.dueDate, today)
  return diff > 0
}

// === DEPENDENCY SYSTEM (Phase 2) ===

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

export const store = {
  getState: () => JSON.parse(JSON.stringify(state)),
  patchState: (partial) => {
    state = { ...state, ...partial }
    saveState()
    notifyListeners()
  },
  subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn) },
  on: (eventName, fn) => {
    if (!eventListeners[eventName]) eventListeners[eventName] = []
    eventListeners[eventName].push(fn)
    return () => { eventListeners[eventName] = (eventListeners[eventName] || []).filter(f => f !== fn) }
  },
  emit: (eventName, ...args) => { (eventListeners[eventName] || []).forEach(fn => fn(...args)) },

  addActivity: (entry) => {
    const act = { id: 'act-' + Date.now(), type: entry.type || 'task', icon: entry.icon || '▣', action: entry.action, time: 'just now', unread: true, timestamp: Date.now(), ...entry.extra }
    state.activity = [act, ...state.activity].slice(0, 50)
    saveState()
    notifyListeners()
    store.emit('activity:added', act)
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
      saveState()
      notifyListeners()
      return true
    } catch (e) { console.error('[store] Import failed:', e); return false }
  },

  factoryReset: () => {
    state = JSON.parse(JSON.stringify(seedState))
    saveState()
    notifyListeners()
  },

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
    return { ok: true }
  },
  removeDependency: (taskId, blockingId) => {
    state.tasks = state.tasks.map(t => {
      if (t.id === taskId) return { ...t, dependencies: (t.dependencies || []).filter(d => d !== blockingId) }
      if (t.id === blockingId) return { ...t, dependsOn: (t.dependsOn || []).filter(d => d !== taskId) }
      return t
    })
    saveState(); notifyListeners()
    return { ok: true }
  },

  // Due date helpers (Phase 3)
  getDueStatus,
  doneEarly,
  getOverdueCount: () => state.tasks.filter(t => { const s = getDueStatus(t); return s && s.status === 'overdue' }).length,
  markDone: (taskId) => {
    state.tasks = state.tasks.map(t => t.id === taskId ? { ...t, status: 'done' } : t)
    saveState(); notifyListeners()
    store.addActivity({ icon: '✅', action: `Completed task: ${state.tasks.find(t => t.id === taskId)?.title?.slice(0,30) || taskId}` })
  },
}

function notifyListeners() {
  const snapshot = JSON.parse(JSON.stringify(state))
  listeners.forEach(fn => fn(snapshot))
}

notifyListeners()
export default store
