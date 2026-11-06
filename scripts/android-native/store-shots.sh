#!/usr/bin/env bash
# scripts/android-native/store-shots.sh <apk-folder> — installs the app on the
# emulator and takes app-store screenshots (used by android-native.yml when
# started with "store_screenshots"). Output: $RUNNER_TEMP/shots/*.png
set -u
OUT="$RUNNER_TEMP/shots"; mkdir -p "$OUT"
APK=$(ls "$1"/*.apk | head -n 1)
adb install -r "$APK" > "$OUT/install.txt" 2>&1
adb shell pm grant com.yojanasahay.app android.permission.POST_NOTIFICATIONS >> "$OUT/install.txt" 2>&1 || true
# clean status bar: 10:00, full battery and signal, no notification icons
adb shell settings put global sysui_demo_allowed 1
adb shell am broadcast -a com.android.systemui.demo -e command enter > /dev/null
adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 1000 > /dev/null
adb shell am broadcast -a com.android.systemui.demo -e command battery -e level 100 -e plugged false > /dev/null
adb shell am broadcast -a com.android.systemui.demo -e command network -e mobile show -e level 4 -e datatype 4g > /dev/null
adb shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4 > /dev/null
adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false > /dev/null
adb shell am start -n com.yojanasahay.app/.MainActivity > /dev/null
sleep 25
PID=$(adb shell pidof com.yojanasahay.app | tr -d '\r')
adb forward tcp:9222 "localabstract:webview_devtools_remote_$PID" > /dev/null 2>&1
node "$RUNNER_TEMP/pw/store-shots.mjs" > "$OUT/log.txt" 2>&1
cat "$OUT/log.txt"
exit 0
