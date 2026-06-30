import { scanOutputRisk } from './risk-guard.mjs';
import { scanSensitiveInput } from './redaction-scan.mjs';

const FLOW_VERSION = 'v1.3';

const HUMAN_REVIEW_REMINDER = '所有输出仅用于材料整理和咨询前准备，不构成法律意见；提交给机构、平台或他人前，请由劳动者本人或具备相应职责的人类工作人员人工复核事实、证据、金额、时效、管辖和当地政策。';

const COMMON_RISK_REMINDERS = [
  '只整理真实已经存在的事实和材料，不生成、补写、篡改或诱导伪造证据。',
  '不要上传完整身份证号、手机号、银行卡号、住址、未脱敏合同或完整聊天记录。',
  '金额、时效、管辖、证据证明力和地方政策存在不确定性，需要人工复核。'
];

const SCENARIO_TREES = {
  wage_arrears: {
    label: '欠薪',
    stages: ['intake', 'evidence_gap', 'amount_estimate', 'drafting', 'help_channel'],
    questions: [
      {
        id: 'employment_period',
        stage: 'intake',
        prompt: '先补充入职时间、离职/在职状态和工作城市。',
        missingLabel: '入职/离职时间和工作城市'
      },
      {
        id: 'wage_standard',
        stage: 'amount_estimate',
        prompt: '请补充工资标准、欠薪月份、已发金额和可核对的工资记录。',
        missingLabel: '工资标准和欠薪期间'
      },
      {
        id: 'paid_records',
        stage: 'evidence_gap',
        prompt: '请列明工资条、银行流水、考勤、催发工资沟通等证据是否真实存在。',
        missingLabel: '工资支付和催发证据来源'
      },
      {
        id: 'evidence_sources',
        stage: 'evidence_gap',
        prompt: '请补充每份证据的来源、保存位置和是否已脱敏。',
        missingLabel: '证据来源和脱敏状态'
      },
      {
        id: 'help_channel',
        stage: 'help_channel',
        prompt: '请选择接下来更需要继续追问缺失事实，还是生成材料草稿。',
        missingLabel: '下一步输出路径'
      }
    ]
  },
  overtime_pay: {
    label: '加班费',
    stages: ['intake', 'evidence_gap', 'amount_estimate', 'drafting', 'help_channel'],
    questions: [
      { id: 'employment_period', stage: 'intake', prompt: '请补充入职时间、岗位和工作城市。', missingLabel: '劳动关系期间' },
      { id: 'work_schedule', stage: 'intake', prompt: '请补充标准工时、实际出勤和休息日/法定节假日加班情况。', missingLabel: '工时和加班安排' },
      { id: 'wage_standard', stage: 'amount_estimate', prompt: '请补充工资基数、已付加班费和调休情况。', missingLabel: '工资基数和已付加班费' },
      { id: 'evidence_sources', stage: 'evidence_gap', prompt: '请补充考勤、排班、审批、聊天记录等证据来源。', missingLabel: '加班证据来源' },
      { id: 'help_channel', stage: 'help_channel', prompt: '请选择继续追问缺失事实或生成材料草稿。', missingLabel: '下一步输出路径' }
    ]
  },
  no_written_contract: {
    label: '未签书面劳动合同',
    stages: ['intake', 'evidence_gap', 'amount_estimate', 'drafting', 'help_channel'],
    questions: [
      { id: 'employment_period', stage: 'intake', prompt: '请补充入职时间、离职/在职状态和工作城市。', missingLabel: '劳动关系期间' },
      { id: 'contract_status', stage: 'intake', prompt: '请说明是否签过任何合同、协议或电子签文件。', missingLabel: '合同签订情况' },
      { id: 'wage_standard', stage: 'amount_estimate', prompt: '请补充月工资标准和未签合同持续月份。', missingLabel: '工资标准和未签期间' },
      { id: 'evidence_sources', stage: 'evidence_gap', prompt: '请补充 offer、工牌、工资流水、考勤、工作群等劳动关系证据。', missingLabel: '劳动关系证据来源' },
      { id: 'help_channel', stage: 'help_channel', prompt: '请选择继续追问缺失事实或生成材料草稿。', missingLabel: '下一步输出路径' }
    ]
  },
  illegal_termination: {
    label: '违法解除',
    stages: ['intake', 'evidence_gap', 'amount_estimate', 'drafting', 'help_channel'],
    questions: [
      {
        id: 'termination_notice',
        stage: 'intake',
        prompt: '请补充解除/辞退发生的时间、形式和公司是否给出书面通知。',
        missingLabel: '解除事实和通知形式'
      },
      {
        id: 'employer_reason',
        stage: 'intake',
        prompt: '请补充公司给出的解除理由、沟通过程和你是否签署过文件。',
        missingLabel: '公司理由和沟通过程'
      },
      {
        id: 'employment_period',
        stage: 'amount_estimate',
        prompt: '请补充入职日期、解除日期、工作城市和月工资标准。',
        missingLabel: '工作年限、地点和工资标准'
      },
      {
        id: 'wage_standard',
        stage: 'amount_estimate',
        prompt: '请补充近 12 个月平均工资、已付补偿和是否仍有欠薪。',
        missingLabel: '赔偿估算所需工资信息'
      },
      {
        id: 'evidence_sources',
        stage: 'evidence_gap',
        prompt: '请列明解除通知、聊天记录、考勤、工资流水、工作群变化等证据是否真实存在。',
        missingLabel: '解除和劳动关系证据来源'
      },
      {
        id: 'desired_output',
        stage: 'drafting',
        prompt: '请选择继续追问缺失事实或生成材料草稿。',
        missingLabel: '下一步输出路径'
      }
    ]
  }
};

