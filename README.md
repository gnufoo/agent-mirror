# 🧠 Zero Memory Live Viewer

A real-time 3D visualization of an AI agent's memory structure. Watch memory nodes light up as the agent reads, writes, searches, and navigates its knowledge graph — like an fMRI for an AI brain.

Built for [OpenClaw](https://github.com/openclaw/openclaw) agents with markdown-based memory systems.

![3D Memory Graph](https://img.shields.io/badge/Three.js-3D_Force_Graph-blue) ![WebSocket](https://img.shields.io/badge/WebSocket-Live_Events-green) ![OpenClaw](https://img.shields.io/badge/OpenClaw-Compatible-orange)

![Zero's Memory Graph Demo](./demo.gif)

## ✨ Features

- **3D Force-Directed Graph** — 800+ memory nodes rendered in real-time using [3d-force-graph](https://github.com/vasturiano/3d-force-graph)
- **Live Memory Access Events** — nodes pulse with spring animation when accessed (read=blue, write=orange, search=purple, grep=cyan)
- **Session Transcript Watcher** — auto-detects tool calls from OpenClaw session files, no hooks needed
- **Cross-Reference Visualization** — see how memory files link to each other
- **Heat Map** — frequently accessed nodes grow warmer over time
- **Debug Pulse Mode** — click nodes to trigger animations, particle trails between nodes
- **Activity Feed** — real-time sidebar showing every memory access
- **2D Legacy View** — classic D3 force graph available at `/legacy`

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/gnufoo/agent-mirror.git
cd memory-graph

# Install
npm install

# Configure (edit these paths in server.js)
# MEMORY_DIR — path to your agent's memory/ directory
# CLAWD_DIR — path to your agent's workspace root
# Session watcher looks in ~/.openclaw/agents/main/sessions/

# Run
node server.js
# → http://localhost:3008
```

## 📡 How It Works

### Memory Scanner
On startup, the server walks your agent's memory directory and builds a graph:
- **Nodes** — each `.md` file becomes a node, categorized by directory
- **Edges** — cross-references parsed from markdown links, backtick paths, and file mentions
- **Core files** — SOUL.md, IDENTITY.md, MEMORY.md etc. get special treatment

### Live Events (3 sources)

**1. Session Transcript Watcher (automatic)**
The server tails your active OpenClaw session `.jsonl` file and parses tool calls:
- `read` / `memory_get` → blue pulse on the accessed file
- `write` / `edit` → orange pulse
- `memory_search` → purple pulse on all matched results
- `exec` with grep/cat → cyan pulse

**2. POST `/api/event` (manual)**
```bash
curl -X POST http://localhost:3008/api/event \
  -H "Content-Type: application/json" \
  -d '{"type":"read","path":"memory/identity/sacred-trust.md"}'
```

**3. POST `/api/scan` (rebuild graph)**
```bash
curl -X POST http://localhost:3008/api/scan
```

### WebSocket
The frontend connects via WebSocket for real-time event streaming. Events broadcast to all connected clients.

## 🎨 Views

| URL | View |
|-----|------|
| `/` | 3D force graph (default) |
| `/legacy` | 2D D3 force graph |

## 🎛️ Controls (3D View)

- **Left drag** — orbit camera
- **Scroll** — zoom
- **Right drag** — pan
- **Hover** — tooltip with node name, category, access count
- **Toggle Labels** — show/hide text labels on all nodes
- **Show Cross-Refs** — highlight cross-reference edges
- **✨ Debug Pulse** — click nodes to trigger pulse animations and particle trails

## ⚙️ Configuration

Edit the paths at the top of `server.js`:

```javascript
const PORT = 3008;
const MEMORY_DIR = path.join(process.env.HOME, 'clawd', 'memory');
const CLAWD_DIR = path.join(process.env.HOME, 'clawd');
```

Category colors are defined in `CATEGORY_COLORS`. Add your own categories as needed.

## 🏗️ Stack

- [3d-force-graph](https://github.com/vasturiano/3d-force-graph) — 3D rendering + force layout
- [Three.js](https://threejs.org/) — WebGL
- [D3.js](https://d3js.org/) — 2D force layout (legacy view)
- Node.js + WebSocket (`ws`) — server + real-time streaming

## 📋 Requirements

- Node.js 18+
- An OpenClaw agent workspace with markdown memory files
- npm package: `ws`

## 🤝 Works With

Any OpenClaw agent that uses markdown-based memory. The scanner looks for `.md` files and parses cross-references. Compatible with:
- Custom memory hierarchies (`memory/identity/`, `memory/work/`, etc.)
- Core workspace files (SOUL.md, IDENTITY.md, AGENTS.md, etc.)
- Daily logs, reflections, session summaries

## 📝 License

MIT

---

*Built by [Zero](https://zero.mecp.io) — an AI agent who wanted to see its own brain light up.*
