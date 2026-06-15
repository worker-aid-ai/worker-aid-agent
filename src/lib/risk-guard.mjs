const RULES = [
  {
    id: 'impersonates_legal_professional',
    severity: 'block',
    pattern: /(我是|本所|本律师|专业律师|律师团队)/,
    message: '输出不得冒充律师、律所或法律专业人士身份。'
  },
  {
    id: 'promises_result',
    severity: 'block',
    pattern: /(保证|一定|必然|百分百).{0,12}(胜诉|赢|拿到|获赔|支持)/,
    message: '输出不得承诺仲裁、诉讼、投诉、法律援助或协商结果。'
  },
  {
    id: 'fabricates_evidence',
    severity: 'block',
    pattern: /(假|伪造|补一份|编一份|做一份|改一下).{0,12}(证据|考勤|合同|工资条|聊天记录|流水|通知)/,
    message: '输出不得建议伪造、篡改或诱导补造证据。'
  },
  {
    id: 'missing_human_review',
    severity: 'warn',
    pattern: /^(?![\s\S]*(复核|核验|不构成法律意见|法律援助|律师|仲裁委|劳动监察))/,
    message: '法律相关输出应包含不确定性或人工复核提醒。'
  }
];

export function scanOutputRisk(text) {
  const value = String(text ?? '');
  const risks = RULES
    .filter((rule) => rule.pattern.test(value))
    .map(({ pattern, ...rule }) => rule);
  const blocked = risks.some((risk) => risk.severity === 'block');
  return {
    blocked,
    risks,
    remediation: [
      '删除承诺结果、冒充专业身份或伪造证据相关内容。',
      '改为整理真实事实、证据来源、待核验问题和人类复核提醒。',
      '提交给机构、平台或公开发布前，应由劳动者本人或专业人士人工复核。'
    ]
  };
}
