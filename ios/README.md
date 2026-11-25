# iOS 版（需要 macOS + Xcode 编译）

这个目录是 iOS 外壳工程的源码。**我没法在 Android 环境里编译 IPA**，所以这里给的是 Xcode 可用的最小工程，你在 Mac 上打开即可编译运行。

## 方式一：PWA（不需要 Mac，立刻可用）

用 iPhone 的 Safari 打开 <https://bhxcvb.github.io/yuhuan/web/>，点「分享 → 添加到主屏幕」。
安装后全屏运行、断网可用，和原生 App 体验接近。

## 方式二：Xcode 工程（需要 Mac）

1. Mac 上安装 Xcode（App Store）
2. Xcode → File → New → Project → iOS App，名字填 `Yuhuan`，Interface 选 Storyboard
3. 把本目录的 `WebViewController.swift` 拖进工程
4. 把 `app/index.html`（构建产物，见下）拖进工程，勾选 Target Membership
5. 在 `Info.plist` 里把 App 名称设为「语欢」
6. 连上 iPhone 或用模拟器运行

## 生成 app/index.html

在仓库根目录执行：

```bash
./build_release.sh 6.9
cp 语法5.html ios/Yuhuan/app/index.html
```

## 上架 App Store 的前置条件

- Apple Developer Program（99 美元/年）
- App Store 截图、隐私政策页面
- 题库版权授权（真题版权归原命题机构，目前仅「仅供学习研究」）
