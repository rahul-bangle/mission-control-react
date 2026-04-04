// ============================================================
// mission-control-react/src/agentRegistry.js
// Central agent registry — Phase 5C
// ============================================================

let agents = []
let listeners = new Set()

export function registerAgent(agent) {
  const entry = {
    id: agent.id || `agent-${Date.now()}`,
    name: agent.name,
    agentId: agent.agentId,
    type: agent.type || 'developer',
    status: agent.status || 'idle',
    currentTask: agent.currentTask || null,
    model: agent.model || 'qwen',
    runtime: agent.runtime || null,
    cpu: 0,
    memory: 0,
    uptime: 0,
    cost: 0,
    skills: agent.skills || [],
    stats: { successRate: 0, avgTime: 0, streak: 0, failRate: 0, completed: 0 },
    events: [],
    canvas: null,
    registeredAt: Date.now(),
    lastHeartbeat: Date.now(),
    ...agent.extra,
  }
  agents.push(entry)
  notify()
  return entry.id
}

export function updateAgent(id, changes) {
  agents = agents.map(a => a.id === id ? { ...a, ...changes, lastHeartbeat: Date.now() } : a)
  notify()
}

export function removeAgent(id) {
  agents = agents.filter(a => a.id !== id)
  notify()
}

export function getAgents() { return [...agents] }
export function getAgent(id) { return agents.find(a => a.id === id) }
export function getStats() {
  const total = agents.length
  const running = agents.filter(a => a.status === 'running').length
  const idle = agents.filter(a => a.status === 'idle').length
  const failed = agents.filter(a => a.status === 'failed').length
  const completed = agents.filter(a => a.status === 'completed').length
  return { total, running, idle, failed, completed }
}
export function getZombies() {
  return agents.filter(a => a.status === 'running' && Date.now() - a.lastHeartbeat > 60000)
}

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) }
function notify() { listeners.forEach(fn => fn(getAgents())) }

export default { registerAgent, updateAgent, removeAgent, getAgents, getAgent, getStats, getZombies, subscribe }
