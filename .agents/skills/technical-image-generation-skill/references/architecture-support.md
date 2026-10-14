# Architecture Template / 架构模板

## Purpose / 用途

用来展示系统由哪些层、服务、存储或外部依赖组成，以及请求、数据和控制如何穿过边界。

Show the layers, services, storage, and external dependencies in a system, and how requests, data, and control cross boundaries.

## Layout / 布局

- 先确定一个分层轴：用户到基础设施、边缘到核心，或控制面到数据面。
- 同层组件尺寸和卡片形状统一；跨层对象用容器或边界框标识。
- 只保留支持当前结论的连接，复杂交互另用时序图。
- 给主要连接加简短动词标签，例如“鉴权”“读取”“写入”“回调”。

- Establish one layering axis first: user-to-infrastructure, edge-to-core, or control-plane-to-data-plane.
- Keep peer component size and card shape consistent; use containers or boundary boxes for cross-layer areas.
- Keep only connections supporting the current takeaway; move complex interactions to a sequence diagram.
- Add short verb labels to major connections, such as “authorize,” “read,” “write,” or “callback.”

## Prompt Skeleton / 提示词骨架

```text
Create a layered technical architecture illustration titled “[title]”.
Layers from [direction]: [layer 1 and components], [layer 2 and components], [layer 3 and components].
Draw boundaries for [trust/domain/ownership boundary].
Show these primary interactions: [source] --[verb]--> [target].
Use a small legend to distinguish [data/control/request/external] paths. Keep peer components visually consistent.
```

## Review / 验收

- 读者能否看出组件属于哪一层或边界？
- 主连接是否少而有意义，且箭头端点准确？
- 同一角色是否保持相同形状和色彩？

- Can a reader tell which layer or boundary owns each component?
- Are primary connections few, meaningful, and attached to the correct endpoints?
- Do equivalent roles keep the same shapes and colors?
