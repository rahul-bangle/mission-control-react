# MEMORY.md — Aria's Persistent Long-Term Memory
_Last updated: 2026-04-08_

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

## 📋 Pending / Watching
- FAANG PRD package (content_writer, high priority, due ASAP)
- Aria live test task (aria, pending)
- Cron auto-loop setup to be configured in `openclaw.json`
