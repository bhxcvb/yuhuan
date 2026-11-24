package com.dsh.grammar;

import android.app.Activity;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;

public class MainActivity extends Activity implements TextToSpeech.OnInitListener {
    private WebView w;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private int initStatus = -1;
    private int langStatus = -99;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        try {
            tts = new TextToSpeech(this, this);
        } catch (Throwable t) {
            tts = null;
        }
        w = new WebView(this);
        WebSettings s = w.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        w.addJavascriptInterface(new Bridge(), "AndroidNative");
        w.setWebViewClient(new WebViewClient());
        w.loadUrl("file:///android_asset/index.html");
        setContentView(w);
    }

    @Override
    public void onInit(int status) {
        initStatus = status;
        if (status != TextToSpeech.SUCCESS || tts == null) {
            ttsReady = false;
            return;
        }
        // 语言数据缺失时也允许朗读：很多引擎能用默认声音读英文
        try {
            langStatus = tts.setLanguage(Locale.US);
        } catch (Throwable t) {
            langStatus = -98;
        }
        try {
            tts.setSpeechRate(0.9f);
            tts.setPitch(1.0f);
        } catch (Throwable ignored) {
        }
        ttsReady = true;
    }

    public class Bridge {
        @JavascriptInterface
        public boolean available() {
            return tts != null && ttsReady;
        }

        /** 诊断信息：0=正常；1=初始化失败；2=语言数据缺失 */
        @JavascriptInterface
        public int status() {
            if (tts == null) return 1;
            if (!ttsReady) return 1;
            if (langStatus == TextToSpeech.LANG_MISSING_DATA || langStatus == TextToSpeech.LANG_NOT_SUPPORTED) return 2;
            return 0;
        }

        @JavascriptInterface
        public void speak(String text) {
            if (tts == null || !ttsReady || text == null || text.trim().isEmpty()) return;
            try {
                tts.stop();
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "dsh-utterance");
            } catch (Throwable ignored) {
            }
        }

        @JavascriptInterface
        public void stop() {
            try {
                if (tts != null) tts.stop();
            } catch (Throwable ignored) {
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (w != null && w.canGoBack()) w.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        try {
            if (tts != null) { tts.stop(); tts.shutdown(); }
        } catch (Throwable ignored) {
        }
        tts = null;
        if (w != null) { w.destroy(); w = null; }
        super.onDestroy();
    }
}
