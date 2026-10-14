---
name: teach-generator
description: 规划、生成、重构、审校和发布中文或技术课程、系列教程。用于从任务定义与可信资料出发设计课程蓝图，按章节类型路由写法指引，生成 Markdown、HTML、练习、项目和参考资料，并通过 Humanizer、课程量规、确定性检查与人工审核形成质量闭环；不用于普通产品代码开发。
---

# Teach Generator

把课程当作一个有来源、有验收标准、可持续迭代的教学产品。不要把它压缩成一组固定长度的短课，也不要把“生成完文件”视为完成。

## 路由原则

本文件只保留全局约束和入口路由。执行具体任务时，先读取与任务匹配的引用文件；不要默认加载所有 references 和 templates。

- 新课程、课程重规划、任务定义、资源整理、蓝图设计：读取 [课程设计流程](references/course-design-workflow.md)。
- 生成、扩写、重写或定向修复学生可见章节正文：读取 [章节写作流程](references/chapter-writing-workflow.md)，再按正文类型读取对应写法指引或模板。
- 批次交付、课程质检、Humanizer、发布准备、整课回归：读取 [质量闭环与发布](references/quality-release-workflow.md)。
- 中文学生可见技术正文写作或改写：读取 `../coco-humanizer-zh/SKILL.md`，并读取 [语感样本库](references/yugan.md) 校准句式。`yugan.md` 只作为语感和句式骨架参考，不作为事实来源。
- 第二阶段语义审校：读取 [课程评价量规](references/course-rubric.md)，不要只凭本文件摘要发明评分标准。
- 需要理解完整课程生产思路时，依次读取 [课程设计流程](references/course-design-workflow.md)、[章节写作流程](references/chapter-writing-workflow.md) 和 [质量闭环与发布](references/quality-release-workflow.md)。这三份文档是当前流程事实源。

如果任务只是产品 UI、API、数据库、Provider、构建工具或产品文档开发，按仓库 `AGENTS.md` 的“产品开发”规则处理，不要求执行课程生产流程。

## 开始前

开始课程生产或正文编辑前完成以下动作：

1. 查找并遵守仓库根目录及目标课程目录中的 `AGENTS.md`。
2. 读取目标课程 workspace 中已有的 `MISSION.md`、`RESOURCES.md`、`COURSE-GENERATION-SPEC.md`、`COURSE-BLUEPRINT.md` 和 `NOTES.md`。
3. 读取目标目录已有的生成脚本、课程目录、样章、参考资料和质量报告。不要覆盖用户改动。
4. 根据本次任务读取上方路由指定的 reference、写法指引和模板。
5. 生成或改写中文学生可见文本前，完整读取 `../coco-humanizer-zh/SKILL.md`；技术正文同时读取 `references/yugan.md`。
6. 进入第二阶段语义质检前，完整读取 `references/course-rubric.md`。

如果课程 workspace 尚不存在，先根据用户目标创建最小任务定义。信息不足但不影响方向时，记录假设并继续；受众、课程目标、交付格式或事实来源的缺失会显著改变产物时，先向用户确认。

## 工作区与事实源

优先沿用仓库已有结构。新建课程时可使用：

```text
<course-root>/
├── workspace/
│   ├── MISSION.md
│   ├── RESOURCES.md
│   ├── COURSE-GENERATION-SPEC.md
│   ├── COURSE-BLUEPRINT.md
│   ├── NOTES.md
│   └── learning-records/
├── lessons/
├── reference/
├── markdown/
├── assets/
└── quality/
```

Markdown 是课程正文事实源。若仓库声明课程文件由脚本生成，修改源数据或渲染器后重新生成，不直接修补生成产物。Run 的请求、状态、事件、人工中断和 artifact 必须持久化。

## 课程设计

创建或重规划课程时，按 [课程设计流程](references/course-design-workflow.md) 建立任务定义、来源包、知识地图、先修关系、章节蓝图和学习成果证据。

必须保留这些约束：

- 按学习目标和认知负荷决定课程与章节体量，不设置统一篇数、字数或时长。
- 先按学习成果设计章节路径，再选择正文类型、教学任务、讲师风格和模板模块。
- 零基础课程先补齐最小前置，再进入本章任务；不能让学习者从完整成品中反推基础规则。
- 来源必须登记到 `RESOURCES.md`，关键断言要能追溯到具体来源或项目实现。
- 当课程以现有产品、仓库或 Demo 作为教学参考时，建立公开来源映射和项目实现映射。当前代码、目标设计和教学简化要分开标记。
- 蓝图必须记录每章的目标受众、前置知识、核心问题、正文主类型、主教学任务、讲师风格、必须覆盖项、来源与实现映射、练习闭环、验收方式和预计体量。

不要把任何单一模板当作课程蓝图。模板只提供候选模块，最终结构要服务当前学习成果。

## 章节写作

写作前读取 [章节写作流程](references/chapter-writing-workflow.md)。每章先设计自己的学习路径，再按需要读取下列类型指引和模板：

