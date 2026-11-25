#!/usr/bin/env bash
# 打包 语欢 为 Android APK
# 依赖：JDK17+、aapt、zipalign、apksigner、R8(d8)、Android platform jar
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AJ="${ANDROID_JAR:-/usr/lib/android-sdk/platforms/android-23/android.jar}"
R8="${R8_JAR:-/usr/share/r8/r8.jar}"
KS="${KS:-$ROOT/build/release.keystore}"
KS_PASS="${KS_PASS:-changeit}"

cd "$ROOT"
rm -rf out dex; mkdir -p out dex
javac -source 8 -target 8 -bootclasspath "$AJ" -d out app/MainActivity.java
java -cp "$R8" com.android.tools.r8.D8 --min-api 21 --lib "$AJ" --output dex out/com/dsh/grammar/*.class

mkdir -p apk/assets
cp web/index.html apk/assets/index.html
cp reward.webp apk/assets/reward.webp
aapt package -f -M app/AndroidManifest.xml -S app/res -A apk/assets -I "$AJ" -F apk/unsigned.apk
(cd dex && aapt add ../apk/unsigned.apk classes.dex)
zipalign -f 4 apk/unsigned.apk apk/aligned.apk

[ -f "$KS" ] || keytool -genkeypair -keystore "$KS" -alias yuhuan -keyalg RSA -keysize 2048 \
  -validity 10000 -storepass "$KS_PASS" -keypass "$KS_PASS" -dname "CN=Yuhuan, C=CN"

apksigner sign --ks "$KS" --ks-pass "pass:$KS_PASS" --key-pass "pass:$KS_PASS" --out apk/yuhuan.apk apk/aligned.apk
apksigner verify apk/yuhuan.apk && echo "OK: apk/yuhuan.apk"
