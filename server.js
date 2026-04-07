const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const PORT = 3008;
const STATIC = __dirname;
const MEMORY_DIR = path.join(process.env.HOME, 'clawd', 'memory');
const CLAWD_DIR = path.join(process.env.HOME, 'clawd');

const CORE_FILES = [
  'MEMORY.md', 'SOUL.md', 'IDENTITY.md', 'AGENTS.md', 'TOOLS.md', 'USER.md',
  'HEARTBEAT.md', 'BOOT.md', 'AUTONOMY.md', 'COMMUNICATION.md', 'LEARNING.md',
  'LINEAGE.md', 'MODEL_CALIBRATION.md', 'POLICIES.md', 'PROJECT_STATUS.md',
  'REFERENCE.md', 'TASTE.md', 'TRAINING_MANIFEST.md', 'HEARTBEAT_FULL.md',
  'OPENCLAW-MIGRATION.md'
];

const CATEGORY_COLORS = {
  identity: '#ff6b6b',
  work: '#4ecdc4',
  projects: '#45b7d1',
  meta: '#96ceb4',
  family: '#dda0dd',
  procedures: '#f7dc6f',
  reflections: '#ff8c42',
  daily: '#7c7cbf',
  'nova-letters': '#e8a0bf',
  core: '#ffffff',
  sessions: '#6a9fb5',
  'meeting-briefs': '#c9b1ff',
  audit: '#82ca9d',
  'satisfaction-insights': '#f9a825',
  backups: '#78909c',
  _archive: '#546e7a',
  _experimental: '#ab47bc',
  '.dreams': '#e040fb',
};

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
};

// --- Scanner ---

function walkDir(dir) {
  let results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(walkDir(fullPath));
      } else if (entry.name.endsWith('.md')) {
        results.push(fullPath);
      }
    }
  } catch (e) { /* skip unreadable dirs */ }
  return results;
}

function fileSizeCategory(bytes) {
  if (bytes > 10000) return 12;
  if (bytes > 5000) return 10;
  if (bytes > 2000) return 8;
  if (bytes > 500) return 6;
  return 5;
}

function getCategoryFromPath(filePath) {
  const rel = path.relative(MEMORY_DIR, filePath);
  const parts = rel.split(path.sep);
  if (parts.length > 1) return parts[0];
  return 'daily'; // root-level memory files are daily logs
}

