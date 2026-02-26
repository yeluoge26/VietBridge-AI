package com.vietbridge.ai.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// ── Auth ────────────────────────────────────────────────────────────────

@Serializable
data class User(
    val id: String,
    val name: String? = null,
    val email: String? = null,
    val role: String = "user",
    val image: String? = null,
) {
    val isPro get() = role == "pro" || role == "admin"
    val displayName get() = name ?: email ?: "用户"
}

@Serializable
data class AuthResponse(
    val token: String,
    val user: User,
)

@Serializable
data class LoginRequest(val email: String, val password: String)

@Serializable
data class RegisterRequest(val name: String, val email: String, val password: String)

@Serializable
data class ForgotPasswordRequest(val email: String)

@Serializable
data class ApiError(val error: String)

// ── Chat ────────────────────────────────────────────────────────────────

@Serializable
data class ChatRequest(
    val input: String,
    val task: String? = null,
    val scene: String? = null,
    val langDir: String = "zh2vi",
    val tone: Int = 50,
    val stream: Boolean = true,
    val conversationId: String? = null,
    val conversationHistory: List<HistoryMessage> = emptyList(),
)

@Serializable
data class HistoryMessage(val role: String, val content: String)

@Serializable
data class SSEDoneEvent(
    val type: String,
    val messageType: String? = null,
    val data: ChatResponseData? = null,
    val proactiveWarnings: List<ProactiveWarning>? = null,
    val conversationId: String? = null,
    val intent: IntentInfo? = null,
    val usage: UsageInfo? = null,
)

@Serializable
data class IntentInfo(val task: String, val scene: String, val confidence: Double)

@Serializable
data class UsageInfo(
    val model: String,
    val tokensPrompt: Int,
    val tokensCompletion: Int,
    val cost: String,
    val latency: Int,
)

@Serializable
data class ChatResponseData(
    // Translation fields
    val translation: String? = null,
    val pinyin: String? = null,
    val literal: String? = null,
    val context: String? = null,
    val alternatives: List<AlternativeTranslation>? = null,
    // Reply fields
    val replies: List<ReplyOption>? = null,
    val culturalNote: String? = null,
    // Risk fields
    val score: Int? = null,
    val level: String? = null,
    val factors: List<RiskFactor>? = null,
    val tips: List<String>? = null,
    val scripts: List<RiskScript>? = null,
    // Teach fields
    val phrase: String? = null,
    val meaning: String? = null,
    val examples: List<TeachExample>? = null,
)

@Serializable
data class AlternativeTranslation(val text: String, val tone: String? = null, val note: String? = null)

@Serializable
data class ReplyOption(
    val text: String,
    val tone: String? = null,
    val pinyin: String? = null,
    val translation: String? = null,
)

@Serializable
data class RiskFactor(val label: String, val detail: String? = null, val weight: Int? = null)

@Serializable
data class RiskScript(val vi: String, val zh: String, val situation: String? = null)

@Serializable
data class TeachExample(val vi: String, val zh: String, val situation: String? = null)

@Serializable
data class ProactiveWarning(val type: String, val message: String, val severity: String? = null)

// ── Conversation ────────────────────────────────────────────────────────

@Serializable
data class ConversationList(
    val conversations: List<Conversation>,
    val total: Int,
    val page: Int,
    val totalPages: Int,
)

@Serializable
data class Conversation(
    val id: String,
    val userId: String,
    val taskType: String,
    val sceneType: String,
    val title: String? = null,
    val createdAt: String,
    val updatedAt: String,
    @SerialName("_count") val count: MessageCount? = null,
)

@Serializable
data class MessageCount(val messages: Int)

@Serializable
data class ConversationDetail(
    val id: String,
    val taskType: String,
    val sceneType: String,
    val title: String? = null,
    val messages: List<ServerMessage>,
)

@Serializable
data class ServerMessage(val id: String, val role: String, val content: String, val createdAt: String)

// ── Scan / OCR ──────────────────────────────────────────────────────────

@Serializable
data class OcrAnalyzeRequest(val ocrText: String, val documentType: String)

@Serializable
data class OcrAnalyzeResponse(
    val type: String,
    val documentType: String,
    val data: OcrResultData,
)

@Serializable
data class OcrResultData(
    val items: List<OcrItem>? = null,
    @SerialName("summary_zh") val summaryZh: String? = null,
    val totalEstimate: String? = null,
    val warnings: List<String>? = null,
    val tips: List<String>? = null,
    val raw: String? = null,
)

@Serializable
data class OcrItem(
    @SerialName("name_vi") val nameVi: String? = null,
    @SerialName("name_zh") val nameZh: String? = null,
    val price: String? = null,
    val unit: String? = null,
    val priceReasonable: Boolean? = null,
    val note: String? = null,
)

// ── Usage & Subscription ────────────────────────────────────────────────

@Serializable
data class UsageData(val used: Int, val limit: Int, val allowed: Boolean, val plan: String)

@Serializable
data class SubscriptionData(
    val plan: String,
    val stripeCustomerId: String? = null,
    val stripeSubscriptionId: String? = null,
    val currentPeriodEnd: String? = null,
    val createdAt: String? = null,
)

@Serializable
data class CheckoutRequest(val priceId: String)

@Serializable
data class CheckoutResponse(val url: String)
