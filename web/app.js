import { buildCaseTimeline } from '/src/lib/timeline.mjs';
import { buildLocalAgentSession, canCallExternalModel, normalizeModelConfig } from '/src/lib/product-entry.mjs';
import { scanSensitiveInput } from '/src/lib/redaction-scan.mjs';
import { buildLocalSessionSnapshot, parseLocalSessionSnapshot } from '/src/lib/local-session.mjs';
import {
  answerAgentQuestion,
  buildAgentOutput,
  buildModelCallPreview,
  createAgentState
} from '/src/lib/agent-flow.mjs';

const LOCAL_SESSION_KEY = 'worker-aid-local-session';

let currentCase;
let currentDoc = '';
let modelConfig = normalizeModelConfig();
let agentState = createAgentState('wage_arrears');

const $ = (id) => document.getElementById(id);

init();

function init() {
  $('loadSample').addEventListener('click', loadSample);
  $('buildCase').addEventListener('click', buildCase);
  $('saveSession').addEventListener('click', saveLocalSession);
  $('restoreSession').addEventListener('click', restoreLocalSession);
  $('clearSession').addEventListener('click', clearLocalSession);
  $('downloadCase').addEventListener('click', () => download('worker-aid-case.json', JSON.stringify(buildCase(), null, 2), 'application/json'));
  $('startAgentFlow').addEventListener('click', startAgentFlow);
  $('answerAgentFlow').addEventListener('click', answerAgentFlow);
  $('previewAgentModel').addEventListener('click', previewAgentModel);
  $('draftAgentMaterials').addEventListener('click', draftAgentMaterials);
  $('saveModel').addEventListener('click', saveModelConfig);
  $('checkModel').addEventListener('click', checkModelReadiness);
  $('downloadMd').addEventListener('click', () => download('worker-aid-document.md', currentDoc || $('docOutput').value, 'text/markdown'));
  $('downloadHtml').addEventListener('click', () => download('worker-aid-document.html', wrapHtml(currentDoc || $('docOutput').value), 'text/html'));
  document.querySelectorAll('[data-doc]').forEach((button) => button.addEventListener('click', () => buildDoc(button.dataset.doc)));
  document.querySelectorAll('[data-jump]').forEach((button) => button.addEventListener('click', () => jumpTo(button)));
  buildCase();
  renderAgentState();
}

function jumpTo(button) {
  document.querySelectorAll('.step').forEach((item) => item.classList.toggle('is-active', item === button));
  $(button.dataset.jump).scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function loadSample() {
  $('workerName').value = '劳动者A';
  $('city').value = '深圳';
  $('employerName').value = '某科技公司';
  $('position').value = '客服专员';
  $('startDate').value = '2025-01-01';
  $('terminationDate').value = '2025-10-31';
  $('monthlySalary').value = '9000';
  $('unpaidWages').value = '18000';
  $('hasContract').value = 'false';
  $('scenario').value = 'wage_arrears';
  $('claims').value = '请求支付拖欠工资 18000 元\n请求依法出具离职证明';
  $('timelineEvents').value = '2025-04-10 | 工资开始异常 | 4 月工资未按约定日期发放\n2025-10-31 | 离职 | 与公司沟通后离职，工资仍未结清';
  buildCase();
}

function buildCase() {
  const hasContractValue = $('hasContract').value;
  currentCase = {
    worker: {
      name: clean($('workerName').value) || '劳动者A',
      city: clean($('city').value) || '待补充城市'
    },
    employer: {
      name: clean($('employerName').value) || '某公司'
    },
    facts: {
      scenario: $('scenario').value,
      startDate: $('startDate').value || undefined,
      terminationDate: $('terminationDate').value || undefined,
      position: clean($('position').value) || undefined,
      monthlySalary: number($('monthlySalary').value),
      unpaidWages: number($('unpaidWages').value),
      hasWrittenContract: hasContractValue === 'unknown' ? undefined : hasContractValue === 'true',
      events: parseTimelineEvents($('timelineEvents').value)
    },
    claims: splitLines($('claims').value)
  };

  const session = buildLocalAgentSession(currentCase, { model: modelConfig });
  const scan = scanSensitiveInput(currentCase);
  $('redactionWarning').hidden = scan.findings.length === 0;
  $('redactionWarning').innerHTML = scan.findings.length
    ? scan.reminders.map((item) => `<p>${escapeHtml(item)}</p>`).join('')
    : '';
  $('caseOutput').textContent = JSON.stringify(session, null, 2);
  return currentCase;
}

function startAgentFlow() {
  const input = buildCase();
  agentState = createAgentState(input.facts?.scenario || 'wage_arrears', {
    city: input.worker?.city,
    employment_period: [input.facts?.startDate, input.facts?.terminationDate].filter(Boolean).join(' 至 '),
    wage_standard: input.facts?.monthlySalary ? `月工资 ${input.facts.monthlySalary} 元` : '',
    unpaid_periods: input.facts?.unpaidWages ? `估算欠薪 ${input.facts.unpaidWages} 元，期间待核验` : '',
    evidence_sources: input.facts?.events?.length ? '已填写时间线事件，证据来源仍需逐项核验' : ''
  });
  $('agentAnswers').value = '';
  renderAgentState();
}

function answerAgentFlow() {
  const parsed = parseAnswerJson($('agentAnswers').value);
  if (!parsed.ok) {
    $('agentOutput').textContent = JSON.stringify(parsed, null, 2);
    return;
  }
  agentState = answerAgentQuestion(agentState, parsed.value);
  renderAgentState();
}

function previewAgentModel() {
  $('agentOutput').textContent = JSON.stringify(buildModelCallPreview(agentState), null, 2);
}

function draftAgentMaterials() {
  const output = buildAgentOutput(agentState, 'draft_materials');
  currentDoc = output.content;
  $('docOutput').value = currentDoc;
  $('agentOutput').textContent = currentDoc;
}

function renderAgentState() {
  const followup = buildAgentOutput(agentState, 'followup_missing_facts');
  $('agentQuestion').textContent = agentState.nextQuestion
    ? `${agentState.nextQuestion.prompt}\n\n缺失信息：${agentState.missingFactLabels.join('、')}`
    : '本轮已收集完问题树中的关键事实。仍请人工复核事实、证据、金额、时效和地方政策。';
  $('agentStateOutput').textContent = JSON.stringify(followup.content, null, 2);
}

function parseAnswerJson(value) {
  if (!String(value || '').trim()) {
    return { ok: false, error: '请用 JSON 填写本轮回答，例如 {"paid_records":"工资条和银行流水"}' };
  }
  try {
    return { ok: true, value: JSON.parse(value) };
  } catch {
    return { ok: false, error: '本轮回答不是有效 JSON。请检查引号、逗号和大括号。' };
  }
}

function saveLocalSession() {
  const snapshot = buildLocalSessionSnapshot(buildCase(), modelConfig);
  window.localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(snapshot));
  setSessionStatus(`已保存本机草稿：${new Date(snapshot.savedAt).toLocaleString()}`);
}

