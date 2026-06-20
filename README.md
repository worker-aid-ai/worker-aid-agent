# Worker Aid Agent / 劳动者 AI 援助 Agent

> 面向中国普通劳动者的开源 AI Agent / Skill 项目，帮助劳动者把劳动权益问题中的事实、证据、金额和材料草稿整理清楚，便于后续咨询法律援助、工会、劳动监察、劳动仲裁委、律师或其他专业人士。

[![License: AGPL-3.0-or-later](https://img.shields.io/badge/License-AGPL--3.0--or--later-blue.svg)](LICENSE)
[![Project status](https://img.shields.io/badge/status-MVP-green.svg)](docs/ROADMAP.md)

## 先说清楚

Worker Aid Agent 不是“AI 律师”，不会替你作出法律判断，也不能保证投诉、仲裁或诉讼结果。它适合在你准备维权、咨询或求助前，先把信息整理成更清楚、可复核的材料。

所有输出都只是草稿或一般性信息整理。提交给任何机构、单位或平台前，请核验事实、证据、金额、时效、管辖和当地政策，并尽量让法律援助机构、律师、工会、劳动监察部门或劳动仲裁委工作人员复核。

## 适合谁使用

- 被拖欠工资、加班费、提成或补贴，想先理清金额和证据的人。
- 没签劳动合同、被辞退、被调岗降薪，想整理时间线和材料的人。
- 准备去法律援助中心、工会、劳动监察或劳动仲裁委咨询的人。
- 公益法律服务、劳动者互助、社区志愿者和开源贡献者。

## 普通劳动者能用它做什么

| 你遇到的问题 | 它可以帮你准备 |
|---|---|
| 拖欠工资 | 工资周期、欠薪金额、转账流水、工资条、聊天记录、考勤记录清单 |
| 未签劳动合同 | 入职时间、工作内容、工资发放、工作群、工牌、考勤等劳动关系证据 |
| 加班费争议 | 工作日、休息日、法定节假日加班费的粗略估算和证据提醒 |
| 违法解除/辞退 | 解除通知、解除理由、沟通过程、补偿或赔偿金额草算 |
| 法律援助准备 | 案情摘要、证据目录、待咨询问题、文书草稿 |
| 本地求助入口 | 法律援助、劳动监察、人社服务、仲裁入口的索引和核验提醒 |

## 三步本地试用

本项目当前主推本地 Web 界面：你的输入默认只在本机浏览器和本地服务中处理，不会主动上传到外部平台。

要求：Node.js 18+，pnpm 11+

```bash
pnpm install
pnpm run serve:web
```

然后在浏览器打开：

```text
http://localhost:5173/
```

你可以在页面里填写案情信息，试用金额估算、最低工资查询、证据目录、仲裁申请书草稿、法律援助咨询摘要等功能。

## 隐私与安全提醒

- 不要上传或公开身份证号、手机号、住址、银行卡号、公司内部账号、未脱敏合同、完整聊天记录等敏感信息。
- 示例和公开讨论必须脱敏，避免出现真实姓名、公司全称、联系方式、住址、精确身份证件信息。
- 不要让任何工具替你编造、修改或补充不存在的证据。
- 金额估算只用于准备材料和沟通参考，不代表最终可获支持金额。
- 地方政策、最低工资、仲裁材料要求、法律援助条件可能变化，提交前请通过 12333、12348、当地人社部门、司法行政机关、法律援助中心、仲裁委等官方渠道核验。

详见：[法律与使用免责声明](docs/LEGAL_DISCLAIMER.md)、[隐私与安全规则](docs/PRIVACY_AND_SAFETY.md)。

## CLI 用法

如果你熟悉命令行，也可以直接使用 CLI：

```bash
pnpm run demo
```

常用命令：

```bash
# 1. 根据案情 JSON 初步分类
node src/worker-aid-cli.mjs classify examples/case-wage-arrears.json

# 2. 输出某类争议的证据清单
node src/worker-aid-cli.mjs checklist wage_arrears

# 3. 估算加班工资差额，仅供材料整理和沟通参考
node src/worker-aid-cli.mjs overtime examples/overtime-input.json

# 4. 查询最低工资启动版数据，提交前必须核验当地最新官方口径
node src/worker-aid-cli.mjs minimum-wage 深圳

# 5. 生成案件时间线，便于核对事实顺序和证据节点
node src/worker-aid-cli.mjs timeline examples/case-wage-arrears.json

# 6. 检索本地法条索引和本地化政策入口，提交前仍需官方核验
node src/worker-aid-cli.mjs law-search 拖欠工资 仲裁时效
node src/worker-aid-cli.mjs local-policy 深圳 欠薪

# 7. 检查高风险输出、查看评测集摘要、生成社区案例脱敏稿
node src/worker-aid-cli.mjs risk-check exports/legal-aid-summary.md
node src/worker-aid-cli.mjs eval-set
node src/worker-aid-cli.mjs anonymize-case examples/case-wage-arrears.json

# 8. 基于结构化事实生成仲裁申请书草稿
node src/worker-aid-cli.mjs draft arbitration examples/case-wage-arrears.json

# 9. 导出可复核材料草稿
node src/worker-aid-cli.mjs export arbitration examples/case-wage-arrears.json exports/arbitration.html
node src/worker-aid-cli.mjs export legal-aid-summary examples/case-wage-arrears.json exports/legal-aid-summary.md
node src/worker-aid-cli.mjs export evidence-index examples/case-wage-arrears.json exports/evidence-index.doc
```

## 当前能力

- `web/`：本地静态 Web 表单界面，用于采集案情、估算金额、生成材料草稿。
- `src/`：零运行依赖 Node.js CLI 原型。
- `data/`：常见争议类型、证据清单、法律依据索引、本地政策索引、评测集、最低工资和服务入口启动版数据。
- `templates/`：劳动争议常用材料草稿模板。
- `skills/`：面向 AI Agent / Skill 平台的技能定义。
- `agents/`：面向多 Agent 编排的角色说明。
- `prompts/`：可复制到 Claude Code、Codex、OpenClaw、Cursor、Dify、Coze、FastGPT 等工具中的提示词。

## 开发者快速开始

```bash
pnpm install
pnpm run validate
pnpm test
pnpm run demo
pnpm run serve:web
```

常用开发文档：

- [贡献指南](CONTRIBUTING.md)
- [中文文档站](docs/site/index.html)
- [使用指南](docs/USAGE.md)
- [Web 表单界面说明](docs/WEB_UI.md)
- [数据源与更新说明](docs/DATA_SOURCES.md)
- [金额计算与测试说明](docs/CALCULATION_TESTS.md)
- [安全与评测功能说明](docs/SAFETY_AND_EVALUATION.md)
- [社区案例脱敏贡献流程](docs/COMMUNITY_CASE_CONTRIBUTION.md)
- [Worker Aid Agent 协议](docs/AGENT_PROTOCOL.md)
- [Worker Aid Skill 包结构](docs/SKILL_PACKAGE_STRUCTURE.md)
- [法律援助、公益律师与工会志愿者协作指南](docs/COLLABORATION_GUIDE.md)
- [项目章程](docs/PROJECT_CHARTER.md)

## 项目结构

```text
worker-aid-agent/
├── agents/                         # 多 Agent 角色定义
├── data/                           # 场景、证据、法律依据和入口索引
├── docs/                           # 项目说明、合规、路线图
├── examples/                       # 示例案情输入
├── prompts/                        # 可复用提示词
├── skills/                         # AI Agent/Skill 规范
├── src/                            # 零依赖 CLI 原型和本地 Web 服务
├── templates/                      # 文书和清单模板
├── tests/                          # Node 原生测试
├── web/                            # 本地静态 Web UI
├── .github/                        # CI
├── package.json
└── README.md
```

## 开源协作原则

1. **保护劳动者隐私**：禁止上传身份证号、手机号、住址、公司内部敏感文件原件等未脱敏材料。
2. **不伪造证据**：项目只能帮助整理真实材料，不能生成、篡改或诱导伪造证据。
3. **不承诺结果**：不得承诺仲裁、诉讼、投诉、法律援助或协商结果。
4. **不煽动对抗**：坚持依法、理性、可验证、可复核的维权路线。
5. **人类复核优先**：涉及金额、时效、管辖、诉求策略、法律适用时，应由专业人士复核。

## 路线图与版本

- [Roadmap](docs/ROADMAP.md)
- [CHANGELOG](CHANGELOG.md)

## License

AGPL-3.0-or-later。详见 [LICENSE](LICENSE)。
