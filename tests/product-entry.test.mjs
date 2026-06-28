import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeModelConfig, canCallExternalModel, buildLocalAgentSession } from '../src/lib/product-entry.mjs';

test('normalizes model config without exposing the full api key', () => {
  const config = normalizeModelConfig({
    provider: 'openai-compatible',
    baseUrl: ' https://api.example.com/v1 ',
    model: ' worker-aid-test ',
    apiKey: 'sk-test-1234567890'
  });

  assert.equal(config.provider, 'openai-compatible');
  assert.equal(config.baseUrl, 'https://api.example.com/v1');
  assert.equal(config.model, 'worker-aid-test');
  assert.equal(config.hasApiKey, true);
  assert.equal(config.apiKeyPreview, 'sk-t...7890');
  assert.equal('apiKey' in config, false);
});

test('requires explicit consent before external model calls', () => {
  const config = normalizeModelConfig({
    provider: 'openai-compatible',
    baseUrl: 'https://api.example.com/v1',
    model: 'worker-aid-test',
    apiKey: 'sk-test-1234567890'
  });

  assert.equal(canCallExternalModel(config, { confirmedExternalCall: false }).allowed, false);
  assert.equal(canCallExternalModel(config, { confirmedExternalCall: true }).allowed, true);
});

test('builds a local agent session with safety reminders and shared outputs', () => {
  const session = buildLocalAgentSession({
    worker: { name: '劳动者A', city: '深圳' },
    employer: { name: '某公司' },
    facts: { startDate: '2025-01-01', monthlySalary: 9000, unpaidWages: 18000 },
    claims: ['请求支付拖欠工资 18000 元']
  });

  assert.equal(session.protocolVersion, '1.0');
  assert.equal(session.mode, 'local-first');
  assert.ok(session.availableOutputs.includes('legal-aid-summary'));
  assert.match(session.humanReviewReminder, /人工复核/);
  assert.match(session.privacyReminder, /默认仅在本机处理/);
});

test('declares a Worker Aid plugin package for professional collaborators', async () => {
  const manifest = JSON.parse(await readFile('worker-aid.plugin.json', 'utf-8'));

  assert.equal(manifest.id, 'worker-aid-agent');
  assert.ok(manifest.skills.includes('skills'));
  assert.ok(manifest.agents.includes('agents'));
  assert.match(manifest.description, /legal-aid preparation/);
});
