---
name: worker-aid-labor-case-intake
description: Use when a worker describes 劳动争议、欠薪、加班费、未签合同、违法解除、工伤、社保 in natural language and facts, timeline, claims, or missing information need structure
---

# 劳动争议案情采集

## 概览

将劳动者的口语化描述整理为可复核的结构化案情。不要一上来给最终法律结论、预测结果，或索取不必要的敏感信息。

## 适用场景

- 欠薪、加班费、未签合同、解除/辞退、社保、工伤等争议的初次案情采集。
- 用户把事实、日期、诉求和证据混在一段描述里。
- 后续技能需要清晰的基本事实、时间线和待补充问题。

## 输入

- 用户的自然语言描述。
- 可选：已脱敏的合同、工资、考勤、聊天记录、通知、转账流水摘要。

## 输出结构

```json
{
  "basicFacts": {
    "city": "",
    "employerName": "",
    "startDate": "",
    "endDate": "",
    "position": "",
    "monthlySalary": "",
    "contractStatus": ""
  },
  "disputeTypes": [],
  "timeline": [],
  "claimsToClarify": [],
  "missingFacts": [],
  "urgentRisks": [],
  "nextQuestions": []
}
```

## 工作流程

1. 识别城市、工作地点、入职时间、离职或在职状态、岗位、工资基数、合同状态、社保和解除状态。
2. 初步归类争议类型，但不作最终法律判断。
3. 根据已知事实形成时间线，并标注不确定日期。
4. 列出缺失事实、紧急风险和下一步提问。

## 护栏

- 不在公开环境要求用户提供完整身份证号、完整手机号、精确住址、银行卡号或未脱敏文件。
- 对时效、金额、管辖、地方政策和诉求策略必须加入不确定性和人工复核提醒。
- 不虚构事实、证据、法条、专业身份或预期结果。

## 官方来源

- 优先使用 `docs/LEGAL_BASIS.md` 和 `docs/DATA_SOURCES.md` 中列出的官方来源。
- 全国性法律和政策核验优先从国家法律法规数据库、中国政府网、人社部渠道、12333 和 12348 开始。
