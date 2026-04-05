# Agent Roster & Capability Mapping

## 🎯 Primary Agents (NVIDIA Free Tier)

| Agent | Model | Strength | When to Use | Cost |
|-------|-------|----------|-------------|------|
| **Kimi K2** | moonshotai/kimi-k2-instruct | General reasoning, 256k context | Default for everything | Free |
| **DeepSeek-R1** | deepseek-ai/deepseek-r1 | Complex reasoning, math, code analysis | Hard coding problems, system design, debugging | Free |
| **Step 3.5 Flash** | stepfun-ai/step-3.5-flash | Fast, lightweight | Quick responses, chat, simple queries | Free |
| **Phi-4 Mini** | microsoft/phi-4-mini-instruct | Small, efficient | Simple text tasks, quick lookups | Free |

## 🌐 Backup Agents (OpenRouter Free)

| Agent | Model | Strength | When to Use | Cost |
|-------|-------|----------|-------------|------|
| **Qwen 3.6 Plus** | qwen/qwen3.6-plus:free | Good reasoning, free | When NVIDIA is down or rate-limited | Free |

## 🤖 Specialized Agents (Spawn for Heavy Tasks)

| Agent Type | Model | Task |
|------------|-------|------|
| **Code Review** | DeepSeek-R1 | Reviewing PRs, architecture critique |
| **Debug** | DeepSeek-R1 | Error debugging, root cause analysis |
| **Brainstorm** | Qwen 3.6 Plus | Idea generation, planning, PRDs |
| **Quick Chat** | Phi-4 Mini | WhatsApp/Telegram replies, summaries |
| **Research** | Kimi K2 | Web research, documentation |
| **System Design** | DeepSeek-R1 | Architecture, database design |

## 📋 Assignment Strategy

```
Task comes in
├── Simple/Chat → Step 3.5 Flash (fast)
├── General/Default → Kimi K2 (primary)
├── Complex Code → DeepSeek-R1 (spawn agent)
├── Heavy Research → Kimi K2 (256k context)
├── Quick Reply → Phi-4 Mini
├── NVIDIA Rate Limited → Qwen 3.6 Plus (fallback)
└── Mission Control Tasks → Kimi K2 (manage DB)
```

## ⚠️ Important Notes
- All agents use FREE tier (NVIDIA, OpenRouter)
- NVIDIA rate limits: ~100 RPM, monitor 429s
- Qwen context: 200k, max output: 8192
- DeepSeek-R1: reasoning=true, takes longer but more accurate
- Phi-4 Mini: smallest model, use only for simple tasks
- Max 4 concurrent agents, 8 max sub-agents
