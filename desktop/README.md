# Windows / macOS 桌面版（Electron）

## 直接运行

```bash
node tools/build-app.js   # 先生成 desktop/app/index.html（构建产物不入库）
cd desktop
npm install
npm start
```

## 打包 Windows 免安装版

```bash
npx electron-packager . 语欢 --platform=win32 --arch=x64 --out=dist \
  --overwrite --electron-version=33.4.11
```

产物在 `dist/语欢-win32-x64/`，双击 `语欢.exe` 即可运行（无需安装）。
同理把 `--platform=win32` 换成 `darwin` 可打 macOS 版（需在 macOS 上执行）。

## 体积说明

Electron 自带 Chromium，单个平台约 270 MB（压缩后 ~110 MB）。
如果只想要轻量方案，用 Edge / Chrome 打开 <https://bhxcvb.github.io/yuhuan/web/> 后点地址栏的「安装」，
会生成一个几 KB 的 PWA 窗口应用，功能和 Electron 版一致，体积小两个数量级。
