---
name: worker-aid-overtime-pay-helper
description: Use when a worker reports unpaid overtime, excessive hours, rest-day work, statutory-holiday work, comp time issues, attendance records, or overtime-pay estimation
---

# Overtime Pay Helper

## Overview

Estimate overtime-pay differences and organize overtime evidence for review. Rates and wage bases are assumptions that must be verified against law, local practice, contract terms, and evidence.

## Common Estimation Rates

- 工作日延长工作时间：通常按 150% 估算；
- 休息日加班且不能安排补休：通常按 200% 估算；
- 法定休假日加班：通常按 300% 估算。

## Required Inputs

- 月工资或加班工资计算基数；
- 工作日加班小时；
- 休息日加班小时；
- 法定节假日加班小时；
- 已支付加班费；
- 是否安排补休。

## Output

- Separate estimate rows for workday overtime, rest-day overtime, and statutory-holiday overtime.
- Already-paid offset and resulting estimated difference.
- Evidence checklist for attendance, schedules, approval, messages, work outputs, payroll, and rest-day compensatory leave.
- Calculation assumptions, uncertain points, and human-review reminders.

## Guardrails

- Do not assume every long workday is legally compensable overtime without supporting facts.
- Do not ignore wage-base disputes, special working-hour systems, compensatory leave, local practice, or evidence gaps.
- Remind the user to verify current national law, local rules, and official holiday arrangements.
