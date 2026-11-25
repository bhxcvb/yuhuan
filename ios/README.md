# iOS 版

## 结论先说

| 方式 | 能不能做 | 说明 |
|---|---|---|
| **PWA（推荐）** | ✅ 现在就能用 | Safari → 添加到主屏幕，全屏、离线 |
| **云端编译 IPA** | ❌ 本仓库做不到 | GitHub 的 macOS 运行器在免费账号上被立即取消（实测「mac-probe」也是 cancelled），需要付费/绑卡 |
| **自己 Mac 编译** | ✅ 有 Mac 就行 | 源码已备好，见下 |
| **第三方 CI 编译** | ✅ 需注册 | Codemagic 免费额度 500 分钟/月，配置见 `codemagic.yaml` |

## 方式一：PWA（不需要 Mac）

iPhone 用 **Safari** 打开 <https://bhxcvb.github.io/yuhuan/web/> → 分享 → **添加到主屏幕**。
全屏运行、断网可用，体验和原生 App 接近。

## 方式二：自己在 Mac 上编译

```bash
brew install xcodegen
cd ios && xcodegen generate
open Yuhuan.xcodeproj
```

把 `web/index.html` 复制到 `ios/Yuhuan/app/index.html`，连真机运行即可。
如果要装到别人手机上，需要 Apple Developer 账号（99 美元/年）或免费账号 7 天重签。

## 方式三：Codemagic 云端编译（用自己的账号）

1. 注册 <https://codemagic.io>（有 GitHub 登录）
2. 添加本仓库，选择 `codemagic.yaml`
3. 触发构建，产出 `yuhuan-unsigned.ipa`

免费额度每月 500 分钟，一次构建约 3–5 分钟。

## 文件

```
project.yml              XcodeGen 工程描述
codemagic.yaml           Codemagic 构建配置
Yuhuan/AppDelegate.swift
Yuhuan/WebViewController.swift   WKWebView 外壳
Yuhuan/Info.plist
Yuhuan/app/              放 index.html（构建时自动复制）
```

## 上架 App Store

需要 Apple Developer Program、隐私政策、截图，以及题库版权授权（真题版权归原命题机构，目前定位「仅供学习研究」）。
