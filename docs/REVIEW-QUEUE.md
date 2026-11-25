# 人工待审核题目清单

> 用途：记录题库审计中发现、但离线无法 100% 确认的题目。审计**没有擅自改动**这些题的答案。
> 核对方式：优先对照官方答案卷/权威教辅；确认后直接改 `build-data.json` 并重新构建。

状态说明：⬜ 待核验 · 🔍 已核对但存疑 · ✅ 已确认（改题或确认无误）

## 一、优先处理（答案唯一性 / 题面缺陷）

### U1 · #563 `need not eat` 是否同样成立（答案唯一性存疑）

### #563 · 情态动词 · should 表建议 · 仿真·情态动词

- 题干：You ______ not eat so much junk food; it's bad for your health.
- 选项：A. need ｜ B. should ｜ C. can ｜ D. must
- 当前答案：B（should）
- 当前解析：本题考查 should 表建议。shouldn't 意为“不应该”，用于劝告别人不要做某事；mustn't 表示禁止，语气过强；needn't 表示不必，can't 表示不可能。
- 选项译文：不必 ｜ 不应该（表建议） ｜ 不能够 ｜ 禁止

**疑点**：题干已给出 `not`，`You need not eat so much junk food` 语法完全成立（need 作情态动词，need not = 不必），与当前答案 B（should）构成两个可接受答案。

**建议核对**：原题是否为 `You ______ eat so much junk food`（无 not）；若是，则答案 B 唯一。若题面确实带 not，建议改为「答案 B，need 作情态动词表不必亦通」或换题。

状态：⬜

### U2 · #527 / #802 / #1233 同一题面三种答案、且题干缺主语

三题题干完全相同（"Hardly ______ the station when the train left."），但**题干中没有主语**，选项各自带 he / I，答案分别为 B / A / D。

### #527 · 倒装与强调 · 倒装：否定词置首 · 仿真·倒装与强调

- 题干：Hardly ______ the station when the train left.
- 选项：A. he had reached ｜ B. had he reached ｜ C. he reached ｜ D. did he reach
- 当前答案：B（had he reached）
- 当前解析：hardly...when 句型中 hardly 置首，主句用过去完成时部分倒装 had he reached，when 从句用一般过去时。
- 选项译文：他到达（正常语序） ｜ 他刚到（倒装） ｜ 他到达（一般过去） ｜ 他到达（did 倒装）

### #802 · 时态 · 过去完成时 · 仿真·时态

- 题干：Hardly ______ the station when the train left.
- 选项：A. had I reached ｜ B. I had reached ｜ C. did I reach ｜ D. I reached
- 当前答案：A（had I reached）
- 当前解析：考查过去完成时。Hardly 置句首主句部分倒装，到达在离开前，故用 had I reached。I had reached 未倒装，did I reach 表一般过去，其余不合。
- 选项译文：到达（倒装） ｜ 到达（未倒装） ｜ 到达（一般过去倒装） ｜ 到达（未倒装过去）

### #1233 · 倒装与强调 · 倒装：否定词置首 · 仿真·倒装与强调

- 题干：Hardly ______ the station when the train left.
- 选项：A. he had reached ｜ B. did he reach ｜ C. he reached ｜ D. had he reached
- 当前答案：D（had he reached）
- 当前解析：考查否定词置首的倒装。Hardly...when 句型中，主句用过去完成时并部分倒装，故用 had he reached；he had reached 未倒装，did he reach 时态不对。
- 选项译文：he had reached（正常语序） ｜ did he reach（时态错误） ｜ he reached（正常语序） ｜ had he reached（部分倒装）

**疑点**：hardly 置于句首要求部分倒装，选项 `had he reached / had I reached` 本身正确，但同一题面可配不同主语，导致「一题三答案」；对学习者而言题面不完整。

**建议核对/修复**：保留一题并补全题干主语，其余两题删除或改编。

状态：⬜

## 二、题号 / 解析问题

### U3 · #230–#234 七选五题号疑为 16–20

- 来源：2020·新高考I卷；当前 NOS：16/17/18/19/20；其余 13 篇七选五均为 36–40。
- 新高考卷七选五通常位于 36–40 题，此处疑为录入错误。

**建议**：对照 2020 新高考I卷原卷确认；若确为 36–40，仅需改题号映射（不影响答案与索引）。

状态：⬜

### U4 · #943 / #946 解析逐字相同

### #943 · 从句 · 结果状语从句 · 仿真·从句

- 题干：It was ______ a hot day that we stayed indoors all afternoon.
- 选项：A. such ｜ B. so ｜ C. very ｜ D. too
- 当前答案：A（such）
- 当前解析：考查结果状语从句。such + a + 形容词 + 名词 + that...，故用 such。so 修饰形容词，very 和 too 不引导结果从句，其余不合。
- 选项译文：如此（such） ｜ 如此（so） ｜ 非常 ｜ 太

### #946 · 从句 · 结果状语从句 · 仿真·从句

- 题干：It is ______ a difficult problem that few students can solve it.
- 选项：A. such ｜ B. so ｜ C. very ｜ D. too
- 当前答案：A（such）
- 当前解析：考查结果状语从句。such + a + 形容词 + 名词 + that...，故用 such。so 修饰形容词，very 和 too 不引导结果从句，其余不合。
- 选项译文：如此（such） ｜ 如此（so） ｜ 非常 ｜ 太

**建议**：保留一条解析并改写另一条（#946 的 problem 是单数名词，可补充与 #943 的 hot day 差别）。

状态：⬜

## 三、已确认并处理（无需再审）

| 问题 | 处理 |
|---|---|
| 7 组同题面变体重复（#3↔#1340、#12↔#855、#21↔#725、#26↔#625、#33↔#1211、#37↔#1400、#43↔#1174） | v6.23 已通过题干占位符归一化在运行时隐藏，不删数据、不动索引 |
| 33 道重复仿真题 | 运行时隐藏（既有机制） |
| 七选五译文被校验器误报 70 条 | 校验器已修正 |
| 范文校验字段名错误 14 条 | 校验器已修正 |

## 四、参考（非逐题）

- 128 条英文占比偏高的选项译文抽查：见 [DATA-REVIEW-2026-11.md](./DATA-REVIEW-2026-11.md)。结论：未发现错误译文，但建议后续统一为纯中文释义。
- 325 条未逐字引用正确项的解析抽查：同上，抽样质量正常，无需批量修改。
- 2022–2026 真题官方答案核验状态：见 DATA-REVIEW 第 3 节。
