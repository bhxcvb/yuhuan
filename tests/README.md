# 测试

四组测试，CI 每次 push 自动运行前三组。

## 1. 题库结构校验

```bash
node tools/extract-data.js /tmp/data.json     # 从 web/index.html 取出题库
node tools/validate-data.js /tmp/data.json    # 校验
```

检查：题目结构、分类、选项数量（七选五 7 个 / 其余 4 个）、选项重复、答案索引、解析长度、知识点是否存在、译文引用（七选五译文 7 个选项）、重复题、范文完整性。

另外 CI 会跑 `node tools/build-app.js --check`，确认 `web/index.html` 与 `src/app-template.html` 同步（防止直接改产物）。

## 2. 基础回归（无依赖）

```bash
node tests/basic.test.js
```

253 项断言：题库与词典规模、出题规则（阅读/七选五不进单题流程）、页面渲染、答题流程、错因、间隔复习调度（升箱、连错推后、错因影响）、章节/计时、查词与中文反查、主题与字号、备份与撤销、schema 迁移、重复题隐藏。

## 3. 端到端（需要 Playwright）

```bash
pip install playwright && python3 -m playwright install chromium
python3 tests/e2e.py
```

21 项：真实 Chromium 里的新手引导、主题、查词、答题、篇章交卷、导入校验、计时、无 JS 报错。

## 4. 离线与数据完整性（需要 Playwright）

```bash
python3 tests/e2e_ext.py
```

20 项：断网后仍可打开与答题、刷新后进度保持、备份导出/清空/导入/撤销、外部网络请求审计（只允许 GitHub 更新检查）、版本与题库规模、**多题库切换的进度隔离与恢复**。
