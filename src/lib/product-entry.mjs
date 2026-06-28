const DEFAULT_OUTPUTS = [
  'case-json',
  'timeline',
  'legal-aid-summary',
  'arbitration-draft',
  'evidence-index'
];

export function normalizeModelConfig(input = {}) {
  const apiKey = String(input.apiKey ?? '').trim();
  return {
    provider: String(input.provider ?? 'not-configured').trim() || 'not-configured',
    baseUrl: String(input.baseUrl ?? '').trim(),
    model: String(input.model ?? '').trim(),
    hasApiKey: apiKey.length > 0,
    apiKeyPreview: apiKey ? maskApiKey(apiKey) : ''
  };
}

export function canCallExternalModel(config = {}, options = {}) {
  const missing = [];
  if (!config.provider || config.provider === 'not-configured') missing.push('provider');
  if (!config.model) missing.push('model');
  if (!config.hasApiKey) missing.push('apiKey');
  if (!options.confirmedExternalCall) missing.push('userConfirmation');

  return {
    allowed: missing.length === 0,
    missing,
    reminder: '调用外部模型前必须由用户明确确认；不要上传身份证号、完整手机号、住址、银行卡号、未脱敏合同或完整聊天记录。'
  };
}

export function buildLocalAgentSession(caseInput = {}, options = {}) {
  return {
    protocolVersion: '1.0',
    mode: 'local-first',
    taskType: 'intake',
    case: caseInput,
    model: normalizeModelConfig(options.model ?? {}),
    availableOutputs: DEFAULT_OUTPUTS,
    privacyReminder: '默认仅在本机处理。只有在用户明确确认后，才可以把必要且已脱敏的摘要发送给外部模型。',
    safetyBoundaries: [
      '不冒充律师、法律援助机构、仲裁委、法院或行政机关。',
      '不承诺投诉、仲裁、诉讼、调解或法律援助结果。',
      '不生成、补写、篡改或诱导伪造证据。',
      '涉及金额、时效、管辖、证据证明力和地方政策时，必须提示不确定性。'
    ],
    humanReviewReminder: '所有输出仅为材料整理草稿。提交给任何机构、平台或人员前，请由劳动者本人和具备相应职责的人类工作人员人工复核事实、证据、金额、时效、管辖和法律适用。'
  };
}

function maskApiKey(value) {
  if (value.length <= 8) return '已填写';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
