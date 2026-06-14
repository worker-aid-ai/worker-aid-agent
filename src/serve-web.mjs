#!/usr/bin/env node
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.cwd());
const port = Number(process.env.PORT ?? 5173);

const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8']
]);

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://localhost:${port}`);
    const pathname = url.pathname === '/' ? '/web/index.html' : url.pathname;
    const file = safeJoin(root, pathname);
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not file');
    res.setHeader('content-type', mime.get(extname(file)) ?? 'application/octet-stream');
    createReadStream(file).pipe(res);
  } catch {
    res.statusCode = 404;
    res.end('Not Found');
  }
}).listen(port, () => {
  console.log(`Worker Aid Web UI: http://localhost:${port}/`);
});

function safeJoin(base, target) {
  const file = normalize(join(base, decodeURIComponent(target)));
  if (!file.startsWith(base)) throw new Error('forbidden');
  return file;
}
