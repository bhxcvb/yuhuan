# iOS 版

## 最省事：PWA（不需要 Mac，现在就能用）

iPhone 用 **Safari** 打开 <https://bhxcvb.github.io/yuhuan/web/> → 分享 → **添加到主屏幕**。
全屏运行、断网可用，和原生 App 体验基本一致。

## 想要真 App：用 GitHub Actions 云端编译（不需要自己有 Mac）

仓库里有 [`.github/workflows/ios.yml`](../.github/workflows/ios.yml)，会在一台 macOS 机器上：

1. 用 XcodeGen 生成工程
2. `xcodebuild` 编译（**不签名**）
3. 打包成 `yuhuan-unsigned.ipa` 作为 Artifact

### 怎么拿到 IPA

1. 打开仓库 → **Actions** → 左侧「iOS 打包」→ 右侧 **Run workflow**
2. 等 3–5 分钟，进这次运行页面，底部 **Artifacts** 下载 `yuhuan-unsigned-ipa`
3. 解压得到 `yuhuan-unsigned.ipa`

### 怎么装到 iPhone（任选其一）

| 工具 | 需要什么 | 有效期 |
|---|---|---|
| **Sideloadly**（Windows/Mac） | 电脑 + Apple ID（免费） | 7 天，到期重签 |
| **AltStore**（Windows/Mac） | 电脑常开 AltServer + Apple ID | 7 天自动续签 |
| **Apple Developer 账号**（99 美元/年） | 开发者证书 | 1 年，可上 TestFlight |

> 未签名 IPA 不能直接双击安装，必须借助上面的侧载工具用自己的 Apple ID 重签。

## 上架 App Store 的前置条件

- Apple Developer Program（99 美元/年）
- 隐私政策页面、App Store 截图与描述
- 题库版权授权（真题版权归原命题机构，目前定位「仅供学习研究」）

## 本地开发（有 Mac 的话）

```bash
brew install xcodegen
cd ios && xcodegen generate
open Yuhuan.xcodeproj
```

把 `web/index.html` 复制到 `ios/Yuhuan/app/index.html` 后即可真机调试。
