// scripts/android-native/patch-google-signin.mjs
// Google account chooser dialog ("Choose an account · to continue to Yojana
// Sahay", with "Add another account") — the app asks for it with
// signInWithGoogle({ useCredentialManager: false }).
// That Google Sign-In client remembers the last account and skips the chooser
// next time, so people could not switch accounts after signing out. This adds
// a local sign-out of that client right before the chooser opens, so it is
// shown every time. Runs on the installed plugin before the Android build.
import fs from "node:fs";

const file = "node_modules/@capacitor-firebase/authentication/android/src/main/java/io/capawesome/capacitorjs/plugins/firebase/authentication/handlers/GoogleAuthProviderHandler.java";
const MARK = "/* ys: always show the account chooser */";
let src = fs.readFileSync(file, "utf8");
if (src.includes(MARK)) { console.log("Google sign-in patch already applied"); process.exit(0); }
const find = "Intent signInIntent = mGoogleSignInClient.getSignInIntent();";
if (!src.includes(find)) {
  console.log(`::error title=Google sign-in patch::"${find}" not found in ${file} (plugin changed?)`);
  process.exit(1);
}
src = src.replace(find,
  `${MARK} try { com.google.android.gms.tasks.Tasks.await(mGoogleSignInClient.signOut(), 3, java.util.concurrent.TimeUnit.SECONDS); } ` +
  `catch (Throwable ysE) { try { mGoogleSignInClient.signOut(); } catch (Throwable ignored) {} }\n            ${find}`);
fs.writeFileSync(file, src);
console.log("::notice title=Google sign-in::account chooser dialog shown on every sign-in");
