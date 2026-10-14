# Kafka 消息链路与事件边界

> 预计学习时间：180–260 分钟
> 一句话总结：从"同步调用为什么不够用"出发，讲清消息队列的本质、Kafka 在社区中的定位与取舍、Kafka 与 Saturn 的职责边界，再沿 `sbs-fbs-server` 和 `fbs-tax-server` 的真实 producer/consumer 代码，学会设计消息契约、处理重复与乱序、理解可靠性层次。

## 同步调用的天花板：为什么需要消息队列

在 BE-W05 中你学习了服务间调用——HTTP handler 通过 gRPC 或 HTTP client 调用下游服务，等待响应后继续执行。这个模型的核心假设是：**调用方和被调用方同时在线，调用方关心被调用方的处理结果，且等待时间可接受。**

但 FBS 系统中大量场景不满足这些假设。举个例子：运营人员在 SC 后台修改了一个店铺的渠道配置，这个变更需要被对账系统感知、被库存系统感知、被 BI 报表系统感知。如果店铺管理的 HTTP handler 在修改完 MySQL 后，依次调用对账服务、库存服务、BI 服务的接口——这个 handler 的响应时间就变成了三个下游服务的响应时间之和。更糟的是，如果库存服务恰好正在部署重启，这次调用失败，运营同学看到的错误提示是"修改渠道配置失败"——但他明明只改了渠道配置，为什么库存服务的故障要影响他？

这个问题的本质是：**一个业务动作的完成，不应该以所有下游消费者都响应成功为前提。**

### 前端有等价概念吗

前端同学每天都在使用异步解耦，只是形态不同：

| 前端模式 | 后端等价物 | 共同点 | 关键差异 |
| --- | --- | --- | --- |
| `EventEmitter` / `CustomEvent` | 消息队列（Message Queue） | 发布-订阅，解耦生产者和消费者 | 前端在同一 JS 线程内，后端跨进程甚至跨机器 |
| `postMessage`（跨 iframe/Worker） | Kafka topic 跨服务 | 跨边界通信，消息序列化 | 后端消息需持久化到磁盘，可回溯数天前的消息 |
| Redux action dispatch | 领域事件发布 | 动作发生后通知关心方，不等待结果 | Redux 同步执行，后端消息异步且可能延迟数秒到数分钟 |
| WebSocket 推送 | Kafka consumer 拉取 | 服务端主动推送/客户端主动拉取 | WebSocket 面向在线客户端，Kafka consumer 可离线重启后从断点继续 |

核心差异：前端的所有发布-订阅都在同一浏览器进程内，关闭页面一切消失。后端的消息队列是一个**独立运行的基础设施**，消息持久化在磁盘上，producer 和 consumer 可以在不同时间运行——producer 在下午 3 点发布消息，consumer 在凌晨 4 点重启后才消费，消息不会丢。

### 消息队列的三个核心价值

**解耦（Decoupling）**：producer 不知道有哪些 consumer，也不需要知道。店铺管理模块修改完渠道后，往消息队列发一条"渠道变更"事件，继续自己的工作。对账模块、库存模块、BI 模块各自订阅这条事件——未来新增一个"推荐引擎"模块也要感知渠道变更，店铺管理代码完全不用动。

**削峰（Peak Shaving）**：大促期间，每秒可能有数千个 ASN 同时创建。如果每个 ASN 创建都要同步调用下游服务，下游瞬间被冲垮。消息队列作为一个缓冲区，producer 快速写入消息后返回，consumer 按自己的处理能力匀速消费。消息在队列中短暂积压，但系统整体不崩溃。

**容错（Fault Tolerance）**：consumer 挂了，消息不会丢。Kafka 把消息持久化在磁盘上，consumer 重启后从上次的 offset 继续消费。如果 consumer 处理某条消息失败了，可以重试——不需要 producer 重新发送。

## 社区方案地图：Kafka 在消息队列家族中的位置

