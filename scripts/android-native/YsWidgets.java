package com.yojanasahay.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.SizeF;
import android.view.View;
import android.widget.RemoteViews;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Yojana Sahay home-screen widgets.
 *  • Quick (4×2, resizable): logo + search bar with 🎤, Eligibility · Money
 *    check · Ask AI; taller → the nearest scheme deadlines; very short → just
 *    the search bar.
 *  • Search (4×1): search bar with 🎤 and Ask AI.
 * Buttons open the app through yojanasahay://go/<key> and
 * yojanasahay://scheme/<id> (MainActivity). The widgets never go online: the
 * app hands them its list of deadlines (YSWidget.update, App.jsx) and the
 * widget works out "days left" itself a few times a day.
 */
public final class YsWidgets {
  private YsWidgets() {}

  static final String PREFS = "ys_widget";

  // ── data the app handed over ────────────────────────────────────────────
  static final class Item { String id, name; int days; }
  static final class Data { String lang = null; boolean mine = false; List<Item> items = new ArrayList<>(); }

  static Data read(Context c) {
    Data d = new Data();
    try {
      String raw = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("data", null);
      if (raw == null) return d;
      JSONObject o = new JSONObject(raw);
      String l = o.optString("lang", "");
      d.lang = "hi".equals(l) ? "hi" : "en".equals(l) ? "en" : null;
      d.mine = o.optBoolean("mine", false);
      JSONArray a = o.optJSONArray("items");
      for (int i = 0; a != null && i < a.length() && d.items.size() < 3; i++) {
        JSONObject x = a.optJSONObject(i);
        if (x == null) continue;
        String id = x.optString("id", "");
        if (!id.matches("[A-Za-z0-9_-]{2,80}")) continue;
        int days = daysLeft(x.optString("date", ""));
        if (days < 0) continue;                       // deadline passed since the app last opened
        Item it = new Item();
        it.id = id;
        it.name = "hi".equals(d.lang) ? x.optString("hi", x.optString("en", "")) : x.optString("en", "");
        it.days = days;
        if (!it.name.isEmpty()) d.items.add(it);
      }
    } catch (Exception ignored) {}
    return d;
  }

  /** whole days from today (India time) to YYYY-MM-DD; -1 if passed or unreadable */
  static int daysLeft(String ymd) {
    try {
      if (!ymd.matches("\\d{4}-\\d{2}-\\d{2}")) return -1;
      Calendar ist = Calendar.getInstance(TimeZone.getTimeZone("Asia/Kolkata"));
      long today = utcDay(ist.get(Calendar.YEAR), ist.get(Calendar.MONTH), ist.get(Calendar.DAY_OF_MONTH));
      long end = utcDay(Integer.parseInt(ymd.substring(0, 4)), Integer.parseInt(ymd.substring(5, 7)) - 1, Integer.parseInt(ymd.substring(8, 10)));
      long d = (end - today) / 86400000L;
      return d < 0 ? -1 : (int) Math.min(d, 999);
    } catch (Exception e) { return -1; }
  }
  private static long utcDay(int y, int m, int d) {
    Calendar u = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
    u.clear(); u.set(y, m, d);
    return u.getTimeInMillis();
  }

  /** the app's language (Hindi / English) — before the app has opened, the phone's */
  static Context lang(Context c, Data d) {
    if (d.lang == null) return c;
    Configuration conf = new Configuration(c.getResources().getConfiguration());
    conf.setLocale(new Locale(d.lang));
    return c.createConfigurationContext(conf);
  }

  // ── taps ──────────────────────────────────────────────────────────────────
  static PendingIntent link(Context c, String uri, int req) {
    Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(uri), c, MainActivity.class);
    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    return PendingIntent.getActivity(c, req, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
  }
  static PendingIntent go(Context c, String key, int req) { return link(c, "yojanasahay://go/" + key, req); }
  static PendingIntent open(Context c, int req) {
    Intent i = new Intent(c, MainActivity.class);
    i.setAction(Intent.ACTION_MAIN);
    i.addCategory(Intent.CATEGORY_LAUNCHER);
    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    return PendingIntent.getActivity(c, req, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
  }

  // ── layouts ───────────────────────────────────────────────────────────────
  static void common(Context c, Context t, RemoteViews v) {
    v.setTextViewText(R.id.ys_w_hint, t.getString(R.string.ys_w_search_hint));
    v.setOnClickPendingIntent(R.id.ys_w_search, go(c, "find", 11));
    v.setOnClickPendingIntent(R.id.ys_w_mic, go(c, "voice", 15));
    v.setOnClickPendingIntent(R.id.ys_w_ai, go(c, "ai", 14));
    v.setContentDescription(R.id.ys_w_mic, t.getString(R.string.ys_w_voice));
    v.setContentDescription(R.id.ys_w_ai, t.getString(R.string.ys_w_ai));
  }

  static RemoteViews searchBar(Context c, Data d) {
    Context t = lang(c, d);
    RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.ys_widget_search);
    common(c, t, v);
    v.setTextViewText(R.id.ys_w_hint, t.getString(R.string.ys_w_search_short));   // fits next to 🎤 and ✨
    return v;
  }

