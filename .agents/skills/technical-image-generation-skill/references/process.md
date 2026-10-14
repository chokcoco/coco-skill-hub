# Process Template / 流程模板

## Purpose / 用途

用来解释输入如何经过动作、检查、分支和反馈，最终形成结果。适合摄取、构建、部署、排错和生命周期。

Explain how an input moves through actions, checks, branches, and feedback to an outcome. Best for ingestion, build, deployment, debugging, and lifecycle stories.

## Layout / 布局

- 主路径从左到右或从上到下，保持单一方向。
- 每一步使用编号、动词标题、一个图标和至多两条说明。
- 反馈线从底部或侧边回到准确的上游步骤，不能穿过卡片正文。
- 成功、失败或人工决策必须用不同线型或色彩，并在图例解释。

- Keep the primary path left-to-right or top-to-bottom in one direction.
- Give each step a number, verb-led title, one icon, and at most two descriptions.
- Return feedback from the bottom or side to the exact upstream step; it must not cross card copy.
- Use distinct line styles or colors for success, failure, and human decisions, and explain them in a legend.

## Prompt Skeleton / 提示词骨架

```text
Create a numbered technical process diagram titled “[title]”.
Primary flow: [step 1] -> [step 2] -> [step 3] -> [outcome].
For each step, show a short action title, a minimal icon, and [one or two] concise details.
Add a feedback loop from “[later step]” to “[earlier step]” labeled “[reason]”.
Use solid arrows for [meaning] and dashed arrows for [meaning]. Include a compact legend.
```

## Review / 验收

- 主路径能否不回头地读完？
- 每根箭头是否表达动作、结果或判断，而非无名连接？
- 失败与反馈是否回到正确的节点？

- Can the primary path be read without backtracking?
- Does every arrow represent an action, outcome, or decision rather than an unnamed connection?
- Do failures and feedback return to the correct node?