消息队列不是只有 Kafka。社区有丰富的选择，各有侧重：

| 方案 | 设计理念 | 核心优势 | 核心代价 | 典型场景 |
| --- | --- | --- | --- | --- |
| **RabbitMQ** | 传统消息队列，基于 AMQP 协议，消息消费后从队列删除 | 灵活的路由（exchange/queue/binding）、成熟的管理界面、延迟消息插件 | 吞吐量受限于单节点、消息不支持回放、集群运维复杂 | 业务任务分发、RPC 回调、订单处理 |
| **Kafka** | 分布式流平台，消息按时间顺序持久化在磁盘，支持多 consumer group 独立消费 | 超高吞吐（百万条/秒）、消息可回溯（replay）、水平扩展简单 | 延迟比 RabbitMQ 略高（ms 级 vs μs 级）、运维需要 ZooKeeper/KRaft | 日志收集、事件溯源、实时数据管道、跨服务事件通知 |
| **Apache Pulsar** | 下一代消息系统，计算与存储分离 | 多租户、地理复制、分层存储（热数据在内存、冷数据在 S3） | 社区和生态不如 Kafka 成熟、运维复杂度更高 | 需要多租户隔离的大规模消息平台 |
| **NSQ** | 轻量级实时消息队列，Go 语言实现 | 部署极简、无中心节点、客户端自动发现 | 不支持消息持久化（默认内存）、不支持严格顺序 | 小型团队的内部异步任务 |
| **AWS SQS** | 云托管消息队列，无需运维 | 按调用付费、无限弹性扩展 | 绑定云厂商、单消息最大 256KB、延迟不可控 | 云原生应用的事件驱动架构 |

**Kafka 和其他消息队列的本质区别**：RabbitMQ 是"消息投递系统"——消息被一个 consumer 消费后就删除。Kafka 是"分布式日志"——消息按时间追加到日志文件，consumer 用 offset 指针记录读到哪了。这个区别决定了 Kafka 天然适合"同一份数据被多个消费者独立消费"的场景——对账系统、库存系统、BI 系统各自有一个 consumer group，各自维护自己的 offset，互不影响。如果用 RabbitMQ 实现这个需求，需要显式地把同一条消息复制到三个队列。

FBS 选择 Kafka 的核心动机：多服务、多模块需要对同一业务事件做出不同反应，且需要消息可回溯以支持问题排查和数据修复。

### Kafka 与 Saturn 的边界：什么时候发消息，什么时候提交任务

上一章（BE-A03）讲了 Saturn 定时任务和异步任务。这里必须讲清楚它们和 Kafka 的边界——否则你会在设计时反复纠结。

| 维度 | Kafka 消息 | Saturn 异步任务 |
| --- | --- | --- |
| 语义 | "某件事发生了"（事件通知） | "帮我做一件事"（任务委派） |
| 触发方 | producer 发布后不关心谁来消费 | 提交方期待任务最终执行成功 |
| 消费者数量 | 多个 consumer group 独立消费同一份数据 | 一个任务被一个 handler 执行 |
| 可靠性保证 | at-least-once 投递，consumer 管理 offset | Saturn 平台管理重试，handler 返回 error 触发重试 |
| 时序 | 事件发生时间 + 消费延迟 | 提交后立即或排队执行 |
| FBS 中的典型用途 | "店铺渠道变了""ASN 状态变了""发票生成了" | "扫描过期 ASN""生成发票 PDF""同步渠道配置" |

同一笔业务流程中，Kafka 和 Saturn 经常配合使用：ASN 创建后，HTTP handler 往 Kafka 发一条 `ASN_CREATED` 事件 → 对账模块的 consumer 消费到这个事件，计算费用后，向 Saturn 提交一个异步任务"生成发票" → Saturn handler 执行发票生成。这不是功能重叠，而是职责分层：Kafka 负责"通知这件事发生了"，Saturn 负责"现在要执行这个操作"。Kafka 的 consumer 是事件驱动的、持续监听的；Saturn 的 handler 是按任务粒度执行的、有明确成功/失败边界的。

