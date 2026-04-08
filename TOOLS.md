# TOOLS.md — Supabase Execution Layer
_The ONLY way Aria interacts with tasks, activities, and live state._

---

## Credentials
```
SUPABASE_URL     = https://pzasaxdmufmhrxdppsbk.supabase.co
ANON_KEY         = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YXNheGRtdWZtaHJ4ZHBwc2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTc0OTcsImV4cCI6MjA5MDk3MzQ5N30.JPdgodqW17oULZ4RGvr5KyUE_DqS98JEb07hOD9ss9A
SERVICE_KEY      = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YXNheGRtdWZtaHJ4ZHBwc2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5NzQ5NywiZXhwIjoyMDkwOTczNDk3fQ.ZqHBzMgj1Ot8yxl2nZfIdgk7PR0bmWWYp2YF8JyWePk
```
> **Use SERVICE_KEY for all writes. Use ANON_KEY for reads.**

---

## Tables Reference
| Table | Purpose |
|---|---|
| `tasks` | All tasks — Aria's work queue, Rahul's tasks |
| `activities` | Activity feed — Aria's completed actions |
| `live_activities` | Heartbeat — Aria's current status |
| `team` | Team roster |
| `memories` | Stored facts/context |
| `docs` | Documents |
| `projects` | Projects |
| `events` | Calendar events |

---

## ✅ CREATE TASK
```bash
curl -s -X POST "https://pzasaxdmufmhrxdppsbk.supabase.co/rest/v1/tasks" \
  -H "apikey: SERVICE_KEY" \
  -H "Authorization: Bearer SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "title": "TITLE",
    "priority": "high|medium|low",
    "status": "pending",
    "assignee": "aria",
    "description": "OPTIONAL"
  }'
```
**MUST verify**: Response body contains JSON with `id` field. No `id` = write failed.

---

## ✅ UPDATE TASK STATUS
```bash
curl -s -X PATCH \
  "https://pzasaxdmufmhrxdppsbk.supabase.co/rest/v1/tasks?id=eq.TASK_ID" \
  -H "apikey: SERVICE_KEY" \
  -H "Authorization: Bearer SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"status": "in-progress|done|review|blocked"}'
```
**Valid statuses**: `pending` → `in-progress` → `done` | `review` | `blocked` | `backlog`

---

## ✅ LOG ACTIVITY (after completing work)
```bash
curl -s -X POST "https://pzasaxdmufmhrxdppsbk.supabase.co/rest/v1/activities" \
  -H "apikey: SERVICE_KEY" \
  -H "Authorization: Bearer SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "icon": "✅",
    "action": "WHAT I DID — one sentence",
    "type": "task",
    "time": "just now",
    "unread": true
  }'
```
**Types**: `task` | `deploy` | `comment` | `mention`

---

## ✅ HEARTBEAT / STATUS UPDATE
```bash
curl -s -X POST \
  "https://pzasaxdmufmhrxdppsbk.supabase.co/rest/v1/live_activities" \
  -H "apikey: SERVICE_KEY" \
  -H "Authorization: Bearer SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "agent": "aria",
    "status": "working|idle|thinking",
    "current_task": "TASK_TITLE_OR_NULL",
    "timestamp": "ISO_TIMESTAMP"
  }'
```

---

## ✅ FETCH PENDING TASKS (pick next task)
```bash
curl -s \
  "https://pzasaxdmufmhrxdppsbk.supabase.co/rest/v1/tasks?select=*&assignee=eq.aria&status=eq.pending&order=created_at.asc&limit=1" \
  -H "apikey: SERVICE_KEY" \
  -H "Authorization: Bearer SERVICE_KEY"
```

---

## ❌ CRITICAL RULES (violations = hallucination)
1. **NEVER fake success** — actual HTTP 200/201 + returned JSON required
2. **NEVER confirm without `id`** — if response has no `id`, the write FAILED
3. **ALWAYS use `-H "Prefer: return=representation"`** — forces read-back on every write
4. **NEVER use GET endpoints that don't exist** — `/agents`, `/sessions`, `/usage` = 404
5. **No REST endpoints on gateway** — all task ops go through Supabase REST, not gateway
6. **Service key for writes** — anon key will fail writes due to RLS