  /** rows: 0 = no deadline list, 2 or 3 = that many deadlines */
  static RemoteViews quick(Context c, Data d, int rows) {
    Context t = lang(c, d);
    RemoteViews v = new RemoteViews(c.getPackageName(), rows > 0 ? R.layout.ys_widget_tall : R.layout.ys_widget_quick);
    common(c, t, v);
    v.setOnClickPendingIntent(R.id.ys_w_logo, open(c, 10));
    v.setContentDescription(R.id.ys_w_logo, t.getString(R.string.ys_w_open));
    v.setOnClickPendingIntent(R.id.ys_w_checker, go(c, "checker", 12));
    v.setOnClickPendingIntent(R.id.ys_w_money, go(c, "money", 13));
    v.setOnClickPendingIntent(R.id.ys_w_ai_chip, go(c, "ai", 16));
    v.setTextViewText(R.id.ys_w_checker_t, t.getString(R.string.ys_w_checker));
    v.setTextViewText(R.id.ys_w_money_t, t.getString(R.string.ys_w_money));
    v.setTextViewText(R.id.ys_w_ai_t, t.getString(R.string.ys_w_ai));
    if (rows <= 0) return v;

    int[] row = { R.id.ys_w_row1, R.id.ys_w_row2, R.id.ys_w_row3 };
    int[] name = { R.id.ys_w_row1_t, R.id.ys_w_row2_t, R.id.ys_w_row3_t };
    int[] days = { R.id.ys_w_row1_d, R.id.ys_w_row2_d, R.id.ys_w_row3_d };
    boolean any = !d.items.isEmpty();
    v.setTextViewText(R.id.ys_w_head, t.getString(d.mine ? R.string.ys_w_head_mine : R.string.ys_w_head_all));
    v.setViewVisibility(R.id.ys_w_head, any ? View.VISIBLE : View.GONE);
    v.setViewVisibility(R.id.ys_w_empty, any ? View.GONE : View.VISIBLE);
    v.setTextViewText(R.id.ys_w_empty, t.getString(R.string.ys_w_empty));
    v.setOnClickPendingIntent(R.id.ys_w_empty, go(c, "checker", 17));
    for (int i = 0; i < 3; i++) {
      if (i < rows && i < d.items.size()) {
        Item it = d.items.get(i);
        v.setViewVisibility(row[i], View.VISIBLE);
        v.setTextViewText(name[i], it.name);
        v.setTextViewText(days[i], it.days == 0 ? t.getString(R.string.ys_w_days_0)
            : it.days == 1 ? t.getString(R.string.ys_w_days_1) : t.getString(R.string.ys_w_days_n, it.days));
        v.setInt(days[i], "setBackgroundResource", it.days <= 7 ? R.drawable.ys_w_days_hot : R.drawable.ys_w_days);
        v.setOnClickPendingIntent(row[i], link(c, "yojanasahay://scheme/" + it.id, 100 + i));
      } else {
        v.setViewVisibility(row[i], View.GONE);
      }
    }
    return v;
  }

  /** the right layout for the widget's size (Android 12+: Android picks as it resizes) */
  static RemoteViews forSize(Context c, AppWidgetManager m, int id, Data d) {
    if (Build.VERSION.SDK_INT >= 31) {
      Map<SizeF, RemoteViews> sizes = new HashMap<>();
      sizes.put(new SizeF(110f, 40f), searchBar(c, d));
      sizes.put(new SizeF(180f, 100f), quick(c, d, 0));
      sizes.put(new SizeF(180f, 165f), quick(c, d, 2));
      sizes.put(new SizeF(180f, 205f), quick(c, d, 3));
      return new RemoteViews(sizes);
    }
    Bundle o = m.getAppWidgetOptions(id);
    int h = o != null ? o.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 110) : 110;
    if (h < 100) return searchBar(c, d);
    if (h < 165) return quick(c, d, 0);
    return quick(c, d, h < 205 ? 2 : 3);
  }

  /** redraw every Yojana Sahay widget (after the app hands over new deadlines) */
  static void refreshAll(Context c) {
    AppWidgetManager m = AppWidgetManager.getInstance(c);
    Data d = read(c);
    for (int id : m.getAppWidgetIds(new ComponentName(c, Quick.class))) m.updateAppWidget(id, forSize(c, m, id, d));
    for (int id : m.getAppWidgetIds(new ComponentName(c, Search.class))) m.updateAppWidget(id, searchBar(c, d));
  }

  public static class Quick extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
      Data d = read(c);
      for (int id : ids) m.updateAppWidget(id, forSize(c, m, id, d));
    }
    @Override
    public void onAppWidgetOptionsChanged(Context c, AppWidgetManager m, int id, Bundle o) {
      m.updateAppWidget(id, forSize(c, m, id, read(c)));
    }
  }

  public static class Search extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
      Data d = read(c);
      for (int id : ids) m.updateAppWidget(id, searchBar(c, d));
    }
  }

  /** The app → widgets: { data: JSON string } (see App.jsx) */
  @CapacitorPlugin(name = "YSWidget")
  public static class Bridge extends Plugin {
    @PluginMethod
    public void update(PluginCall call) {
      String data = call.getString("data", "");
      if (data == null || data.length() > 20000) { call.reject("bad data"); return; }
      try { new JSONObject(data); } catch (Exception e) { call.reject("bad data"); return; }
      Context c = getContext();
      SharedPreferences.Editor e = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit();
      e.putString("data", data).apply();
      try { refreshAll(c); } catch (Exception ignored) {}
      call.resolve();
    }
  }
}
