package com.vietbridge.ai.util

import android.content.Context
import android.speech.tts.TextToSpeech
import java.util.Locale

object TTSHelper {
    private var tts: TextToSpeech? = null
    private var ready = false

    fun init(context: Context) {
        if (tts != null) return
        tts = TextToSpeech(context.applicationContext) { status ->
            ready = status == TextToSpeech.SUCCESS
        }
    }

    fun speakChinese(text: String) = speak(text, Locale.SIMPLIFIED_CHINESE)
    fun speakVietnamese(text: String) = speak(text, Locale("vi", "VN"))

    fun speak(text: String, locale: Locale) {
        if (!ready) return
        tts?.language = locale
        tts?.setSpeechRate(0.9f)
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
    }

    fun stop() {
        tts?.stop()
    }
}
