export function anonymizeCommunityCase(input = {}) {
  const replacements = collectReplacements(input);
  const caseCopy = replaceInValue(input, replacements);

  if (caseCopy.worker?.name) caseCopy.worker.name = '劳动者A';
  if (caseCopy.worker?.phone) caseCopy.worker.phone = maskPhone(caseCopy.worker.phone);
  if (caseCopy.worker?.idNumber) caseCopy.worker.idNumber = maskIdNumber(caseCopy.worker.idNumber);
  if (caseCopy.employer?.name) caseCopy.employer.name = '某公司';

  const serialized = JSON.stringify(caseCopy);
  const remainingSensitive = /(1[3-9]\d{9})|(\d{17}[\dXx])/.test(serialized);

  return {
    safeToShare: !remainingSensitive,
    case: caseCopy,
    redactions: replacements.map((item) => ({ type: item.type, replacement: item.replacement })),
    reminders: [
      '公开前人工复核：确认姓名、电话、身份证号、住址、公司全称、账号、合同原件和聊天截图均已脱敏。',
      '社区案例只用于经验贡献和互助讨论，不得包含伪造证据或可识别个人的敏感信息。'
    ]
  };
}

function collectReplacements(input) {
  const replacements = [];
  const worker = input.worker ?? {};
  const employer = input.employer ?? {};

  if (worker.name) replacements.push({ type: 'worker_name', value: worker.name, replacement: '劳动者A' });
  if (worker.phone) replacements.push({ type: 'phone', value: worker.phone, replacement: maskPhone(worker.phone) });
  if (worker.idNumber) replacements.push({ type: 'id_number', value: worker.idNumber, replacement: maskIdNumber(worker.idNumber) });
  if (employer.name) replacements.push({ type: 'employer_name', value: employer.name, replacement: '某公司' });

  return replacements.filter((item) => item.value && item.value !== item.replacement);
}

function replaceInValue(value, replacements) {
  if (Array.isArray(value)) return value.map((item) => replaceInValue(item, replacements));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, replaceInValue(child, replacements)]));
  }
  if (typeof value !== 'string') return value;
  return replacements.reduce((text, item) => text.split(item.value).join(item.replacement), value);
}

function maskPhone(value) {
  const phone = String(value);
  return phone.replace(/^(1[3-9]\d)(\d{4})(\d{4})$/, '$1****$3');
}

function maskIdNumber(value) {
  const id = String(value);
  return id.replace(/^(\d{6})\d{8}(\d{3}[\dXx])$/, '$1********$2');
}
