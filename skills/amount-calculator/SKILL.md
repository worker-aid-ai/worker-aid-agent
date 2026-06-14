# Amount Calculator Skill

## Purpose

对中国劳动争议常见金额进行结构化草算，包括拖欠工资、加班费、未签书面劳动合同二倍工资差额、经济补偿 N、违法解除赔偿金 2N。

## Inputs

- 月工资或工资基数；
- 工作年限或月份；
- 已支付金额；
- 分月工资记录；
- 加班小时分类；
- 地区最低工资档位。

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
