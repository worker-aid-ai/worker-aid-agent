# v1.0 Docs and Protocol Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the four v1.0 roadmap items by adding stable Agent/Skill specifications, a zero-dependency Chinese documentation site, and a collaboration guide with validation coverage.

**Architecture:** Keep the repository dependency-free for core CLI and docs. Add Markdown specifications under `docs/`, a static docs entry under `docs/site/`, and extend `src/validate.mjs` so v1.0 readiness is mechanically checked.

**Tech Stack:** Node.js 18 ESM, built-in `node:fs/promises`, static HTML/CSS/JavaScript, Markdown.

---

## File Structure

- Create `docs/AGENT_PROTOCOL.md`: stable Agent protocol, versioning, input/output contract, routing, safety, and compatibility.
- Create `docs/SKILL_PACKAGE_STRUCTURE.md`: stable Skill package layout, frontmatter, required sections, output conventions, and checks.
- Create `docs/COLLABORATION_GUIDE.md`: collaboration workflow for legal aid institutions, public-interest lawyers, and union volunteers.
- Create `docs/site/index.html`: zero-build Chinese docs site home.
- Create `docs/site/styles.css`: restrained documentation styling.
- Create `docs/site/site.js`: small search/filter helper for docs links.
- Modify `src/validate.mjs`: require v1.0 files and check key sections.
- Modify `README.md`: expose v1.0 docs and docs site in developer docs.
- Modify `docs/ROADMAP.md`: mark v1.0 items complete after validation coverage exists.

### Task 1: Validation Contract

**Files:**
- Modify: `src/validate.mjs`

- [ ] **Step 1: Add v1.0 files to requiredFiles before creating them**

Add these paths to `requiredFiles` after `docs/COMMUNITY_CASE_CONTRIBUTION.md`:

```js
  'docs/AGENT_PROTOCOL.md',
  'docs/SKILL_PACKAGE_STRUCTURE.md',
  'docs/COLLABORATION_GUIDE.md',
  'docs/site/index.html',
  'docs/site/styles.css',
  'docs/site/site.js',
```

- [ ] **Step 2: Run validation to verify it fails**

Run: `pnpm run validate`

Expected: FAIL because `docs/AGENT_PROTOCOL.md` does not exist.

- [ ] **Step 3: Add key-section checks to `src/validate.mjs`**

Add these reads after existing JSON reads:

```js
const agentProtocol = await readFile('docs/AGENT_PROTOCOL.md', 'utf-8');
const skillPackageStructure = await readFile('docs/SKILL_PACKAGE_STRUCTURE.md', 'utf-8');
const collaborationGuide = await readFile('docs/COLLABORATION_GUIDE.md', 'utf-8');
const docsSite = await readFile('docs/site/index.html', 'utf-8');
```

Add this helper before the final `console.log('validate ok');`:

```js
function requireText(text, requiredSnippets, label) {
  for (const snippet of requiredSnippets) {
    if (!text.includes(snippet)) {
      throw new Error(`${label} 缺少关键内容：${snippet}`);
    }
  }
}
```

Add these checks before the final `console.log('validate ok');`:

```js
requireText(agentProtocol, ['协议版本', '输入契约', '输出契约', '安全护栏', '人工复核'], 'Agent protocol');
requireText(skillPackageStructure, ['frontmatter', '目录结构', '必备章节', '输出结构', '安全边界'], 'Skill package structure');
requireText(collaborationGuide, ['法律援助机构', '公益律师', '工会志愿者', '隐私', '禁止事项'], 'Collaboration guide');
requireText(docsSite, ['Worker Aid Agent 中文文档', 'Agent 协议', 'Skill 包结构', '协作指南'], 'Docs site');
```

- [ ] **Step 4: Run validation to verify it still fails**

Run: `pnpm run validate`

Expected: FAIL because the required v1.0 files are still absent.

- [ ] **Step 5: Commit validation contract**

Run:

```bash
git add src/validate.mjs
git commit -m "test(validate): require v1 docs baseline"
```

### Task 2: Agent Protocol

**Files:**
- Create: `docs/AGENT_PROTOCOL.md`

- [ ] **Step 1: Create the Agent protocol document**

Write `docs/AGENT_PROTOCOL.md` with these sections:

