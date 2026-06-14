const ROUND = 2;

export function calculateOvertimePay(input) {
  const monthlySalary = number(input.monthlySalary, 'monthlySalary');
  const monthlyWorkingDays = Number(input.monthlyWorkingDays ?? 21.75);
  const dailyWage = monthlySalary / monthlyWorkingDays;
  const hourlyWage = dailyWage / Number(input.standardHoursPerDay ?? 8);

  const workdayHours = Number(input.workdayOvertimeHours ?? 0);
  const restDayHours = Number(input.restDayOvertimeHours ?? 0);
  const statutoryHolidayHours = Number(input.statutoryHolidayOvertimeHours ?? 0);
  const alreadyPaid = Number(input.alreadyPaidOvertime ?? 0);

  const workdayPay = hourlyWage * workdayHours * 1.5;
  const restDayPay = hourlyWage * restDayHours * 2;
  const statutoryHolidayPay = hourlyWage * statutoryHolidayHours * 3;
  const total = workdayPay + restDayPay + statutoryHolidayPay;

  return {
    input: {
      monthlySalary,
      monthlyWorkingDays,
      standardHoursPerDay: Number(input.standardHoursPerDay ?? 8),
      workdayOvertimeHours: workdayHours,
      restDayOvertimeHours: restDayHours,
      statutoryHolidayOvertimeHours: statutoryHolidayHours,
      alreadyPaidOvertime: alreadyPaid
    },
    basis: {
      dailyWage: round(dailyWage),
      hourlyWage: round(hourlyWage),
      multipliers: {
        workday: 1.5,
        restDay: 2,
        statutoryHoliday: 3
      }
    },
    estimate: {
      workdayPay: round(workdayPay),
      restDayPay: round(restDayPay),
      statutoryHolidayPay: round(statutoryHolidayPay),
      totalPayable: round(total),
      alreadyPaid: round(alreadyPaid),
      estimatedDifference: round(Math.max(total - alreadyPaid, 0))
    },
    warnings: [
      '这是基于常见倍率的粗略估算，工资基数、加班事实、调休、地方口径和证据会影响结果。',
      '提交前请核验当地仲裁委/法院对加班费计算基数和证据的要求。'
    ]
  };
}

function number(value, name) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new Error(`${name} 必须是非负数字`);
  return n;
}

function round(value) {
  return Number(value.toFixed(ROUND));
}
