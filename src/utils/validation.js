/**
 * Validation utility for Mission Control
 * Handles collision detection for tasks and events.
 */

export function checkCollision(tasks, events, date, time, excludeId = null) {
  if (!date || !time) return null;

  // Normalizing time for comparison (e.g., '10:00 AM' vs '10:00')
  const normalize = (t) => {
    if (!t) return '';
    return t.trim().toLowerCase();
  };

  const targetTime = normalize(time);

  // Check against other tasks
  const collidingTask = tasks.find(t => 
    t.id !== excludeId &&
    t.dueDate === date && 
    normalize(t.dueTime) === targetTime
  );

  if (collidingTask) {
    return { type: 'TASK', title: collidingTask.title };
  }

  // Check against events (meetings/reviews)
  const collidingEvent = events.find(e => 
    e.id !== excludeId &&
    e.fullDate === date && 
    normalize(e.time) === targetTime
  );

  if (collidingEvent) {
    return { type: 'EVENT', title: collidingEvent.title };
  }

  return null;
}