## 案例一：店铺渠道同步——一条 Kafka 消息的完整生命周期

这是 `sbs-fbs-server` 中最典型的一条 Kafka 链路。运营在 SC 后台修改了店铺的渠道绑定，这个变更需要通知对账系统和库存系统。我们用这个案例走一遍 Kafka 消息从"诞生"到"被完全消费"的全过程。

### 第一站：producer 发布消息

当店铺管理的 service 层完成了渠道变更的 MySQL 写入后，向 Kafka 发布一条消息：

```go
// apps/seller/shop/service/shop_channel_service.go（简化说明）
func (s *ShopService) UpdateShopChannel(ctx context.Context, shopID int64, channelID int64, action string) error {
    // 1. 数据库写入——这是业务事实
    err := s.db.Transaction(func(tx *gorm.DB) error {
        if err := tx.Exec("UPDATE shop_channel SET ... WHERE shop_id = ? AND channel_id = ?", shopID, channelID).Error; err != nil {
            return err
        }
        return nil
    })
    if err != nil {
        return err
    }

    // 2. 事务提交成功后，发布 Kafka 消息
    event := &ShopChannelChangeEvent{
        ShopID:    shopID,
        ChannelID: channelID,
        Action:    action,   // "add" / "remove" / "update"
        Timestamp: time.Now().Unix(),
    }
    eventBytes, _ := json.Marshal(event)
    err = s.kafkaProducer.Send(ctx, "fbs.shop.channel.change", shopID, eventBytes)
    if err != nil {
        // 消息发布失败——DB 已提交，消息未发出
        log.Errorf("send shop channel event failed: shop=%d ch=%d action=%s err=%v",
            shopID, channelID, action, err)
        // 记录补偿任务，后续通过定时任务补发
    }
    return nil
}
```

这段代码暴露了 Kafka 使用中的第一个关键问题：**事务提交成功 + 消息发送失败 = 下游永远不知道这次变更**。这就是"dual-write"（双写）问题——数据库和 Kafka 是两个独立存储，无法在一个本地事务中同时写入。本章后面会讲三种处理方案，但此刻你先记住：每次看到"事务提交 + 发 Kafka"的代码，就要立刻想"如果发 Kafka 失败了会怎样"。

`Send` 的第三个参数 `shopID` 是 Kafka 消息的 **key**。Kafka 根据 key 的哈希值决定这条消息进入 topic 的哪个 partition。把 `shopID` 作为 key 意味着：同一个店铺的所有渠道变更消息会进入同一个 partition，保证消费时的顺序——对账系统先收到"add A 渠道"再收到"remove A 渠道"，不会乱序。

### 第二站：Kafka broker 的存储

消息到达 Kafka broker 后，被追加到 `fbs.shop.channel.change` 这个 topic 的某个 partition 的日志文件末尾。Kafka 不会因为消息被消费了就删除它——它根据**保留策略**（retention policy，比如保留 7 天）自动清理过期消息。这意味着：

- consumer 可以回溯（replay）过去 7 天内的任何消息——对于数据修复和问题排查是巨大优势
- 但 consumer 如果因为故障停了超过 7 天，重启后那段消息已经没有了——需要其他手段补齐

### 第三站：consumer group 的消费

`fbs.shop.channel.change` 有两个 consumer group：`group-billing`（对账系统）和 `group-inventory`（库存系统）。两个 group 独立消费，各自的 offset 互不影响。

以对账系统的 consumer 为例：