| 正文类型 | 主要完成证据 | 按需读取 |
| --- | --- | --- |
| 技术教学文章 | 建立整体模型、机制、选型和工程落地判断 | [指引](references/writing-guide-technical-teaching.md)、[模板](templates/technical-teaching-structure.md) |
| 课程开篇、模块过渡与总结 | 说明目标、路线、阶段关系或后续行动 | [指引](references/writing-guide-opening-closing.md)、[模板](templates/opening-closing-structure.md) |
| 环境安装与工具准备 | 获得可复现、可核验的运行结果 | [指引](references/writing-guide-environment.md)、[模板](templates/environment-structure.md)、必要时读[完整样例](templates/environment-writing-example.md) |
| 语言基础与标准库 | 解释规则，阅读并修改最小代码 | [指引](references/writing-guide-language.md)、[模板](templates/language-structure.md)、必要时读[完整样例](templates/language-writing-example.md) |
| 单一框架或工具介绍、应用及进阶 | 完成最小闭环并处理常见配置问题 | [指引](references/writing-guide-framework.md)、[模板](templates/framework-structure.md)、必要时读[完整样例](templates/framework-structure-example.md) |
| 原理机制、协议、架构与故障诊断 | 解释因果链，借助证据验证机制或定位故障 | [指引](references/writing-guide-mechanism-diagnostics.md)、[模板](templates/mechanism-diagnostics-structure.md)、必要时读[完整样例](templates/mechanism-diagnostics-structure-example.md) |
| 综合应用实践与项目交付 | 整合技术栈并交付可运行、可测试、可复盘的成果 | [指引](references/writing-guide-integrated-practice.md)、[模板](templates/integrated-practice-structure.md) |
| 原理阐述+结合已有源码进行教学 | 对照真实源码理解原理、边界和教学简化 | [指引](references/writing-guide-principle-with-source.md)、[模板](templates/principle-with-source-structure.md) |

类型按章节的主学习成果划分，不按技术名词划分。通常一章使用一个主类型和一到两个辅助模块就够；多个模块各自形成独立学习目标时，优先拆章。

### 中文语感与去 AI 味

中文学生可见技术正文写作前，先用 [语感样本库](references/yugan.md) 做句式校准：根据局部任务选择定义句、能力陈述句、指令建议句、因果条件句、对比句、边界警示句或机制过程句，默读对应例句，学习骨架，不复制原句。

写作完成后执行 `coco-humanizer-zh`。Humanizer 不是禁词替换器，重点判断句子是否具体、自然、可信；`yugan.md` 用来校准“像清楚的官方技术文档”，不能替代事实核验、课程来源或第二阶段量规。

## 批次与产出

长课程默认把连续 3–4 章作为一个生成批次；根据章节复杂度调整，不为凑数量压缩内容。批次是完整交付单元，必须连续完成 Markdown 事实源、HTML 或其他目标产物、Humanizer、第一阶段确定性检查、第二阶段课程评价量规和第三阶段体验检查。

写一章前只组装该章真正需要的上下文：章节计划、自有学习路径、正文类型、教学任务、讲师风格、必要模板模块、必须覆盖项、来源与实现映射、受众约束、练习闭环和上轮质检反馈。

学生可见内容必须遵守披露边界。用户提供过程、内部材料名称、蒸馏来源、样章状态、rubric 得分、生成过程、本机路径和内部文件名默认只留在 workspace、来源映射和质量报告中，不进入正文、参考文献、页面元数据或导航。

## 质量闭环

为每章和整门课程分别质检。固定顺序是：生成并渲染产物、执行 Humanizer、运行第一阶段脚本、执行第二阶段评价量规、检查最终体验。九步完整性审查属于生成与渲染环节，必须在 Humanizer 前完成。

第一阶段硬检查使用：

```bash
node .agents/skills/teach-generator/scripts/validate-course.mjs <course-root>
```

出现 error 时判定 reject，不能发布，也不能进入第二阶段。只有 warning 时允许进入第二阶段，但要在交付说明中保留警告。需要调整课程结构或 URL 策略时，可在课程根目录创建 `.teach-generator-qc.json`；任何 `qc-ignore` 例外都要经过人工审核并在质量报告中解释。

第二阶段必须按 [课程评价量规](references/course-rubric.md) 输出带证据的语义审校报告。每个分数都要附带实际文件、章节、标题或段落证据；只给总分的审校无效。中文内容还要核对 Humanizer 结果，并抽查关键定义、警示、机制解释和操作建议是否符合 `yugan.md` 的句式用途与边界。

第三阶段按最终交付形式验证：浏览器布局、导航、响应式、代码高亮、Mermaid、打印资料、项目代码、测验反馈、课程首页和下载入口。浏览器不可用时，至少运行本地结构、链接和构建检查，并记录未验证项。

任何内容修改都会使旧报告失效，必须回到生成、Humanizer、第一阶段检查和第二阶段审校。连续三轮仍有 blocker，或审校意见互相冲突时，停止自动返工并转人工审核。

完整 LOOP、报告字段、返工顺序、整课回归和交付要求见 [质量闭环与发布](references/quality-release-workflow.md)。

## 交付

交付时简要说明新增或修改了哪些课程源文件与生成产物、使用了哪些来源和受众假设、运行了哪些构建/测试/质检/视觉验证、修复了哪些 blocker 或 major、还剩哪些人工审核项，以及当前发布决定及依据。

不要只报告“课程已生成”。交付结论必须能追溯到任务定义、质量报告和实际检查结果。
