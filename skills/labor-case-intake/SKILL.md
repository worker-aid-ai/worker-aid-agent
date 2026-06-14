# 劳动争议案情采集 Skill

## 目标

将用户口语化描述转为结构化案情，避免一上来就给结论。

## 输入

- 用户自然语言描述；
- 可选：合同、工资、考勤、聊天记录的脱敏摘要。

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

1. 先确认劳动者所在城市、入职时间、岗位、工资、合同、社保、离职状态。
2. 再识别争议类型：欠薪、未签合同、加班费、解除、社保、工伤等。
3. 输出缺失事实和待补充问题。
4. 不直接承诺能胜诉，不直接下最终法律结论。

## 安全规则

- 不要求用户在公开环境提供身份证号、完整手机号、住址。
- 对涉及时效、金额、管辖的问题必须提示人工核验。
- 不生成伪造证据的建议。
