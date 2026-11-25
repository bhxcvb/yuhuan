# 参与贡献

感谢你愿意帮语欢变得更好。下面是几个常见的贡献方式。

## 构建与自测

```bash
# 改 src/app-template.html 后重新生成产物
node tools/build-app.js
node tools/build-app.js --check   # 应输出「构建一致」

node tools/extract-data.js /tmp/data.json && node tools/validate-data.js /tmp/data.json
node tests/basic.test.js
```

不要直接编辑 `web/index.html`（产物，会被构建覆盖）。

## 报告问题

到 [Issues](https://github.com/bhxcvb/yuhuan/issues/new/choose) 选择模板：

- **题目错误**：请写清来源（年份 / 卷别 / 题号），例如「2023·新课标I卷 第 24 题」
- **功能异常**：说明操作步骤、使用方式（APK / 网页 / 本地 HTML）和版本号

## 提交改动

1. Fork 本仓库并新建分支：`git checkout -b fix/xxx`
2. 修改 `web/index.html`（应用本体）或文档
3. 本地验证：`python3 -m http.server 8080` 打开 `web/`
4. 提交 PR，说明改动内容和验证方式

CI 会自动跑两步校验：脚本语法（`node --check`）和题库结构（每题选项数、答案下标）。PR 变绿再合并。

## 题库格式

```js
QS[i] = [分类, 题干, [选项...], 正确答案下标, 解析, 来源?, 原文?, 知识点?]
```

- 分类用现有 13 类之一（见 `web/index.html` 里的 `MODULES` / `真题·xxx`）
- 题干里的空位统一用 6 个下划线 `______`
- 解析写「考点 + 依据 + 干扰项排除」，60–110 字
- 如果配译文，同时补 `TR[i] = { q, o }`

## 代码风格

- 单文件、无构建步骤、无外部依赖
- 不引入网络请求（离线是核心卖点）
- 新增 UI 时同时适配日间 / 夜间和 6 种主题色
