package com.vietbridge.ai.data.remote

import com.vietbridge.ai.data.model.*
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ── Auth ────────────────────────────────────────────────────────────
    @POST("api/auth/mobile")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    @POST("api/auth/register")
    suspend fun register(@Body request: RegisterRequest): AuthResponse

    @GET("api/auth/mobile/me")
    suspend fun me(): User

    @POST("api/auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest)

    // ── Chat (streaming via OkHttp SSE) ────────────────────────────────
    @POST("api/chat")
    @Streaming
    suspend fun chatStream(@Body request: ChatRequest): Response<ResponseBody>

    // ── Conversations ──────────────────────────────────────────────────
    @GET("api/conversations")
    suspend fun getConversations(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
    ): ConversationList

    @GET("api/conversations/{id}")
    suspend fun getConversation(@Path("id") id: String): ConversationDetail

    @DELETE("api/conversations/{id}")
    suspend fun deleteConversation(@Path("id") id: String)

    // ── OCR ────────────────────────────────────────────────────────────
    @POST("api/ocr/analyze")
    suspend fun ocrAnalyze(@Body request: OcrAnalyzeRequest): OcrAnalyzeResponse

    // ── Usage & Subscription ───────────────────────────────────────────
    @GET("api/usage")
    suspend fun getUsage(): UsageData

    @GET("api/subscription")
    suspend fun getSubscription(): SubscriptionData

    @POST("api/stripe/checkout")
    suspend fun createCheckout(@Body request: CheckoutRequest): CheckoutResponse

    @POST("api/stripe/portal")
    suspend fun createPortal(): CheckoutResponse
}
