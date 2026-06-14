import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { exportDocument, renderDocument } from '../src/lib/exporters.mjs';

const input = {
  worker: { name: '张三', city: '深圳' },
  employer: { name: '某科技有限公司' },
  facts: { startDate: '2025-01-01', position: '前端开发', monthlySalary: 9000, unpaidWages: 18000, hasWrittenContract: false },
  claims: ['请求支付拖欠工资 18000 元']
};

test('renders legal aid summary markdown', () => {
  const markdown = renderDocument('legal-aid-summary', input);
  assert.match(markdown, /法律援助/);
  assert.match(markdown, /某科技有限公司/);
});

test('exports arbitration document as html', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'worker-aid-'));
  const output = join(dir, 'arbitration.html');
  const result = await exportDocument('arbitration', input, output);
  const html = await readFile(output, 'utf-8');
  assert.equal(result.format, 'html');
  assert.match(html, /劳动人事争议仲裁申请书/);
  await rm(dir, { recursive: true, force: true });
});
