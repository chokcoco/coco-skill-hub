# Coco Skill Hub

`coco-skill-hub` 收录我在内容创作、技术表达和课程生产中持续使用的 Agent Skills。每个 Skill 都是一个自包含目录，可以按需单独安装，也可以一次安装整套能力。

这些 Skill 不只是 Prompt 集合。它们会把任务路由、质量边界、参考资料、模板、脚本和视觉资产放在一起，让 Agent 在真实项目中按照稳定流程工作。

## Skills

| Skill | 适合解决的问题 | 主要产物 |
| --- | --- | --- |
| [`teach-generator`](.agents/skills/teach-generator/README.md) | 规划、编写、审校和发布中文或技术课程 | 课程蓝图、章节正文、练习、项目、质量报告 |
| [`technical-image-generation`](.agents/skills/technical-image-generation-skill/README.md) | 生成结构清晰、文字可读的技术插图 | 流程图、架构图、对比图、机制下钻图、数据故事图 |
| [`gzh-cover-image-generator`](.agents/skills/gzh-cover-image-generator/README.md) | 生成标题内嵌、适合信息流传播的公众号封面 | `1800 x 766` 横版封面与多个创意候选 |
| [`coco-humanizer-zh`](.agents/skills/coco-humanizer-zh/README.md) | 去除中文文本中的模板化 AI 腔 | 保留事实和术语的自然中文改稿与审校意见 |

## 效果预览

### 技术插图

`technical-image-generation` 用统一的水彩墨线视觉语言，覆盖七类常见技术解释任务。

<img src=".agents/skills/technical-image-generation-skill/assets/technical-image-generation-overview-v1.png" alt="Technical Image Generation Skill 总览" width="100%">

<table>
<tr>
<td width="50%" valign="top">
<img src=".agents/skills/technical-image-generation-skill/assets/technical-image-generation-process-v1.png" alt="流程与生命周期技术插图" width="100%">
<br><strong>流程与生命周期</strong>
<br><sub>用编号主路径、分支和反馈箭头解释任务如何推进，以及失败后回到哪里。</sub>
</td>
<td width="50%" valign="top">
<img src=".agents/skills/technical-image-generation-skill/assets/technical-image-generation-architecture-v1.png" alt="系统架构与边界技术插图" width="100%">
<br><strong>系统架构与边界</strong>
<br><sub>把组件、职责、数据流和系统边界放进同一张可追踪的结构图。</sub>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<img src=".agents/skills/technical-image-generation-skill/assets/technical-image-generation-overview-pattern-v1.png" alt="全景总览技术插图" width="100%">
<br><strong>全景总览</strong>
<br><sub>先建立完整心智模型，再用一个局部放大区补充关键细节。</sub>
</td>
<td width="50%" valign="top">
<img src=".agents/skills/technical-image-generation-skill/assets/technical-image-generation-comparison-v1.png" alt="方案对比技术插图" width="100%">
<br><strong>方案对比</strong>
<br><sub>在固定维度下并列选择、优势、代价和适用条件，避免只列功能。</sub>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<img src=".agents/skills/technical-image-generation-skill/assets/technical-image-generation-deep-dive-v1.png" alt="机制下钻技术插图" width="100%">
<br><strong>机制下钻</strong>
<br><sub>聚焦一个局部机制，展示输入、中间状态、判断依据和结果。</sub>
</td>
<td width="50%" valign="top">
<img src=".agents/skills/technical-image-generation-skill/assets/technical-image-generation-conceptual-explainer-v1.png" alt="抽象概念解释技术插图" width="100%">
<br><strong>抽象概念解释</strong>
<br><sub>从直觉模型进入正式术语，同时保留适用边界和常见误区。</sub>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<img src=".agents/skills/technical-image-generation-skill/assets/technical-image-generation-data-story-v1.png" alt="数据故事技术插图" width="100%">
<br><strong>数据故事</strong>
<br><sub>让指标变化、观察点和决策动作出现在同一条阅读路径上。</sub>
</td>
<td width="50%" valign="top"></td>
</tr>
</table>

### 公众号封面

`gzh-cover-image-generator` 默认采用黑、白、荧光黄构成的新潮工业反叛风，标题本身就是画面的第一视觉。

<img src=".agents/skills/gzh-cover-image-generator/assets/reference-covers/industrial-title-shockwave.png" alt="数字冲击方向的公众号封面" width="100%">

<p><strong>数字冲击：</strong>用超大数字、爆裂结构和标题层级制造第一眼传播力，适合数量级变化与热点事件。</p>

<table>
<tr>
<td width="50%" valign="top">
<img src=".agents/skills/gzh-cover-image-generator/assets/reference-covers/industrial-title-curve.png" alt="增长曲线方向的公众号封面" width="100%">
<br><strong>增长曲线</strong>
<br><sub>适合爆发、增长和旧秩序被击穿。</sub>
</td>
<td width="50%" valign="top">
<img src=".agents/skills/gzh-cover-image-generator/assets/reference-covers/industrial-title-dossier.png" alt="档案调查方向的公众号封面" width="100%">
<br><strong>档案调查</strong>
<br><sub>适合危险、调查、警示和规则边界。</sub>
</td>
</tr>
</table>

## 每个 Skill 能做什么

### teach-generator

它把课程视为一个需要来源、验收标准和持续迭代的教学产品，而不是一次性生成的一组文章。工作流覆盖任务定义、来源登记、课程蓝图、分章写作、练习闭环、确定性检查、语义量规、Humanizer 和人工发布判断。

一个实际使用场景是：

```text
为零基础产品经理设计一门 AI Agent 课程。
课程需要从 Agent、Tool、Workflow 的基本关系讲起，
最终让学习者能够设计并验收一个具备人工控制点的 Agent 工作流。
```

