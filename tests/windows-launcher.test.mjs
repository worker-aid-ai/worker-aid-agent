import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('provides a double-click Windows launcher for non-technical users', async () => {
  const launcher = await readFile('start-worker-aid.cmd', 'utf-8');

  assert.match(launcher, /powershell/i);
  assert.match(launcher, /start-worker-aid\.ps1/i);
  assert.match(launcher, /pause/i);
});

test('PowerShell launcher opens the local app in the browser after diagnostics', async () => {
  const script = await readFile('start-worker-aid.ps1', 'utf-8');

  assert.match(script, /Start-Process\s+"http:\/\/localhost:\$port\/"/);
  assert.match(script, /Node\.js was not found/);
  assert.match(script, /pnpm was not found/);
  assert.match(script, /Port \$port is already in use/);
});
