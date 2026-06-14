# Worker Aid Agent / 劳动者 AI 援助 Agent

> 面向中国普通劳动者的开源 AI Agent / Skill 项目，帮助劳动者完成**权益问题初步分流、事实梳理、证据清单整理、材料草稿生成、法律援助渠道指引**。

[![License: AGPL-3.0-or-later](https://img.shields.io/badge/License-AGPL--3.0--or--later-blue.svg)](LICENSE)
[![Project status](https://img.shields.io/badge/status-MVP-green.svg)](docs/ROADMAP.md)

## 项目定位

Worker Aid Agent 不是“AI 律师”，也不替代律师、法律援助机构、劳动监察、劳动仲裁委、法院或工会的专业判断。它的定位是：

1. 用普通人能理解的语言解释常见劳动权益问题；
2. 引导劳动者把事实、时间线、证据、诉求整理清楚；
3. 生成可供人工复核的材料草稿，例如投诉线索、证据目录、仲裁申请书草稿；
4. 提醒用户核验本地政策、时效、管辖和证据真实性；
5. 尽量降低普通劳动者维权前的信息整理成本。

## MVP 能力

当前仓库已经包含一个可运行的最小版本：

- `skills/`：面向 AI Agent / Skill 平台的技能定义。
- `agents/`：面向多 Agent 编排的角色说明。
- `prompts/`：可复制到 Claude Code、Codex、OpenClaw、Cursor、Dify、Coze、FastGPT 等工具中的提示词。
- `templates/`：劳动争议常用材料草稿模板。
- `data/`：常见争议类型、证据清单、法律依据索引。
- `src/`：零依赖 Node.js CLI 原型，用于案件分流、证据清单生成、加班工资估算、仲裁申请草稿生成。

## 快速开始

要求：Node.js 18+

```bash
npm install
npm run demo
```

常用命令：

```bash
# 1. 根据案情 JSON 初步分类
node src/worker-aid-cli.mjs classify examples/case-wage-arrears.json

# 2. 输出某类争议的证据清单
node src/worker-aid-cli.mjs checklist wage_arrears

# 3. 估算加班工资差额，仅供材料整理和沟通参考
node src/worker-aid-cli.mjs overtime examples/overtime-input.json

# 4. 基于结构化事实生成仲裁申请书草稿
node src/worker-aid-cli.mjs draft arbitration examples/case-wage-arrears.json
```

## 适用场景

| 场景 | 可帮助用户做什么 |
|---|---|
| 拖欠工资 | 整理工资周期、欠薪金额、聊天记录、考勤、转账流水、工资条 |
| 未签劳动合同 | 梳理入职时间、工作内容、考勤、工资发放、工作群、工牌等劳动关系证据 |
| 加班费争议 | 估算工作日/休息日/法定节假日加班工资差额，提示保留考勤和安排加班证据 |
| 违法解除/辞退 | 梳理解除通知、理由、沟通过程、绩效证据、补偿或赔偿诉求 |
| 社保/工伤 | 生成材料清单，提示走当地社保、工伤认定、法律援助或劳动仲裁路径 |
| 法律援助准备 | 整理案情摘要、证据目录、诉求金额、待咨询问题 |

## 重要免责声明

本项目只提供一般性信息整理、流程指引和文书草稿，不构成法律意见。用户在提交投诉、仲裁、诉讼、举报或公开传播前，应自行核验事实和证据，并尽量咨询律师、法律援助机构、工会、劳动监察部门、劳动人事争议仲裁委员会或其他有权机关。

详见：[法律与使用免责声明](docs/LEGAL_DISCLAIMER.md)、[隐私与安全规则](docs/PRIVACY_AND_SAFETY.md)。

## 项目结构

```text
worker-aid-agent/
├── agents/                         # 多 Agent 角色定义
├── data/                           # 场景、证据、法律依据索引
├── docs/                           # 项目说明、合规、路线图
├── examples/                       # 示例案情输入
├── prompts/                        # 可复用提示词
├── skills/                         # AI Agent/Skill 规范
├── src/                            # 零依赖 CLI 原型
├── templates/                      # 文书和清单模板
├── .github/                        # Issue 模板和 CI
├── package.json
└── README.md
```

## 开源协作原则

1. **保护劳动者隐私**：禁止上传身份证号、手机号、住址、公司内部敏感文件原件等未脱敏材料。
2. **不伪造证据**：项目只能帮助整理真实材料，不能生成、篡改或诱导伪造证据。
3. **不承诺结果**：不得承诺仲裁、诉讼、投诉结果。
4. **不煽动对抗**：坚持依法、理性、可验证、可复核的维权路线。
5. **人类复核优先**：涉及金额、时效、管辖、诉求策略、法律适用时，应由专业人士复核。

## Roadmap

见：[ROADMAP.md](docs/ROADMAP.md)

## License

AGPL-3.0-or-later。详见 [LICENSE](LICENSE)。