```markdown
# Worker Aid Agent 协议 v1.0

> 本协议定义 Worker Aid Agent 在案情采集、证据整理、金额估算、材料草稿和求助渠道导航中的稳定输入输出边界。它不是法律意见协议，也不授权任何系统冒充律师、法律援助机构、仲裁委、法院、行政机关或工会。

## 协议版本

- 当前版本：`1.0`
- 兼容范围：适用于本仓库 `agents/`、`skills/`、`prompts/`、CLI 和本地 Web UI 的劳动者自助与法律援助准备场景。
- 版本策略：同一主版本内可以新增可选字段；删除字段、改变字段含义或放宽安全护栏必须进入新的主版本。

## 输入契约

Agent 可以接收自然语言描述、已脱敏材料摘要或结构化 JSON。输入应尽量包含城市、用工主体、入职/离职时间、工资基数、争议类型、已掌握证据和希望准备的材料。

禁止要求用户在公开环境提供完整身份证号、完整手机号、家庭住址、银行卡号、公司内部账号、未脱敏合同、完整聊天记录或其他不必要敏感信息。

## 输出契约

稳定输出应优先使用 JSON 或 Markdown。每次涉及法律、金额、时效、证据证明力、管辖或地方政策时，必须包含不确定性说明和人工复核提醒。

推荐顶层结构：

```json
{
  "protocolVersion": "1.0",
  "taskType": "intake | evidence | amount | draft | channel | safety",
  "facts": {},
  "findings": [],
  "missingInformation": [],
  "riskWarnings": [],
  "humanReviewReminder": "",
  "officialSourceHints": []
}
```

## Agent 路由

- 案情采集：先整理事实和缺失信息，再进入证据、金额或文书任务。
- 证据整理：只整理真实已存在材料，不补写不存在的证据。
- 金额估算：输出计算过程、假设和待核验项，不承诺最终支持金额。
- 文书草稿：输出草稿和待人工核验清单，不替代当地表格要求。
- 求助渠道：提示 12333、12348、当地人社、司法行政、仲裁委、工会等官方核验入口。
- 安全检查：拦截伪造证据、承诺结果、冒充专业身份和公开敏感信息。

## 安全护栏

Agent 不得承诺投诉、仲裁、诉讼、调解或法律援助结果；不得虚构事实、证据、法条、机构意见或专业身份；不得教唆隐匿不利事实、伪造材料、骚扰他人或破坏系统。

## 官方来源与本地政策

新增法律或政策内容时优先引用官方来源。地方政策必须标明省/市、更新时间、来源链接或核验入口，并提示以当地官方最新口径为准。

## 人工复核

所有输出默认是材料整理草稿。提交给法律援助机构、律师、工会、劳动监察部门、仲裁委、法院或用人单位前，应由用户和具备相应职责的人类工作人员复核事实、证据、金额、时效、管辖和法律适用。
```

- [ ] **Step 2: Run validation to verify remaining missing docs**

Run: `pnpm run validate`

Expected: FAIL because Skill package structure, collaboration guide, and docs site files are still absent.

- [ ] **Step 3: Commit Agent protocol**

Run:

```bash
git add docs/AGENT_PROTOCOL.md
git commit -m "docs: add stable agent protocol"
```

### Task 3: Skill Package Structure

**Files:**
- Create: `docs/SKILL_PACKAGE_STRUCTURE.md`

- [ ] **Step 1: Create Skill package structure document**

Write `docs/SKILL_PACKAGE_STRUCTURE.md` with these sections:

```markdown
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
```

- [ ] **Step 2: Run validation to verify remaining missing docs**

Run: `pnpm run validate`

Expected: FAIL because collaboration guide and docs site files are still absent.

- [ ] **Step 3: Commit Skill package structure**

Run:

```bash
git add docs/SKILL_PACKAGE_STRUCTURE.md
git commit -m "docs: add stable skill package structure"
```

### Task 4: Collaboration Guide

**Files:**
- Create: `docs/COLLABORATION_GUIDE.md`

- [ ] **Step 1: Create collaboration guide**

Write `docs/COLLABORATION_GUIDE.md` with these sections:

