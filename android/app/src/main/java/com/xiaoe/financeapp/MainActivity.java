package com.xiaoe.financeapp;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.os.*;
import android.webkit.*;
import java.util.concurrent.atomic.AtomicInteger;

public class MainActivity extends Activity {
    private static final String CHANNEL_ID = "finance_demo_messages";
    private final AtomicInteger notificationId = new AtomicInteger(100);
    private WebView webView;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannel();
        webView = new WebView(this);
        webView.setBackgroundColor(0xFFF4F7FB);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setBuiltInZoomControls(false);
        webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("file:///android_asset/index.html");
        setContentView(webView);
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 42);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "金融实时消息", NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription("金脉金融私域 Demo 的本地测试推送");
            getSystemService(NotificationManager.class).createNotificationChannel(channel);
        }
    }

    private void showNotification(String title, String content) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pending = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? new Notification.Builder(this, CHANNEL_ID) : new Notification.Builder(this);
        builder.setSmallIcon(android.R.drawable.ic_dialog_info).setContentTitle(title).setContentText(content)
                .setStyle(new Notification.BigTextStyle().bigText(content)).setAutoCancel(true).setContentIntent(pending);
        getSystemService(NotificationManager.class).notify(notificationId.incrementAndGet(), builder.build());
    }

    public class AndroidBridge {
        @JavascriptInterface public void notify(String title, String content) {
            runOnUiThread(() -> showNotification(title, content));
        }
    }
}
