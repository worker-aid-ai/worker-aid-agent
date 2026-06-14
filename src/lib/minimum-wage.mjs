import { readFile } from 'node:fs/promises';

const DATA_URL = new URL('../../data/minimum-wage-cn-2025.json', import.meta.url);

export async function loadMinimumWageDataset() {
  return JSON.parse(await readFile(DATA_URL, 'utf-8'));
}

export async function lookupMinimumWage(regionNameOrCode, tier = 1) {
  const dataset = await loadMinimumWageDataset();
  const query = String(regionNameOrCode ?? '').trim().toLowerCase();
  if (!query) throw new Error('请提供省市名称或 regionCode');
  const record = dataset.records.find((item) => {
    return item.regionName.toLowerCase() === query || item.regionCode.toLowerCase() === query || item.regionName.includes(query);
  });
  if (!record) throw new Error(`未找到最低工资地区：${regionNameOrCode}`);
  const monthly = record.monthlyMinimumWageTiers.find((item) => item.tier === Number(tier)) ?? record.monthlyMinimumWageTiers[0];
  const hourly = record.hourlyMinimumWageTiers.find((item) => item.tier === Number(tier)) ?? record.hourlyMinimumWageTiers[0];
  return {
    dataset: {
      datasetId: dataset.datasetId,
      effectiveAsOf: dataset.effectiveAsOf,
      lastReviewed: dataset.lastReviewed,
      authorityLevel: dataset.authorityLevel
    },
    region: {
      code: record.regionCode,
      name: record.regionName,
      tier: Number(tier),
      tierNote: record.tierNote,
      verificationStatus: record.verificationStatus
    },
    minimumWage: {
      monthly: monthly?.amount ?? null,
      hourly: hourly?.amount ?? null,
      currency: dataset.currency
    },
    warnings: dataset.importantNotice
  };
}

export function checkMonthlyWageAgainstMinimum(actualMonthlyWage, minimumMonthlyWage) {
  const actual = Number(actualMonthlyWage);
  const minimum = Number(minimumMonthlyWage);
  if (!Number.isFinite(actual) || !Number.isFinite(minimum)) throw new Error('actualMonthlyWage 和 minimumMonthlyWage 必须是数字');
  return {
    actualMonthlyWage: actual,
    minimumMonthlyWage: minimum,
    belowMinimum: actual < minimum,
    difference: Number(Math.max(minimum - actual, 0).toFixed(2))
  };
}
