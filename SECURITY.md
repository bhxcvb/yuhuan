# 安全说明

## 受支持版本

只维护最新 Release。旧版本请升级后再报问题。

## 应用权限

Android 版只申请 **网络访问**（仅用于「检查更新」）与 **TTS**（朗读，可选）。
不申请存储、位置、通讯录、相机、麦克风权限。

## 数据与隐私

- 所有学习记录存在设备本地（localStorage + IndexedDB 自动备份）
- 不上传任何数据，没有账号，没有埋点
- 唯一的网络请求：`api.github.com` 查询最新版本号，可在设置里关闭
- 清除浏览器数据或卸载应用会丢进度，请用「我的 → 备份/恢复」导出 JSON

## 报告安全漏洞

**请优先用 GitHub 私密漏洞报告**（不会公开可见）：

👉 https://github.com/bhxcvb/yuhuan/security/advisories/new

如果私密报告入口不可用，可以发 Issue，但**只写「有安全问题，求联系方式」，不要贴细节**。

报告时请附上：版本号、平台（Android / iOS PWA / Windows）、复现步骤。
我会在 7 天内回复。

## 不在范围内

- 需要物理接触设备才能利用的问题
- 第三方依赖（GitHub Pages、GitHub Actions）自身的漏洞，请直接报给上游
