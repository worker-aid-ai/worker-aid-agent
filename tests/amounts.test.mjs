import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateWageArrears, calculateNoWrittenContractDoubleWage, calculateEconomicCompensation, calculateIllegalTerminationCompensation } from '../src/lib/amounts.mjs';
import { calculateOvertimePay } from '../src/lib/overtime.mjs';

test('calculates wage arrears from monthly records', () => {
  const result = calculateWageArrears({ records: [
    { period: '2026-01', expected: 8000, paid: 3000 },
    { period: '2026-02', expected: 8000, paid: 0 }
  ]});
  assert.equal(result.estimate.wageArrears, 13000);
  assert.equal(result.records.length, 2);
});

test('caps no-written-contract double wage months at 11 by default', () => {
  const result = calculateNoWrittenContractDoubleWage({ monthlySalary: 6000, monthsWithoutContract: 14 });
  assert.equal(result.estimate.claimableMonths, 11);
  assert.equal(result.estimate.estimatedDifference, 66000);
});

test('calculates economic compensation N by service months', () => {
  assert.equal(calculateEconomicCompensation({ monthlySalary: 10000, serviceMonths: 5 }).basis.compensationMonths, 0.5);
  assert.equal(calculateEconomicCompensation({ monthlySalary: 10000, serviceMonths: 6 }).basis.compensationMonths, 1);
  assert.equal(calculateEconomicCompensation({ monthlySalary: 10000, serviceMonths: 20 }).basis.compensationMonths, 2);
});

test('calculates assumed illegal termination compensation as 2N', () => {
  const result = calculateIllegalTerminationCompensation({ monthlySalary: 10000, serviceMonths: 20 });
  assert.equal(result.estimate.grossIllegalTerminationCompensation, 40000);
});

test('calculates overtime pay with 1.5x/2x/3x multipliers', () => {
  const result = calculateOvertimePay({ monthlySalary: 8700, workdayOvertimeHours: 10, restDayOvertimeHours: 8, statutoryHolidayOvertimeHours: 8 });
  assert.equal(result.basis.dailyWage, 400);
  assert.equal(result.basis.hourlyWage, 50);
  assert.equal(result.estimate.totalPayable, 2750);
});
