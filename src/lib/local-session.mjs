import { normalizeModelConfig } from './product-entry.mjs';

export const SESSION_SCHEMA_VERSION = '1';

export function buildLocalSessionSnapshot(caseInput = {}, modelInput = {}) {
  return {
    schemaVersion: SESSION_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    storage: 'local-browser-only',
    case: caseInput,
    model: normalizeModelConfig(modelInput),
    reminders: [
      '本地会话只应保存在用户本机浏览器中。',
      '不要把未脱敏原始材料、完整身份证号、手机号、住址或银行卡号保存到公开环境。'
    ]
  };
}

export function parseLocalSessionSnapshot(serialized) {
  try {
    const value = JSON.parse(String(serialized || ''));
    if (!value || value.schemaVersion !== SESSION_SCHEMA_VERSION || !value.case) {
      return { ok: false, error: '本地会话格式不匹配，请重新填写案情。' };
    }
    return { ok: true, value };
  } catch {
    return { ok: false, error: '无法读取本地会话，请重新填写案情。' };
  }
}
