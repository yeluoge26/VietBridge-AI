package com.vietbridge.ai.ui.profile

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.PersonOutline
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vietbridge.ai.BuildConfig
import com.vietbridge.ai.data.model.Plan
import com.vietbridge.ai.data.model.SubscriptionData
import com.vietbridge.ai.data.model.UsageData
import com.vietbridge.ai.data.remote.ApiClient
import com.vietbridge.ai.data.model.CheckoutRequest
import com.vietbridge.ai.ui.auth.AuthViewModel
import com.vietbridge.ai.ui.components.VBCard
import com.vietbridge.ai.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileTab(
    modifier: Modifier = Modifier,
    isGuest: Boolean = false,
    authViewModel: AuthViewModel? = null,
    onSignOut: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    var usage by remember { mutableStateOf<UsageData?>(null) }
    var subscription by remember { mutableStateOf<SubscriptionData?>(null) }
    var showSignOutDialog by remember { mutableStateOf(false) }
    var showLoginSheet by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        try { usage = ApiClient.api.getUsage() } catch (_: Exception) {}
        try { subscription = ApiClient.api.getSubscription() } catch (_: Exception) {}
    }

    Column(modifier.fillMaxSize()) {
        CenterAlignedTopAppBar(
            title = { Text("我的", fontWeight = FontWeight.Bold, fontSize = 18.sp) },
            colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = BgPrimary),
        )

        Column(
            Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            // User info card
            VBCard {
                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Icon(
                        if (isGuest) Icons.Default.PersonOutline else Icons.Default.AccountCircle,
                        null, Modifier.size(48.dp),
                        tint = if (isGuest) VBAccent else TextTertiary,
                    )
                    Column {
                        Text(
                            if (isGuest) "游客用户" else "用户",
                            fontWeight = FontWeight.Bold, fontSize = 16.sp,
                        )
                        if (isGuest) {
                            Text("登录后可保存对话记录", fontSize = 12.sp, color = TextSecondary)
                        } else {
                            val planLabel = when (subscription?.plan) { "PRO" -> "专业版"; "ENTERPRISE" -> "企业版"; else -> "免费版" }
                            Text(planLabel, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = VBAccent)
                        }
                    }
                }
            }

            // Guest login prompt
            if (isGuest) {
                VBCard {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("登录解锁更多", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(
                            "登录后可保存对话记录、升级到专业版获取 GPT-4o 高精度模型和更多功能。",
                            fontSize = 12.sp, color = TextSecondary, lineHeight = 18.sp,
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Button(
                                onClick = { showLoginSheet = true },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = TextPrimary),
                            ) { Text("登录", fontWeight = FontWeight.Bold) }
                            OutlinedButton(
                                onClick = { showLoginSheet = true },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp),
                            ) { Text("注册", fontWeight = FontWeight.Bold, color = TextPrimary) }
                        }
                    }
                }
            }

            // Usage
            usage?.let { u ->
                VBCard {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row {
                            Text("今日用量", fontWeight = FontWeight.Bold)
                            Spacer(Modifier.weight(1f))
                            val pct = if (u.limit > 0) u.used.toFloat() / u.limit else 0f
                            val color = when { pct >= 0.9f -> RiskRed; pct >= 0.7f -> RiskOrange; else -> VBAccent }
                            Text("${u.used} / ${u.limit}", fontWeight = FontWeight.Bold, color = color)
                        }
                        LinearProgressIndicator(
                            progress = { if (u.limit > 0) u.used.toFloat() / u.limit else 0f },
                            modifier = Modifier.fillMaxWidth().height(6.dp),
                            color = if (u.used.toFloat() / u.limit.coerceAtLeast(1) >= 0.9f) RiskRed else VBAccent,
                            trackColor = BgInput,
                        )
                        if (!u.allowed) {
                            Text(
                                if (isGuest) "今日额度已用完，注册后获取更多次数" else "今日额度已用完，升级获取更多次数",
                                fontSize = 12.sp, color = RiskOrange,
                            )
                        }
                    }
                }
            }

            // Plans
            Text("订阅计划", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Plan.list(if (isGuest) "FREE" else (subscription?.plan ?: "FREE")).forEach { plan ->
                VBCard {
                    Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row {
                            Text(plan.name, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Spacer(Modifier.weight(1f))
                            Text(plan.price, fontWeight = FontWeight.Bold, color = VBAccent)
                        }
                        plan.features.forEach { feature ->
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Icon(Icons.Default.CheckCircle, null, Modifier.size(14.dp), tint = VBAccent)
                                Text(feature, fontSize = 12.sp, color = TextSecondary)
                            }
                        }
                        if (plan.isCurrent) {
                            Text(
                                if (isGuest) "当前 (游客)" else "当前计划",
                                fontSize = 12.sp, fontWeight = FontWeight.Bold, color = VBAccent,
                            )
                        } else if (plan.priceId != null) {
                            if (isGuest) {
                                Button(
                                    onClick = { showLoginSheet = true },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = TextPrimary),
                                ) { Text("注册后升级", fontWeight = FontWeight.Bold) }
                            } else {
                                Button(
                                    onClick = {
                                        scope.launch {
                                            try {
                                                val resp = ApiClient.api.createCheckout(CheckoutRequest(plan.priceId))
                                                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(resp.url)))
                                            } catch (_: Exception) {}
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = TextPrimary),
                                ) { Text("升级", fontWeight = FontWeight.Bold) }
                            }
                        }
                    }
                }
            }

            // Sign out (only for authenticated users)
            if (!isGuest) {
                OutlinedButton(
                    onClick = { showSignOutDialog = true },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = RiskRed),
                    border = ButtonDefaults.outlinedButtonBorder(enabled = true).copy(brush = androidx.compose.ui.graphics.SolidColor(RiskRed.copy(0.2f))),
                ) { Text("退出登录", fontWeight = FontWeight.Bold) }
            }

            // Version
            Text(
                "VietBridge AI v${BuildConfig.VERSION_NAME}",
                fontSize = 12.sp, color = TextTertiary,
                modifier = Modifier.align(Alignment.CenterHorizontally),
            )
        }
    }

    // Sign out dialog
    if (showSignOutDialog) {
        AlertDialog(
            onDismissRequest = { showSignOutDialog = false },
            title = { Text("确认退出") },
            text = { Text("退出后将以游客身份继续使用") },
            confirmButton = { TextButton(onClick = { showSignOutDialog = false; onSignOut() }) { Text("退出", color = RiskRed) } },
            dismissButton = { TextButton(onClick = { showSignOutDialog = false }) { Text("取消") } },
        )
    }

    // Login bottom sheet
    if (showLoginSheet && authViewModel != null) {
        LoginBottomSheet(
            authViewModel = authViewModel,
            onDismiss = { showLoginSheet = false },
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun LoginBottomSheet(authViewModel: AuthViewModel, onDismiss: () -> Unit) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val authState by authViewModel.state.collectAsState()
    var isLoginMode by remember { mutableStateOf(true) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }

    // Close sheet when auth succeeds
    LaunchedEffect(authState.isGuest) {
        if (!authState.isGuest && authState.isAuthenticated) {
            onDismiss()
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = BgPrimary,
    ) {
        Column(
            Modifier.padding(horizontal = 24.dp).padding(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Text(
                if (isLoginMode) "登录" else "注册",
                fontWeight = FontWeight.Bold, fontSize = 20.sp,
            )

            if (!isLoginMode) {
                OutlinedTextField(
                    value = name, onValueChange = { name = it },
                    label = { Text("姓名") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true,
                )
            }

            OutlinedTextField(
                value = email, onValueChange = { email = it },
                label = { Text("邮箱") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
            )

            OutlinedTextField(
                value = password, onValueChange = { password = it },
                label = { Text("密码") },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true,
            )

            authState.error?.let {
                Text(it, color = RiskRed, fontSize = 12.sp)
            }

            Button(
                onClick = {
                    if (isLoginMode) authViewModel.login(email, password)
                    else authViewModel.register(name, email, password)
                },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = TextPrimary),
                enabled = !authState.isLoading && email.isNotBlank() && password.isNotBlank(),
            ) {
                if (authState.isLoading) {
                    CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                } else {
                    Text(if (isLoginMode) "登录" else "注册", fontWeight = FontWeight.Bold)
                }
            }

            TextButton(
                onClick = {
                    isLoginMode = !isLoginMode
                    authViewModel.clearMessages()
                },
                modifier = Modifier.align(Alignment.CenterHorizontally),
            ) {
                Text(
                    if (isLoginMode) "没有账号？去注册" else "已有账号？去登录",
                    color = VBAccent, fontSize = 14.sp,
                )
            }
        }
    }
}
