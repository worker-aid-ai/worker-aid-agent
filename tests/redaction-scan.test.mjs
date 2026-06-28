import test from 'node:test';
import assert from 'node:assert/strict';
import { scanSensitiveInput } from '../src/lib/redaction-scan.mjs';

test('detects high-risk personal identifiers in user input', () => {
  const result = scanSensitiveInput('我是张三，手机号 13812345678，身份证 440300199001011234。');

  assert.equal(result.safeToSendExternally, false);
  assert.deepEqual(result.findings.map((item) => item.type), ['phone', 'id_number']);
  assert.equal(result.findings[0].severity, 'block');
  assert.match(result.reminders.join('\n'), /脱敏/);
});

test('detects medium-risk address and bank-card hints', () => {
  const result = scanSensitiveInput('住址：深圳市南山区某小区，银行卡号尾号 1234。');

  assert.equal(result.safeToSendExternally, false);
  assert.ok(result.findings.some((item) => item.type === 'address_hint'));
  assert.ok(result.findings.some((item) => item.type === 'bank_card_hint'));
});

test('allows already anonymized short case summaries', () => {
  const result = scanSensitiveInput('劳动者A在深圳某公司工作，4月工资未发，已保留工资条和沟通记录摘要。');

  assert.equal(result.safeToSendExternally, true);
  assert.deepEqual(result.findings, []);
});
