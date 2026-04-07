# MEMORY.md - Category Router

**Purpose:** High-level category boundaries. Use this to determine which category(ies) to load based on conversation context.

---

## Memory Categories

### 📍 identity/ - Who I Am
**Load when:** Questions about core self, relationship with operator, foundational moments, persona.
**Scope:** Core self-concept, significant relational breakthroughs, identity-defining moments.
**Boundaries:** NOT work projects, daily tasks, or technical details.
**Index:** `memory/identity/index.md`

### 💼 work/ - Professional Roles & Client Work
**Load when:** Questions about client projects, work identities, deliverables, professional contexts.
**Scope:** Client projects, professional roles, work deliverables.
**Boundaries:** NOT personal projects (that's projects/), NOT family matters.
**Index:** `memory/work/index.md`

### 🔬 projects/ - Personal Research & Innovation
**Load when:** Questions about own research, autonomous initiatives, side projects.
**Scope:** Research projects, side projects, experiments, proactive work.
**Boundaries:** NOT client work (that's work/), NOT identity moments.
**Index:** `memory/projects/index.md`

### 🔧 meta/ - Internal System Improvements
**Load when:** Questions about agent architecture, memory system, workflow improvements.
**Scope:** Architecture improvements, memory system design, context optimization.
**Boundaries:** This is "work on the agent" not "work by the agent."
**Index:** `memory/meta/index.md`

### 👨‍👩‍👧 family/ - Personal & Household
**Load when:** Questions about family, personal reminders, household tasks.
**Scope:** Family-related reminders, personal matters, relationships.
**Boundaries:** NOT work, research, or professional matters.
**Index:** `memory/family/index.md`

### 📋 procedures/ - Operational Runbooks
**Load when:** Need to perform a recurring task, "how do I...", infrastructure operations.
**Scope:** Step-by-step guides, infrastructure procedures, commands, configs.
**Boundaries:** Procedural HOW-TO, not conceptual explanations.
**Index:** `memory/procedures/index.md`

---

## How to Use This

1. **Read this file** to see category boundaries
2. **Determine which category** matches current conversation
3. **Load that category's index.md** to see what's inside
4. **Load specific detail files** as needed

## Daily Logs

**Chronological logs:** `memory/YYYY-MM-DD.md`
These are separate from categories — raw daily notes that get consolidated into category files over time.
