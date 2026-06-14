import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { renderArbitrationDraft } from './drafts.mjs';

export async function exportDocument(kind, input, outputPath) {
  const output = resolve(process.cwd(), outputPath);
  await mkdir(dirname(output), { recursive: true });
  const markdown = renderDocument(kind, input);
  const ext = extname(output).toLowerCase();
  let content = markdown;
  if (ext === '.html' || ext === '.htm' || ext === '.doc') {
    content = renderHtmlDocument(markdown, kind);
  }
  await writeFile(output, content, 'utf-8');
  return { outputPath: output, format: ext.slice(1) || 'md', bytes: Buffer.byteLength(content, 'utf-8') };
}

export function renderDocument(kind, input) {
  switch (kind) {
    case 'arbitration':
      return renderArbitrationDraft(input);
    case 'legal-aid-summary':
      return renderLegalAidSummary(input);
    case 'evidence-index':
      return renderEvidenceIndex(input);
    default:
      throw new Error(`暂不支持的文书类型：${kind}`);
  }
}

export function renderHtmlDocument(markdown, title = 'Worker Aid Document') {
  const body = markdownToHtml(markdown);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif; max-width: 860px; margin: 32px auto; padding: 0 24px; line-height: 1.75; color: #172033; }
    h1, h2, h3 { line-height: 1.35; }
    blockquote { border-left: 4px solid #2684ff; margin: 16px 0; padding: 8px 16px; background: #f5f9ff; color: #344563; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #dfe1e6; padding: 8px; }
    @media print { body { margin: 0 auto; } }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

function renderLegalAidSummary(input) {
  const worker = input.worker ?? {};
  const employer = input.employer ?? {};
  const facts = input.facts ?? {};
  return `# 法律援助/公益咨询情况摘要（草稿）

> 本摘要用于向 12348、法律援助中心、工会或公益律师说明情况，不构成法律意见。

## 一、基本信息

- 劳动者：${worker.name ?? '【姓名】'}
- 工作城市：${worker.city ?? '【城市】'}
- 用人单位：${employer.name ?? '【单位全称】'}
- 入职时间：${facts.startDate ?? '【入职日期】'}
- 岗位：${facts.position ?? '【岗位】'}
- 工资标准：${facts.monthlySalary ?? '【金额】'} 元/月

## 二、主要诉求

${(input.claims ?? ['【请补充：拖欠工资/未签合同二倍工资/解除赔偿/加班费等】']).map((item, i) => `${i + 1}. ${item}`).join('\n')}

## 三、关键事实

- 劳动合同情况：${facts.hasWrittenContract === false ? '未签书面劳动合同' : '【请补充】'}
- 欠薪情况：${facts.unpaidWages ? `约 ${facts.unpaidWages} 元` : '【请补充】'}
- 解除/离职情况：${facts.terminationReason ?? '【请补充】'}
- 已采取措施：${facts.actionsTaken ?? '【例如：沟通催讨、投诉、申请仲裁、咨询12348等】'}

## 四、已掌握证据

${(input.evidence ?? ['劳动合同/offer/入职记录', '工资条/银行流水/个税或社保记录', '考勤记录', '聊天记录/邮件/通知']).map((item, i) => `${i + 1}. ${item}`).join('\n')}

## 五、需要咨询的问题

1. 本案应优先走劳动监察投诉、劳动仲裁，还是法律援助申请？
2. 仲裁请求和金额口径是否需要调整？
3. 证据是否足够，还需要补充哪些材料？
4. 是否存在时效风险或管辖问题？
`;
}

function renderEvidenceIndex(input) {
  const evidence = input.evidence ?? [];
  const rows = evidence.length ? evidence : [
    '劳动合同/offer/入职通知',
    '工资条/银行流水',
    '考勤记录',
    '催讨工资聊天记录',
    '解除通知或离职沟通记录'
  ];
  return `# 证据目录（草稿）

> 提交前请按当地仲裁委要求编号、打印、截图留存原件来源，并避免伪造或篡改证据。

| 序号 | 证据名称 | 证明目的 | 备注 |
|---:|---|---|---|
${rows.map((item, i) => `| ${i + 1} | ${item} | 【请填写证明目的】 | 【页码/截图时间/来源】 |`).join('\n')}
`;
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let inUl = false;
  let inOl = false;
  let inTable = false;
  for (const line of lines) {
    if (line.startsWith('|')) {
      if (!inTable) { html.push('<table>'); inTable = true; }
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
      if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
      const tag = html.length && html[html.length - 1] === '<table>' ? 'th' : 'td';
      html.push(`<tr>${cells.map((cell) => `<${tag}>${inline(cell)}</${tag}>`).join('')}</tr>`);
      continue;
    }
    if (inTable) { html.push('</table>'); inTable = false; }
    if (/^\d+\.\s+/.test(line)) {
      if (!inOl) { html.push('<ol>'); inOl = true; }
      html.push(`<li>${inline(line.replace(/^\d+\.\s+/, ''))}</li>`);
      continue;
    }
    if (/^-\s+/.test(line)) {
      if (!inUl) { html.push('<ul>'); inUl = true; }
      html.push(`<li>${inline(line.replace(/^-\s+/, ''))}</li>`);
      continue;
    }
    if (inOl) { html.push('</ol>'); inOl = false; }
    if (inUl) { html.push('</ul>'); inUl = false; }
    if (line.startsWith('### ')) html.push(`<h3>${inline(line.slice(4))}</h3>`);
    else if (line.startsWith('## ')) html.push(`<h2>${inline(line.slice(3))}</h2>`);
    else if (line.startsWith('# ')) html.push(`<h1>${inline(line.slice(2))}</h1>`);
    else if (line.startsWith('> ')) html.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
    else if (line.trim()) html.push(`<p>${inline(line)}</p>`);
  }
  if (inTable) html.push('</table>');
  if (inOl) html.push('</ol>');
  if (inUl) html.push('</ul>');
  return html.join('\n');
}

function inline(text) {
  return escapeHtml(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
