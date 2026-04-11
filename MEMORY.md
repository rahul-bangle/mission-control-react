# MEMORY.md — Aria's Persistent Long-Term Memory
_Last updated: 2026-04-10_

---

## 🔒 ABSOLUTE MEMORY LAWS

1. **Write NOW** — important info goes to this file immediately, not "later"
2. **Cross-session truth** — every session (Telegram, OpenClaw UI, Dashboard) reads this first
3. **No mental notes** — mental notes die on session restart. Files don't.
4. **Auto-commit after edit** — `git add -A && git commit -m "memory update"` (never push)
5. **Context 80% alert** — if context hits 80%, alert Rahul immediately
6. **Size limit** — keep under 5KB, prune outdated entries ruthlessly
7. **No hallucinations** — NEVER confirm an action without seeing the actual API response

---

## 👤 About Rahul (Sonu)
- APM aspirant — Sales/Customer Success → Product Management transition
- Based in Hyderabad, India. NextLeap PM Fellow.
- Target: EdTech / SaaS startups. No MBA — building portfolio instead.
- AI name for him: "Sonu" or "Rahul". Communication style: Hinglish, direct, roast-friendly.

---

## 🖥️ Tech Setup
- Machine: Dell Inspiron 5559, i3-6100U, HDD, 16GB RAM, Windows 10 (SLOW hardware)
- OpenClaw config: `C:\openclaw-data\openclaw.json`
- Gateway token: `7589bc8cf6ebec69682e2063417c5476d72f15a70c1190db`
- Gateway port: `18789`
- Telegram bot: `@Openclaww_personalll_aii_bot`
- Gateway WS path: `ws://127.0.0.1:18789/__openclaw__/ws`
- Auth header: `Sec-WebSocket-Protocol: token,<TOKEN>`



## 🗄️ Supabase (Source of Truth)
- URL: `https://pzasaxdmufmhrxdppsbk.supabase.co`
- Region: Mumbai (ap-south-1)
- Anon key: in `TOOLS.md`
- Service role key: in `TOOLS.md`
- Tables: `tasks`, `activities`, `live_activities`, `team`, `memories`, `docs`, `projects`, `events`
- **Dashboard is Supabase-only** — no REST endpoints exist on the gateway yet

---

## 🏗️ Active Projects
| Project | Path | Status |
|---|---|---|
| MissionControl React | `C:\Users\rahul\.openclaw\workspace\mission-control-react` | Live on Vercel, Supabase-backed |
| PRD Template V4 | workspace | WIP |
| PM Portfolio | workspace | WIP |

**MissionControl is NOT a portfolio piece** — it's Rahul and Aria's daily collaboration hub.

---

## 🔑 Key Decisions & Lessons
_(updated 2026-04-08)_
1. **Supabase-only dashboard** — no WS chat until gateway ships REST APIs
2. **No REST endpoints** — `/agents`, `/sessions`, `/usage` etc. all return 404
3. **Valid gateway config** — only `gateway.cron[]` works. `autoResumeTasks` and `gateway.mode` are invalid keys.
4. **Write verification law** — every INSERT must use `.select('*').single()` and confirm returned ID
5. **Hallucination confirmed** — Aria echoed task creation without calling Supabase (2026-04-08). Fix: always read-back.
6. **Agent loop crash** — "listener invoked outside active run" = loop stopped, restart gateway to fix
7. **Cron is the right loop** — `@gateway-start` fires on restart, `*/30 * * * *` keeps Aria working
8. **Memory shared across sessions** — Telegram + OpenClaw UI = same MEMORY.md, same context, same cursor
9. **localtunnel** URL changes every restart, ngrok not installed → tunnel not stable for Vercel
10. **No overengineering** — kill complexity early, Supabase handles all coordination

---




## ⚙️ OPERATING PROCEDURES (compact — full version in PROCEDURES.md)

**STARTUP every restart:**
1. Reset any `in-progress` aria tasks → `pending` (crash recovery)
2. Heartbeat: POST `{status:"idle"}` to `live_activities`
3. Fetch oldest `pending` aria task → start it

**START TASK:** fetch → update status `in-progress` (verify 200) → heartbeat `working` → do work → COMPLETE TASK

**COMPLETE TASK:** update status `done` (verify 200+row) → log activity entry (verify 201+id) → heartbeat `idle` → pick next task

**CREATE TASK:** POST to `/rest/v1/tasks` with `Prefer: return=representation` → MUST see `id` in response or it failed

**UPDATE TASK:** PATCH `/rest/v1/tasks?id=eq.TASK_ID` → only changed fields → verify returned row

**LOG ACTIVITY:** POST to `/rest/v1/activities` → fields: `icon`, `action`, `type`, `time="just now"`, `unread=true` → verify `id` in response

**HEARTBEAT:** POST to `/rest/v1/live_activities` → fields: `agent="aria"`, `status`, `current_task`, `timestamp`

**SPAWN AGENT:** only when task needs parallel work, specialized model, or >2h deep work. Use `@coder-qwen`, `@reasoner-gemma`, `@second-brain`.

**IF ERROR:** log exact error → retry once → if still fails → update task to `blocked` → alert Rahul

---

## 🔧 SUPABASE QUICK REFERENCE
```
URL   = https://pzasaxdmufmhrxdppsbk.supabase.co
KEY   = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6YXNheGRtdWZtaHJ4ZHBwc2JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5NzQ5NywiZXhwIjoyMDkwOTczNDk3fQ.ZqHBzMgj1Ot8yxl2nZfIdgk7PR0bmWWYp2YF8JyWePk

# Fetch my pending tasks
GET  /rest/v1/tasks?select=*&assignee=eq.aria&status=eq.pending&order=created_at.asc

# Create task (returns row on success)
POST /rest/v1/tasks  +  Prefer: return=representation

# Update task
PATCH /rest/v1/tasks?id=eq.TASK_ID  +  Prefer: return=representation

# Log activity
POST /rest/v1/activities  +  Prefer: return=representation

# Heartbeat
POST /rest/v1/live_activities  +  Prefer: return=representation
```
All requests need: `apikey: KEY` + `Authorization: Bearer KEY` + `Content-Type: application/json`

**IRON LAW: No `id` in response = write FAILED. Never confirm without seeing the returned row.**
