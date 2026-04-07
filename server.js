const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3008;
const STATIC = __dirname;

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url === '/api/graph-data') {
    const data = fs.readFileSync(path.join(STATIC, 'graph-data.json'), 'utf8');
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(data);
  }
  
  let filePath = path.join(STATIC, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath) || '.html';
  
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end('Not found');
  }
  
  res.writeHead(200, {'Content-Type': mime[ext] || 'text/plain'});
  res.end(fs.readFileSync(filePath));
});

server.listen(PORT, () => console.log(`Memory graph on http://localhost:${PORT}`));