function restoreLocalSession() {
  const parsed = parseLocalSessionSnapshot(window.localStorage.getItem(LOCAL_SESSION_KEY));
  if (!parsed.ok) {
    setSessionStatus(parsed.error, 'warn');
    return;
  }
  applyCaseToForm(parsed.value.case);
  modelConfig = parsed.value.model;
  $('modelBadge').textContent = modelConfig.hasApiKey ? `已配置 ${modelConfig.apiKeyPreview}` : '未配置';
  buildCase();
  setSessionStatus('已恢复本机草稿。请重新填写 API key 后再调用外部模型。');
}

function clearLocalSession() {
  window.localStorage.removeItem(LOCAL_SESSION_KEY);
  setSessionStatus('已清除本机草稿。');
}

function setSessionStatus(message, tone = 'ok') {
  const status = $('sessionStatus');
  status.textContent = message;
  status.dataset.tone = tone;
}

function applyCaseToForm(input = {}) {
  $('workerName').value = input.worker?.name || '';
  $('city').value = input.worker?.city || '';
  $('employerName').value = input.employer?.name || '';
  $('position').value = input.facts?.position || '';
  $('startDate').value = input.facts?.startDate || '';
  $('terminationDate').value = input.facts?.terminationDate || '';
  $('monthlySalary').value = input.facts?.monthlySalary || '';
  $('unpaidWages').value = input.facts?.unpaidWages || '';
  $('hasContract').value = input.facts?.hasWrittenContract === true ? 'true' : input.facts?.hasWrittenContract === false ? 'false' : 'unknown';
  $('scenario').value = input.facts?.scenario || 'wage_arrears';
  $('claims').value = (input.claims || []).join('\n');
  $('timelineEvents').value = (input.facts?.events || [])
    .map((event) => [event.date, event.title, event.description].filter(Boolean).join(' | '))
    .join('\n');
}

function saveModelConfig() {
  modelConfig = normalizeModelConfig({
    provider: $('provider').value,
    baseUrl: $('baseUrl').value,
    model: $('modelName').value,
    apiKey: $('apiKey').value
  });
  $('modelBadge').textContent = modelConfig.hasApiKey ? `已配置 ${modelConfig.apiKeyPreview}` : '未配置';
  $('modelOutput').textContent = JSON.stringify(modelConfig, null, 2);
  buildCase();
}

function checkModelReadiness() {
  saveModelConfig();
  const readiness = canCallExternalModel(modelConfig, { confirmedExternalCall: $('confirmExternal').checked });
  $('modelOutput').textContent = JSON.stringify(readiness, null, 2);
}

function buildDoc(kind) {
  const input = currentCase || buildCase();
  if (kind === 'summary') currentDoc = renderLegalAidSummary(input);
  if (kind === 'arbitration') currentDoc = renderArbitration(input);
  if (kind === 'evidence') currentDoc = renderEvidenceIndex(input);
  if (kind === 'timeline') currentDoc = renderTimelineMarkdown(input);
  $('docOutput').value = currentDoc;
}

