---
name: technical-image-generation
description: "生成带清晰文字、结构关系和水彩墨线风格的技术插图与信息图。 Generate readable technical illustrations and infographics with clear text, structural relationships, and a watercolor-and-ink visual language."
---

# Technical Image Generation / 技术插图生成

用这套 Skill 生成一张能解释技术问题的图。先想清楚读者要看懂什么，再组织信息和画面。

Use this Skill to generate a visual that explains a technical question. Decide what the reader needs to understand, then organize the information and composition around it.

## Quick Workflow / 快速流程

1. 选择一个图型模板。
2. 写清楚图片要回答的问题、读者和必须保留的文字。
3. 用下方 Prompt 框架生成图片。
4. 检查文字、关系和版面；一次只修改一个问题。

1. Choose one diagram-family template.
2. State the question, audience, and text that must remain unchanged.
3. Generate with the prompt frame below.
4. Check copy, relationships, and layout; repair one problem at a time.

## Choose a Template / 选择模板

| Need / 需要解释什么 | Template / 模板 |
| --- | --- |
| 全景、系统地图或心智模型 / landscape, system map, mental model | `references/overview.md` |
| 步骤、反馈或生命周期 / steps, feedback, lifecycle | `references/process.md` |
| 组件、边界与关系 / components, boundaries, relationships | `references/architecture-support.md` |
| 方案差异与取舍 / options and trade-offs | `references/comparison.md` |
| 一个机制的内部细节 / internals of one mechanism | `references/deep-dive.md` |
| 抽象概念的直觉解释 / intuition for an abstract concept | `references/conceptual-explainer.md` |
| 指标变化与决策 / metrics and decisions | `references/data-story.md` |

一张图只选一个主图型。需要总览加细节时，在同一张图里保留一个小的放大区即可。

Choose one primary family per image. For an overview with detail, use only one small zoom-in area in the same image.

## Visual Language / 视觉语言

复古米白水彩纸肌理、细墨水描边、低饱和柔蓝/柔绿/柔紫/柔橙填充。卡片和箭头手绘但规整，水彩只提供层次，不能影响文字和关系的阅读。

Use vintage off-white watercolor paper texture, fine ink outlines, and muted soft blue, green, purple, and orange fills. Cards and arrows should feel hand-drawn yet orderly. Watercolor adds hierarchy but never interferes with reading text or relationships.

### Style Guardrails / 风格稳定器

- **纸张底色**：使用有可见纤维和轻微吸水斑驳的暖米白纸底。边缘可以有淡水彩晕染，但不能做成纯白画布、深色背景或大面积渐变。
- **墨线**：用细深色墨线勾勒卡片、箭头、图标和标题横幅。线条可以有自然笔触起伏，但不能粗重、机械或像霓虹描边。
- **水彩**：蓝、绿、紫、橙只作为低饱和的透明填充。保留不均匀的颜料堆积和干刷感，文字区仍保持干净、高对比。
- **卡片**：主要信息放在浅色圆角矩形或横幅里。卡片有清楚边框、统一的内边距和稳定对齐，不做漂浮玻璃卡或无边界的散点布局。
- **编号与图标**：有顺序的内容使用彩色圆形编号。每张卡片只配一个简洁的技术图标，例如流程箭头、层级方块、节点、图表、放大镜或勾选。
- **关系线**：主路径用粗一些的实线箭头；反馈、补充或边界关系可用虚线。箭头必须有明确起点和终点，必要时只加短动词标签。
- **信息密度**：画面可以丰富，但保持一个标题、一个主阅读方向和一层辅助信息。先用布局表达层级，不要靠塞满小字制造“技术感”。
- **装饰边界**：允许小面积水彩污点、短横线和轻微纸张痕迹；不使用人物、风景、植物、口号、拟物产品图或与主题无关的装饰。

### Visual Anchors / 视觉锚点

每次生成都应保留这些稳定信号：暖米白纸底、细墨线、四种低饱和水彩色、规整卡片、编号圆点、简洁技术图标和可追踪箭头。构图可以从横向流程、分层结构、网格比较或“总览 + 小放大区”之间变化，但这些信号不应同时被替换。

Keep these stable signals in every generation: warm off-white paper, fine ink, four muted watercolor colors, orderly cards, numbered circles, simple technical icons, and traceable arrows. Composition may change between horizontal flows, layered structures, comparison grids, or an overview with a small zoom-in, but these signals should not all change at once.

## Prompt Frame / Prompt 框架

将下列内容整理为一段完整 Prompt。不要把方括号留在最终请求中。

Turn the following into one complete prompt. Do not leave brackets in the final request.

```text
Create a [diagram family] that explains [one question].

Audience / 读者: [who will read it]
Takeaway / 结论: [one sentence]
Layout / 构图: [reading direction, cards or panels, arrows, optional zoom-in]
Content / 内容: [title, labels, key relationships, short explanations]
Protected text / 必须原样保留的文字: [names, values, versions, fields, or None]

Style / 风格:
Vintage off-white watercolor paper, fine ink outlines, muted blue, green, purple, and orange watercolor fills, orderly hand-drawn cards, clear print, and simple technical icons.

Avoid / 避免:
Tiny or incorrect text, clipped cards, overlapping arrows, placeholder text, nonsense glyphs, logos, watermarks, neon, glossy 3D UI, and unrelated decoration.
```

文字很重要时，加上：`Render all protected text exactly as supplied; keep every label large, high-contrast, and readable.`

When copy matters, add: `Render all protected text exactly as supplied; keep every label large, high-contrast, and readable.`

## Check the Result / 检查成图

- 一眼能看出这张图回答什么问题吗？
- 主路径、箭头和边界是否正确？
- 关键文字是否清晰、完整、没有错字？
- 画面是否留有呼吸空间，而不是为了“信息量”塞满卡片？

- Is the question clear at a glance?
- Are the main path, arrows, and boundaries correct?
- Is important copy clear, complete, and correctly spelled?
- Does the layout have breathing room rather than filling every space for “density”?

发现问题时，只描述并修复一个问题。例如：`Keep all content; enlarge the title and reduce the lower detail area to three cards.`

When a problem appears, describe and fix only one issue. For example: `Keep all content; enlarge the title and reduce the lower detail area to three cards.`

## Asset Names / 文件命名

发布图片使用：`technical-image-generation-<route>-v<revision>.png`，例如 `technical-image-generation-process-v1.png`。

For published images, use: `technical-image-generation-<route>-v<revision>.png`, for example `technical-image-generation-process-v1.png`.
