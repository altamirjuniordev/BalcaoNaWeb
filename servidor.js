/* ==========================================================================
   Servidor estatico minimo para rodar o site localmente.
   Uso:  node servidor.js        -> http://localhost:5173
   Sem dependencias: usa so o modulo http do Node.
   Em producao isto nao e necessario — e um site estatico, basta subir a
   pasta em qualquer hospedagem (Netlify, Vercel, GitHub Pages, S3, cPanel).
   ========================================================================== */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5173;
const ROOT = __dirname;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, path.normalize(urlPath).replace(/^(\.\.[/\\])+/, ''));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404</h1><p>Nao encontrado: ' + urlPath + '</p>');
      return;
    }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log('Balcao na Web rodando em http://localhost:' + PORT);
  console.log('  Landing page: http://localhost:' + PORT + '/');
  console.log('  Cardapio:     http://localhost:' + PORT + '/cardapio.html');
});
