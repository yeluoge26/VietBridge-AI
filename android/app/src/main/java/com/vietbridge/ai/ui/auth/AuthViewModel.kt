package com.vietbridge.ai.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.vietbridge.ai.data.local.TokenManager
import com.vietbridge.ai.data.model.LoginRequest
import com.vietbridge.ai.data.model.RegisterRequest
import com.vietbridge.ai.data.model.User
import com.vietbridge.ai.data.remote.ApiClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AuthState(
    val isLoading: Boolean = true,
    val isAuthenticated: Boolean = false,
    val isGuest: Boolean = false,
    val user: User? = null,
    val error: String? = null,
    val success: String? = null,
)

class AuthViewModel(private val tokenManager: TokenManager) : ViewModel() {

    private val _state = MutableStateFlow(AuthState())
    val state: StateFlow<AuthState> = _state.asStateFlow()

    init {
        ApiClient.init(tokenManager)
        checkAuth()
    }

    private fun checkAuth() {
        if (tokenManager.token == null) {
            // No token → enter as guest (skip login screen)
            _state.update { it.copy(isLoading = false, isAuthenticated = true, isGuest = true) }
            return
        }
        viewModelScope.launch {
            try {
                val user = ApiClient.api.me()
                _state.update { it.copy(isLoading = false, isAuthenticated = true, isGuest = false, user = user) }
            } catch (_: Exception) {
                tokenManager.clear()
                // Auth failed → still enter as guest
                _state.update { it.copy(isLoading = false, isAuthenticated = true, isGuest = true) }
            }
        }
    }

    fun login(email: String, password: String) {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val response = ApiClient.api.login(LoginRequest(email, password))
                tokenManager.token = response.token
                _state.update { it.copy(isLoading = false, isAuthenticated = true, isGuest = false, user = response.user) }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.message ?: "登录失败") }
            }
        }
    }

    fun register(name: String, email: String, password: String) {
        _state.update { it.copy(isLoading = true, error = null) }
        viewModelScope.launch {
            try {
                val response = ApiClient.api.register(RegisterRequest(name, email, password))
                tokenManager.token = response.token
                _state.update { it.copy(isLoading = false, isAuthenticated = true, isGuest = false, user = response.user) }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.message ?: "注册失败") }
            }
        }
    }

    fun forgotPassword(email: String) {
        _state.update { it.copy(isLoading = true, error = null, success = null) }
        viewModelScope.launch {
            try {
                ApiClient.api.forgotPassword(com.vietbridge.ai.data.model.ForgotPasswordRequest(email))
                _state.update { it.copy(isLoading = false, success = "重置链接已发送到您的邮箱") }
            } catch (e: Exception) {
                _state.update { it.copy(isLoading = false, error = e.message ?: "发送失败") }
            }
        }
    }

    fun signOut() {
        tokenManager.clear()
        _state.update { AuthState(isLoading = false, isAuthenticated = true, isGuest = true) }
    }

    fun clearMessages() {
        _state.update { it.copy(error = null, success = null) }
    }

    class Factory(private val tokenManager: TokenManager) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T = AuthViewModel(tokenManager) as T
    }
}