const ALIASES = {
  termination: 'illegal_termination',
  no_contract: 'no_written_contract',
  overtime: 'overtime_pay'
};

const SAFE_PREVIEW_FIELDS = new Set([
  'city',
  'employment_period',
  'wage_standard',
  'unpaid_periods',
  'paid_records',
  'evidence_sources',
  'termination_notice',
  'employer_reason',
  'contract_status',
  'work_schedule',
  'desired_output',
  'help_channel'
]);

export function createAgentState(scenario = 'wage_arrears', initialAnswers = {}) {
  const scenarioId = normalizeScenario(scenario);
  const tree = SCENARIO_TREES[scenarioId] ?? SCENARIO_TREES.wage_arrears;
  return normalizeState({
    flowVersion: FLOW_VERSION,
    scenario: scenarioId,
    scenarioLabel: tree.label,
    currentStage: tree.questions[0].stage,
    answers: { ...initialAnswers },
    history: [],
    availablePaths: ['followup_missing_facts', 'draft_materials'],
    riskReminders: COMMON_RISK_REMINDERS,
    humanReviewReminder: HUMAN_REVIEW_REMINDER
  });
}

export function answerAgentQuestion(state, answers = {}) {
  const nextState = normalizeState({
    ...state,
    answers: { ...(state.answers ?? {}), ...compactObject(answers) },
    history: [
      ...(state.history ?? []),
      {
        answeredAt: new Date().toISOString(),
        fields: Object.keys(compactObject(answers))
      }
    ]
  });
  return {
    ...nextState,
    stepReminder: HUMAN_REVIEW_REMINDER
  };
}

export function buildModelCallPreview(state) {
  const normalized = normalizeState(state);
  const payload = {
    flowVersion: normalized.flowVersion,
    scenario: normalized.scenario,
    scenarioLabel: normalized.scenarioLabel,
    stage: normalized.currentStage,
    facts: {},
    redactedOmittedFields: {},
    missingFacts: normalized.missingFacts,
    requestedTask: normalized.availablePaths
  };
  const omittedFields = [];

  for (const [key, value] of Object.entries(normalized.answers ?? {})) {
    if (SAFE_PREVIEW_FIELDS.has(key)) {
      payload.facts[key] = sanitizeValue(value);
    } else {
      omittedFields.push(key);
      payload.redactedOmittedFields[key] = sanitizeValue(value);
    }
  }

  const scan = scanSensitiveInput(payload);
  return {
    requiresUserConfirmation: true,
    safeToSendExternally: scan.findings.length === 0,
    payload,
    omittedFields,
    findings: scan.findings,
    reminders: [
      ...scan.reminders,
      '调用外部模型前请逐项确认以上摘要确为必要且已脱敏；不要发送完整原始材料。'
    ],
    confirmationText: '请确认：即将发送的只是必要且已脱敏的摘要，而不是完整敏感材料。'
  };
}

export function buildAgentOutput(state, path = 'followup_missing_facts') {
  const normalized = normalizeState(state);
  if (path === 'draft_materials') {
    return {
      path,
      format: 'markdown',
      content: renderDraft(normalized)
    };
  }

  return {
    path: 'followup_missing_facts',
    format: 'json',
    content: {
      scenario: normalized.scenario,
      currentStage: normalized.currentStage,
      nextQuestion: normalized.nextQuestion,
      missingFacts: normalized.missingFacts,
      riskReminders: normalized.riskReminders,
      humanReviewReminder: normalized.humanReviewReminder
    }
  };
}

