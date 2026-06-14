const ROUND = 2;

export function roundMoney(value) {
  return Number(Number(value).toFixed(ROUND));
}

export function assertNonNegativeNumber(value, name) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${name} 必须是非负数字`);
  }
  return n;
}

export function calculateWageArrears(input) {
  const records = Array.isArray(input.records) ? input.records : buildRecordsFromSummary(input);
  if (!records.length) throw new Error('至少需要一条工资欠付记录');

  const normalized = records.map((item, index) => {
    const expected = assertNonNegativeNumber(item.expected, `records[${index}].expected`);
    const paid = assertNonNegativeNumber(item.paid ?? 0, `records[${index}].paid`);
    const difference = Math.max(expected - paid, 0);
    return {
      period: item.period ?? `第 ${index + 1} 期`,
      expected: roundMoney(expected),
      paid: roundMoney(paid),
      difference: roundMoney(difference),
      note: item.note ?? ''
    };
  });

  const totalExpected = normalized.reduce((sum, item) => sum + item.expected, 0);
  const totalPaid = normalized.reduce((sum, item) => sum + item.paid, 0);
  const totalDifference = normalized.reduce((sum, item) => sum + item.difference, 0);

  return {
    records: normalized,
    estimate: {
      totalExpected: roundMoney(totalExpected),
      totalPaid: roundMoney(totalPaid),
      wageArrears: roundMoney(totalDifference)
    },
    warnings: [
      '工资欠付金额应结合劳动合同、工资条、银行流水、个税记录、考勤和公司确认记录核验。',
      '若存在提成、绩效、补贴、扣款、病事假等情况，应单独列明计算口径。'
    ]
  };
}

export function calculateNoWrittenContractDoubleWage(input) {
  const monthlySalary = assertNonNegativeNumber(input.monthlySalary, 'monthlySalary');
  const monthsWithoutContract = assertNonNegativeNumber(input.monthsWithoutContract, 'monthsWithoutContract');
  const alreadyPaidDoubleWage = assertNonNegativeNumber(input.alreadyPaidDoubleWage ?? 0, 'alreadyPaidDoubleWage');
  const cappedMonths = Math.min(monthsWithoutContract, Number(input.capMonths ?? 11));
  const gross = monthlySalary * cappedMonths;

  return {
    input: {
      monthlySalary: roundMoney(monthlySalary),
      monthsWithoutContract: roundMoney(monthsWithoutContract),
      capMonths: Number(input.capMonths ?? 11),
      alreadyPaidDoubleWage: roundMoney(alreadyPaidDoubleWage)
    },
    estimate: {
      claimableMonths: roundMoney(cappedMonths),
      grossDoubleWageDifference: roundMoney(gross),
      alreadyPaidDoubleWage: roundMoney(alreadyPaidDoubleWage),
      estimatedDifference: roundMoney(Math.max(gross - alreadyPaidDoubleWage, 0))
    },
    warnings: [
      '未签书面劳动合同二倍工资通常涉及起算时间、已支付工资是否抵扣、仲裁时效等问题。',
      '这里仅作金额草算，不判断是否已超过时效，也不替代律师或仲裁委认定。'
    ]
  };
}

export function calculateEconomicCompensation(input) {
  const monthlySalary = assertNonNegativeNumber(input.monthlySalary, 'monthlySalary');
  const serviceMonths = assertNonNegativeNumber(input.serviceMonths, 'serviceMonths');
  const alreadyPaid = assertNonNegativeNumber(input.alreadyPaid ?? 0, 'alreadyPaid');
  const years = Math.floor(serviceMonths / 12);
  const remainingMonths = serviceMonths % 12;
  const compensationMonths = years + (remainingMonths >= 6 ? 1 : remainingMonths > 0 ? 0.5 : 0);
  const gross = monthlySalary * compensationMonths;

  return {
    input: {
      monthlySalary: roundMoney(monthlySalary),
      serviceMonths: roundMoney(serviceMonths),
      alreadyPaid: roundMoney(alreadyPaid)
    },
    basis: {
      compensationMonths: roundMoney(compensationMonths),
      ruleSummary: '每满一年按一个月工资；六个月以上不满一年按一年；不满六个月按半个月工资。'
    },
    estimate: {
      grossEconomicCompensation: roundMoney(gross),
      alreadyPaid: roundMoney(alreadyPaid),
      estimatedDifference: roundMoney(Math.max(gross - alreadyPaid, 0))
    },
    warnings: [
      '经济补偿月工资基数、十二个月平均工资、三倍社平工资封顶、违法解除赔偿金等问题需要进一步核验。',
      '本函数只计算基础 N，不自动判断是否应为 N、N+1、2N 或其他口径。'
    ]
  };
}

export function calculateIllegalTerminationCompensation(input) {
  const economic = calculateEconomicCompensation(input);
  const gross = economic.estimate.grossEconomicCompensation * 2;
  const alreadyPaid = assertNonNegativeNumber(input.alreadyPaid ?? 0, 'alreadyPaid');
  return {
    ...economic,
    estimate: {
      grossEconomicCompensation: economic.estimate.grossEconomicCompensation,
      grossIllegalTerminationCompensation: roundMoney(gross),
      alreadyPaid: roundMoney(alreadyPaid),
      estimatedDifference: roundMoney(Math.max(gross - alreadyPaid, 0))
    },
    warnings: [
      '违法解除赔偿金是否成立取决于解除事实、证据、公司理由、程序合法性和当地裁审口径。',
      '本函数只在“已初步认定违法解除”的假设下计算 2N 估算值。'
    ]
  };
}

function buildRecordsFromSummary(input) {
  const monthlyExpected = input.monthlyExpected ?? input.monthlySalary;
  const months = Number(input.months ?? input.unpaidMonths ?? 0);
  if (!monthlyExpected || !months) return [];
  const paidPerMonth = Number(input.paidPerMonth ?? 0);
  return Array.from({ length: months }, (_, index) => ({
    period: `第 ${index + 1} 月`,
    expected: monthlyExpected,
    paid: paidPerMonth
  }));
}
