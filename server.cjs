// 僅供本機評審；零外部依賴，不接收提交，不公開監聽。
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const allowed = new Set(['index.html', 'styles.css', 'content.js', 'app.js']);
http.createServer((req, res) => {
  const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (!['GET', 'HEAD'].includes(req.method) || !allowed.has(name)) { res.writeHead(404); return res.end('Not found'); }
  const type = name.endsWith('.css') ? 'text/css' : name.endsWith('.js') ? 'text/javascript' : 'text/html';
  res.writeHead(200, { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-store' });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(path.join(__dirname, name)).pipe(res);
}).listen(4173, '127.0.0.1', () => console.log('Demo: http://127.0.0.1:4173'));
