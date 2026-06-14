import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const SCENARIOS = JSON.parse(await readFile(new URL('../../data/scenarios.json', import.meta.url), 'utf-8'));

export async function loadJson(path) {
  const fullPath = resolve(process.cwd(), path);
  return JSON.parse(await readFile(fullPath, 'utf-8'));
}

export function printJson(value) {
  console.log(JSON.stringify(value, null, 2));
}

export function classifyCase(input) {
  const text = normalizeText(input);
  const matches = SCENARIOS.map((scenario) => {
    const hits = scenario.keywords.filter((keyword) => text.includes(keyword));
    const score = hits.length;
    return { ...scenario, score, matchedKeywords: hits };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const primary = matches[0] ?? {
    id: 'general_labor_dispute',
    name: '一般劳动争议',
    commonClaims: [],
    recommendedPaths: ['补充事实', '整理证据', '咨询当地劳动监察/仲裁委/法律援助机构']
  };

  return {
    primaryScenario: pickScenario(primary),
    possibleScenarios: matches.slice(1, 5).map(pickScenario),
    triage: buildTriage(input, primary),
    disclaimers: [
      '本结果是初步分流，不构成法律意见。',
      '仲裁时效、管辖、金额和法律适用必须由用户或专业人士核验。',
      '不要伪造、篡改或诱导他人提供虚假证据。'
    ]
  };
}

function pickScenario(scenario) {
  return {
    id: scenario.id,
    name: scenario.name,
    matchedKeywords: scenario.matchedKeywords ?? [],
    commonClaims: scenario.commonClaims ?? [],
    recommendedPaths: scenario.recommendedPaths ?? []
  };
}

function normalizeText(input) {
  return JSON.stringify(input, null, 2).toLowerCase();
}

function buildTriage(input, primary) {
  const facts = input.facts ?? {};
  const missing = [];
  if (!facts.startDate) missing.push('入职日期');
  if (!facts.monthlySalary) missing.push('工资标准/工资基数');
  if (!input.employer?.name) missing.push('用人单位准确名称');
  if (!input.worker?.city) missing.push('工作城市/劳动合同履行地');

  const urgent = [];
  if (primary.id === 'work_injury') urgent.push('尽快核验工伤认定期限并保存病历、事故经过和现场证据');
  if (primary.id === 'illegal_termination') urgent.push('保存解除通知、沟通记录、账号停用/移出工作群等证据');
  if (primary.id === 'wage_arrears') urgent.push('按月份列明应发、实发、欠发金额，并保存工资流水和催讨记录');

  return { missingFacts: missing, urgentReminders: urgent };
}