function renderLegalAidSummary(input) {
  const { worker, employer, facts, claims } = input;
  return `# 法律援助/公益咨询情况摘要（草稿）

> 重要提示：本摘要仅用于咨询前材料整理，不构成法律意见。提交前请人工复核事实、证据、金额、时效、管辖和当地政策。

## 基本情况

- 劳动者：${worker.name}
- 工作城市：${worker.city}
- 用人单位：${employer.name}
- 岗位：${facts.position || '待补充'}
- 入职日期：${facts.startDate || '待补充'}
- 离职/解除日期：${facts.terminationDate || '待补充'}
- 月工资基数：${formatMoney(facts.monthlySalary)}
- 估计欠薪金额：${formatMoney(facts.unpaidWages)}
- 书面劳动合同：${contractLabel(facts.hasWrittenContract)}

## 主要诉求

${claims.length ? claims.map((item, index) => `${index + 1}. ${item}`).join('\n') : '1. 待补充诉求和金额。'}

## 待人工复核

1. 诉求金额、工资基数和计算口径是否准确。
2. 仲裁时效、管辖机构和当地材料要求是否适用。
3. 证据是否真实存在、来源清楚、与诉求对应。
`;
}

function renderArbitration(input) {
  const { worker, employer, facts, claims } = input;
  return `# 劳动人事争议仲裁申请书（草稿）

> 重要提示：本文件为材料整理草稿，不构成法律意见。提交前请核验当地仲裁委格式、管辖、主体信息、请求金额、证据编号和时效。

## 申请人

姓名：${worker.name}
工作地点：${worker.city}

## 被申请人

名称：${employer.name}

## 仲裁请求

${claims.length ? claims.map((item, index) => `${index + 1}. ${item}`).join('\n') : '1. 待补充仲裁请求和金额。'}

## 事实与理由

申请人于 ${facts.startDate || '待补充'} 入职被申请人，岗位为 ${facts.position || '待补充'}，月工资基数约为 ${formatMoney(facts.monthlySalary)}。

${facts.hasWrittenContract === false ? '入职后，被申请人未依法与申请人签订书面劳动合同。' : '双方劳动合同签订情况仍需补充或核验。'}

${facts.unpaidWages ? `截至目前，被申请人尚欠申请人工资约 ${formatMoney(facts.unpaidWages)}。` : '工资支付情况和欠付金额仍需补充。'}

## 证据目录提示

1. 劳动关系证据：劳动合同、offer、工牌、工作群、考勤账号等。
2. 工资证据：工资条、银行流水、转账记录、工资沟通记录等。
3. 欠薪/催讨证据：聊天记录、通知、录音整理、投诉记录等。
4. 解除/离职证据：通知、沟通记录、交接材料等。
`;
}

function renderEvidenceIndex(input) {
  const timeline = buildCaseTimeline(input);
  const timelineRows = timeline.events.map((event, index) => `| ${index + 1} | ${event.title}相关材料 | 证明 ${event.date} 的事实经过 | 请补充真实证据来源和编号 |`);
  return `# 证据目录（草稿）

> 只整理真实已经存在的材料，不要为了补齐目录而编造、补写或修改证据。

| 序号 | 证据名称 | 证明目的 | 备注 |
|---:|---|---|---|
| 1 | 劳动合同/offer/入职记录 | 证明劳动关系 | 如未签合同，请列明替代证据 |
| 2 | 工资条/银行流水 | 证明工资标准和实发金额 | 注意脱敏银行卡号 |
| 3 | 考勤记录 | 证明出勤、加班或工作安排 | 需说明来源 |
| 4 | 催讨记录 | 证明欠薪和沟通过程 | 不要篡改聊天记录 |
${timelineRows.join('\n')}
`;
}

function renderTimelineMarkdown(input) {
  const timeline = buildCaseTimeline(input);
  return `# 案件时间线（草稿）

${timeline.events.length ? timeline.events.map((event) => `- ${event.date}：${event.title}。${event.description || '待补充说明和证据来源。'}`).join('\n') : '- 暂无有效日期事件。'}

## 提醒

${[...timeline.reminders, ...timeline.warnings, '不要为补齐时间线而编造日期、通知内容或证据来源。'].map((item) => `- ${item}`).join('\n')}
`;
}

function parseTimelineEvents(value) {
  return splitLines(value).map((line) => {
    const [date, title, ...description] = line.split('|').map((item) => item.trim());
    return { date, title, description: description.join(' | ') };
  }).filter((event) => event.date || event.title || event.description);
}

function wrapHtml(markdown) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>Worker Aid Document</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft YaHei',sans-serif;max-width:860px;margin:32px auto;line-height:1.75;padding:0 24px;color:#172033}pre{white-space:pre-wrap;font-family:inherit}</style></head><body><pre>${escapeHtml(markdown)}</pre></body></html>`;
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function splitLines(value) {
  return String(value || '').split('\n').map((item) => item.trim()).filter(Boolean);
}

function clean(value) {
  return String(value || '').trim();
}

function number(value) {
  return Number(value || 0);
}

function formatMoney(value) {
  return value ? `${value} 元` : '待补充';
}

function contractLabel(value) {
  if (value === true) return '已签';
  if (value === false) return '未签';
  return '不确定/待补充';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]));
}
