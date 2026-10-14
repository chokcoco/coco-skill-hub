# Quality Checklist / 质量检查表

## Review in Order / 按顺序检查

1. **Question and takeaway / 问题与结论**：不读提示词，能否看出这张图回答什么问题，以及结论是什么？
2. **Reading path / 阅读路径**：标题、主路径、局部细节和图例是否按自然顺序出现？
3. **Semantic accuracy / 语义准确性**：卡片、箭头、边界、编号、反馈和警示是否表达了原始事实？
4. **Protected text / 受保护文字**：逐项核对名称、数值、版本、字段、日期、命令和引用。任何一处错误都要记录。
5. **Legibility / 可读性**：在正常使用尺寸下，标题、卡片标题、箭头和图例是否清楚？是否存在裁切、重叠、断字或乱码？
6. **Visual grammar / 视觉语法**：同一颜色、线型、形状和图标是否始终表达同一种含义？
7. **Style fidelity / 风格一致性**：是否保留米白纸底、细墨线、低饱和水彩与克制纹理？装饰有没有抢走信息？
8. **Delivery / 交付**：是否保存最终提示词、版本、画幅、用途、限制和验收结论？

## Severity / 严重程度

`blocker / 阻断`：中心结论错误；受保护文字错误；主箭头接错；关键内容不可读；图被裁切。

`major / 主要问题`：读者难以确定阅读顺序；颜色语义混乱；信息拥挤到无法扫描；图例与图形不一致。

`minor / 次要问题`：水彩纹理过重；图标风格轻微不统一；留白、对齐或字距可以改善。

## Targeted Repair Prompt / 定向修复提示词

```text
Keep the topic, content, and shared watercolor-and-ink style unchanged.
Fix only this issue: [one observed defect].
Preserve these verified elements exactly: [protected text and correct relationships].
The revised image must improve [legibility/arrow routing/layout/text accuracy] without adding new cards, facts, or decorative objects.
```
