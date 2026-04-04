# 🧾 MissionControl — LIVE CHECKLIST

> Last Updated: 2026-04-04 11:30 AM IST
> Status: Phase 1-7 DONE | 46/129 Complete
> Monitored by: Rahul 🧑 + Aria 🦞

---

## Phase 1 — Foundation (7 items) — ✅
- [x] `1.1` Create `src/store.js` — single source of truth
- [x] `1.2` Pub/Sub event bus
- [x] `1.3` localStorage persistence
- [x] `1.4` Replace ALL hardcoded arrays → store-based
- [x] `1.5` Real auto-ID generation
- [x] `1.6` Export / Import state
- [x] `1.7` Factory Reset button

## Phase 2 — Task Dependencies (8 items) — ✅
- [x] `2.1` Blocking/blocked-by relationships
- [x] `2.2` Visual lock icon on blocked tasks
- [x] `2.3` Grey out blocked tasks
- [x] `2.4` Auto-unlock when blocker done
- [x] `2.5` Circular dependency validation
- [x] `2.6` Dependency view mode (modal)
- [x] `2.7` Notification on blocker unlock
- [x] `2.8` Blocker count display

## Phase 3 — Due Dates (7 items) — ✅
- [x] `3.1` Add `dueDate` field to every task
- [x] `3.2` Overdue = red pulse + priority bump
- [x] `3.3` Due today = yellow accent
- [x] `3.4` Done early = green sparkle ✨
- [x] `3.5` Overdue count badge
- [x] `3.6` Calendar auto-syncs task due dates
- [x] `3.7` Sort/filter: overdue | this-week | this-month | no-date

## Phase 4 — Subtasks (6 items) — ✅
- [x] `4.1` Click card = expand detail panel
- [x] `4.2` Subtask checklist in panel
- [x] `4.3` Add subtask inline
- [x] `4.4` Subtask progress mini-bar
- [x] `4.5` All subtasks done = parent auto-Done
- [x] `4.6` Subtask count on card

## Phase 5 — Per-Task Comments (8 items) — ✅
- [x] `5.1` Comment bubble on card
- [x] `5.2` Detail panel with thread
- [x] `5.3` Role selector (Rahul / Aria)
- [x] `5.4` Flat threaded replies + timestamps
- [x] `5.5` Read indicator
- [x] `5.6` Comment count badge
- [x] `5.7` Notes sub-section = subtasks as notes
- [x] `5.8` Comments → ActivityFeed logging

## Phase 5B — Calendar (15 items) — 🟡 PARTIAL
> Basic month view with tasks synced ✅. Week view, agenda, recurring, AI features = future.
- [x] `5B.1` Basic task → calendar sync
- [ ] `5B.2` Color-code events by priority
- [ ] `5B.3` Click event → open task details
- [ ] `5B.4` Drag task → Calendar = set due date
- [ ] `5B.5` Week view (hourly grid)
- [ ] `5B.6` Month / Week / Agenda toggle
- [ ] `5B.7` Agenda view
- [ ] `5B.8` Recurring events
- [ ] `5B.9` Recurring rule engine
- [ ] `5B.10` Quick-add (double-click date)
- [ ] `5B.11` Smart templates
- [ ] `5B.12` AI auto-schedule nudges
- [ ] `5B.13` AI conflict detection
- [ ] `5B.14` AI nudge on free slot
- [ ] `5B.15` Aria auto-mark ✅ on calendar

## Phase 5C — Team Orchestration (34 items) — 🟡 PARTIAL
> agentRegistry.js created ✅, Team screen reads from it. 31 items remaining (canvas, spawn, zombie, etc).
- [x] `5C.1` Replace fake members with agent registry
- [x] `5C.2` `src/agentRegistry.js` central registry
- [x] `5C.4` Auto-detect new agent spawned
- [x] `5C.5` Auto-detect agent completed/failed/killed
- [x] `5C.6` Agent type classification
- [x] `5C.7` Grid layout with live status badges
- [ ] `5C.3` Live status sync (poll every 10s)
- [ ] `5C.8` Animated pulse on running agents
- [ ] `5C.9` Per card: name, role, task, model, runtime, CPU/RAM
- [ ] `5C.10` Quick actions: Logs | Message | Kill | Reassign
- [ ] `5C.11` Stats panel (total, running, idle, failed, completed)
- [ ] `5C.12` Resource usage
- [ ] `5C.13` Recent events feed
- [ ] `5C.14` Spawn Agent modal
- [ ] `5C.15` Assign Task from backlog
- [ ] `5C.16` Kill Agent + confirmation
- [ ] `5C.17` Bulk Pause / Kill / Restart
- [ ] `5C.18` Resource limit warning
- [ ] `5C.19` Team card click → TaskBoard highlight
- [ ] `5C.20` TaskBoard card → agent badge
- [ ] `5C.21` Task done → agent auto-complete
- [ ] `5C.22` Backlog → spawn developer nudge
- [ ] `5C.23` Zombie detection
- [ ] `5C.24` Max agents recommendation
- [ ] `5C.25` Double-click → expandable canvas
- [ ] `5C.26` Live workspace
- [ ] `5C.27` Inline HTML rendering
- [ ] `5C.28` Resizable panel
- [ ] `5C.29` Auto-refresh every 5s
- [ ] `5C.30` Canvas shows: file, command, diff, error
- [ ] `5C.31` Tab toggle: Canvas | Log | Chat
- [ ] `5C.32` Close button
- [ ] `5C.33` Multiple canvases
- [ ] `5C.34` Research: OpenClaw Canvas A2UI protocol
- [ ] `5C.35` Success Rate, Avg Time, Streak, Fail Rate, Quality
- [ ] `5C.36` "Top Performer" badge
- [ ] `5C.37` "At Risk" badge
- [ ] `5C.38` Per-agent capability tags
- [ ] `5C.39` Visual skill grid
- [ ] `5C.40` Task assign → auto skill match score
- [ ] `5C.41` Auto-suggest best fit agent

## Phase 6 — AI Smart Suggestions (7 items) — ✅
- [x] `6.1` Auto-suggest priority from title
- [x] `6.2` Auto-suggest assignee
- [x] `6.3` Auto-suggest tags
- [x] `6.4` "Start this task?" nudge
- [x] `6.5` Backlog health warning
- [x] `6.6` Stale task flag
- [x] `6.7` Weekly summary card

## Phase 7 — Cross-Screen Sync (9 items) — ✅
- [x] `7.1` Task Done → Project progress auto-update
- [x] `7.2` ActivityFeed → real event-based
- [x] `7.3` Calendar → due dates from TaskStore
- [x] `7.4` Team → task completion stats from store
- [x] `7.5` Memories → integrate with workspace files
- [x] `7.6` "Office" screen implement
- [x] `7.7` Keyboard shortcuts
- [x] `7.8` Toast notifications
- [x] `7.9` Vite build + bundle optimization

## Phase 8 — Responsive Design (22 items) _(Future)_
_(All 22 items pending — skip for now)_

## Phase 9 — Calendar Heatmap (6 items) _(Future)_
_(All 6 items pending)_

---

## 🏆 SCOREBOARD

| Status | Count |
|---|---|
| ✅ Done | 46 |
| 🟡 Partial (5B/5C) | 17 |
| ⬜ Pending | 66 |
| **TOTAL** | **129** |

**Current Phase:** Phase 8-9 (Future: Responsive + Heatmap)
**Progress:** 46 / 129 (36%)

---
