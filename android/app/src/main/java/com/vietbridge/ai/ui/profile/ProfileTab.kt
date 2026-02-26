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
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vietbridge.ai.data.model.Plan
import com.vietbridge.ai.data.model.SubscriptionData
import com.vietbridge.ai.data.model.UsageData
import com.vietbridge.ai.data.remote.ApiClient
import com.vietbridge.ai.data.model.CheckoutRequest
import com.vietbridge.ai.ui.components.VBCard
import com.vietbridge.ai.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileTab(modifier: Modifier = Modifier, onSignOut: () -> Unit) {
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    var usage by remember { mutableStateOf<UsageData?>(null) }
    var subscription by remember { mutableStateOf<SubscriptionData?>(null) }
    var showSignOutDialog by remember { mutableStateOf(false) }

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
            // User info
            VBCard {
                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Icon(Icons.Default.AccountCircle, null, Modifier.size(48.dp), tint = TextTertiary)
                    Column {
                        Text("用户", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        val planLabel = when (subscription?.plan) { "PRO" -> "专业版"; "ENTERPRISE" -> "企业版"; else -> "免费版" }
                        Text(planLabel, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = VBAccent)
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
                        if (!u.allowed) Text("今日额度已用完，升级获取更多次数", fontSize = 12.sp, color = RiskOrange)
                    }
                }
            }

            // Plans
            Text("订阅计划", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Plan.list(subscription?.plan ?: "FREE").forEach { plan ->
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
                            Text("当前计划", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = VBAccent)
                        } else if (plan.priceId != null) {
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

            // Sign out
            OutlinedButton(
                onClick = { showSignOutDialog = true },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = RiskRed),
                border = ButtonDefaults.outlinedButtonBorder(enabled = true).copy(brush = androidx.compose.ui.graphics.SolidColor(RiskRed.copy(0.2f))),
            ) { Text("退出登录", fontWeight = FontWeight.Bold) }

            // Version
            Text("VietBridge AI v1.0.0", fontSize = 12.sp, color = TextTertiary, modifier = Modifier.align(Alignment.CenterHorizontally))
        }
    }

    if (showSignOutDialog) {
        AlertDialog(
            onDismissRequest = { showSignOutDialog = false },
            title = { Text("确认退出") },
            text = { Text("退出后需要重新登录") },
            confirmButton = { TextButton(onClick = { showSignOutDialog = false; onSignOut() }) { Text("退出", color = RiskRed) } },
            dismissButton = { TextButton(onClick = { showSignOutDialog = false }) { Text("取消") } },
        )
    }
}
