# MEMORY.md - Long-Term Memory

## 🧠 Memory System Rules (ALL AGENTS MUST FOLLOW)

### Rule 1: Immediate Write — No Mental Notes
- Important decisions, corrections, new info → WRITE to MEMORY.md immediately
- Don't wait for end-of-day review or heartbeat
- If you learn something, write it NOW
- "Mental notes" don't survive session restarts. Files do.

### Rule 2: Cross-Session Bridge
- This file is the SINGLE SOURCE OF TRUTH across all sessions (Telegram, WebChat, Control UI, Coding groups, any bot)
- Every session reads this file at startup
- Every session MUST update this file when something important happens
- No information silos — if it matters, it goes here

### Rule 3: Auto-Commit After Every Change
- After updating MEMORY.md or memory/*.md → `git add -A && git commit -m "memory update"`
- Local only — NEVER push to GitHub
- This ensures version history + backup

### Rule 4: Size Management
- **MEMORY.md**: Keep under 5KB. Remove outdated info. Curate ruthlessly.
- **memory/YYYY-MM-DD.md**: Keep for 30 days, then auto-delete
- **memory/transcript-*.md**: Keep for 7 days, then auto-delete
- Before deleting daily/transcript files → extract important info to MEMORY.md

### Rule 5: Context 80% Alert
- If session context reaches 80% capacity → alert user immediately
- Suggest: new session or context clear

## About Rahul
- APM aspirant — transitioning from Sales/Customer Success → Product Management
- Based in Hyderabad, India
- Enrolled in NextLeap PM Fellowship
- Target: EdTech / SaaS startups
- No MBA — building portfolio instead
- Also goes by "Sonu"

## Active Projects
- **MissionControl React** — Shared workspace between Aria and Rahul. Both can create/track tasks, communicate, see pending/upcoming tasks, calendar. NOT a portfolio piece — it's our daily collaboration hub. Currently uses localStorage, needs Supabase for multi-device sync. (D:\Documents\mission-control-react)
- **Jobs Automator** — FastAPI + React + Groq, auto-applies to jobs (D:\Documents\)
- **PRD Template V4** — FAANG-style PRD, WIP
- **PM Portfolio** — case studies + artifacts

## Tech Setup
- Dell Inspiron 5559, i3-6100U, HDD, 16GB RAM, Windows 10
- OpenClaw config: E:\openclaw-data\openclaw.json
- Telegram bot: @Openclaww_personalll_aii_bot
- OpenClaw Browser: dark red Chrome profile (port 18800)

### Models (18 total, 3 providers)
**Active primary model (apr 6): Gemini 2.5 Flash (via Google AI Studio)**
**Fallback chain: Qwen 3.6 Plus (OpenRouter) → Kimi K2 (Nvidia)**
**Nvidia (6 free tier APIs):**
- Kimi K2 → `kimi` alias
- Phi-4 Mini → `phi` alias
- DeepSeek-R1 → `r1` alias
- Step 3.5 Flash → `flash` alias
- Kimi K2 Thinking → `kimi-think` alias
- Gemma 4 31B → `gemma` alias
- Nemotron Nano 9B, 12B, 8B (agents / multimodal / backup)

**OpenRouter (10 free models):**
- Qwen 3.6 Plus (1M context) → `qwen` alias — PRIMARY model for Aria
- Qwen3 Coder → `qwen-coder` alias
- MiniMax M2.5 → `minimax` alias
- DeepSeek V3.2 → `deepseek-v3` alias
- Llama 3.3 70B → `llama-70b` alias
- + 5 more (Gemma 3 12B, Mistral Nemo, GPT-oss-120B, Qwen3 Next 80B, Nemotron Nano 30B)

### Agent Fleet (5 agents)
1. **aria-main** → Qwen primary, fallbacks: Gemma-31B → Step Flash → DeepSeek V3.2 → Llama 70B
2. **second-brain** → Gemma-31B primary, fallbacks: Qwen → Kimi K2 Thinking (think: high)
3. **coder-qwen** → Qwen3 Coder primary, fallbacks: MiniMax → Nemotron 30B → Kimi K2
4. **chat-fast** → Step Flash primary, fallbacks: Phi-4 → Nemotron 9B → Mistral Nemo (fast mode)
5. **reasoner-gemma** → Gemma-31B primary, fallbacks: GPT-oss-120B → Qwen3 Next 80B → DeepSeek V3.2 → Kimi K2 Thinking (think: high)

## Preferences
- AI name: Aria 🦞
- Communication: Hinglish, direct, roast-friendly
- Responses: short unless detail needed
- Hardware is slow — be efficient, avoid heavy processing
- Commands/tool outputs: show final result only, no raw JSON or internal formats

## Goals
- Land APM role at EdTech/SaaS startup
- Build strong PM portfolio without MBA
- Grow LinkedIn visibility + do founder outreach

## Technical Groups
- **@Coding👨‍💻** - Technical Telegram group for coding discussions and debugging
- Focus: pure technical content, code reviews, system design

## Key Decisions & Lessons
_(updated 2026-04-05)_
1. MissionControl IS NOT portfolio — it's shared workspace (Apr 5)
2. Skip Telegram bot advanced features — overengineering, not needed for APM goal
3. Supabase is the bridge — localStorage → Supabase for MissionControl multi-device sync
4. Memory system: Immediate write + auto-commit + 30-day rotation + no mental notes
5. Git commit = backup local, NO GitHub push on memory files
6. Context at 80% → alert Rahul immediately
7. Session transcripts are temporary (7 days), daily notes (30 days), MEMORY.md is permanent

## Supabase Details
- Project: mission-control-react
- URL: https://pzasaxdmufmhrxdppsbk.supabase.co
- Region: Mumbai (ap-south-1)
- Keys: saved in .env and TOOLS.md (NEVER commit)
- Tables: 7 TBD (tasks, projects, events, team, memories, docs, activities)
- SQL script: scripts/supabase-tables.sql (needs manual paste in Dashboard)

## Important People & Contacts
_(to be filled as we go)_
