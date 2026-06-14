import test from 'node:test';
import assert from 'node:assert/strict';
import { lookupMinimumWage, checkMonthlyWageAgainstMinimum } from '../src/lib/minimum-wage.mjs';

test('looks up Shenzhen minimum wage bootstrap record', async () => {
  const result = await lookupMinimumWage('深圳');
  assert.equal(result.region.name, '深圳');
  assert.equal(result.minimumWage.monthly, 2360);
  assert.equal(result.minimumWage.hourly, 22.2);
});

test('detects wage below minimum', () => {
  const result = checkMonthlyWageAgainstMinimum(2000, 2360);
  assert.equal(result.belowMinimum, true);
  assert.equal(result.difference, 360);
});
