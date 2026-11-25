# 架构说明

## 为什么是单文件

`web/index.html`（约 5.5 MB）包含界面、逻辑、题库、词典，双击即可离线运行，也方便塞进 WebView。

**这是有意的取舍**：部署成本为零、离线天然可用、不存在跨域和资源路径问题。代价是维护成本随功能增长而上升。当前的处理方式是**构建期分离、运行期合并**：

```
app-template.html     界面 + 逻辑（带占位符 __QS__ / __TR__ / __DICT__ 等）
build-data.json       题库：QS 题目 / TR 译文 / NOS 题号 / KB 知识点 / WRITING 范文
build-dict.json       词典：27,970 条，含音标、释义、例句、近义词
build_release.sh      注入数据 → 产出 web/index.html → 打包 APK
```

改代码只动 `app-template.html`，改数据只动 json，二者互不影响；`build_release.sh` 是唯一的版本号来源。

## 模块划分（app-template.html 内部）

| 区域 | 职责 |
|---|---|
| `STATE` / `load` / `save` | 状态、localStorage 持久化、IndexedDB 自动备份 |
| `SRS` / `intDays` | 间隔复习（箱 0–6，按复习强度缩放） |
| `sessions`（`startPoint` / `startExam` / `startBlock` / `today`） | 各种练习入口 |
| `render()` + `phase` | 单页路由，页面由 phase 决定 |
| `DICT` / `revIndex` / `suggestWords` | 查词（英文前缀 → 中文反查） |
| `KB` / `POINTS` | 51 个语法知识点、定义与易混点 |
| `openWordSheet` | 长按取词卡片 |
| `logError` / `checkUpdate` | 错误日志、版本检查 |

## 数据流

```
build-data.json ─┐
build-dict.json ─┼→ build_release.sh → web/index.html → APK(assets/index.html)
app-template.html┘
```

## 已知取舍

- 单文件体积随词典增长（当前 5.5 MB），首次加载约 0.3–0.8 s
- 没有后端，所以反馈走「复制内容 / GitHub Issue」
- 无账号体系，数据只在本机，跨设备靠手动备份恢复
