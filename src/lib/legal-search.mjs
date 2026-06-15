import { readFile } from 'node:fs/promises';

const DATA_URL = new URL('../../data/law-basis.json', import.meta.url);

export async function searchLawBasis(query, options = {}) {
  const records = JSON.parse(await readFile(DATA_URL, 'utf-8'));
  const normalizedQuery = String(query ?? '').trim();
  if (!normalizedQuery) throw new Error('请提供法条检索关键词');

  const limit = Number(options.limit ?? 5);
  const terms = expandTerms(normalizedQuery);
  const results = records
    .map((record) => ({ ...record, score: scoreRecord(record, terms) }))
    .filter((record) => record.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, limit);

  return {
    query: normalizedQuery,
    results,
    warnings: [
      '本检索仅基于本地启动版索引，不构成法律意见。',
      '条文、时效、管辖和当地裁审口径可能变化，提交材料前请到官方渠道核验。'
    ]
  };
}

function expandTerms(query) {
  const raw = query.toLowerCase().split(/[\s,，。；;、]+/).filter(Boolean);
  const terms = new Set(raw);
  const aliases = {
    欠薪: ['拖欠', '工资', '劳动报酬'],
    拖欠工资: ['拖欠', '工资', '劳动报酬'],
    仲裁时效: ['仲裁时效', '时效', '第二十七条'],
    加班费: ['加班', '延长工作时间', '第四十四条'],
    未签合同: ['书面劳动合同', '二倍工资', '第八十二条'],
    法律援助: ['法律援助', '12348']
  };
  for (const term of raw) {
    for (const [key, values] of Object.entries(aliases)) {
      if (term.includes(key) || key.includes(term)) values.forEach((value) => terms.add(value));
    }
  }
  return [...terms];
}

function scoreRecord(record, terms) {
  const haystack = [
    record.id,
    record.law,
    record.topic,
    record.articleHint,
    record.summary,
    ...(record.verifyAt ?? [])
  ].join(' ').toLowerCase();
  return terms.reduce((score, term) => score + (haystack.includes(term.toLowerCase()) ? term.length : 0), 0);
}
