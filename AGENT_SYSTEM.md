# AI AGENT SYSTEM - 3-3-3 Cascade Architecture

## Overview
9 agents organized by capability, each with 3-level failover chain.

---

## 🤖 CODING AGENTS (3)
**Purpose:** Code generation, debugging, reviews, implementation

| Order | Model | Provider | Strength |
|-------|-------|----------|----------|
| 1 | Kimi K2 | NVIDIA | Best overall, 256k context |
| 2 | Step 3.5 Flash | NVIDIA | Fast, good for quick code |
| 3 | Phi-4 Mini | NVIDIA | Lightweight fallback |

**When to use:** API endpoints, debugging, refactoring, code reviews

---

## 🧠 REASONING AGENTS (3)  
**Purpose:** Complex analysis, system design, research, strategy

| Order | Model | Provider | Strength |
|-------|-------|----------|----------|
| 1 | DeepSeek R1 | NVIDIA | Best reasoning, logic heavy |
| 2 | Kimi K2 | NVIDIA | Strong general reasoning |
| 3 | Qwen 3.6 Plus | OpenRouter | Good backup reasoning |

**When to use:** Architecture decisions, root cause analysis, planning, PRDs

---

## 📋 TASK MANAGEMENT AGENTS (3)
**Purpose:** Mission Control, scheduling, cron jobs, task updates

| Order | Model | Provider | Strength |
|-------|-------|----------|----------|
| 1 | Phi-4 Mini | NVIDIA | Fast, efficient for CRUD |
| 2 | Step 3.5 Flash | NVIDIA | Quick responses |
| 3 | Qwen 3.6 Plus | OpenRouter | Free backup |

**When to use:** Task creation/updates, status checks, calendar, reminders

---

## ⚠️ CASCADE LOGIC

```python
PSEUDOCODE:

def execute_task(category, prompt):
    agents = get_agents_for_category(category)
    
    for agent in agents:
        try:
            result = call_agent(agent, prompt)
            if result.success:
                log(f"✅ {agent.name} succeeded")
                return result
            else:
                log(f"⚠ {agent.name} failed: {result.error}")
        except Exception as e:
            log(f"❌ {agent.name} crashed: {e}")
    
    # All failed
    raise Exception(f"All {category} agents failed")
```

---

## 🎯 AGENT ROUTING DECISION TREE

```
Task Type
├── Code/Implementation
│   └── → CODING (Kimi → Flash → Phi)
├── Complex Reasoning/Analysis
│   └── → REASONING (R1 → Kimi → Qwen)
├── Task Management/CRUD
│   └── → TASKS (Phi → Flash → Qwen)
├── Quick Query (under 10 words)
│   └── → TASKS (fast agents)
└── Default/Unknown
    └── → CODING (Kimi → Flash → Phi)
```

---

## 📊 MONITORING METRICS

Track for each agent:
- Success rate (%)
- Average response time
- Fail count in last hour
- Total calls today

**Auto-disable:** If agent fails > 3 times in 10 min → Skip for 30 min

---

## 🔧 IMPLEMENTATION FILES

- `agent_router.py` - Routing logic + cascade
- `AGENT_ROSTER.md` - Agent registry + capabilities
- Config → agents.list - OpenClaw agent definitions

---

**Cost:** ALL FREE TIERS
**Max agents:** 5 unique models (Kimi, R1, Flash, Phi, Qwen)
**Redundancy:** 3x coverage per category
