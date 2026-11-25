# 安装教程

> **先看这里**：iPhone / iPad 用户直接用 **PWA**（见第二节），不需要找 .ipa —— iOS 原生包需要 Mac + 开发者账号编译，本项目不提供现成 ipa。

按你的设备选一种，全部**免费、无需注册账号**。

---

## 一、Android（推荐 APK）

1. 手机浏览器打开 [Releases 页面](https://github.com/bhxcvb/yuhuan/releases)
2. 在 [Releases](https://github.com/bhxcvb/yuhuan/releases/latest) 下载最新的 `yuhuan-v*.apk`（约 1.9 MB）
3. 点开安装包，首次会提示「未知来源」→ 允许来自此来源
4. 安装完成，桌面出现「语欢」图标

> 覆盖安装不会丢进度（包名与签名固定）。

---

## 二、iPhone / iPad（PWA，免安装）

1. 用 **Safari** 打开 <https://bhxcvb.github.io/yuhuan/web/>
2. 点底部分享按钮（□↑）
3. 选择「**添加到主屏幕**」
4. 命名为「语欢」→ 添加

打开后全屏运行，断网可用。**注意要用 Safari**，微信内打开无法添加到主屏幕。

---

## 三、Windows

### 方式 A：PWA（推荐，几秒完成）

1. 用 **Edge** 或 **Chrome** 打开 <https://bhxcvb.github.io/yuhuan/web/>
2. 地址栏右侧出现「安装」图标（或菜单 → 应用 → 安装此站点）
3. 确认安装，开始菜单会出现「语欢」

### 方式 B：免安装包（100 MB，自带浏览器）

1. 在 [Releases](https://github.com/bhxcvb/yuhuan/releases/latest) 下载 `yuhuan-windows-x64.zip`
2. 解压到任意目录（例如 `D:\语欢`）
3. 双击 `语欢.exe`

自带 Chromium，**不需要 Edge 或 Chrome**；不写注册表，删掉文件夹即卸载。
首次运行若提示「已保护你的电脑」→ 更多信息 → 仍要运行（无签名证书所致，源码公开可审查）。

按 `desktop/README.md` 用 Electron 打包，产物双击即用、不依赖 Edge。
代价是自带 Chromium，体积大两个数量级，所以**没有放进 Release**。

## 四、macOS

用 Chrome 或 Edge 打开网页版 → 地址栏「安装」。
（原生版需要在 Mac 上用 Xcode 编译，见 `ios/README.md`）

---

## 五、数据迁移

换设备时：

1. 旧设备：我的 → 备份 / 恢复 → 复制全部
2. 新设备：我的 → 备份 / 恢复 → 粘贴 → 导入

进度、错题、生词、成就都会带过去。

---

## 六、常见问题

**Q：需要联网吗？**
做题完全不需要；只有「检查更新」会访问 GitHub（可在设置里关闭）。

**Q：答题记录存在哪？**
存在设备本地（localStorage），不上传任何服务器。

**Q：手机上字太小？**
系统字号不影响应用内字号；后续版本会加字号设置。

**Q：为什么阅读题要整篇交卷才对答案？**
避免做完第一题就看到全文译文，影响后面几题的判断。
