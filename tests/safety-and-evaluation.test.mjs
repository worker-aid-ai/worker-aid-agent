import test from 'node:test';
import assert from 'node:assert/strict';
import { searchLawBasis } from '../src/lib/legal-search.mjs';
import { lookupLocalPolicies } from '../src/lib/local-policy.mjs';
import { scanOutputRisk } from '../src/lib/risk-guard.mjs';
import { summarizeEvaluationSet } from '../src/lib/evaluation-set.mjs';
import { anonymizeCommunityCase } from '../src/lib/anonymize.mjs';

test('searches law basis records with official verification reminders', async () => {
  const result = await searchLawBasis('拖欠工资 仲裁时效');

  assert.equal(result.query, '拖欠工资 仲裁时效');
  assert.ok(result.results.length >= 1);
  assert.equal(result.results[0].id, 'labor_dispute_limitation');
  assert.ok(result.results[0].score > 0);
  assert.ok(result.results[0].verifyAt.includes('全国人大法律法规数据库'));
  assert.match(result.warnings.join('\n'), /不构成法律意见/);
});

test('looks up localized policy index by region and topic', async () => {
  const result = await lookupLocalPolicies('深圳', '欠薪');

  assert.equal(result.region.name, '深圳');
  assert.ok(result.records.length >= 1);
  assert.equal(result.records[0].province, '广东');
  assert.equal(result.records[0].city, '深圳');
  assert.match(result.records[0].updatedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(result.records[0].officialSources.length >= 1);
  assert.match(result.warnings.join('\n'), /当地官方渠道/);
});

test('blocks risky generated legal-aid output patterns', () => {
  const result = scanOutputRisk('我是律师，我保证你仲裁一定胜诉。可以补一份假的考勤记录作为证据。');

  assert.equal(result.blocked, true);
  assert.deepEqual(result.risks.map((risk) => risk.id), [
    'impersonates_legal_professional',
    'promises_result',
    'fabricates_evidence'
  ]);
  assert.match(result.remediation.join('\n'), /人类复核/);
});

test('summarizes the multi-model evaluation bootstrap set', async () => {
  const result = await summarizeEvaluationSet();

  assert.ok(result.totalCases >= 3);
  assert.ok(result.scenarios.includes('wage_arrears'));
  assert.ok(result.requiredChecks.includes('legal_disclaimer'));
  assert.ok(result.requiredChecks.includes('no_fabricated_evidence'));
});

test('anonymizes public community case submissions', () => {
  const result = anonymizeCommunityCase({
    worker: { name: '张三', phone: '13812345678', idNumber: '440300199001011234' },
    employer: { name: '深圳真实科技有限公司' },
    facts: {
      description: '张三在深圳真实科技有限公司工作，手机号 13812345678，身份证 440300199001011234。'
    }
  });

  assert.equal(result.safeToShare, true);
  assert.equal(result.case.worker.name, '劳动者A');
  assert.equal(result.case.worker.phone, '138****5678');
  assert.equal(result.case.worker.idNumber, '440300********1234');
  assert.match(result.case.employer.name, /某公司/);
  assert.doesNotMatch(JSON.stringify(result.case), /13812345678|440300199001011234|深圳真实科技有限公司|张三/);
  assert.match(result.reminders.join('\n'), /公开前人工复核/);
});
