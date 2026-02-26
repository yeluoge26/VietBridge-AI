package com.vietbridge.ai.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.vietbridge.ai.data.model.*
import com.vietbridge.ai.data.remote.ApiClient
import com.vietbridge.ai.data.remote.SSEEvent
import com.vietbridge.ai.data.remote.asSSEFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ChatState(
    val messages: List<ChatMessage> = emptyList(),
    val isStreaming: Boolean = false,
    val streamingContent: String = "",
    val error: String? = null,
    val selectedTask: String? = null,
    val selectedScene: String = "general",
    val langDir: String = "zh2vi",
    val tone: Int = 50,
    val conversationId: String? = null,
)

class ChatViewModel : ViewModel() {
    private val _state = MutableStateFlow(ChatState())
    val state: StateFlow<ChatState> = _state.asStateFlow()

    fun send(inputText: String) {
        val text = inputText.trim()
        if (text.isEmpty() || _state.value.isStreaming) return

        val userMsg = ChatMessage.user(text)
        _state.update { it.copy(
            messages = it.messages + userMsg,
            isStreaming = true,
            streamingContent = "",
            error = null,
        ) }

        val s = _state.value
        val history = s.messages.takeLast(10).map { HistoryMessage(it.role.name.lowercase(), it.content) }

        viewModelScope.launch {
            try {
                val request = ChatRequest(
                    input = text, task = s.selectedTask, scene = s.selectedScene,
                    langDir = s.langDir, tone = s.tone, stream = true,
                    conversationId = s.conversationId, conversationHistory = history,
                )
                val response = ApiClient.api.chatStream(request)
                val body = response.body() ?: throw Exception("空响应")

                var fullContent = ""
                var doneEvent: SSEDoneEvent? = null

                body.asSSEFlow().collect { event ->
                    when (event) {
                        is SSEEvent.Delta -> {
                            fullContent += event.content
                            _state.update { it.copy(streamingContent = fullContent) }
                        }
                        is SSEEvent.Done -> doneEvent = event.event
                        is SSEEvent.Error -> _state.update { it.copy(error = event.message) }
                    }
                }

                val assistantMsg = ChatMessage.assistant(
                    content = fullContent,
                    type = doneEvent?.messageType,
                    data = doneEvent?.data,
                    warnings = doneEvent?.proactiveWarnings,
                )
                _state.update { it.copy(
                    messages = it.messages + assistantMsg,
                    conversationId = doneEvent?.conversationId ?: it.conversationId,
                ) }
            } catch (e: Exception) {
                _state.update { it.copy(error = e.message ?: "发送失败") }
            }
            _state.update { it.copy(isStreaming = false, streamingContent = "") }
        }
    }

    fun newConversation() {
        _state.update { ChatState(selectedTask = it.selectedTask, selectedScene = it.selectedScene, langDir = it.langDir, tone = it.tone) }
    }

    fun setTask(task: String?) = _state.update { it.copy(selectedTask = task) }
    fun setScene(scene: String) = _state.update { it.copy(selectedScene = scene) }
    fun setLangDir(dir: String) = _state.update { it.copy(langDir = dir) }
    fun setTone(tone: Int) = _state.update { it.copy(tone = tone) }
}