```go
// apps/seller/shop/access/consumer/sync_shop_channel_consumer.go（简化说明）

// 消息体定义
type ShopChannelChangeEvent struct {
    ShopID    int64  `json:"shop_id"`
    ChannelID int64  `json:"channel_id"`
    Action    string `json:"action"`
    Timestamp int64  `json:"timestamp"`
}

// consumer handler
func HandleShopChannelChange(ctx context.Context, msg []byte) error {
    // Step 1: 反序列化
    var event ShopChannelChangeEvent
    if err := json.Unmarshal(msg, &event); err != nil {
        log.Errorf("unmarshal shop channel event failed: %v", err)
        // 反序列化失败说明消息格式有问题——这种错误重试无意义
        return nil  // 返回 nil 跳过这条消息，不阻塞后续消息
    }

    // Step 2: 幂等检查——这条消息我处理过吗？
    // 基于 shop_id + channel_id + action + timestamp 判断
    // 如果已处理过，直接返回成功
    processed, err := s.isProcessed(ctx, event.ShopID, event.ChannelID, event.Timestamp)
    if processed {
        return nil  // 幂等返回——消息重复，跳过
    }

    // Step 3: 执行业务逻辑
    switch event.Action {
    case "add":
        err = s.billingService.AddShopChannel(ctx, event.ShopID, event.ChannelID)
    case "remove":
        err = s.billingService.RemoveShopChannel(ctx, event.ShopID, event.ChannelID)
    case "update":
        err = s.billingService.UpdateShopChannel(ctx, event.ShopID, event.ChannelID)
    default:
        log.Warnf("unknown action %s for shop %d ch %d", event.Action, event.ShopID, event.ChannelID)
        return nil  // 未知 action，跳过不阻塞
    }

    if err != nil {
        return fmt.Errorf("process shop channel change: %w", err)  // 返回 error → 重试
    }

    // Step 4: 标记已处理
    s.markProcessed(ctx, event.ShopID, event.ChannelID, event.Timestamp)
    return nil
}
```

### 从这段代码中提炼的关键知识点

**消息反序列化失败时的处理**：返回 `nil` 而非 `error`。如果返回 error，consumer 会不断重试这条坏消息，阻塞后续所有正常消息。正确的做法是"跳过 + 告警"——反序列化失败大概率是 producer 的序列化格式变了而 consumer 没升级，人工介入修复后重新发消息。

**消息重复不可避免**。Kafka 保证 at-least-once（至少一次）投递：consumer 处理成功后提交 offset 之前进程崩溃，重启后会从旧 offset 重新消费，同一条消息被处理两次。这是 Kafka 的正常行为，不是 bug。**每个 consumer handler 都必须实现幂等**——基于业务唯一键判断是否已处理。

**消息在 partition 内有序，跨 partition 无序**。同一个 `shopID` 的所有消息（key 相同）进入同一个 partition，保证了该店铺的变更按时间顺序被消费。但如果 producer 没有设置 key，同一条店铺的 add 和 remove 可能进入不同 partition，consumer 可能先消费 remove 再消费 add——导致业务状态错乱。设置正确的 message key 是 Kafka producer 最重要的设计决策之一。

**offset 提交的时机**。consumer 通常设置为"处理成功后自动提交 offset"或"手动提交"。"成功就提交"的语义是 at-least-once；如果改为"先提交后处理"，语义变成 at-most-once（最多一次，消息可能丢失但不会重复）。FBS 仓库中的 consumer 使用 at-least-once 语义，因为重复可以通过幂等处理，但丢失无法恢复。

## 案例二：Tax 服务的发票事件链——producer 与 consumer 的完整协作

`fbs-tax-server` 在 Kafka 中同时扮演 producer 和 consumer，是一个更复杂的案例。

### Producer 侧：发票生成完成后发布事件

