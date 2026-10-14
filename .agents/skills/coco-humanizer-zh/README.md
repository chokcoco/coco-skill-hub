# Coco Humanizer-zh

`coco-humanizer-zh` 用于编辑或审阅中文正文、教程和技术文档，去掉模板化 AI 腔，同时保全原文事实、术语、论证和语气。

> 该 Skill 原名 `humanizer-zh`。为避免与社区同名 Skill 冲突，Hub 仅保留新名称 `coco-humanizer-zh`。

它不是禁词替换器。它处理的是空洞造势、机械排比、翻译腔、短碎句堆砌和没有信息量的过渡，不会为了“像人”而编造经历、数据或读者反馈。

## 改写示例

### 示例一：删掉空洞造势

改写前：

> 在当今这个快速发展的数字化时代，AI Agent 正以前所未有的速度重塑各行各业，为企业带来了无限可能。

改写后：

> AI Agent 已经进入真实工作流。团队接下来要解决的，是它能调用什么、失败后如何恢复，以及哪些决定必须留给人。

### 示例二：保留技术边界

改写前：

> 值得注意的是，Humanizer 不仅能够全面提升文本质量，更能够确保内容的专业性和准确性。

改写后：

> Humanizer 只检查表达质量。事实是否准确、教学目标是否达成，仍要交给对应的核验环节。

第二个例子没有把“准确性”包装成语言工具的能力，而是把职责边界说清楚。

## 安装

```bash
npx skills add chokcoco/coco-skill-hub --skill coco-humanizer-zh
```

## 使用示例

直接改写：

```text
使用 $coco-humanizer-zh 改写这篇中文技术文章。
保留所有 API 名称、版本号、代码、数据和作者判断，只修改确有问题的句子。
```

只做审阅：

```text
使用 $coco-humanizer-zh 审阅下面的课程正文，不直接改稿。
按“原文 -> 建议 -> 问题类型”列出可定位的问题。
```

## 适用边界

- 适用于中文正文、教程、课程、技术文档、复盘和观点文章。
- 不机械修改代码块、行内代码、JSON 键、URL、API 路径、字段名和原文引用。
- 不代替事实核查、来源审查、教学设计、构建验证或发布判断。
- 没有问题的句子不必重写；自然不等于口语化，也不等于删掉专业细节。

## 目录说明

- `SKILL.md`：适用范围、路由、基本流程和交付标准。
- `reference/de-ai-style.md`：所有中文任务必读的去 AI 味编辑规范。
- `reference/common-patterns.md`：常见模板化表达与判断方式。
- `reference/technical-text-boundaries.md`：技术文本中不可误改的内容。
- `reference/quality-rubric.md`：大篇幅重写和质量 Gate 的评分标准。
- `reference/review-cases.md`：用于校准判断的反例与审校案例。

