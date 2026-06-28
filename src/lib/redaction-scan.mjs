const RULES = [
  {
    type: 'phone',
    severity: 'block',
    pattern: /1[3-9]\d{9}/,
    message: '检测到完整手机号。请脱敏为 138****8000 这类格式后再发送。'
  },
  {
    type: 'id_number',
    severity: 'block',
    pattern: /\d{17}[\dXx]/,
    message: '检测到疑似完整身份证号。请删除或脱敏后再整理材料。'
  },
  {
    type: 'bank_card_hint',
    severity: 'warn',
    pattern: /(银行卡|卡号|开户行|银行账户)/,
    message: '检测到银行卡相关描述。请只保留必要尾号，并人工复核脱敏结果。'
  },
  {
    type: 'address_hint',
    severity: 'warn',
    pattern: /(住址|家庭地址|小区|楼栋|门牌号|宿舍地址)/,
    message: '检测到住址相关描述。公开或发送外部模型前请概括到省市区级别。'
  },
  {
    type: 'raw_chat_hint',
    severity: 'warn',
    pattern: /(完整聊天记录|聊天截图原图|微信截图|QQ截图|钉钉截图)/,
    message: '检测到疑似原始聊天记录描述。请改为摘要，并保留原件由劳动者本人妥善保存。'
  }
];

export function scanSensitiveInput(value = '') {
  const text = JSON.stringify(value);
  const findings = RULES
    .filter((rule) => rule.pattern.test(text))
    .map(({ pattern, ...rule }) => rule);
  return {
    safeToSendExternally: findings.length === 0,
    findings,
    reminders: findings.length
      ? findings.map((item) => item.message)
      : ['未检测到常见完整敏感标识。提交前仍应人工复核脱敏结果。']
  };
}
