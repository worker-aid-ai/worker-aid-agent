# Worker Aid Skill 包结构 v1.0

> 本文定义本项目 Skill 包的稳定结构。Skill 用于帮助 AI Agent 整理劳动争议事实、证据、金额和材料草稿，不提供最终法律意见。

## 目录结构

每个 Skill 使用独立目录：

```text
skills/
└── worker-aid-<topic>/
    └── SKILL.md
```

如确需增加示例或资产，应放在同一 Skill 目录下的 `examples/` 或 `assets/`，且示例必须完全脱敏。

## frontmatter

每个 `SKILL.md` 必须以 YAML frontmatter 开头：

```yaml
---
name: worker-aid-<topic>
description: Use when ...
---
```

- `name` 必须与目录名一致。
- `description` 应说明触发场景，可以包含中文劳动争议关键词。
- 不应在 description 中承诺结果、冒充专业身份或鼓励收集不必要敏感信息。

## 必备章节

每个 Skill 至少包含：

- `# 标题`
- `## 概览`
- `## 适用场景`
- `## 输入`
- `## 输出结构`
- `## 工作流程`
- `## 护栏`
- `## 官方来源`

## 输出结构

输出优先使用 JSON 或 Markdown。涉及法律、金额、时效、证据证明力、管辖或地方政策时，输出必须包含不确定性说明和人工复核提醒。

推荐字段：

```json
{
  "summary": "",
  "knownFacts": [],
  "missingFacts": [],
  "evidenceItems": [],
  "riskWarnings": [],
  "nextSteps": [],
  "humanReviewReminder": ""
}
```

## 安全边界

Skill 不得生成、补写或美化不存在的证据；不得承诺法律援助、仲裁、诉讼、调解或投诉结果；不得冒充律师、法律援助机构、工会、仲裁委、法院或行政机关；不得要求公开完整身份证号、手机号、住址、银行卡号或未脱敏原件。

## 质量检查

新增或修改 Skill 后应运行：

```bash
pnpm run validate
pnpm test
```

维护者应检查 Skill 是否保留项目护栏、是否引用官方核验入口、示例是否脱敏、输出是否适合普通劳动者理解。
