package com.yojanasahay.app;

import android.content.Intent;
import android.graphics.Color;
import android.view.View;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import org.json.JSONObject;

/**
 * Yojana Sahay — Android app (Capacitor).
 * Adds two Android integrations on top of Capacitor's standard activity:
 *  • "Share" from WhatsApp/SMS → the shared text goes to the app's
 *    "Is this message real?" check (window.__ysShared, src/native/bridge.js)
 *  • app-icon shortcuts (res/xml/shortcuts.xml) → yojanasahay://go/<key>
 *    opens that part of the app (?go=<key>, handled in App.jsx)
 * opens the website's own pages (scheme pages, About, Contact…) in an in-app
 * browser tab — they live on the website, not inside the app —
 * and keeps the app inside the screen's safe area on every Android version
 * (Android 15 draws apps behind the status/navigation bars and the keyboard).
 */
public class MainActivity extends BridgeActivity {
  private final Handler main = new Handler(Looper.getMainLooper());

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    fitToScreen();
    keepWebsitePagesOnWebsite();
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

  private static final String SITE = "https://yojanasahay.vercel.app";

  /** Pages that are part of the app itself (everything else is on the website). */
  private static boolean insideApp(String p) {
    if (p == null || p.isEmpty() || p.equals("/") || p.equals("/index.html")) return true;
    return p.startsWith("/embed") || p.startsWith("/assets/") || p.startsWith("/icons/"); // /admin → website
  }

  private void keepWebsitePagesOnWebsite() {
    if (getBridge() == null) return;
    getBridge().setWebViewClient(new BridgeWebViewClient(getBridge()) {
      @Override
      public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        Uri u = request.getUrl();
        if (request.isForMainFrame() && u != null && "localhost".equals(u.getHost()) && !insideApp(u.getPath())) {
          String web = SITE + u.getEncodedPath()
              + (u.getEncodedQuery() != null ? "?" + u.getEncodedQuery() : "")
              + (u.getEncodedFragment() != null ? "#" + u.getEncodedFragment() : "");
          openOnWebsite(view, web);
          return true;
        }
        return super.shouldOverrideUrlLoading(view, request);
      }
    });
  }

  /** In-app browser tab (via the app's own Browser plugin); Chrome as a fallback. */
  private void openOnWebsite(WebView view, final String url) {
    String js = "(function(){try{if(window.ysNative&&window.ysNative.openUrl){window.ysNative.openUrl(" + JSONObject.quote(url) + ");return true}}catch(e){}return false})()";
    view.evaluateJavascript(js, value -> {
      if (!"true".equals(value)) {
        try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception ignored) {}
      }
    });
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
