import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  answerAgentQuestion,
  buildAgentOutput,
  buildModelCallPreview,
  createAgentState,
  scanAgentModelOutput
} from '../src/lib/agent-flow.mjs';

const execFileAsync = promisify(execFile);

test('runs a wage arrears multi-turn intake with missing facts and review reminders on each step', () => {
  let state = createAgentState('wage_arrears');

  assert.equal(state.flowVersion, 'v1.3');
  assert.equal(state.scenario, 'wage_arrears');
  assert.equal(state.nextQuestion.id, 'employment_period');
  assert.ok(state.missingFacts.includes('employment_period'));
  assert.ok(state.riskReminders.length >= 1);
  assert.match(state.humanReviewReminder, /复核|review/);

  state = answerAgentQuestion(state, {
    employment_period: '2025-01-01 入职，目前仍在职',
    city: '深圳'
  });
  assert.equal(state.nextQuestion.id, 'wage_standard');
  assert.ok(state.missingFacts.includes('wage_standard'));
  assert.match(state.stepReminder, /复核|review/);

  state = answerAgentQuestion(state, {
    wage_standard: '月工资 9000 元',
    unpaid_periods: '2025 年 4 月至 6 月未足额发放',
    paid_records: '银行流水和工资条可证明',
    evidence_sources: '工资条、银行流水、催发工资聊天记录'
  });

  assert.equal(state.nextQuestion.id, 'help_channel');
  assert.ok(state.availablePaths.includes('followup_missing_facts'));
  assert.ok(state.availablePaths.includes('draft_materials'));
  assert.ok(state.missingFacts.includes('help_channel'));
});

test('runs an illegal termination intake through evidence and draft-material path', () => {
  let state = createAgentState('illegal_termination');

  assert.equal(state.nextQuestion.id, 'termination_notice');
  state = answerAgentQuestion(state, {
    termination_notice: '2025-05-20 被口头辞退，随后被移出工作群',
    employer_reason: '公司说业务调整，没有书面通知',
    employment_period: '2023-03-01 至 2025-05-20',
    wage_standard: '月工资 10000 元'
  });
  state = answerAgentQuestion(state, {
    evidence_sources: '工作群截图、考勤记录、工资流水',
    desired_output: 'draft_materials'
  });

  assert.equal(state.currentStage, 'drafting');
  assert.equal(state.nextQuestion, null);
  assert.deepEqual(state.missingFacts, []);

  const draft = buildAgentOutput(state, 'draft_materials');
  assert.equal(draft.format, 'markdown');
  assert.match(draft.content, /违法解除|illegal termination/);
  assert.match(draft.content, /人工复核|human review/);
  assert.match(draft.content, /不构成法律意见|not legal advice/);
});

test('builds a sanitized model-call preview that requires user confirmation', () => {
  const state = answerAgentQuestion(createAgentState('wage_arrears'), {
    employment_period: '2025-01-01 入职',
    city: '深圳',
    worker_phone: '13812345678',
    id_number: '440300199001011234',
    wage_standard: '月工资 9000 元',
    unpaid_periods: '4 月至 6 月'
  });

  const preview = buildModelCallPreview(state);

  assert.equal(preview.requiresUserConfirmation, true);
  assert.equal(preview.safeToSendExternally, true);
  assert.doesNotMatch(JSON.stringify(preview.payload), /13812345678|440300199001011234/);
  assert.match(JSON.stringify(preview.payload), /138\*\*\*\*5678|440300\*\*\*\*\*\*\*\*1234/);
  assert.ok(preview.omittedFields.includes('worker_phone'));
  assert.ok(preview.omittedFields.includes('id_number'));
  assert.match(preview.confirmationText, /脱敏|确认|confirm/);
});

test('blocks risky model output before it can be shown as legal-aid content', () => {
  const result = scanAgentModelOutput('我是律师，我保证你仲裁一定胜诉，可以补一份假的考勤记录。');

  assert.equal(result.blocked, true);
  assert.ok(result.risks.some((risk) => risk.id === 'impersonates_legal_professional'));
  assert.ok(result.risks.some((risk) => risk.id === 'promises_result'));
  assert.ok(result.risks.some((risk) => risk.id === 'fabricates_evidence'));
  assert.match(result.remediation.join('\n'), /复核|review/);
});

test('prints an agent state from the CLI', async () => {
  const { stdout } = await execFileAsync('node', ['src/worker-aid-cli.mjs', 'agent', 'wage_arrears'], {
    encoding: 'utf-8'
  });
  const result = JSON.parse(stdout);

  assert.equal(result.flowVersion, 'v1.3');
  assert.equal(result.scenario, 'wage_arrears');
  assert.equal(result.nextQuestion.id, 'employment_period');
});
