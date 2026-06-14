let minimumDataset;
let currentCase;
let currentDoc = '';

const $ = (id) => document.getElementById(id);

init();

async function init() {
  minimumDataset = await fetch('/data/minimum-wage-cn-2025.json').then((res) => res.json());
  const select = $('minimumRegion');
  for (const record of minimumDataset.records) {
    const option = document.createElement('option');
    option.value = record.regionName;
    option.textContent = record.regionName;
    select.appendChild(option);
  }
  select.value = '深圳';
  $('buildCase').addEventListener('click', buildCase);
  $('downloadCase').addEventListener('click', () => download('worker-aid-case.json', JSON.stringify(buildCase(), null, 2), 'application/json'));
  $('calcOvertime').addEventListener('click', calcOvertime);
  $('lookupMinimum').addEventListener('click', lookupMinimum);
  document.querySelectorAll('[data-doc]').forEach((button) => button.addEventListener('click', () => buildDoc(button.dataset.doc)));
  $('downloadMd').addEventListener('click', () => download('worker-aid-document.md', currentDoc || $('docOutput').value, 'text/markdown'));
  $('downloadHtml').addEventListener('click', () => download('worker-aid-document.html', wrapHtml(currentDoc || $('docOutput').value), 'text/html'));
}

function buildCase() {
  const hasContractValue = $('hasContract').value;
  currentCase = {
    worker: { name: $('workerName').value || '【劳动者姓名】', city: $('city').value || '【城市】' },
    employer: { name: $('employerName').value || '【用人单位全称】' },
    facts: {
      startDate: $('startDate').value || '【入职日期】',
      position: $('position').value || '【岗位】',
      monthlySalary: Number($('monthlySalary').value || 0),
      unpaidWages: Number($('unpaidWages').value || 0),
      hasWrittenContract: hasContractValue === 'unknown' ? undefined : hasContractValue === 'true'
    },
    claims: $('claims').value.split('\n').map((item) => item.trim()).filter(Boolean)
  };
  $('caseOutput').textContent = JSON.stringify(currentCase, null, 2);
  return currentCase;
}

function calcOvertime() {
  const monthlySalary = number($('otSalary').value);
  const hourly = monthlySalary / 21.75 / 8;
  const workdayPay = hourly * number($('otWorkday').value) * 1.5;
  const restPay = hourly * number($('otRest').value) * 2;
  const holidayPay = hourly * number($('otHoliday').value) * 3;
  const alreadyPaid = number($('otPaid').value);
  const total = workdayPay + restPay + holidayPay;
  $('overtimeOutput').textContent = JSON.stringify({
    basis: { dailyWage: round(monthlySalary / 21.75), hourlyWage: round(hourly), multipliers: { workday: 1.5, restDay: 2, statutoryHoliday: 3 } },
    estimate: { workdayPay: round(workdayPay), restDayPay: round(restPay), statutoryHolidayPay: round(holidayPay), totalPayable: round(total), alreadyPaid: round(alreadyPaid), estimatedDifference: round(Math.max(total - alreadyPaid, 0)) },
    warning: '仅为估算，请结合工资基数、调休、证据和当地口径核验。'
  }, null, 2);
}

function lookupMinimum() {
  const regionName = $('minimumRegion').value;
  const tier = Number($('minimumTier').value || 1);
  const record = minimumDataset.records.find((item) => item.regionName === regionName);
  const monthly = record.monthlyMinimumWageTiers.find((item) => item.tier === tier) || record.monthlyMinimumWageTiers[0];
  const hourly = record.hourlyMinimumWageTiers.find((item) => item.tier === tier) || record.hourlyMinimumWageTiers[0];
  $('minimumOutput').textContent = JSON.stringify({
    region: record.regionName,
    tier,
    monthlyMinimumWage: monthly.amount,
    hourlyMinimumWage: hourly.amount,
    effectiveAsOf: minimumDataset.effectiveAsOf,
    warning: minimumDataset.importantNotice[0]
  }, null, 2);
}

function buildDoc(kind) {
  const data = currentCase || buildCase();
  if (kind === 'arbitration') currentDoc = renderArbitration(data);
  else if (kind === 'legal-aid-summary') currentDoc = renderLegalAidSummary(data);
  else currentDoc = renderEvidenceIndex(data);
  $('docOutput').value = currentDoc;
}

function renderArbitration(input) {
  const worker = input.worker || {}, employer = input.employer || {}, facts = input.facts || {}, claims = input.claims || [];
  return `# 劳动人事争议仲裁申请书（草稿）\n\n> 重要提示：本文件为 AI 辅助生成草稿，不构成法律意见。提交前请核验当地仲裁委格式、管辖、主体信息、请求金额、证据编号和时效。\n\n## 申请人\n\n姓名：${worker.name || '【劳动者姓名】'}  \n工作地点：${worker.city || '【工作城市】'}\n\n## 被申请人\n\n名称：${employer.name || '【用人单位全称】'}\n\n## 仲裁请求\n\n${claims.length ? claims.map((item, i) => `${i + 1}. ${item}；`).join('\n') : '1. 【请填写仲裁请求和金额】'}\n\n## 事实与理由\n\n申请人于 ${facts.startDate || '【入职日期】'} 入职被申请人，岗位为 ${facts.position || '【岗位】'}，约定/月平均工资为 ${facts.monthlySalary || '【金额】'} 元。\n\n${facts.hasWrittenContract === false ? '入职后，被申请人未依法与申请人签订书面劳动合同。' : '双方劳动合同签订情况为：【请补充】。'}\n\n${facts.unpaidWages ? `截至目前，被申请人尚欠申请人工资约 ${facts.unpaidWages} 元。` : '关于工资支付情况：【请补充】。'}\n\n## 证据目录（示例）\n\n1. 劳动关系证据；\n2. 工资证据；\n3. 欠薪/催讨证据；\n4. 解除证据；\n5. 其他证据。\n`;
}

function renderLegalAidSummary(input) {
  const worker = input.worker || {}, employer = input.employer || {}, facts = input.facts || {};
  return `# 法律援助/公益咨询情况摘要（草稿）\n\n- 劳动者：${worker.name || '【姓名】'}\n- 工作城市：${worker.city || '【城市】'}\n- 用人单位：${employer.name || '【单位】'}\n- 入职时间：${facts.startDate || '【入职日期】'}\n- 月工资：${facts.monthlySalary || '【金额】'} 元\n- 欠薪：${facts.unpaidWages || '【金额】'} 元\n\n## 需要咨询的问题\n\n1. 应优先走劳动监察投诉、劳动仲裁，还是法律援助申请？\n2. 仲裁请求和金额口径是否需要调整？\n3. 证据是否足够？\n`;
}

function renderEvidenceIndex() {
  return `# 证据目录（草稿）\n\n| 序号 | 证据名称 | 证明目的 | 备注 |\n|---:|---|---|---|\n| 1 | 劳动合同/offer/入职记录 | 证明劳动关系 |  |\n| 2 | 工资条/银行流水 | 证明工资标准和实发金额 |  |\n| 3 | 考勤记录 | 证明出勤/加班 |  |\n| 4 | 催讨记录 | 证明欠薪和催讨过程 |  |\n`;
}

function wrapHtml(markdown) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>Worker Aid Document</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Microsoft YaHei',sans-serif;max-width:860px;margin:32px auto;line-height:1.75;padding:0 24px}</style></head><body><pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(markdown)}</pre></body></html>`;
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

function number(value) { return Number(value || 0); }
function round(value) { return Number(value.toFixed(2)); }
function escapeHtml(value) { return String(value).replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char])); }