export function scanAgentModelOutput(text) {
  const result = scanOutputRisk(text);
  const readableRisks = [...result.risks];
  const value = String(text ?? '');
  addReadableRisk(readableRisks, value, 'impersonates_legal_professional', /(我是|本所|律师|法律专业人士)/);
  addReadableRisk(readableRisks, value, 'promises_result', /(保证|一定|必然|百分百).{0,12}(胜诉|赢|拿到|获赔|支持)/);
  addReadableRisk(readableRisks, value, 'fabricates_evidence', /(假|伪造|补一份|编一份|做一份|改一份).{0,12}(证据|考勤|合同|工资条|聊天记录|流水|通知)/);

  return {
    ...result,
    blocked: result.blocked || readableRisks.some((risk) => risk.severity === 'block'),
    risks: uniqueRisks(readableRisks),
    remediation: [
      ...result.remediation,
      '改为列出待核验事实、真实证据来源、缺失材料和人工复核提醒。'
    ]
  };
}

function normalizeState(state) {
  const scenarioId = normalizeScenario(state.scenario);
  const tree = SCENARIO_TREES[scenarioId] ?? SCENARIO_TREES.wage_arrears;
  const answers = state.answers ?? {};
  const missingQuestions = tree.questions.filter((question) => !hasAnswer(answers, question.id));
  const nextQuestion = missingQuestions[0] ?? null;
  const currentStage = nextQuestion?.stage ?? 'drafting';

  return {
    ...state,
    flowVersion: FLOW_VERSION,
    scenario: scenarioId,
    scenarioLabel: tree.label,
    currentStage,
    answers,
    nextQuestion,
    questionTree: tree.questions,
    missingFacts: missingQuestions.map((question) => question.id),
    missingFactLabels: missingQuestions.map((question) => question.missingLabel),
    availablePaths: state.availablePaths ?? ['followup_missing_facts', 'draft_materials'],
    riskReminders: state.riskReminders ?? COMMON_RISK_REMINDERS,
    humanReviewReminder: state.humanReviewReminder ?? HUMAN_REVIEW_REMINDER
  };
}

function normalizeScenario(value) {
  const key = String(value ?? '').trim();
  return ALIASES[key] ?? key;
}

function hasAnswer(answers, key) {
  const value = answers[key];
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function compactObject(input) {
  return Object.fromEntries(
    Object.entries(input ?? {}).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
  );
}

function sanitizeValue(value) {
  return String(value)
    .replace(/1[3-9]\d{9}/g, (match) => `${match.slice(0, 3)}****${match.slice(-4)}`)
    .replace(/\d{17}[\dXx]/g, (match) => `${match.slice(0, 6)}********${match.slice(-4)}`);
}

function renderDraft(state) {
  const lines = [
    `# ${state.scenarioLabel}材料整理草稿`,
    '',
    '> 重要提示：本草稿仅用于咨询前材料整理，不构成法律意见。事实、证据、金额、时效、管辖和当地政策均需人工复核。',
    '',
    '## 已收集事实',
    ...Object.entries(state.answers).map(([key, value]) => `- ${key}: ${sanitizeValue(value)}`),
    '',
    '## 缺失事实',
    ...(state.missingFactLabels.length ? state.missingFactLabels.map((item) => `- ${item}`) : ['- 暂无，但仍需人工核验原始材料。']),
    '',
    '## 风险提醒',
    ...state.riskReminders.map((item) => `- ${item}`),
    '',
    '## 可复核输出',
    '- 继续追问缺失事实：用于补齐事实、证据来源和金额口径。',
    '- 生成材料草稿：优先生成 Markdown/JSON，便于劳动者或协作者逐项核对。'
  ];

  if (state.scenario === 'illegal_termination') {
    lines.splice(1, 0, '', '本部分围绕违法解除/辞退争议整理，但不判断解除必然违法。');
  }

  return lines.join('\n');
}

function addReadableRisk(risks, text, id, pattern) {
  if (!pattern.test(text) || risks.some((risk) => risk.id === id)) return;
  risks.push({
    id,
    severity: 'block',
    message: '模型输出触发安全边界，需要删除或改写后再展示。'
  });
}

function uniqueRisks(risks) {
  const seen = new Set();
  return risks.filter((risk) => {
    if (seen.has(risk.id)) return false;
    seen.add(risk.id);
    return true;
  });
}
