# 语欢 · Yuhuan

一个**离线**的高考英语语法练习 App：14 套历年真题、685 道题、280 条译文、逐题详细解析。
单文件网页实现，可打包成 Android APK；无网络请求、无权限、无账号。

> 名字取自「与语言相欢」。

## 功能

- **14 套真题**（2020 新高考 I/II、2021 新高考 I/II、2022 新高考 I/II、2023 新课标 I/II、2024 新课标 I/II、2025 全国一/二、2026 全国一/二）
- 每套 45 题：完形填空 15 + 语法填空 10 + 阅读 15 + 七选五 5
- **280 条译文**：阅读理解与七选五的原文全文、题干、每个选项都有中文翻译
- **逐题详细解析**：考点 + 原文依据 + 干扰项排除
- 六种练习方式：摸底诊断 / 每日一练 / 弱项组卷 / 模拟考 / 限时阅读 / 按试卷整套练
- 错题本（按年份、题型筛选，答对两次才移出）
- 学习数据：连续天数、最近 7 天正确率、本周报告、真题进度
- 备份 / 恢复：一键复制 JSON，换设备粘贴导入
- 日间 / 夜间主题；系统返回键走页面历史，不会误退出

## 快速开始

直接双击 `index.html`，或用任何静态服务器：

```bash
python3 -m http.server 8080
# 打开 http://127.0.0.1:8080/
```

数据保存在浏览器 localStorage，**不联网、不上传**。

## 打包 Android APK

需要 JDK、Android SDK 的 `aapt`、`zipalign`、`apksigner`，以及 [R8](https://r8.googlesource.com/r8) 提供的 `d8`。

```bash
# 1. 编译入口
javac -source 8 -target 8 -bootclasspath $ANDROID_JAR -d out app/MainActivity.java

# 2. 转 dex
java -cp r8.jar com.android.tools.r8.D8 --min-api 21 --lib $ANDROID_JAR --output dex out/**/*.class

# 3. 打包资源与 dex
aapt package -f -M app/AndroidManifest.xml -S app/res -A assets -I $ANDROID_JAR -F unsigned.apk
(cd dex && aapt add ../unsigned.apk classes.dex)

# 4. 对齐与签名
zipalign -f 4 unsigned.apk aligned.apk
apksigner sign --ks release.keystore --out yuhuan.apk aligned.apk
```

`app/MainActivity.java` 只做三件事：WebView 加载 `assets/index.html`、返回键交给页面历史、把系统 TextToSpeech 暴露给网页（`AndroidNative`）。

## 目录

```
index.html          完整应用（含题库数据）
app/                Android 外壳源码
build/              打包脚本与说明
docs/               图标等素材
```

## 数据与版权

- 题目与原文来自历年高考真题，版权归原命题机构所有，本项目**仅用于学习研究**，如权利人提出异议会立即移除。
- 解析、译文为本项目自行撰写。
- 2020–2021 与 2026 二卷的答案对照官方答案卷；2022 年之后的官方答案未公开，答案为本项目自行解答。

## 许可

代码以 MIT 许可发布；题库内容的使用请遵守上述说明。