```markdown
# 法律援助、公益律师与工会志愿者协作指南

> 本指南面向使用 Worker Aid Agent 进行材料预整理的法律援助机构、公益律师、工会志愿者和社区互助者。它只说明协作流程和安全边界，不替代任何机构的正式受理、审查、代理或值班制度。

## 适用对象

- 法律援助机构：用于接收更清晰的案情摘要、证据目录和待核验问题。
- 公益律师：用于志愿咨询前快速了解事实、争议类型和材料缺口。
- 工会志愿者：用于协助劳动者整理事实、保存证据、识别紧急期限和连接官方渠道。
- 社区互助者：用于脱敏整理材料和提醒用户寻求正式帮助。

## 协作原则

1. 事实优先：先核对时间、工资、岗位、用工主体和证据来源。
2. 脱敏优先：公开讨论、案例贡献和线上协作不得包含完整身份信息。
3. 人工复核优先：AI 输出只能作为草稿，由相应人员复核。
4. 官方核验优先：地方政策、材料要求和入口以当地官方最新口径为准。
5. 劳动者自主：不替劳动者承诺结果，不替其作出重大处分决定。

## 建议材料流转

1. 劳动者在本地 Web UI 或 CLI 中整理案情。
2. 输出法律援助咨询摘要、证据目录、时间线和待咨询问题。
3. 分享前人工删除身份证号、手机号、住址、银行卡号、公司内部账号和未脱敏原件。
4. 协作者复核事实、证据、金额、时效、管辖和当地政策。
5. 根据职责建议咨询 12348、12333、当地司法行政机关、人社部门、仲裁委、工会或其他正式渠道。

## 隐私

协作者应只收集完成咨询或转介所必需的信息。公开 issue、社区群、培训材料和案例贡献必须使用化名、概括地址、模糊公司名称和脱敏截图摘要。原始证据应由劳动者自行妥善保存，不建议上传到公开仓库或公共聊天群。

## 禁止事项

- 禁止伪造、补写、倒签、篡改或诱导隐藏证据。
- 禁止承诺仲裁、诉讼、投诉、调解、法律援助或协商结果。
- 禁止冒充律师、法律援助机构、工会、仲裁委、法院或行政机关。
- 禁止公开传播未脱敏身份信息、联系方式、住址、银行卡号、合同原件、聊天记录原文或企业商业秘密。
- 禁止以 AI 输出替代正式法律咨询、代理意见、机构审查或劳动者本人决定。

## 复核清单

- 事实日期是否有证据支持？
- 工资基数、欠薪金额、加班时长和补偿年限是否有计算依据？
- 是否存在仲裁时效、工伤认定期限、离职协议或签收文件风险？
- 证据目录是否区分原件、复印件、截图、录音和证人线索？
- 是否已提示当地法律援助条件、劳动监察入口、仲裁委材料要求和工会协助渠道需要官方核验？
```

- [ ] **Step 2: Run validation to verify remaining missing docs**

Run: `pnpm run validate`

Expected: FAIL because docs site files are still absent.

- [ ] **Step 3: Commit collaboration guide**

Run:

```bash
git add docs/COLLABORATION_GUIDE.md
git commit -m "docs: add legal aid collaboration guide"
```

### Task 5: Static Chinese Documentation Site

**Files:**
- Create: `docs/site/index.html`
- Create: `docs/site/styles.css`
- Create: `docs/site/site.js`

- [ ] **Step 1: Create docs site files**

Create `docs/site/index.html` with a Chinese documentation homepage. It must include the text `Worker Aid Agent 中文文档`, `Agent 协议`, `Skill 包结构`, and `协作指南`, and link to the relevant Markdown docs using relative URLs.

Create `docs/site/styles.css` with readable, responsive documentation styles using restrained colors, no build tooling, and no external assets.

Create `docs/site/site.js` with a small client-side filter:

```js
const searchInput = document.querySelector('[data-doc-search]');
const cards = Array.from(document.querySelectorAll('[data-doc-card]'));

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    for (const card of cards) {
      const text = card.textContent.toLowerCase();
      card.hidden = query.length > 0 && !text.includes(query);
    }
  });
}
```

- [ ] **Step 2: Run validation to verify docs site content**

Run: `pnpm run validate`

Expected: PASS with `validate ok`.

- [ ] **Step 3: Commit docs site**

Run:

```bash
git add docs/site/index.html docs/site/styles.css docs/site/site.js
git commit -m "docs: add chinese documentation site"
```

### Task 6: Navigation and Roadmap

**Files:**
- Modify: `README.md`
- Modify: `docs/ROADMAP.md`

- [ ] **Step 1: Update README docs list**

In `README.md` under `常用开发文档`, add links for:

```markdown
- [中文文档站](docs/site/index.html)
- [Worker Aid Agent 协议](docs/AGENT_PROTOCOL.md)
- [Worker Aid Skill 包结构](docs/SKILL_PACKAGE_STRUCTURE.md)
- [法律援助、公益律师与工会志愿者协作指南](docs/COLLABORATION_GUIDE.md)
```

- [ ] **Step 2: Mark v1.0 roadmap items complete**

In `docs/ROADMAP.md`, change the four v1.0 items from `[ ]` to `[x]`.

- [ ] **Step 3: Run validation and tests**

Run:

```bash
pnpm run validate
pnpm test
```

Expected:

```text
validate ok
```

and all Node tests pass.

- [ ] **Step 4: Commit navigation and roadmap**

Run:

```bash
git add README.md docs/ROADMAP.md
git commit -m "docs: mark v1 roadmap complete"
```

### Task 7: Final Verification

**Files:**
- No new files.

- [ ] **Step 1: Check repository status**

Run: `git status --short`

Expected: only intentional uncommitted files remain, or clean working tree.

- [ ] **Step 2: Run final validation**

Run:

```bash
pnpm run validate
pnpm test
```

Expected: validation passes and all tests pass.

- [ ] **Step 3: Summarize final state**

Report the created docs, validation/test results, and any commits made.
