# v1.0 文档与规范基线设计

## 背景

`docs/ROADMAP.md` 中 v1.0 仍有四项未完成：稳定的 Agent 协议、稳定的 Skill 包结构、完整中文文档站点，以及法律援助机构、公益律师、工会志愿者协作指南。现有项目已经具备 CLI、Web UI、数据源、Agent/Skill 初版、安全评测和社区案例脱敏流程，因此 v1.0 的合理增量是把这些能力固化为可发布、可复核、可维护的规范与文档体系。

## 推荐方案

采用零依赖文档与校验基线：

- 新增 `docs/AGENT_PROTOCOL.md`，定义 Worker Aid Agent 的版本、输入输出契约、路由、风险护栏、人工复核和兼容性规则。
- 新增 `docs/SKILL_PACKAGE_STRUCTURE.md`，定义 Skill 包目录、frontmatter、必备章节、输出结构、安全边界和质量检查。
- 新增 `docs/COLLABORATION_GUIDE.md`，面向法律援助机构、公益律师、工会志愿者说明协作边界、材料流转、隐私脱敏、复核流程和禁止事项。
- 新增 `docs/site/` 静态中文文档站入口，使用无构建 HTML/CSS/JS 汇总项目文档导航，保持项目当前零依赖风格。
- 更新 `README.md`、`docs/ROADMAP.md` 和 `src/validate.mjs`，让 v1.0 文档成为可发现、可校验的发布基线。

## 备选方案

1. 引入文档站框架，例如 VitePress 或 Docusaurus。优点是导航、搜索和部署体验更成熟；缺点是增加依赖、构建流程和维护成本，不符合当前项目的轻量零依赖取向。
2. 只新增 Markdown 文档，不加文档站和校验。优点是改动小；缺点是“稳定”程度不足，路线图完成状态缺少自动化检查。

因此采用推荐方案。

## 架构

文档体系分为三层：

1. 规范层：`AGENT_PROTOCOL.md` 和 `SKILL_PACKAGE_STRUCTURE.md`，定义 Agent/Skill 对外契约。
2. 协作层：`COLLABORATION_GUIDE.md`，面向线下和线上协作者给出流程边界。
3. 入口层：`docs/site/index.html`、`docs/site/styles.css`、`docs/site/site.js`，提供中文文档站首页和分类导航。

`src/validate.mjs` 将检查新增文档和站点文件是否存在，并做最小结构校验：协议文档需包含版本、输入、输出、护栏和人工复核；Skill 包结构需包含 frontmatter、目录、输出、安全边界；协作指南需包含法律援助、公益律师、工会志愿者、隐私和禁止事项；文档站需包含入口 HTML。

## 数据流

用户或协作者从 README 或 `docs/site/index.html` 进入中文文档站，再根据身份进入使用指南、数据源说明、安全文档、Agent 协议、Skill 包结构或协作指南。开发者运行 `pnpm run validate` 时，校验脚本确认这些 v1.0 文档存在并保留关键章节。

## 错误处理与安全

本次不新增法律结论或实时政策内容。所有新增内容必须延续项目护栏：

- 不承诺投诉、仲裁、诉讼或法律援助结果。
- 不冒充律师、法律援助机构、工会、仲裁委或行政机关。
- 不引导伪造、补写或篡改证据。
- 涉及时效、金额、管辖、证据证明力和地方政策时保留不确定性和人工复核提醒。
- 公开示例和协作材料必须脱敏。

## 测试

- 更新 `src/validate.mjs` 的 requiredFiles 和关键章节检查。
- 运行 `pnpm run validate`。
- 运行 `pnpm test`，确保现有功能不被文档更新破坏。

## 范围外

- 不引入新的文档站构建框架。
- 不新增在线搜索、实时政策抓取或外部服务。
- 不修改核心 CLI 的业务逻辑。
- 不新增律师匹配、案件转介或结果预测能力。