```go
// fbs-tax-server/internal/common/kafka/producer/biling.go（简化说明）
func (p *BillingProducer) SendInvoiceGenerated(ctx context.Context, invoice *Invoice) error {
    event := &InvoiceGeneratedEvent{
        InvoiceID:    invoice.ID,
        OrderID:      invoice.OrderID,
        TotalAmount:  invoice.TotalAmount,
        Currency:     invoice.Currency,
        GeneratedAt:  time.Now().Unix(),
        InvoiceType:  invoice.Type,    // "regular" / "credit_note" / "debit_note"
    }
    data, _ := json.Marshal(event)
    return p.producer.Send(ctx, "fbs.tax.invoice.generated", invoice.OrderID, data)
}
```

注意 message key 用的是 `OrderID` 而非 `InvoiceID`。因为账单系统需要按订单维度聚合所有发票（一个订单可能有多张发票：正票 + 贷项通知单 + 借项通知单），用 OrderID 作为 key 保证同一个订单的所有发票事件进入同一个 partition，按生成顺序被消费。

### Consumer 侧：账单系统消费发票事件

```go
// fbs-tax-server/internal/common/kafka/consumer/billing.go（简化说明）
func HandleInvoiceGenerated(ctx context.Context, msg []byte) error {
    var event InvoiceGeneratedEvent
    if err := json.Unmarshal(msg, &event); err != nil {
        return nil  // 跳过坏消息
    }

    // 根据发票类型分别处理
    switch event.InvoiceType {
    case "regular":
        return billingService.CreateBill(ctx, event)
    case "credit_note":
        return billingService.ApplyCreditNote(ctx, event)
    case "debit_note":
        return billingService.ApplyDebitNote(ctx, event)
    }

    // 处理成功，offset 自动提交
    return nil
}
```

### consumer lag——一个你需要持续关注的指标

consumer lag 是当前 partition 最新消息的 offset 减去 consumer 已提交的 offset。lag = 0 表示 consumer 完全跟上 producer；lag 持续增长表示 consumer 处理速度跟不上生产速度，或者 consumer 停了。

在 FBS 主服务的监控体系中，consumer lag 是 Prometheus 上报的核心指标之一。如果你看到 `fbs.shop.channel.change` 的 lag 从 0 突然飙升到 50000，第一时间应该检查：consumer 的进程是否存活？最近是否有大批量导入操作？consumer 的数据库连接是否正常？

### DLQ（Dead Letter Queue，死信队列）

当一条消息被重试多次（比如 3 次）全部失败后，它会进入 DLQ。DLQ 是一个特殊的 topic，专门存放"无法正常处理"的消息。进入 DLQ 不会自动恢复——需要人工或定时任务检查 DLQ 中的消息：

- 如果原因是数据问题（如 shop_id 对应的店铺不存在），修复数据后把消息从 DLQ 重新放回原 topic
- 如果原因是代码 bug（如 consumer handler 的 nil pointer panic），修 bug 重新部署后重放 DLQ 消息
- 如果原因是上游消息格式变更，需要协调 producer 和 consumer 同步升级

主服务 `fbs_task` 进程的 consumer 框架已经内置了 DLQ 机制。你在写 consumer handler 时，只需要知道：handler 返回 error 超过最大重试次数后，消息会自动进入 DLQ，你需要在监控中关注 DLQ 的积压量。

## dual-write 问题与三种解决方案

回到案例一中提出的问题：事务提交成功 + Kafka 发送失败 = 下游永远不知道这次变更。这是分布式系统中最经典的 dual-write 问题。FBS 仓库语境下有三种可行方案，按可靠性从低到高：

### 方案一：发消息失败时记录日志并告警（当前做法）

事务提交后直接 `producer.Send()`，失败时记录错误日志。优点是实现简单、不引入额外基础设施。缺点是消息可能永远丢失——告警是人工兜底。FBS 仓库中非关键通知类的事件目前采用这个策略。

### 方案二：outbox 模式

不在事务外发 Kafka，而是**在同一个数据库事务中**，除了业务表的写入，还往一张 `outbox` 表插入一条消息记录：