function scanMemory() {
  const nodes = [];
  const edges = [];
  const nodeIds = new Set();
  const categorySet = new Set();

  // Core files
  for (const name of CORE_FILES) {
    const fullPath = path.join(CLAWD_DIR, name);
    if (!fs.existsSync(fullPath)) continue;
    const id = 'core/' + name;
    const stat = fs.statSync(fullPath);
    nodes.push({
      id,
      label: name.replace('.md', ''),
      category: 'core',
      type: 'core',
      size: Math.max(14, fileSizeCategory(stat.size) + 8),
    });
    nodeIds.add(id);
  }

  // Walk memory dir
  const memFiles = walkDir(MEMORY_DIR);
  for (const fullPath of memFiles) {
    const rel = path.relative(MEMORY_DIR, fullPath);
    const id = 'mem/' + rel;
    const category = getCategoryFromPath(fullPath);
    categorySet.add(category);
    const stat = fs.statSync(fullPath);
    nodes.push({
      id,
      label: path.basename(rel, '.md'),
      category,
      type: 'file',
      size: fileSizeCategory(stat.size),
    });
    nodeIds.add(id);
  }

  // Category nodes
  for (const cat of categorySet) {
    const id = 'cat/' + cat;
    nodes.push({
      id,
      label: cat.toUpperCase().replace(/[-_]/g, ' '),
      category: cat,
      type: 'category',
      size: 22,
    });
    nodeIds.add(id);

    // structural edge: category -> each file in it
    for (const n of nodes) {
      if (n.type === 'file' && n.category === cat) {
        edges.push({ source: id, target: n.id, type: 'contains' });
      }
    }
  }

  // Structural edges from MEMORY.md to categories
  if (nodeIds.has('core/MEMORY.md')) {
    for (const cat of categorySet) {
      const catId = 'cat/' + cat;
      if (nodeIds.has(catId)) {
        edges.push({ source: 'core/MEMORY.md', target: catId, type: 'structural' });
      }
    }
  }

  // Structural edges between core files
  const coreStructural = [
    ['core/SOUL.md', 'core/IDENTITY.md'],
    ['core/AGENTS.md', 'core/SOUL.md'],
    ['core/AGENTS.md', 'core/IDENTITY.md'],
    ['core/AGENTS.md', 'core/MEMORY.md'],
    ['core/AGENTS.md', 'core/USER.md'],
    ['core/IDENTITY.md', 'cat/identity'],
    ['core/USER.md', 'cat/work'],
    ['core/USER.md', 'cat/family'],
    ['core/TOOLS.md', 'core/AGENTS.md'],
    ['core/BOOT.md', 'core/SOUL.md'],
    ['core/BOOT.md', 'core/IDENTITY.md'],
  ];
  for (const [s, t] of coreStructural) {
    if (nodeIds.has(s) && nodeIds.has(t)) {
      edges.push({ source: s, target: t, type: 'structural' });
    }
  }

  // Cross-reference edges: parse files for links to other memory files
  const allFiles = [
    ...CORE_FILES.filter(f => fs.existsSync(path.join(CLAWD_DIR, f)))
      .map(f => ({ id: 'core/' + f, fullPath: path.join(CLAWD_DIR, f) })),
    ...memFiles.map(f => ({
      id: 'mem/' + path.relative(MEMORY_DIR, f),
      fullPath: f,
    })),
  ];

  // Build lookup: basename -> [ids], relative path fragment -> id
  const basenameLookup = {};
  const pathFragmentLookup = {};
  for (const n of nodes) {
    if (n.type === 'category') continue;
    const base = n.label.toLowerCase();
    if (!basenameLookup[base]) basenameLookup[base] = [];
    basenameLookup[base].push(n.id);
    // Also index by relative path fragments
    const parts = n.id.split('/');
    for (let i = 1; i < parts.length; i++) {
      const frag = parts.slice(i).join('/').toLowerCase();
      pathFragmentLookup[frag] = n.id;
      pathFragmentLookup[frag.replace('.md', '')] = n.id;
    }
  }

  const refEdgeSet = new Set();
  for (const file of allFiles) {
    let content;
    try { content = fs.readFileSync(file.fullPath, 'utf8'); } catch { continue; }

    // Patterns: markdown links [text](path), backtick paths `memory/...`, bare references memory/dir/file.md
    const patterns = [
      /\[([^\]]*)\]\(([^)]+\.md)\)/g,                    // markdown links
      /`((?:memory|identity|work|projects|meta|family|procedures|reflections|nova-letters|sessions|meeting-briefs|audit|daily|satisfaction-insights)[\/][^\s`]+)`/g,  // backtick paths
      /(?:memory\/|~\/clawd\/memory\/)([^\s)>\]]+\.md)/g, // bare path references
      /(?:SOUL|IDENTITY|AGENTS|USER|MEMORY|TOOLS|HEARTBEAT|BOOT|AUTONOMY|COMMUNICATION|LEARNING|LINEAGE|POLICIES|REFERENCE|TASTE)\.md/g, // core file references
    ];

    const foundTargets = new Set();
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const ref = (match[2] || match[1] || match[0]).trim();
        const refLower = ref.toLowerCase().replace(/^\.?\/?/, '');

        // Try to resolve to a node id
        let targetId = null;

        // Direct path match
        if (pathFragmentLookup[refLower]) {
          targetId = pathFragmentLookup[refLower];
        } else if (pathFragmentLookup[refLower.replace('.md', '')]) {
          targetId = pathFragmentLookup[refLower.replace('.md', '')];
        }

        // Core file match
        if (!targetId && ref.match(/^[A-Z_]+\.md$/)) {
          const coreId = 'core/' + ref;
          if (nodeIds.has(coreId)) targetId = coreId;
        }

        if (targetId && targetId !== file.id && !foundTargets.has(targetId)) {
          const edgeKey = file.id + '|' + targetId;
          if (!refEdgeSet.has(edgeKey)) {
            refEdgeSet.add(edgeKey);
            foundTargets.add(targetId);
            edges.push({ source: file.id, target: targetId, type: 'references' });
          }
        }
      }
    }
  }

  return { nodes, edges, colors: CATEGORY_COLORS };
}

// --- Initial scan ---
let graphData;
try {
  console.log('Scanning memory directory...');
  graphData = scanMemory();
  fs.writeFileSync(path.join(STATIC, 'graph-data.json'), JSON.stringify(graphData));
  console.log(`Scanned: ${graphData.nodes.length} nodes, ${graphData.edges.length} edges`);
} catch (e) {
  console.error('Scan failed, falling back to existing graph-data.json:', e.message);
  graphData = JSON.parse(fs.readFileSync(path.join(STATIC, 'graph-data.json'), 'utf8'));
}

// --- HTTP Server ---

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // GET /api/graph-data
  if (req.url === '/api/graph-data' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(graphData));
  }

  // POST /api/event — receive memory access events and broadcast to WS clients
  if (req.url === '/api/event' && req.method === 'POST') {
    try {
      const event = await parseBody(req);
      event.timestamp = Date.now();
      broadcast(JSON.stringify({ type: 'event', data: event }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // POST /api/scan — re-scan memory directory
  if (req.url === '/api/scan' && req.method === 'POST') {
    try {
      graphData = scanMemory();
      fs.writeFileSync(path.join(STATIC, 'graph-data.json'), JSON.stringify(graphData));
      broadcast(JSON.stringify({ type: 'reload', data: graphData }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true, nodes: graphData.nodes.length, edges: graphData.edges.length }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // Static files
  // 3D is default, 2D at /legacy
  let urlPath = req.url;
  if (urlPath === '/' || urlPath === '/3d' || urlPath === '/3d/') urlPath = '/index-3d.html';
  if (urlPath === '/legacy' || urlPath === '/legacy/' || urlPath === '/2d' || urlPath === '/2d/') urlPath = '/index.html';
  let filePath = path.join(STATIC, urlPath);
  const ext = path.extname(filePath) || '.html';

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end('Not found');
  }

  res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
  res.end(fs.readFileSync(filePath));
});

// --- WebSocket Server ---

const wss = new WebSocket.Server({ server });

function broadcast(msg) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.on('close', () => console.log('WebSocket client disconnected'));
});

server.listen(PORT, () => {
  console.log(`Memory graph LIVE on http://localhost:${PORT}`);
  console.log(`WebSocket on ws://localhost:${PORT}`);
  console.log(`POST events to http://localhost:${PORT}/api/event`);
  console.log(`POST scan to http://localhost:${PORT}/api/scan`);
  startSessionWatcher();
});

