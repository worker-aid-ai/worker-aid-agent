---
name: worker-aid-privacy-redaction
description: Use when worker case details, examples, issues, screenshots, contracts, chat records, payroll records, or public contributions may contain 个人信息、公司信息、病历、银行卡、地址、账号 identifiers
---

# 隐私脱敏

## 概览

在公开提问、提交 Issue、贡献示例或共享案情前，对敏感信息进行脱敏。尽量保留有助于法律和政策判断的上下文，同时移除可能识别劳动者、单位人员、证人或账号的数据。

## 脱敏规则

- 姓名：张三 -> 劳动者A。
- 手机号：13800138000 -> 138****8000。
- 身份证号：4403xxxxxxxxxxxx -> 4403************。
- 公司名称：深圳市某某科技有限公司 -> 深圳某科技公司。
- 地址：必要时保留到省/市/区，删除门牌号、房间号和精确位置。
- 银行卡号、病历号、账号、合同编号、内部文件编号：默认隐藏。

## 输出要求

- 脱敏后的文本。
- 残留敏感信息检查。
- 不建议公开的内容列表。
- 说明是否保留了足够的地区和时间上下文，便于法律或政策复核。

## 护栏

- 不编造会改变法律含义的替代事实。
- 示例和公开数据集必须完全匿名化。
- 不确定时优先多遮盖，并提醒用户离线保存原件供专业人士复核。
