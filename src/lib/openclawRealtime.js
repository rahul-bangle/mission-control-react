import { supabase } from './supabaseClient';
import { updateAgent, registerAgent, getAgent } from '../agentRegistry';
import store from '../store';

let subscription = null;

export function initializeLiveActivities() {
  if (subscription) return;

  // Perform an initial fetch of all currently active agents in the table
  supabase.from('activities').select('*').limit(20).order('timestamp', { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        console.error('[OpenClawRealtime] Initial fetch error:', error);
        return;
      }
      if (data) {
        data.forEach(processActivityRow);
      }
    });

  // Subscribe to real-time updates
  subscription = supabase
    .channel('live_activities_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'activities' },
      (payload) => {
        console.log('[OpenClawRealtime] Payload received:', payload);
        if (payload.new) {
          processActivityRow(payload.new);
        }
      }
    )
    .subscribe((status) => {
      console.log('[OpenClawRealtime] Subscription status:', status);
    });
}

function processActivityRow(row) {
  // If this activity isn't from an AI agent, gracefully ignore or map it abstractly
  const payload = row.extra || {};
  const agentId = payload.agent_id || `agent-${row.id || Date.now()}`;
  const isAgent = payload.agent_id || row.type?.includes('agent') || row.type === 'live-stream' || row.action?.includes('Aria') || row.action?.includes('OpenClaw');
  
  // Directly reflect this row in the dashboard's Activity Feed if store is available
  if (store) {
    const currentActivities = store.getState().activity || [];
    if (!currentActivities.find(a => a.id === row.id)) {
      store.patchState({ activity: [{...row, unread: true}, ...currentActivities].slice(0, 50) });
    }
  }

  if (!isAgent) return; // Ignore normal human tasks in this agent viewer

  const existing = getAgent(agentId);
  const changes = {
    status: row.status || payload.status || 'running',
    currentTask: row.action || payload.current_task,
    canvas: payload.live_payload || payload.canvas || row.time || row.action,
    lastHeartbeat: new Date(row.timestamp || Date.now()).getTime(),
  };

  if (existing) {
    updateAgent(agentId, changes);
  } else {
    registerAgent({
      id: agentId,
      agentId: agentId,
      name: payload.agent_name || `Aria (OpenClaw)`,
      ...changes
    });
  }
}
