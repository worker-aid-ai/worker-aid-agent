# 使用指南

## 1. 准备案情 JSON

参考 `examples/case-wage-arrears.json`：

```json
{
  "worker": { "name": "劳动者A", "city": "深圳" },
  "employer": { "name": "某科技公司" },
  "facts": {
    "startDate": "2024-03-01",
    "endDate": "2026-05-31",
    "monthlySalary": 12000,
    "unpaidWages": 24000,
    "hasWrittenContract": false,
    "terminationReason": "公司口头通知不用来上班"
  },
  "claims": ["支付拖欠工资", "未签劳动合同二倍工资差额", "违法解除赔偿金"]
}
```

## 2. 初步分类

```bash
node src/worker-aid-cli.mjs classify examples/case-wage-arrears.json
```

## 3. 生成证据清单

```bash
node src/worker-aid-cli.mjs checklist wage_arrears
```

## 4. 估算加班工资

```bash
node src/worker-aid-cli.mjs overtime examples/overtime-input.json
```

## 5. 生成仲裁申请书草稿

```bash
node src/worker-aid-cli.mjs draft arbitration examples/case-wage-arrears.json
```

输出仅为草稿，提交前应核验当地仲裁委表格要求、主体信息、证据编号、请求金额和法律依据。
