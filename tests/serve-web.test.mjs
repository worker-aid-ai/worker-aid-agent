import test from 'node:test';
import assert from 'node:assert/strict';
import { contentTypeForPath } from '../src/serve-web.mjs';

test('serves mjs files as JavaScript modules for the browser app', () => {
  assert.equal(contentTypeForPath('src/lib/product-entry.mjs'), 'text/javascript; charset=utf-8');
});
