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
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
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

  // ── Launch screen ─────────────────────────────────────────────────────────
  // Android's launch screen (the app icon on navy) stays up until the page has
  // drawn its own launch scene — which starts with the very same icon — and
  // the page tells us so (YSLaunch.ready). Then Android's screen fades away and
  // the page's animation starts at that exact moment, so people see one
  // smooth, continuous animation. (While Android's screen is up the page can't
  // draw, so the animation must not start earlier.) Safety: 6 s at most.
  private volatile boolean launchDone = false;
  volatile boolean quickLaunch = false;
  private boolean webAnimStarted = false;

  void webReady() {
    if (launchDone) return;
    launchDone = true;
    View c = findViewById(android.R.id.content);
    if (c != null) c.invalidate();   // re-check now (Android only re-checks on a redraw)
    // opened without Android's launch screen (e.g. from Share): start right away
    main.postDelayed(this::startWebAnimation, 350);
  }

  private void startWebAnimation() {
    if (webAnimStarted) return;
    webAnimStarted = true;
    WebView wv = getBridge() != null ? getBridge().getWebView() : null;
    if (wv != null) wv.evaluateJavascript("try{window.__hsPlay&&window.__hsPlay()}catch(e){}", null);
  }

  /** Lets the page say "my launch scene is drawn" (index.html). */
  @CapacitorPlugin(name = "YSLaunch")
  public static class LaunchPlugin extends Plugin {
    @PluginMethod
    public void ready(PluginCall call) {
      final android.app.Activity a = getActivity();
      com.getcapacitor.JSObject r = new com.getcapacitor.JSObject();
      if (a instanceof MainActivity) {
        r.put("quick", ((MainActivity) a).quickLaunch);   // opened from a widget / shortcut
        a.runOnUiThread(((MainActivity) a)::webReady);
      }
      call.resolve(r);
    }
  }

  @Override
  public void onCreate(Bundle savedInstanceState) {
    SplashScreen launch = SplashScreen.installSplashScreen(this);
    launch.setKeepOnScreenCondition(() -> !launchDone);
    launch.setOnExitAnimationListener(view -> {
      startWebAnimation();
      view.getView().animate().alpha(0f).setDuration(220).withEndAction(view::remove).start();
    });
    Intent first = getIntent();
    quickLaunch = first != null && first.getData() != null && "yojanasahay".equals(first.getData().getScheme());
    registerPlugin(LaunchPlugin.class);
    registerPlugin(YsWidgets.Bridge.class);
    super.onCreate(savedInstanceState);
    main.postDelayed(() -> { webReady(); main.postDelayed(this::startWebAnimation, 400); }, 6000);
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
        // the app opens it in place (no reload); older app versions: reload at ?go=
        deliver("(function(){if(window.__ysGo)return window.__ysGo('" + key + "');if(document.readyState!=='loading'&&document.getElementById('root')&&document.getElementById('root').childElementCount){location.replace('/?go=" + key + "');return true}return false})()", 0);
        if ("find".equals(key)) showKeyboardWhenReady(0);
      }
    }
    // a scheme from the widget's deadline list
    if (Intent.ACTION_VIEW.equals(action) && data != null && "yojanasahay".equals(data.getScheme()) && "scheme".equals(data.getHost())) {
      String id = data.getLastPathSegment();
      if (id != null && id.matches("[A-Za-z0-9_-]{2,80}")) {
        deliver("(function(){if(window.__ysOpenScheme)return window.__ysOpenScheme('" + id + "');if(document.readyState!=='loading'&&document.getElementById('root')&&document.getElementById('root').childElementCount){location.replace('/?scheme=" + id + "');return true}return false})()", 0);
      }
    }
  }

  /** Search from the widget: once the search box has focus, bring up the keyboard. */
  private void showKeyboardWhenReady(final int attempt) {
    main.postDelayed(() -> {
      final WebView wv = getBridge() != null ? getBridge().getWebView() : null;
      if (wv == null) { if (attempt < 20) showKeyboardWhenReady(attempt + 1); return; }
      wv.evaluateJavascript("(function(){var a=document.activeElement;return !!a&&a.tagName==='INPUT'})()", v -> {
        if ("true".equals(v)) {
          wv.requestFocus();
          android.view.inputmethod.InputMethodManager imm = (android.view.inputmethod.InputMethodManager) getSystemService(INPUT_METHOD_SERVICE);
          if (imm != null) imm.showSoftInput(wv, 0);
        } else if (attempt < 20) showKeyboardWhenReady(attempt + 1);
      });
    }, attempt == 0 ? 600 : 400);
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