// --- Session Transcript Watcher ---
// Tails the active OpenClaw session JSONL for tool calls in real-time

function startSessionWatcher() {
  const sessDir = path.join(process.env.HOME, '.openclaw', 'agents', 'main', 'sessions');
  if (!fs.existsSync(sessDir)) { console.log('Session dir not found, skipping watcher'); return; }

  let currentFile = null;
  let currentWatcher = null;
  let fileSize = 0;

  function findLatestSession() {
    try {
      const files = fs.readdirSync(sessDir).filter(f => f.endsWith('.jsonl'));
      if (!files.length) return null;
      let latest = null, latestMtime = 0;
      for (const f of files) {
        const stat = fs.statSync(path.join(sessDir, f));
        if (stat.mtimeMs > latestMtime) { latestMtime = stat.mtimeMs; latest = f; }
      }
      return latest;
    } catch { return null; }
  }

  function processNewLines(filePath) {
    try {
      const stat = fs.statSync(filePath);
      if (stat.size <= fileSize) return;
      const fd = fs.openSync(filePath, 'r');
      const buf = Buffer.alloc(stat.size - fileSize);
      fs.readSync(fd, buf, 0, buf.length, fileSize);
      fs.closeSync(fd);
      fileSize = stat.size;

      const lines = buf.toString('utf8').split('\n').filter(l => l.trim());
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          processTranscriptEntry(entry);
        } catch {}
      }
    } catch {}
  }

  function processTranscriptEntry(entry) {
    const msg = entry?.message;
    if (!msg) return;

    // Tool calls (from assistant)
    if (msg.role === 'assistant' && msg.toolCalls) {
      for (const tc of msg.toolCalls) {
        const name = tc.toolName || tc.name;
        const args = tc.args || tc.input || {};
        emitToolEvent(name, args);
      }
    }

    // Tool results
    if (msg.role === 'toolResult') {
      const name = msg.toolName;
      const args = msg.args || {};
      // For memory_search results, try to parse the content
      if (name === 'memory_search') {
        try {
          const content = msg.content?.[0]?.text || '';
          const parsed = JSON.parse(content);
          if (parsed?.results) {
            const results = parsed.results.map(r => ({
              path: normPath(r.path), score: r.score || 0,
              snippet: (r.snippet || '').slice(0, 80)
            })).filter(r => r.path);
            broadcast(JSON.stringify({ type: 'event', data: {
              type: 'search', query: args.query || msg.query || '',
              results, timestamp: Date.now()
            }}));
          }
        } catch {}
      }
    }
  }

  function emitToolEvent(name, args) {
    if (name === 'read' || name === 'memory_get') {
      const p = normPath(args.path);
      if (p && (p.includes('memory') || p.endsWith('.md'))) {
        broadcast(JSON.stringify({ type: 'event', data: { type: 'read', path: p, timestamp: Date.now() }}));
      }
    }
    if (name === 'write' || name === 'edit') {
      const p = normPath(args.path);
      if (p && (p.includes('memory') || p.endsWith('.md'))) {
        broadcast(JSON.stringify({ type: 'event', data: { type: 'write', path: p, timestamp: Date.now() }}));
      }
    }
    if (name === 'memory_search') {
      broadcast(JSON.stringify({ type: 'event', data: {
        type: 'search', query: args.query || '', results: [], timestamp: Date.now()
      }}));
    }
    if (name === 'exec') {
      const cmd = args.command || '';
      const grepMatch = cmd.match(/(?:grep|cat|head|tail)\s+.*?((?:memory|\w+\.md)[\w\/.-]*)/g);
      if (grepMatch) {
        for (const m of grepMatch) {
          const parts = m.split(/\s+/);
          const last = parts[parts.length - 1];
          const p = normPath(last);
          if (p) broadcast(JSON.stringify({ type: 'event', data: { type: 'grep', path: p, timestamp: Date.now() }}));
        }
      }
    }
  }

  function normPath(p) {
    if (!p) return null;
    return p.replace(/^\/home\/gnufoo\/clawd\//, '').replace(/^~\/clawd\//, '').replace(/^\.\//, '');
  }

  // Watch for session file changes
  function watchSession() {
    const latest = findLatestSession();
    if (!latest) { setTimeout(watchSession, 5000); return; }

    const filePath = path.join(sessDir, latest);
    if (filePath !== currentFile) {
      if (currentWatcher) { currentWatcher.close(); }
      currentFile = filePath;
      fileSize = fs.statSync(filePath).size; // start from current position
      console.log(`Watching session: ${latest}`);
      currentWatcher = fs.watch(filePath, () => processNewLines(filePath));
    }
    setTimeout(watchSession, 10000); // check for new session every 10s
  }

  watchSession();
  console.log('Session transcript watcher started');
}
