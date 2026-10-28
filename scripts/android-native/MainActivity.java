package com.yojanasahay.app;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import org.json.JSONObject;

/**
 * Yojana Sahay — Android app (Capacitor).
 * Adds two Android integrations on top of Capacitor's standard activity:
 *  • "Share" from WhatsApp/SMS → the shared text goes to the app's
 *    "Is this message real?" check (window.__ysShared, src/native/bridge.js)
 *  • app-icon shortcuts (res/xml/shortcuts.xml) → yojanasahay://go/<key>
 *    opens that part of the app (?go=<key>, handled in App.jsx)
 */
public class MainActivity extends BridgeActivity {
  private final Handler main = new Handler(Looper.getMainLooper());

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    handle(getIntent());
  }

  @Override
  protected void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
    handle(intent);
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
