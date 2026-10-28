#!/usr/bin/env bash
# scripts/android-native/diagnose.sh <apk-folder> — runs the test build on the
# emulator and prints what happens inside the app (used by android-native.yml
# when started with "diagnose"). Output: $RUNNER_TEMP/diag/*.txt
set -u
OUT="$RUNNER_TEMP/diag"; mkdir -p "$OUT"
APK=$(ls "$1"/*.apk | head -n 1)
adb install -r "$APK" > "$OUT/install.txt" 2>&1
adb shell pm grant com.yojanasahay.app android.permission.POST_NOTIFICATIONS >> "$OUT/install.txt" 2>&1 || true
adb reverse tcp:8000 tcp:8000 >> "$OUT/install.txt" 2>&1 || true
adb logcat -c
adb shell am start -n com.yojanasahay.app/.MainActivity > /dev/null
sleep 30
PID=$(adb shell pidof com.yojanasahay.app | tr -d '\r')
echo "pid=$PID" > "$OUT/pid.txt"
adb forward tcp:9222 "localabstract:webview_devtools_remote_$PID" >> "$OUT/pid.txt" 2>&1
curl -s http://127.0.0.1:9222/json/list >> "$OUT/pid.txt" 2>&1
node "$RUNNER_TEMP/pw/diagnose.mjs" > "$OUT/app.txt" 2>&1
adb exec-out uiautomator dump /dev/tty 2>/dev/null | grep -o 'text="[^"]\{2,\}"' | head -40 > "$OUT/screen.txt"
adb logcat -d 2>/dev/null | grep -iE "Capacitor|chromium:.*(Console|Uncaught)|AndroidRuntime|FATAL|FirebaseAuth|GoogleSignIn|credential|yojana" | grep -v "^$" | tail -n 150 > "$OUT/logcat.txt"
exit 0