Skill 不会直接堆出若干章节，而是先建立 `MISSION.md`、`RESOURCES.md`、`COURSE-GENERATION-SPEC.md` 和 `COURSE-BLUEPRINT.md`，再按章节类型选择写法、练习和验收证据。

> `teach-generator` 的中文质量闭环依赖 `coco-humanizer-zh`，安装时应同时选择两者。

[查看完整说明](.agents/skills/teach-generator/README.md)

### 技术插图：technical-image-generation

它先判断图片需要解释的是流程、架构、对比、机制还是数据，再选择对应构图。重点不是“生成一张好看的图”，而是确保标题、文字、关系线、边界和阅读顺序都经得起检查。

| 需要解释的问题 | 选择的图型 | 实际组织方式 |
| --- | --- | --- |
| 一个系统的全貌是什么 | 全景总览 | 一条全局阅读路径，加一个受控的局部放大区 |
| 任务怎样一步步完成 | 流程与生命周期 | 编号步骤、主路径、失败分支和反馈箭头 |
| 组件如何协作、边界在哪里 | 系统架构 | 分层组件、职责标签、数据流和边界框 |
| 多个方案如何选择 | 方案对比 | 固定比较维度、优势、代价和适用条件 |
| 一个机制内部如何运作 | 机制下钻 | 输入、中间状态、判断依据、输出和异常路径 |
| 抽象概念怎样建立直觉 | 概念解释 | 直觉模型、正式术语、适用边界和常见误区 |
| 指标变化意味着什么 | 数据故事 | 趋势、观察点、原因假设和决策动作 |

[查看完整说明与七类样图](.agents/skills/technical-image-generation-skill/README.md)

### gzh-cover-image-generator

它面向公众号信息流，不把文章内容缩成信息图，而是提炼一个最值得停下来的冲突：增长、风险、权力反转、旧规则失效或利益变化。默认输出 3 个明显不同的创意方向，标题必须逐字嵌入图片。

[查看完整说明与参考封面](.agents/skills/gzh-cover-image-generator/README.md)

### coco-humanizer-zh

它会删掉空洞造势、机械排比、翻译腔和没有信息量的过渡，但保留原文事实、论点、术语、代码和作者语气。它只负责表达质量，不替代事实核查、教学设计或发布判断。

> `coco-humanizer-zh` 是原 `humanizer-zh` 的新名称。Hub 不保留旧名称的重复副本。

```text
改写前：在当今快速发展的数字化时代，AI Agent 正以前所未有的速度重塑各行各业。

改写后：AI Agent 已经进入真实工作流。团队接下来要解决的，是它能调用什么、失败后如何恢复，以及哪些决定必须留给人。
```

[查看完整说明与审校边界](.agents/skills/coco-humanizer-zh/README.md)

## 安装

推荐使用 [`skills`](https://www.npmjs.com/package/skills) CLI。它会检测 Codex、Claude Code、Cursor 等 Agent，并把 Skill 安装到对应目录。

### 安装全部 Skills

```bash
npx skills add chokcoco/coco-skill-hub --skill '*' -y
```

### 单独安装

```bash
# 课程生成：同时安装必需的中文审校 Skill
npx skills add chokcoco/coco-skill-hub --skill teach-generator coco-humanizer-zh

# 技术插图
npx skills add chokcoco/coco-skill-hub --skill technical-image-generation

# 公众号封面
npx skills add chokcoco/coco-skill-hub --skill gzh-cover-image-generator

# 中文去 AI 味
npx skills add chokcoco/coco-skill-hub --skill coco-humanizer-zh
```

加上 `--global` 可以安装到用户级目录：

```bash
npx skills add chokcoco/coco-skill-hub --skill coco-humanizer-zh --global
```

### 手动安装

```bash
git clone https://github.com/chokcoco/coco-skill-hub.git

# 以安装到项目级通用目录为例
cp -R coco-skill-hub/.agents/skills/coco-humanizer-zh your-project/.agents/skills/
```

手动安装 `teach-generator` 时，也要复制同级的 `coco-humanizer-zh`：

```bash
cp -R coco-skill-hub/.agents/skills/teach-generator your-project/.agents/skills/
cp -R coco-skill-hub/.agents/skills/coco-humanizer-zh your-project/.agents/skills/
```

手动安装时，优先使用跨 Agent 通用的 `.agents/skills/`。部分 Agent 也支持自己的专用目录；使用 CLI 时无需手动判断，它会自动处理。

| 场景 | Skill 目录 |
| --- | --- |
| 通用项目级目录（推荐） | `.agents/skills/<name>/` |
| Codex 用户级目录 | `~/.codex/skills/<name>/` |
| Claude Code 专用项目目录 | `.claude/skills/<name>/` |

## 使用

安装后可以在请求中直接点名 Skill，也可以让支持自动发现的 Agent 根据 frontmatter 描述自行选择。

```text
使用 $technical-image-generation，为这份系统设计生成一张架构边界图。
```

```text
使用 $gzh-cover-image-generator，根据文章标题生成 3 张公众号封面，标题必须逐字保留。
```

```text
使用 $coco-humanizer-zh 审阅这篇中文技术文章，保留术语和事实，只修改有 AI 腔的句子。
```

## 仓库结构

```text
coco-skill-hub/
├── .agents/
│   └── skills/
│       ├── teach-generator/
│       ├── technical-image-generation-skill/
│       ├── gzh-cover-image-generator/
│       └── coco-humanizer-zh/
└── README.md
```

每个目录都以 `SKILL.md` 为 Agent 入口；`README.md` 面向使用者；`references/`、`assets/`、`scripts/`、`templates/` 等目录只在该 Skill 需要时存在。

