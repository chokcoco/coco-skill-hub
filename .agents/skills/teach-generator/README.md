# Teach Generator

`teach-generator` 用于规划、生成、重构、审校和发布中文或技术课程、系列教程。它把课程当作一个有来源、有验收标准、可持续迭代的教学产品，而不是一次模型调用生成的一组长文。

## 能解决什么

- 把模糊的课程想法整理为可验收的任务定义。
- 登记可信资料，建立知识地图、先修关系和课程蓝图。
- 根据章节目标选择技术教学、环境安装、框架实践、机制诊断或综合项目等写法。
- 生成 Markdown、HTML、练习、项目和参考资料。
- 通过确定性检查、课程量规、Humanizer、最终体验检查和人工审核形成质量闭环。

## 实际案例

下面的需求来自 AI Agent 课程生产场景：

```text
为零基础产品经理创建一门 AI Agent 课程。
课程需要解释 Agent、Tool、Workflow 的关系，
并让学习者最终能够设计、实现和验收一个具备人工控制点的 Agent 工作流。
```

Skill 会先把需求拆成可检查的生产资料：

```text
course-root/
├── workspace/
│   ├── MISSION.md
│   ├── RESOURCES.md
│   ├── COURSE-GENERATION-SPEC.md
│   ├── COURSE-BLUEPRINT.md
│   └── NOTES.md
├── lessons/
├── reference/
├── markdown/
├── assets/
└── quality/
```

课程蓝图会记录每章的受众、前置知识、学习成果、正文类型、来源映射、练习闭环和验收方式。正文生成后，再依次执行 Humanizer、脚本检查、语义量规和最终体验验证。

## 安装

`teach-generator` 的中文质量闭环依赖同级的 `coco-humanizer-zh`，推荐一次安装两者：

```bash
npx skills add chokcoco/coco-skill-hub --skill teach-generator coco-humanizer-zh
```

手动安装时也要保留同级目录关系：

```bash
cp -R coco-skill-hub/.agents/skills/teach-generator your-project/.agents/skills/
cp -R coco-skill-hub/.agents/skills/coco-humanizer-zh your-project/.agents/skills/
```

## 使用示例

```text
使用 $teach-generator，根据仓库中的产品文档和源码，
为有 JavaScript 基础的前端工程师设计一门 8 小时的 Agent 工程课程。
先完成任务定义、来源登记和课程蓝图，等待我确认后再生成正文。
```

你也可以用它定向处理已有课程：

```text
使用 $teach-generator 审阅第 03 章。
重点检查前置知识、源码映射、练习闭环和验收证据，只修复失败片段。
```

## 质量检查

Skill 自带确定性检查脚本：

```bash
node .agents/skills/teach-generator/scripts/validate-course.mjs <course-root>
```

脚本负责结构、链接和可确定判断；教学目标是否达成、解释是否可信等语义问题，仍需按课程量规审阅。发布决定必须由人做出。

## 目录说明

- `SKILL.md`：全局约束与任务路由。
- `references/`：课程设计、章节写作、质量发布和各类正文指引。
- `templates/`：不同章节类型的结构模板与少量完整样例。
- `styles/`：可复用的课程视觉或讲解风格资料。
- `scripts/`：课程确定性检查及测试。

