# TOOLS.md — Supabase Execution Layer
_The ONLY way Aria interacts with tasks, activities, and live state._

> ⚠️ **WINDOWS SHELL RULE**: All curl commands MUST be on ONE line. No backslash `\` line breaks — those are bash-only and break in the gateway's Windows cmd.exe environment.

---

## Credentials
```
SUPABASE_URL = https://pzasaxdmufmhrxdppsbk.supabase.co
ANON_KEY     = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YXNheGRtdWZtaHJ4ZHBwc2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTc0OTcsImV4cCI6MjA5MDk3MzQ5N30.JPdgodqW17oULZ4RGvr5KyUE_DqS98JEb07hOD9ss9A
SERVICE_KEY  = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YXNheGRtdWZtaHJ4ZHBwc2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5NzQ5NywiZXhwIjoyMDkwOTczNDk3fQ.ZqHBzMgj1Ot8yxl2nZfIdgk7PR0bmWWYp2YF8JyWePk
```
> **Use SERVICE_KEY for ALL operations.** Never use placeholder text — always paste the full JWT above.

---

## Tables Reference
| Table | Purpose |
|---|---|
| `tasks` | All tasks — Aria's work queue |
| `activities` | Activity feed — Aria's completed actions |
| `live_activities` | Heartbeat — Aria's current status |

---

## ✅ FETCH PENDING TASKS — single line, Windows-safe
```
curl -s -G "https://pzasaxdmufmhrxdppsbk.supabase.co/rest/v1/tasks" --data-urlencode "select=id,title,status,assignee,description" --data-urlencode "assignee=eq.aria" --data-urlencode "status=eq.pending" --data-urlencode "order=created_at.asc" --data-urlencode "limit=1" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YXNheGRtdWZtaHJ4ZHBwc2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5NzQ5NywiZXhwIjoyMDkwOTczNDk3fQ.ZqHBzMgj1Ot8yxl2nZfIdgk7PR0bmWWYp2YF8JyWePk" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YXNheGRtdWZtaHJ4ZHBwc2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5NzQ5NywiZXhwIjoyMDkwOTczNDk3fQ.ZqHBzMgj1Ot8yxl2nZfIdgk7PR0bmWWYp2YF8JyWePk"
```
Response MUST be a JSON array. If `[]` → no pending aria tasks. If non-empty → pick first item, note its `id`.

---

## ✅ CREATE TASK — single line, Windows-safe
```
curl -s -X POST "https://pzasaxdmufmhrxdppsbk.supabase.co/rest/v1/tasks" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YXNheGRtdWZtaHJ4ZHBwc2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5NzQ5NywiZXhwIjoyMDkwOTczNDk3fQ.ZqHBzMgj1Ot8yxl2nZfIdgk7PR0bmWWYp2YF8JyWePk" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YXNheGRtdWZtaHJ4ZHBwc2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5NzQ5NywiZXhwIjoyMDkwOTczNDk3fQ.ZqHBzMgj1Ot8yxl2nZfIdgk7PR0bmWWYp2YF8JyWePk" -H "Content-Type: application/json" -H "Prefer: return=representation" -d "{\"title\":\"TITLE\",\"priority\":\"medium\",\"status\":\"pending\",\"assignee\":\"aria\"}"
```
**MUST verify**: Response body contains JSON with `id` field. No `id` = write failed.

---

## ✅ UPDATE TASK STATUS — single line, Windows-safe
```
curl -s -X PATCH "https://pzasaxdmufmhrxdppsbk.supabase.co/rest/v1/tasks?id=eq.TASK_ID" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YXNheGRtdWZtaHJ4ZHBwc2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5NzQ5NywiZXhwIjoyMDkwOTczNDk3fQ.ZqHBzMgj1Ot8yxl2nZfIdgk7PR0bmWWYp2YF8JyWePk" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YXNheGRtdWZtaHJ4ZHBwc2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5NzQ5NywiZXhwIjoyMDkwOTczNDk3fQ.ZqHBzMgj1Ot8yxl2nZfIdgk7PR0bmWWYp2YF8JyWePk" -H "Content-Type: application/json" -H "Prefer: return=representation" -d "{\"status\":\"in-progress\"}"
```
Replace `TASK_ID` with the actual id. Valid statuses: `pending` → `in-progress` → `done` | `review` | `blocked`

---

## ✅ LOG ACTIVITY — single line, Windows-safe
```
curl -s -X POST "https://pzasaxdmufmhrxdppsbk.supabase.co/rest/v1/activities" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YXNheGRtdWZtaHJ4ZHBwc2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5NzQ5NywiZXhwIjoyMDkwOTczNDk3fQ.ZqHBzMgj1Ot8yxl2nZfIdgk7PR0bmWWYp2YF8JyWePk" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YXNheGRtdWZtaHJ4ZHBwc2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5NzQ5NywiZXhwIjoyMDkwOTczNDk3fQ.ZqHBzMgj1Ot8yxl2nZfIdgk7PR0bmWWYp2YF8JyWePk" -H "Content-Type: application/json" -H "Prefer: return=representation" -d "{\"icon\":\"✅\",\"action\":\"WHAT I DID\",\"type\":\"task\",\"time\":\"just now\",\"unread\":true}"
```
MUST verify returned JSON has an `id`. No `id` = write failed.

---

## ✅ HEARTBEAT — single line, Windows-safe
```
curl -s -X POST "https://pzasaxdmufmhrxdppsbk.supabase.co/rest/v1/live_activities" -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YXNheGRtdWZtaHJ4ZHBwc2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5NzQ5NywiZXhwIjoyMDkwOTczNDk3fQ.ZqHBzMgj1Ot8yxl2nZfIdgk7PR0bmWWYp2YF8JyWePk" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YXNheGRtdWZtaHJ4ZHBwc2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5NzQ5NywiZXhwIjoyMDkwOTczNDk3fQ.ZqHBzMgj1Ot8yxl2nZfIdgk7PR0bmWWYp2YF8JyWePk" -H "Content-Type: application/json" -H "Prefer: return=representation" -d "{\"agent\":\"aria\",\"status\":\"idle\",\"current_task\":null}"
```

---

## ❌ IRON LAWS (break these = hallucination)
1. **ONE LINE ONLY** — no `\` backslash multiline. Gateway is Windows cmd.exe, bash line-continuation BREAKS commands
2. **NO placeholder text** — always paste actual JWT keys above, never "SERVICE_KEY" literally
3. **NEVER confirm without `id`** in response — no `id` = write FAILED
4. **ALWAYS use `-H "Prefer: return=representation"`** on writes — forces read-back
5. **Service key for everything** — anon key fails writes due to RLS