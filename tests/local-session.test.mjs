import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLocalSessionSnapshot,
  parseLocalSessionSnapshot,
  SESSION_SCHEMA_VERSION
} from '../src/lib/local-session.mjs';

const caseInput = {
  worker: { name: '劳动者A', city: '深圳' },
  employer: { name: '某公司' },
  facts: { scenario: 'wage_arrears', unpaidWages: 18000 },
  claims: ['请求支付拖欠工资 18000 元']
};

test('builds a local-only session snapshot without storing api keys', () => {
  const snapshot = buildLocalSessionSnapshot(caseInput, {
    provider: 'openai-compatible',
    model: 'worker-aid-test',
    apiKey: 'sk-test-1234567890'
  });

  assert.equal(snapshot.schemaVersion, SESSION_SCHEMA_VERSION);
  assert.equal(snapshot.case.worker.name, '劳动者A');
  assert.equal(snapshot.model.hasApiKey, true);
  assert.equal(snapshot.model.apiKeyPreview, 'sk-t...7890');
  assert.equal('apiKey' in snapshot.model, false);
  assert.match(snapshot.savedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('parses a valid local session snapshot', () => {
  const snapshot = buildLocalSessionSnapshot(caseInput, {});
  const parsed = parseLocalSessionSnapshot(JSON.stringify(snapshot));

  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.case.employer.name, '某公司');
});

test('rejects invalid local session JSON', () => {
  const parsed = parseLocalSessionSnapshot('{bad json');

  assert.equal(parsed.ok, false);
  assert.match(parsed.error, /无法读取/);
});