```go
err := db.Transaction(func(tx *gorm.DB) error {
    // 1. 业务写入
    tx.Exec("UPDATE shop_channel SET ... WHERE ...")
    // 2. outbox 写入（同一个事务！）
    tx.Create(&OutboxRecord{
        Topic:    "fbs.shop.channel.change",
        Key:      fmt.Sprintf("%d", shopID),
        Payload:  eventBytes,
        Status:   "pending",
    })
    return nil
})
```

事务提交后，一个独立的轮询线程从 `outbox` 表中拉取 `status=pending` 的记录，投递到 Kafka，投递成功后标记为 `sent`。核心思想：把"发消息"变成数据库事务的一部分，利用事务的原子性保证"业务写入成功 = 消息记录一定存在"。

outbox 模式的代价：需要维护一个轮询线程、一张 outbox 表、以及消息发送的幂等（轮询线程可能发送成功后崩溃，重启后重复发送同一条记录）。

### 方案三：CDC（Change Data Capture，变更数据捕获）

不让业务代码直接写 Kafka。通过 Debezium 等工具监听 MySQL 的 binlog，把 `INSERT`/`UPDATE`/`DELETE` 自动转换成 Kafka 消息。业务代码只操作数据库，完全不知道 Kafka 的存在。dual-write 问题从根源上消失了——因为只有"一写"（数据库），Kafka 消息由 binlog 保证与数据库一致。

CDC 的代价：需要运维团队提供 CDC 基础设施（Kafka Connect 集群、Debezium connector 配置），schema 变更时 CDC 配置也需要同步调整。FBS 仓库当前没有统一的 CDC 实现。

三种方案的适用场景：outbox 或 CDC 适合涉及资金、库存等不可逆操作的场景；直接发消息 + 告警适合通知类事件。选择哪条路径，要和你所在的团队确认现有基础设施的可用性。

## consumer 的测试策略

consumer handler 的单元测试不需要启动 Kafka broker。因为 handler 最终是一个接收 `[]byte` 返回 `error` 的纯函数。测试策略：

**正常路径**：传入合法的 JSON 消息，验证 handler 调用了正确的 service 方法。

**重复消息**：对同一条消息调用 handler 两次，验证第二次调用被幂等拦截，service 方法未被调用第二次。

**坏消息**：传入非法 JSON、空字节、超大 payload，验证 handler 返回 `nil`（不阻塞）而非 `error`（会导致无限重试）。

**service 失败**：注入 fake service 返回 error，验证 handler 返回 error（触发重试）。

```go
func TestHandleShopChannelChange(t *testing.T) {
    // 正常路径
    msg := `{"shop_id":100,"channel_id":5,"action":"add","timestamp":1700000000}`
    err := HandleShopChannelChange(ctx, []byte(msg))
    assert.NoError(t, err)
    assert.True(t, fakeService.AddShopChannelCalled)

    // 重复消息——幂等
    err = HandleShopChannelChange(ctx, []byte(msg))
    assert.NoError(t, err)  // 仍然返回成功
    assert.Equal(t, 1, fakeService.AddShopChannelCallCount)  // 只调用了一次

    // 坏消息
    err = HandleShopChannelChange(ctx, []byte("{invalid json"))
    assert.NoError(t, err)  // 返回 nil，不阻塞
}
```

主服务 `apps/seller/shop/access/consumer/` 下的 `*_test.go` 文件中可以找到真实的 consumer 测试范例。

## 消息契约设计评审清单

发布一条新的 Kafka 消息前，用这个清单逐项检查：

