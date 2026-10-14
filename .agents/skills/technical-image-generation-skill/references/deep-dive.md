# Deep-Dive Template / 机制下钻模板

## Purpose / 用途

用来解释一个组件内部如何工作。读者应在看完后知道输入进入哪里、内部发生什么、输出怎样形成，以及什么地方会失败或需要取舍。

Explain how one component works internally. After reading, the audience should know where input enters, what happens inside, how output forms, and where failure or trade-offs appear.

## Layout / 布局

- 顶部先给被拆解对象的一句话定义。
- 中间采用 3-5 个局部面板，按内部数据或控制路径排序。
- 允许一个放大结构，例如索引、缓存层、评分器或重试循环。
- 用虚线框标出“范围外”或“内部实现未展开”，不要把未知部分画成事实。

- Start with a one-sentence definition of the component being opened.
- Use 3-5 focused panels ordered by internal data or control path.
- Allow one zoomed structure, such as an index, cache layer, scorer, or retry loop.
- Use a dashed boundary for “outside scope” or “implementation not expanded”; do not draw unknown details as fact.

## Prompt Skeleton / 提示词骨架

```text
Create a deep-dive technical explainer titled “[component] internals”.
Start with “[component] receives [input] and produces [output]”.
Break the mechanism into panels: [panel 1], [panel 2], [panel 3], [panel 4].
Include one zoom-in of “[important internal structure]”.
Show [failure/limit/trade-off] as a clearly labeled boundary or warning callout, not as part of the happy path.
```

## Review / 验收

- 面板是否共同解释同一个机制，而不是并列百科知识？
- 放大区是否连接回主流程？
- 未知、可选和必经步骤是否区分清楚？

- Do the panels explain one mechanism rather than parallel encyclopedia facts?
- Does the zoom-in connect back to the main path?
- Are unknown, optional, and mandatory steps clearly distinguished?
