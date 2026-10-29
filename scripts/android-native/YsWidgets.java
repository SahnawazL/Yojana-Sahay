package com.yojanasahay.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;

/**
 * Yojana Sahay home-screen widgets. Each button opens that part of the app
 * through the same yojanasahay://go/<key> links as the app-icon shortcuts.
 * No data, no background work, no battery use.
 */
public final class YsWidgets {
  private YsWidgets() {}

  static PendingIntent go(Context c, String key, int req) {
    Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse("yojanasahay://go/" + key), c, MainActivity.class);
    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    return PendingIntent.getActivity(c, req, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
  }

  static PendingIntent open(Context c, int req) {
    Intent i = new Intent(c, MainActivity.class);
    i.setAction(Intent.ACTION_MAIN);
    i.addCategory(Intent.CATEGORY_LAUNCHER);
    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    return PendingIntent.getActivity(c, req, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
  }

  /** 4×2: logo + search bar, then Eligibility · Money check · Ask AI */
  public static class Quick extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
      RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.ys_widget_quick);
      v.setOnClickPendingIntent(R.id.ys_w_logo, open(c, 10));
      v.setOnClickPendingIntent(R.id.ys_w_search, go(c, "search", 11));
      v.setOnClickPendingIntent(R.id.ys_w_checker, go(c, "checker", 12));
      v.setOnClickPendingIntent(R.id.ys_w_money, go(c, "money", 13));
      v.setOnClickPendingIntent(R.id.ys_w_ai, go(c, "ai", 14));
      for (int id : ids) m.updateAppWidget(id, v);
    }
  }

  /** 4×1: search bar */
  public static class Search extends AppWidgetProvider {
    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
      RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.ys_widget_search);
      v.setOnClickPendingIntent(R.id.ys_w_search, go(c, "search", 21));
      v.setOnClickPendingIntent(R.id.ys_w_ai, go(c, "ai", 22));
      for (int id : ids) m.updateAppWidget(id, v);
    }
  }
}
