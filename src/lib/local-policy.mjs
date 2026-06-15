import { readFile } from 'node:fs/promises';

const DATA_URL = new URL('../../data/local-policy-index-cn.json', import.meta.url);

export async function lookupLocalPolicies(regionNameOrCode, topic = '') {
  const dataset = JSON.parse(await readFile(DATA_URL, 'utf-8'));
  const regionQuery = String(regionNameOrCode ?? '').trim().toLowerCase();
  if (!regionQuery) throw new Error('请提供地区名称，例如 深圳、广东 或 全国');
  const topicQuery = String(topic ?? '').trim().toLowerCase();

  const records = dataset.records
    .map((record) => ({ ...record, score: scorePolicy(record, regionQuery, topicQuery) }))
    .filter((record) => record.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  if (!records.length) throw new Error(`未找到本地政策索引：${regionNameOrCode}`);

  return {
    dataset: {
      datasetId: dataset.datasetId,
      schemaVersion: dataset.schemaVersion,
      lastReviewed: dataset.lastReviewed
    },
    region: {
      name: records[0].city || records[0].province,
      province: records[0].province,
      city: records[0].city
    },
    records: records.map(({ score, ...record }) => record),
    warnings: dataset.importantNotice
  };
}

function scorePolicy(record, regionQuery, topicQuery) {
  let score = 0;
  const regionText = `${record.province} ${record.city} ${record.id}`.toLowerCase();
  if (regionText.includes(regionQuery)) score += 20;
  if (record.province === '全国' && ['全国', '国家', '通用'].some((item) => regionQuery.includes(item))) score += 20;
  if (!topicQuery) return score;

  const topicText = [
    ...record.topics,
    record.summary,
    ...record.searchKeywords
  ].join(' ').toLowerCase();
  if (topicText.includes(topicQuery)) score += 10;
  for (const part of topicQuery.split(/[\s,，。；;、]+/).filter(Boolean)) {
    if (topicText.includes(part)) score += part.length;
  }
  return score;
}
