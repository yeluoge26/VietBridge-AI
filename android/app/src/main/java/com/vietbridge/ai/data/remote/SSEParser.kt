package com.vietbridge.ai.data.remote

import com.vietbridge.ai.data.model.SSEDoneEvent
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.ResponseBody
import java.io.BufferedReader
import java.io.InputStreamReader

sealed class SSEEvent {
    data class Delta(val content: String) : SSEEvent()
    data class Done(val event: SSEDoneEvent) : SSEEvent()
    data class Error(val message: String) : SSEEvent()
}

fun ResponseBody.asSSEFlow(): Flow<SSEEvent> = flow {
    val reader = BufferedReader(InputStreamReader(byteStream()))
    try {
        var line: String?
        while (reader.readLine().also { line = it } != null) {
            val l = line ?: continue
            if (!l.startsWith("data: ")) continue

            val jsonStr = l.removePrefix("data: ")
            try {
                val obj = ApiClient.json.decodeFromString<JsonObject>(jsonStr)
                val type = obj["type"]?.jsonPrimitive?.content ?: continue

                when (type) {
                    "delta" -> {
                        val content = obj["content"]?.jsonPrimitive?.content ?: ""
                        emit(SSEEvent.Delta(content))
                    }
                    "done" -> {
                        val event = ApiClient.json.decodeFromString<SSEDoneEvent>(jsonStr)
                        emit(SSEEvent.Done(event))
                    }
                    "error" -> {
                        val msg = obj["error"]?.jsonPrimitive?.content ?: "未知错误"
                        emit(SSEEvent.Error(msg))
                    }
                }
            } catch (_: Exception) { /* skip malformed lines */ }
        }
    } finally {
        reader.close()
    }
}
