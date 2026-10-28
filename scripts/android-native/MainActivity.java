package com.yojanasahay.app;

import android.content.Intent;
import android.graphics.Color;
import android.view.View;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import org.json.JSONObject;

/**
 * Yojana Sahay — Android app (Capacitor).
 * Adds two Android integrations on top of Capacitor's standard activity:
 *  • "Share" from WhatsApp/SMS → the shared text goes to the app's
 *    "Is this message real?" check (window.__ysShared, src/native/bridge.js)
 *  • app-icon shortcuts (res/xml/shortcuts.xml) → yojanasahay://go/<key>
 *    opens that part of the app (?go=<key>, handled in App.jsx)
 * and keeps the app inside the screen's safe area on every Android version
 * (Android 15 draws apps behind the status/navigation bars and the keyboard).
 */
public class MainActivity extends BridgeActivity {
  private final Handler main = new Handler(Looper.getMainLooper());

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    fitToScreen();
    handle(getIntent());
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
    handle(intent);
  }

  /**
   * Same layout on Android 7 → 15: the app sits below the status bar, above the
   * navigation bar / gesture area and above the keyboard while typing; the bars
   * themselves show the app's navy with white icons.
   */
  private void fitToScreen() {
    final int navy = Color.parseColor("#003580");
    WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
    getWindow().getDecorView().setBackgroundColor(navy);
    getWindow().setStatusBarColor(Color.TRANSPARENT);
    getWindow().setNavigationBarColor(Color.TRANSPARENT);
    WindowInsetsControllerCompat bars = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
    bars.setAppearanceLightStatusBars(false);
    bars.setAppearanceLightNavigationBars(false);
    View content = findViewById(android.R.id.content);
    if (content == null) return;
    ViewCompat.setOnApplyWindowInsetsListener(content, (v, insets) -> {
      Insets sys = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
      Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
      v.setPadding(sys.left, sys.top, sys.right, Math.max(sys.bottom, ime.bottom));
      return WindowInsetsCompat.CONSUMED;
    });
    ViewCompat.requestApplyInsets(content);
  }

  private void handle(Intent intent) {
    if (intent == null) return;
    String action = intent.getAction();
    if (Intent.ACTION_SEND.equals(action) && "text/plain".equals(intent.getType())) {
      String subject = intent.getStringExtra(Intent.EXTRA_SUBJECT);
      String text = intent.getStringExtra(Intent.EXTRA_TEXT);
      String all = ((subject != null ? subject + "\n" : "") + (text != null ? text : "")).trim();
      if (all.length() > 2000) all = all.substring(0, 2000);
      if (!all.isEmpty()) {
        String q = JSONObject.quote(all);
        deliver("(function(){if(window.__ysShared&&!window.__ysSharedTaken){window.__ysSharedTaken=1;window.__ysShared(" + q + ");setTimeout(function(){window.__ysSharedTaken=0},1500);return true}return false})()", 0);
      }
      return;
    }
    Uri data = intent.getData();
    if (Intent.ACTION_VIEW.equals(action) && data != null && "yojanasahay".equals(data.getScheme()) && "go".equals(data.getHost())) {
      String key = data.getLastPathSegment();
      if (key != null && key.matches("[a-z]{2,20}")) {
        deliver("(function(){if(document.readyState!=='loading'&&document.getElementById('root')&&document.getElementById('root').childElementCount){location.replace('/?go=" + key + "');return true}return false})()", 0);
      }
    }
  }

  /** Runs the script once the app's page is ready (retries for ~12 s). */
  private void deliver(final String js, final int attempt) {
    main.postDelayed(new Runnable() {
      @Override public void run() {
        WebView wv = getBridge() != null ? getBridge().getWebView() : null;
        if (wv == null) { if (attempt < 30) deliver(js, attempt + 1); return; }
        wv.evaluateJavascript(js, value -> { if (!"true".equals(value) && attempt < 30) deliver(js, attempt + 1); });
      }
    }, attempt == 0 ? 500 : 400);
  }
}
