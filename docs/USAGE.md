# 使用指南

## 0. 普通用户本地 App

普通劳动者优先使用本地 App，而不是先学习 CLI 或插件安装。页面会引导填写脱敏案情、配置可选模型 API、确认隐私边界并导出材料草稿。

Windows PowerShell：

```powershell
.\start-worker-aid.ps1
```

通用方式：

```bash
pnpm install
pnpm run start:app
```

打开：

```text
http://localhost:5173/
```

模型 API 配置是可选项。没有用户勾选确认时，本地 App 不允许外部模型调用；即使确认调用，也只应发送必要且已脱敏的摘要。

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
    "terminationReason": "公司口头通知不用来上班",
    "events": [
      {
        "date": "2026-04-10",
        "title": "工资开始拖欠",
        "description": "4 月工资未按约定日期发放"
      }
    ]
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

## 5. 生成案件时间线

```bash
node src/worker-aid-cli.mjs timeline examples/case-wage-arrears.json
```

时间线只用于整理事实顺序和证据节点。不要为补齐时间线而编造日期、通知内容、聊天记录或证据来源；涉及时效、管辖和证明力时应人工复核。

## 6. 生成仲裁申请书草稿

```bash
node src/worker-aid-cli.mjs draft arbitration examples/case-wage-arrears.json
```

输出仅为草稿，提交前应核验当地仲裁委表格要求、主体信息、证据编号、请求金额和法律依据。

## 7. 安全、法条与政策辅助命令

```bash
# 本地法条索引检索
node src/worker-aid-cli.mjs law-search 拖欠工资 仲裁时效

# 本地化政策入口索引
node src/worker-aid-cli.mjs local-policy 深圳 欠薪

# 风险输出检查
node src/worker-aid-cli.mjs risk-check exports/legal-aid-summary.md

# 多模型评测集摘要
node src/worker-aid-cli.mjs eval-set

# 社区案例脱敏
node src/worker-aid-cli.mjs anonymize-case examples/case-wage-arrears.json
```

以上命令都只用于材料整理、安全检查和官方核验入口提示，不构成法律意见。涉及地方政策时，应以省/市官方渠道的最新公开信息为准；公开案例前必须人工复核脱敏结果。
