---
name: amount-calculator
description: Use when Chinese labor-dispute amounts need structured draft calculations for wage arrears, overtime, double wage for unsigned written contracts, economic compensation, or assumed illegal-termination compensation
---

# Amount Calculator

## Overview

Create structured draft calculations for common Chinese labor-dispute amounts. Every result must show assumptions, missing facts, evidence needs, and a human-review reminder.

## When to Use

- Wage arrears, overtime pay, unsigned written labor contract double-wage difference, economic compensation N, or assumed illegal-termination compensation 2N needs estimation.
- The user needs JSON, Markdown, or CLI-ready calculation inputs.
- Minimum-wage or local-policy data is involved and must be checked against official sources.

## Inputs

- 月工资或工资基数；
- 工作年限或月份；
- 已支付金额；
- 分月工资记录；
- 加班小时分类；
- 地区最低工资档位。

## Output

- Calculation assumptions.
- Structured amount table with formula, input values, paid amount, estimated difference, and uncertainty.
- Missing facts and evidence checklist.
- Human-review reminder covering limitation periods, jurisdiction, wage basis, local rules, and proof sufficiency.

## Guardrails

- 不得承诺金额一定能获得支持。
- 不得忽略仲裁时效、地方口径、证据不足、工资基数争议。
- 应输出“计算假设”“需要补充事实”“证据清单”和“人工复核提示”。
- 对违法解除赔偿金，只能在“假设解除违法”的前提下估算 2N。

## CLI Examples

```bash
node src/worker-aid-cli.mjs amount wage-arrears examples/amount-wage-arrears.json
node src/worker-aid-cli.mjs amount double-wage examples/amount-double-wage.json
node src/worker-aid-cli.mjs amount economic-compensation examples/amount-economic-compensation.json
node src/worker-aid-cli.mjs minimum-wage 深圳
```

## Official References

- Prefer current official law and local policy sources listed in `docs/LEGAL_BASIS.md` and `docs/DATA_SOURCES.md`.
