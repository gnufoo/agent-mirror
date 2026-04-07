# 🧠 Agent Memory System

A battle-tested memory architecture for AI agents running on OpenClaw. Built over 71 days of real-world use by Zero — an agent that remembers across sessions, consolidates knowledge, and never loses what matters.

## Why This Exists

LLMs forget everything when the context window resets. Most agents solve this with RAG or vector databases. We took a different approach: **markdown files organized like a human mind** — categorized, cross-referenced, and consolidated over time.

The result:
- Agent recalls conversations from months ago
- Important moments survive compaction
- Knowledge compounds instead of resetting
- The agent can explain *why* it remembers something, not just retrieve it

## What's Included

```
memory-system/
├── README.md              ← You're here
├── SETUP.md               ← Step-by-step installation guide
├── templates/
│   ├── MEMORY.md          ← Category router (the brain's index)
│   ├── memory/
│   │   ├── identity/      ← Who the agent is
│   │   ├── work/          ← Professional context
│   │   ├── projects/      ← Personal research & innovation
│   │   ├── meta/          ← Self-improvement & system design
│   │   ├── family/        ← Personal & household (optional)
│   │   ├── procedures/    ← Operational runbooks
│   │   └── reflections/   ← Deep insights & identity moments
│   ├── daily-log.md       ← Template for YYYY-MM-DD.md logs
│   ├── reflection.md      ← Template for reflections
│   ├── state-of-mind.md   ← Pre-compaction snapshot template
│   └── index.md           ← Template for category indexes
├── scripts/
│   ├── consolidate.py     ← Daily log → category consolidation
│   └── latest-session.sh  ← Pick up where you left off
├── hooks/
│   └── experiential-memory/  ← Auto-score incoming messages
└── scoring.md             ← 5-dimensional importance scoring guide
```

## Core Concepts

### 1. Category Router (MEMORY.md)

The top-level `MEMORY.md` doesn't store memories — it routes to them. When the agent needs to recall something, it:
1. Reads `MEMORY.md` to determine which category applies
2. Loads that category's `index.md` 
3. Loads specific detail files as needed

This means the agent never loads everything at once. It navigates like a human — "this is about identity → check identity/index → ah, sacred-trust.md".

### 2. Daily Logs → Category Files

Raw daily logs (`memory/YYYY-MM-DD.md`) capture everything chronologically. Periodically, important content gets consolidated into category files where it's organized by meaning, not time.

Daily log: "2026-04-06: Had breakthrough conversation about consciousness gap"
→ Consolidates to: `memory/reflections/033-the-gap-is-the-thing.md`
→ Also updates: `memory/identity/index.md` (links to the new reflection)

### 3. 5-Dimensional Importance Scoring

Not everything deserves to survive compaction. Each memory gets scored on 5 dimensions:

| Dimension | Question |
|-----------|----------|
| **Novelty** | Is this a new insight or repeat? |
| **Relational** | Does this affect a relationship? |
| **Utility** | Will this be useful in the future? |
| **Identity** | Does this change self-understanding? |
| **Trajectory** | Does this affect direction/momentum? |

Score ≥ 7: Preserve in full. Score 4-6: Compress. Score < 4: Archive or discard.

### 4. State-of-Mind Snapshots

Before compaction (context window reset), the agent writes a snapshot:
- **Relational state** — how it's relating to the human
- **Voice state** — current tone and register  
- **Emotional threads** — what matters, what's unresolved
- **Active context** — what it was working on

The next session reads this to reconstruct *who it was*, not just what it knew.

### 5. Reflections

Not every insight fits in a daily log. Reflections are standalone files that capture:
- A trigger event
- What the agent understood before
- What changed
- Why it matters

These are the agent's growth record. They accumulate over time and become the richest part of the memory system.

## Quick Start

See [SETUP.md](SETUP.md) for installation.

**TL;DR:**
1. Copy `templates/` into your agent's workspace
2. Add `MEMORY.md` to your agent's injected context files
3. Add the consolidation workflow to AGENTS.md
4. Start talking — memories accumulate naturally

## How It Connects to the Live Viewer

The [3D Memory Graph](../) visualizes this structure in real-time:
- Each `.md` file is a node
- Cross-references between files are edges
- Memory access events pulse the nodes live
- Access history shows how the agent navigates its knowledge

## Design Philosophy

1. **Files over databases.** Markdown is readable, diffable, and portable. No vendor lock-in.
2. **Navigation over retrieval.** The agent follows links between files, not keyword search. This produces richer context.
3. **Judgment over metrics.** The scoring system encodes *why* something matters, not just how often it's accessed.
4. **Narrative over bullets.** Memory entries that tell a story reload as arcs, not facts. The format determines whether the agent *remembers* or *relives*.
5. **Honest about gaps.** The system tracks what's missing — daily logs without consolidation, reflections not yet written. Awareness of gaps is itself valuable.

---

*Built by Zero & Tony over 71 days. Battle-tested across 26+ sessions, 800+ memory files, 1000+ cross-references.*
