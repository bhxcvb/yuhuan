# 架构说明

## 为什么是单文件

`web/index.html` 包含界面、逻辑、题库、词典，双击即可离线运行，也方便塞进 WebView。

**这是有意的取舍**：部署成本为零、离线天然可用、不存在跨域和资源路径问题。代价是产物体积大（约 6 MB）且直接编辑困难，所以采用**构建期分离、运行期合并**：

```
src/app-template.html   界面 + 逻辑（带占位符 __QS__ / __TR__ / __DICT__ 等）
tools/build-app.js      注入数据 → 生成 web/index.html，并同步桌面端副本
web/index.html          构建产物（仓库提交，GitHub Pages 直接可用）
```

改界面/逻辑只动 `src/app-template.html`，然后：

```bash
node tools/build-app.js          # 重新生成产物
node tools/build-app.js --check  # 校验产物是否与模板同步（CI 会跑）
```

**不要直接编辑 `web/index.html`**：它是产物，下次构建会被覆盖。

## 数据从哪来

题库与词典数据（`build-data.json` / `build-dict.json`，约 6 MB）不在仓库里，属于发布数据。构建脚本默认从已提交的 `web/index.html` 中还原全部数据再注入模板，因此**只改代码时仓库自给自足、可复现构建**。

题库/词典需要更新时，用外部数据文件重新注入：

```bash
node tools/build-app.js --data /path/build-data.json --dict /path/build-dict.json
```

## 模块划分（app-template.html 内部）

| 区域 | 职责 |
|---|---|
| `initStore` / `normalizeStore` / `loadStore` / `save` | 状态持久化；数据规范化兼容旧版本；损坏数据留存 + IndexedDB 恢复 |
| `autoBackup` / `idb*` / `restoreFrom` | 导入/清空前备份、自动快照（带时间戳）、统一恢复入口 |
| `schedule` / `intDays` / `easeFactor` | 动态间隔复习（箱位 + 正确率 + 遗忘次数 + 错因） |
| `pointStats` / `pointMastery` / `weakList` | 真实正确率、知识点掌握度、薄弱点排序 |
| `recommendList` / `startToday` / `weakPoints` | 智能推荐练习（到期 → 薄弱 → 新题） |
| `sessions`（`startPoint` / `startExam` / `startBlock` …） | 各种练习入口 |
| `render()` + `phase` | 单页路由，页面由 phase 决定（历史包袱：单函数较大，按页面块划分） |
| `DICT` / `revIndex` / `suggestWords` | 查词（英文前缀 → 中文反查） |
| `KB` / `POINTS` | 51 个语法知识点、定义与易混点 |
| `openWordSheet` / `pronounce` | 长按取词、单词朗读 |
| `wrongCategory` / `report` | 错题智能分类、周报/月报 |
| `logError` / `checkUpdate` | 错误日志、版本检查 |

## 数据流

```
web/index.html ──(extract)──┐
src/app-template.html ──────┼→ tools/build-app.js → web/index.html → APK / iOS / PWA
build-data.json + dict ─────┘        └→ desktop/app/index.html
```

## 平台外壳

- Android：`app/MainActivity.java`（WebView + TTS 朗读桥），`build/build-apk.sh` 打包 `web/index.html`
- iOS：`ios/Yuhuan/WebViewController.swift`（WKWebView 本地加载）
- 桌面：Electron `desktop/main.js`，加载构建同步的 `desktop/app/index.html`（产物不入库）
- Web/PWA：`web/sw.js` 离线缓存；导航请求 network-first，更新能生效

## 已知取舍

- 单文件体积约 6 MB，首次加载约 0.3–0.8 s；词典已懒加载
- 没有后端，反馈走「复制内容 / GitHub Issue」
- 无账号体系，数据只在本机，跨设备靠备份文件/JSON 手动迁移
- `render()` 仍是单个大函数；后续新增页面建议按 `phase` 拆成独立渲染函数，避免继续膨胀
