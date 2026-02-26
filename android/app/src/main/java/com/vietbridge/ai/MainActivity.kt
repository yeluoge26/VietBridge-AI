package com.vietbridge.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import com.vietbridge.ai.data.local.TokenManager
import com.vietbridge.ai.ui.auth.AuthScreen
import com.vietbridge.ai.ui.auth.AuthViewModel
import com.vietbridge.ai.ui.home.MainScreen
import com.vietbridge.ai.ui.theme.VietBridgeTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val tokenManager = TokenManager(this)

        setContent {
            VietBridgeTheme {
                val authViewModel: AuthViewModel = viewModel(
                    factory = AuthViewModel.Factory(tokenManager)
                )
                val authState by authViewModel.state.collectAsState()

                when {
                    authState.isLoading -> SplashScreen()
                    authState.isAuthenticated -> MainScreen(
                        onSignOut = { authViewModel.signOut() }
                    )
                    else -> AuthScreen(viewModel = authViewModel)
                }
            }
        }
    }
}
