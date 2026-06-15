---
name: worker-aid-amount-calculator
description: Use when Chinese labor-dispute amounts need draft calculations for 欠薪、加班费、未签书面劳动合同二倍工资差额、经济补偿 N、违法解除赔偿金 2N, or minimum-wage checks
---

# 金额草算

## 概览

用于对中国劳动争议中的常见金额进行结构化草算。所有结果都必须写明计算假设、缺失事实、证据需求和人工复核提醒。

## 适用场景

- 需要估算拖欠工资、加班费、未签书面劳动合同二倍工资差额、经济补偿 N 或“假设违法解除”下的赔偿金 2N。
- 用户需要 JSON、Markdown 或 CLI 可用的计算输入。
- 涉及最低工资、本地政策或地方口径，需要提示核验官方来源。

## 必要输入

- 月工资或工资基数；
- 工作年限或月份；
- 已支付金额；
- 分月工资记录；
- 加班小时分类；
- 地区最低工资档位。

## 输出要求

- 计算假设。
- 结构化金额表，包含公式、输入值、已支付金额、估算差额和不确定点。
- 需要补充的事实和证据清单。
- 人工复核提示，覆盖仲裁时效、管辖、工资基数、地方规则和证据充分性。

## 护栏

- 不得承诺金额一定能获得支持。
- 不得忽略仲裁时效、地方口径、证据不足、工资基数争议。
- 应输出“计算假设”“需要补充事实”“证据清单”和“人工复核提示”。
- 对违法解除赔偿金，只能在“假设解除违法”的前提下估算 2N。

## CLI 示例

```bash
node src/worker-aid-cli.mjs amount wage-arrears examples/amount-wage-arrears.json
node src/worker-aid-cli.mjs amount double-wage examples/amount-double-wage.json
node src/worker-aid-cli.mjs amount economic-compensation examples/amount-economic-compensation.json
node src/worker-aid-cli.mjs minimum-wage 深圳
```

## 官方来源

- 优先使用 `docs/LEGAL_BASIS.md` 和 `docs/DATA_SOURCES.md` 中列出的现行官方法律、政策和本地入口。
