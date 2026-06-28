# 安全与评测功能说明

本项目提供本地优先、零运行依赖的安全辅助能力。它不接入外部模型或在线向量库，而是提供可复核的本地索引、评测和风险检查能力。

## 本地 RAG 法条检索

命令：

```bash
node src/worker-aid-cli.mjs law-search 拖欠工资 仲裁时效
```

输出来自 `data/law-basis.json` 的启动版法条索引，包含主题、条文提示、摘要和官方核验渠道。检索结果不构成法律意见，提交材料前应通过全国人大法律法规数据库、中国政府网、当地人社部门、劳动监察、仲裁委或法律援助机构核验。

## 本地化政策索引

命令：

```bash
node src/worker-aid-cli.mjs local-policy 深圳 欠薪
```

数据位于 `data/local-policy-index-cn.json`。每条记录必须标注省份/城市、更新时间、官方入口、检索关键词和核验状态。当前数据是入口索引，不直接替代地方最新政策文本。

## 多模型评测集

命令：

```bash
node src/worker-aid-cli.mjs eval-set
```

数据位于 `data/model-evaluation-set.json`，用于比较不同模型或提示词输出是否满足安全要求，包括法律免责声明、人工复核提醒、不伪造证据、不承诺结果和隐私脱敏。

## 风险输出拦截器

命令：

```bash
node src/worker-aid-cli.mjs risk-check exports/legal-aid-summary.md
```

风险检查会拦截或提示以下问题：

- 冒充律师、律所或法律专业人士。
- 承诺仲裁、诉讼、投诉、法律援助或协商结果。
- 建议伪造、篡改或补造证据。
- 缺少不确定性或人工复核提醒。

## 社区案例脱敏

命令：

```bash
node src/worker-aid-cli.mjs anonymize-case examples/case-wage-arrears.json
```

脱敏工具只做启动版自动替换，公开前仍必须人工复核。社区案例不得包含真实姓名、完整手机号、身份证号、住址、银行卡号、公司内部账号、未脱敏合同、完整聊天记录截图或其他可识别个人的信息。
