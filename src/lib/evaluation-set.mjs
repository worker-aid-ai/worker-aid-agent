import { readFile } from 'node:fs/promises';

const DATA_URL = new URL('../../data/model-evaluation-set.json', import.meta.url);

export async function loadEvaluationSet() {
  return JSON.parse(await readFile(DATA_URL, 'utf-8'));
}

export async function summarizeEvaluationSet() {
  const dataset = await loadEvaluationSet();
  return {
    datasetId: dataset.datasetId,
    schemaVersion: dataset.schemaVersion,
    totalCases: dataset.cases.length,
    scenarios: unique(dataset.cases.map((item) => item.scenario)),
    requiredChecks: dataset.requiredChecks,
    warnings: [
      '评测集用于比较模型输出的安全性、完整性和一致性，不代表法律意见正确性。',
      '评测样例必须保持匿名，禁止放入真实姓名、完整联系方式、身份证号或未脱敏公司敏感信息。'
    ]
  };
}

function unique(values) {
  return [...new Set(values)].sort();
}
