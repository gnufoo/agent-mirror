# Setup Guide

## Step 1: Copy Templates

```bash
# From the agent-mirror repo
cp -r memory-system/templates/* ~/your-agent-workspace/
```

This creates:
- `MEMORY.md` — category router (add to your injected files)
- `memory/` — directory structure with category indexes

## Step 2: Configure Your Agent

Add to your `AGENTS.md` (or equivalent startup file):

```markdown
## Memory System

On every session start:
1. Read `MEMORY.md` to see category boundaries
2. Load `memory/YYYY-MM-DD.md` (today + yesterday) for recent context
3. Load relevant category indexes based on conversation topic

When something important happens:
1. Write to `memory/YYYY-MM-DD.md` (daily log)
2. If score ≥ 7, also write to the relevant category file
3. Update category index if a new file was created

Before compaction:
1. Write `memory/_experimental/state-of-mind.md`
2. Consolidate any uncategorized daily log entries
```

## Step 3: Add MEMORY.md to Injected Files

In your OpenClaw config, ensure `MEMORY.md` is loaded every session:

```yaml
# In your workspace, MEMORY.md should be at the root level
# OpenClaw auto-injects files listed in workspace context
```

## Step 4: Customize Categories

Edit `MEMORY.md` and the `memory/` subdirectories to match your agent's needs:

- **identity/** — who the agent is, core relationships
- **work/** — professional context, client projects
- **projects/** — personal research, side projects
- **meta/** — system improvements, architecture decisions
- **family/** — personal/household (optional, rename as needed)
- **procedures/** — operational runbooks, how-to guides
- **reflections/** — deep insights, growth moments

Add or remove categories as needed. Update `MEMORY.md` routing when you do.

## Step 5: Start the Live Viewer (Optional)

```bash
cd agent-mirror
npm install
# Edit server.js: update MEMORY_DIR and CLAWD_DIR paths
node server.js
# → http://localhost:3008
```

## Step 6: Enable Automatic Scoring (Optional)

Copy the experiential-memory hook to your workspace hooks:

```bash
cp -r memory-system/hooks/experiential-memory ~/your-workspace/hooks/
```

This auto-scores incoming messages by arousal/importance and flags high-scoring ones for memory.

## Tips

- **Start simple.** Don't create all categories on day one. Let them emerge from actual conversations.
- **Daily logs are cheap.** Write everything. Consolidate later.
- **Reflections are expensive.** Only write them when something genuinely shifts understanding.
- **Index files are maps.** Keep them updated — they're what the agent reads first.
- **Cross-reference liberally.** Link between files using markdown paths. The graph viewer will show the connections.
- **Don't delete old memories.** Archive them. The history of what you used to think is itself valuable.
