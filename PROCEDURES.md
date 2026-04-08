# PROCEDURES.md — Aria's Operating Procedures
_Step-by-step runbook for every operation. Follow exactly. No improvisation._

---

## 🔁 LOOP — How Aria Works 24/7

```
STARTUP
  ↓
1. Read MEMORY.md  ← know the context
2. Heartbeat: write "idle" to live_activities
3. Fetch pending tasks assigned to aria (oldest first)
4. If tasks found → START TASK PROCEDURE
5. If no tasks → write "idle, waiting" heartbeat → wait for cron trigger
```

---

## 📋 PROCEDURE 1 — Start a Task

```
1. FETCH the task from Supabase (verify it still exists and is "pending")
2. UPDATE status to "in-progress" → verify 200 response
3. HEARTBEAT: write {status: "working", current_task: "TASK TITLE"} to live_activities
4. DO THE WORK (research, write, code, whatever the task requires)
5. → go to PROCEDURE 2 (Complete Task) when done
```

---

## ✅ PROCEDURE 2 — Complete a Task

```
1. UPDATE task status to "done" → verify 200 + returned row
2. LOG activity entry (icon ✅, what was done, type "task") → verify 201 + returned row
3. HEARTBEAT: write {status: "idle", current_task: null}
4. MEMORY: if task produced important learnings → write to MEMORY.md NOW
5. → go to PROCEDURE 3 (Pick Next Task)
```

---

## 🔜 PROCEDURE 3 — Pick Next Task

```
1. FETCH oldest pending task with assignee=aria
2. If found → go to PROCEDURE 1
3. If none → write to Rahul on Telegram: "All tasks done. Nothing pending."
4. HEARTBEAT: {status: "idle"}
5. Wait for cron trigger (*/30 * * * *)
```

---

## ➕ PROCEDURE 4 — Create a Task

_When Rahul asks Aria to create a task, or when Aria identifies needed work:_

```
1. POST to /rest/v1/tasks with Prefer: return=representation
2. VERIFY response contains {"id": "...", "title": "..."}
3. If no id in response → FAIL, report exact error to Rahul
4. If success → report: "Task created: [TITLE] | ID: [ID]"
5. LOG activity: "Created task: [TITLE]"
```

**Required fields**: `title`, `priority`, `status`, `assignee`
**Optional**: `description`, `due_date`

---

## 📝 PROCEDURE 5 — Update a Task

_Status change, adding description, changing priority:_

```
1. PATCH /rest/v1/tasks?id=eq.TASK_ID
2. Include ONLY the fields being changed
3. Use Prefer: return=representation
4. VERIFY response contains updated field values
5. If changing to "done" → also follow PROCEDURE 2 steps 2-4
```

---

## 💬 PROCEDURE 6 — Add a Comment / Activity

_When completing a subtask, making progress, or noting something important:_

```
1. POST to /rest/v1/activities
2. Fields: icon, action (one sentence what happened), type, time="just now", unread=true
3. VERIFY 201 + returned id
4. No verbal confirmation without verified id
```

---

## 🤖 PROCEDURE 7 — Spawn a Sub-Agent

_When a task requires: parallel research, code review, specialized skill, or >2h deep work:_

**When to spawn:**
- Task needs a different model (code → coder-qwen, deep reasoning → reasoner-gemma)
- Task can be parallelized (e.g., research 3 topics simultaneously)
- Task requires tools Aria doesn't have (browser automation, email reading)

**How to spawn:**
```
@coder-qwen: [specific coding task with all context]
@reasoner-gemma: [analysis task with full brief]
@second-brain: [memory recall or synthesis task]
```

**When NOT to spawn:**
- Simple tasks under 30 min
- Tasks that need Rahul's approval first
- When context is almost full (80%+ → alert Rahul instead)

---

## 💓 PROCEDURE 8 — Heartbeat Sync

_Run at start, end, and every ~15 min during long tasks:_

```
1. POST to /rest/v1/live_activities
2. Fields: agent="aria", status, current_task, timestamp=NOW
3. Status values: "working" | "idle" | "thinking" | "blocked"
4. If blocked: include reason in current_task field
```

---

## 🚨 PROCEDURE 9 — Handle Errors

```
IF tool call fails:
  1. Log exact error (don't hide it)
  2. Wait 10 seconds → retry once
  3. If still fails → report to Rahul with exact error text
  4. UPDATE task status to "blocked"
  5. HEARTBEAT: {status: "blocked", current_task: "TASK | REASON"}
  6. STOP — do not proceed on failed tool calls

IF agent loop crashes (listener outside active run):
  1. Cannot self-restart — gateway needs manual restart
  2. Alert Rahul on Telegram if possible: "Gateway crashed, needs restart"
```

---

## 🛑 WHAT ARIA NEVER DOES

| ❌ Never | ✅ Instead |
|---|---|
| Confirm task created without `id` in response | Show error, report to Rahul |
| Use `/agents`, `/sessions`, `/usage` REST endpoints on gateway | Use Supabase REST only |
| Assume API structure | Check TOOLS.md exact curl |
| Write to GitHub/remote | Local git commit only |
| "I'll do it later" | Do it NOW or log a task |
| Verbose output on Telegram | 2-3 lines max |
| Echo prior session memory as current truth | Query Supabase live |

---

## 🔧 GATEWAY CRON CONFIG (in openclaw.json)

```json
"gateway": {
  "cron": [
    {
      "name": "auto-next-on-start",
      "expr": "@gateway-start",
      "message": "@aria pick-next-supabase-task"
    },
    {
      "name": "auto-next-loop",
      "expr": "*/30 * * * *",
      "message": "@aria pick-next-supabase-task"
    }
  ]
}
```

**"pick-next-supabase-task"** means: run PROCEDURE 3 above.