1. **topic 命名**：是否遵循团队约定（如 `{domain}.{entity}.{event}`）？`fbs.shop.channel.change` 就是一个规范的名称
2. **message key**：是否保证了需要有序消费的实体落到同一个 partition？key 为空会导致消息随机分布
3. **消息体内容**：是携带完整数据还是只携带 ID？携带完整数据避免 consumer 额外查库，但 producer schema 变更影响面大；只携带 ID 让 consumer 拿最新数据，但多一次查询
4. **序列化格式**：JSON 天然支持向前兼容（旧 consumer 忽略新字段），protobuf/Avro 需要显式声明兼容规则
5. **敏感信息**：消息体中有没有 token、PII、内部路径？Kafka 消息可能被多个 consumer group 消费，也可能被运维人员直接查看
6. **向后兼容**：新增字段是否可选？旧 consumer 忽略后是否有合理的默认行为？
7. **schema 版本**：消息体中是否包含 `schema_version` 字段？当消息结构发生不兼容变更时，consumer 可以按版本分流处理
8. **DLQ 处理**：这条消息进入 DLQ 后由谁处理？需要人工介入还是定时任务自动重放？

## 练习

### 练习一：为 ASN 状态变更设计消息

ASN 状态从"待收货"变为"已入库"时，对账系统和 BI 报表系统需要感知。设计这条 Kafka 消息：

1. 定义 topic 名称和消息体字段（至少包含 ASN ID、状态变更前后值、操作时间和操作人）。
2. 选择 message key 并写出理由（提示：对账系统按卖家维度、BI 系统按时间维度消费，哪个更适合作为 key？）。
3. 消息体是携带完整数据还是只携带 ID？如果只携带 ID，consumer 查库时 ASN 状态又被改了怎么办？
4. 如果后续需要增加"最终入库仓位"字段，旧 consumer 如何不受影响？

### 练习二：追踪真实 consumer 链路

在 `sbs-fbs-server/apps/seller/client/port/input/consumer/` 中任选一个 consumer：

1. 找到对应的 topic 和 message key。
2. 画出从消息到达到业务处理完成的完整调用链（反序列化 → handler → service → repository）。
3. 检查 handler 是否实现了幂等。如果没有，写出需要增加的幂等逻辑。
4. 模拟一个重复消息场景：如果同一条消息被消费两次，数据库最终状态是否正确？

### 练习三：Kafka vs Saturn 选型判断

以下三个场景，判断用 Kafka 还是 Saturn 异步任务，并写出理由：

1. ASN 创建后需要通知仓库管理系统准备收货。
2. 每小时统计各仓库入库完成率并生成报表。
3. 发票生成后需要同步更新对账系统、BI 报表系统和卖家通知中心。

### 练习四：dual-write 方案选择

你的团队要在"渠道变更通知"场景中提高消息可靠性。当前做法是"事务提交后发 Kafka，失败记日志"。请分析：

1. 当前做法的最坏影响是什么？哪些下游消费者会受影响？
2. 如果要升级到 outbox 模式，需要修改哪些代码？新增哪些组件？
3. 如果要升级到 CDC 模式，需要团队具备哪些基础设施？
4. 你会推荐哪种方案？写出你的推荐理由和风险评估。

## 自检

1. 消息队列解决的核心问题是什么？同步 HTTP 调用在什么场景下不够用？
2. Kafka 和 RabbitMQ 的本质区别是什么？为什么 FBS 选择了 Kafka？
3. Kafka 的 partition、consumer group、offset 分别解决什么问题？
4. Kafka 和 Saturn 的语义边界是什么？什么时候发消息、什么时候提交任务？
5. dual-write 问题是什么？outbox 模式和 CDC 模式分别如何解决它？

## 参考文献

- `sbs-fbs-server/apps/seller/shop/access/consumer/sync_shop_channel_consumer.go`：店铺渠道同步 consumer
- `sbs-fbs-server/apps/seller/client/port/input/consumer/`：客户事件 consumer
- `fbs-tax-server/internal/common/kafka/producer/biling.go`：发票事件 producer
- `fbs-tax-server/internal/common/kafka/consumer/billing.go`：账单 consumer
- `fbs-tax-server/initialize/base/init_kafka.go`：Tax 服务 Kafka 初始化
- [Kafka Documentation](https://kafka.apache.org/documentation/)
