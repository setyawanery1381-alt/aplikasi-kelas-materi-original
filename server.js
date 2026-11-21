import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rpcHandler from './api/rpc.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];

  // Route API RPC (Vercel Serverless Function simulator)
  if (reqPath.startsWith('/api/rpc') || reqPath.includes('/api/rpc')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch (e) {
        req.body = body;
      }
      // Mock response wrapper for Vercel handler
      const vRes = {
        statusCode: 200,
        headers: {},
        setHeader(k, v) { this.headers[k] = v; },
        status(code) { this.statusCode = code; return this; },
        json(data) {
          res.writeHead(this.statusCode, { 'Content-Type': 'application/json', ...this.headers });
          res.end(JSON.stringify(data));
        },
        end(data) {
          res.writeHead(this.statusCode, this.headers);
          res.end(data || '');
        }
      };
      return rpcHandler(req, vRes);
    });
    return;
  }

  // Static File Serving
  if (reqPath === '/') reqPath = '/index.html';

  let filePath = path.join(__dirname, 'public', reqPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, reqPath);
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // SPA Fallback
    const spaIndex = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(spaIndex)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream(spaIndex).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`Server lokal berjalan di http://localhost:${PORT}/`);
  console.log(`Simulasi Vercel Serverless /api/rpc aktif.`);
});
