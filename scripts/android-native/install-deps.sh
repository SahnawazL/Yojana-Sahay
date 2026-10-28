#!/usr/bin/env bash
# scripts/android-native/install-deps.sh — the Android app's Capacitor packages.
# Used by BOTH .github/workflows/android-native.yml (the APK) and
# .github/workflows/app-live-update.yml (live updates), so the app files are
# always built against the same plugins that are inside the installed app.
#
# Adding or removing a plugin here changes the Android side: bump
# scripts/android-native/native-api.txt, so already-installed apps (which don't
# have the new plugin) never receive app files that need it.
#
# --save adds them to package.json on the build machine only (never committed):
# Capacitor wires an Android plugin into the app ONLY if package.json lists it.
set -euo pipefail
npm install --save --no-audit --no-fund --loglevel=error \
  @capacitor/core@7 @capacitor/cli@7 @capacitor/android@7 \
  @capacitor/app@7 @capacitor/share@7 @capacitor/browser@7 \
  @capacitor/splash-screen@7 @capacitor/status-bar@7 \
  @capacitor/filesystem@7 @capacitor-community/text-to-speech@6 \
  @capacitor-community/speech-recognition@7 \
  @capacitor-firebase/authentication@7 @capacitor-firebase/messaging@7 \
  @capgo/capacitor-updater@7 sharp@0.33.5
