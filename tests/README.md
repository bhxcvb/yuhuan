# 测试

两个文件，CI 每次 push 自动运行。

## 基础回归（无依赖）

```bash
node tests/basic.test.js
```

覆盖：题库结构与数量、解析/译文完整性、所有练习入口的出题规则（阅读不进单题流程）、页面渲染、答题流程、错因标记、间隔复习调度、篇章模式、计时、词典与生词本、主题持久化、导入校验等，共 86 项断言。

## 端到端（需要 Playwright）

```bash
pip install playwright && python3 -m playwright install chromium
python3 tests/e2e.py
```

在真实 Chromium 里跑：新手引导、主题持久化、查词联想、答题与错因、篇章交卷拦截、导入校验、计时、各页面无 JS 报错。

## 约定

- 改动 `web/index.html` 后先跑 `node tests/basic.test.js`
- 新增功能请在 `basic.test.js` 里补断言
- CI 红灯不要合并
