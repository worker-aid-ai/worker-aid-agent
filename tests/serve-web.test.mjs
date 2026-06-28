import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHealthPayload, contentTypeForPath } from '../src/serve-web.mjs';

test('serves mjs files as JavaScript modules for the browser app', () => {
  assert.equal(contentTypeForPath('src/lib/product-entry.mjs'), 'text/javascript; charset=utf-8');
});

test('serves health endpoint as json', () => {
  assert.equal(contentTypeForPath('health.json'), 'application/json; charset=utf-8');
});

test('builds local app health payload', () => {
  const payload = buildHealthPayload({ port: 5173, root: 'D:/code/worker/worker-aid-agent' });

  assert.equal(payload.app, 'worker-aid-agent');
  assert.equal(payload.mode, 'local-first');
  assert.equal(payload.port, 5173);
  assert.match(payload.reminder, /本机/);
});
