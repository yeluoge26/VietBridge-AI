package com.vietbridge.ai.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vietbridge.ai.ui.theme.*

enum class AuthMode { LOGIN, REGISTER, FORGOT_PASSWORD }

@Composable
fun AuthScreen(viewModel: AuthViewModel) {
    val state by viewModel.state.collectAsState()
    var mode by remember { mutableStateOf(AuthMode.LOGIN) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgPrimary)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(Modifier.height(80.dp))

        // Logo
        Icon(Icons.Default.Language, null, Modifier.size(56.dp), tint = VBAccent)
        Spacer(Modifier.height(12.dp))
        Text("VietBridge AI", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
        Text("在越华人智能助手", fontSize = 14.sp, color = TextSecondary)
        Spacer(Modifier.height(32.dp))

        // Name (register only)
        if (mode == AuthMode.REGISTER) {
            AuthTextField(value = name, onValueChange = { name = it }, label = "姓名", icon = Icons.Default.Person)
            Spacer(Modifier.height(12.dp))
        }

        // Email
        AuthTextField(
            value = email, onValueChange = { email = it }, label = "邮箱",
            icon = Icons.Default.Email, keyboardType = KeyboardType.Email,
        )
        Spacer(Modifier.height(12.dp))

        // Password
        if (mode != AuthMode.FORGOT_PASSWORD) {
            AuthTextField(
                value = password, onValueChange = { password = it }, label = "密码",
                icon = Icons.Default.Lock, isPassword = true, showPassword = showPassword,
                onTogglePassword = { showPassword = !showPassword },
            )
            Spacer(Modifier.height(12.dp))
        }

        // Confirm password (register)
        if (mode == AuthMode.REGISTER) {
            AuthTextField(
                value = confirmPassword, onValueChange = { confirmPassword = it },
                label = "确认密码", icon = Icons.Default.Lock, isPassword = true,
                showPassword = showPassword, onTogglePassword = { showPassword = !showPassword },
            )
            Spacer(Modifier.height(12.dp))
        }

        // Error / Success
        state.error?.let {
            Text(it, fontSize = 13.sp, color = RiskRed, modifier = Modifier.padding(vertical = 4.dp))
        }
        state.success?.let {
            Text(it, fontSize = 13.sp, color = VBAccent, modifier = Modifier.padding(vertical = 4.dp))
        }

        Spacer(Modifier.height(16.dp))

        // Primary button
        Button(
            onClick = {
                viewModel.clearMessages()
                when (mode) {
                    AuthMode.LOGIN -> viewModel.login(email, password)
                    AuthMode.REGISTER -> {
                        if (password != confirmPassword) return@Button
                        viewModel.register(name, email, password)
                    }
                    AuthMode.FORGOT_PASSWORD -> viewModel.forgotPassword(email)
                }
            },
            enabled = !state.isLoading,
            modifier = Modifier.fillMaxWidth().height(50.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = TextPrimary),
        ) {
            if (state.isLoading) CircularProgressIndicator(Modifier.size(20.dp), color = BgPrimary, strokeWidth = 2.dp)
            else Text(
                when (mode) { AuthMode.LOGIN -> "登录"; AuthMode.REGISTER -> "注册"; AuthMode.FORGOT_PASSWORD -> "发送重置链接" },
                fontWeight = FontWeight.Bold,
            )
        }

        Spacer(Modifier.height(20.dp))

        // Mode switches
        when (mode) {
            AuthMode.LOGIN -> {
                TextButton(onClick = { mode = AuthMode.REGISTER; viewModel.clearMessages() }) {
                    Text("还没有账号？注册", color = TextSecondary, fontSize = 13.sp)
                }
                TextButton(onClick = { mode = AuthMode.FORGOT_PASSWORD; viewModel.clearMessages() }) {
                    Text("忘记密码？", color = TextSecondary, fontSize = 13.sp)
                }
            }
            AuthMode.REGISTER -> TextButton(onClick = { mode = AuthMode.LOGIN; viewModel.clearMessages() }) {
                Text("已有账号？登录", color = TextSecondary, fontSize = 13.sp)
            }
            AuthMode.FORGOT_PASSWORD -> TextButton(onClick = { mode = AuthMode.LOGIN; viewModel.clearMessages() }) {
                Text("返回登录", color = TextSecondary, fontSize = 13.sp)
            }
        }
    }
}

@Composable
private fun AuthTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    keyboardType: KeyboardType = KeyboardType.Text,
    isPassword: Boolean = false,
    showPassword: Boolean = false,
    onTogglePassword: (() -> Unit)? = null,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        leadingIcon = { Icon(icon, null, tint = TextTertiary) },
        trailingIcon = if (isPassword) { { IconButton(onClick = { onTogglePassword?.invoke() }) {
            Icon(if (showPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility, null, tint = TextTertiary)
        } } } else null,
        singleLine = true,
        visualTransformation = if (isPassword && !showPassword) PasswordVisualTransformation() else VisualTransformation.None,
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType, imeAction = ImeAction.Next),
        shape = RoundedCornerShape(12.dp),
        colors = OutlinedTextFieldDefaults.colors(
            unfocusedContainerColor = BgInput,
            focusedContainerColor = BgInput,
            unfocusedBorderColor = BorderLight,
        ),
        modifier = Modifier.fillMaxWidth(),
    )
}
