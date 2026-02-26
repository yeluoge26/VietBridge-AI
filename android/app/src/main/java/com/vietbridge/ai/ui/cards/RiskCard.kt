package com.vietbridge.ai.ui.cards

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vietbridge.ai.data.model.ChatResponseData
import com.vietbridge.ai.ui.components.ActionButton
import com.vietbridge.ai.ui.components.VBCard
import com.vietbridge.ai.ui.theme.*
import com.vietbridge.ai.util.TTSHelper

@Composable
fun RiskCard(data: ChatResponseData) {
    VBCard {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Icon(Icons.Default.Shield, null, Modifier.size(14.dp), tint = RiskAccentColor)
                Text("风险评估", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = RiskAccentColor)
            }

            // Gauge
            data.score?.let { score ->
                Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    RiskGauge(score, data.level ?: "unknown")
                }
            }

            // Factors
            data.factors?.takeIf { it.isNotEmpty() }?.let { factors ->
                Text("风险因素", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextSecondary)
                factors.forEach { factor ->
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box(Modifier.padding(top = 6.dp).size(6.dp).clip(CircleShape).background(RiskOrange))
                        Column {
                            Text(factor.label, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            factor.detail?.let { Text(it, fontSize = 12.sp, color = TextSecondary) }
                        }
                    }
                }
            }

            // Tips
            data.tips?.takeIf { it.isNotEmpty() }?.let { tips ->
                Text("防护建议", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextSecondary)
                tips.forEach { tip ->
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Icon(Icons.Default.Lightbulb, null, Modifier.size(14.dp), tint = RiskYellow)
                        Text(tip, fontSize = 12.sp, color = TextPrimary)
                    }
                }
            }

            // Scripts
            data.scripts?.takeIf { it.isNotEmpty() }?.let { scripts ->
                Text("应对话术", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextSecondary)
                scripts.forEach { script ->
                    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(BgInput).padding(8.dp)) {
                        script.situation?.let { Text(it, fontSize = 11.sp, color = TextTertiary) }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(script.vi, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text(script.zh, fontSize = 12.sp, color = TextSecondary)
                            }
                            ActionButton(Icons.Default.VolumeUp) { TTSHelper.speakVietnamese(script.vi) }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun RiskGauge(score: Int, level: String) {
    val color = when {
        score < 30 -> VBAccent
        score < 60 -> RiskYellow
        score < 80 -> RiskOrange
        else -> RiskRed
    }
    val levelLabel = when (level.lowercase()) {
        "safe" -> "安全"; "low" -> "低风险"; "medium" -> "中风险"; "high" -> "高风险"; "critical" -> "极高风险"; else -> "未知"
    }

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(Modifier.size(100.dp), contentAlignment = Alignment.Center) {
            Canvas(Modifier.fillMaxSize()) {
                val stroke = Stroke(width = 10.dp.toPx(), cap = StrokeCap.Round)
                drawArc(BorderLight, 0f, 360f, false, style = stroke, topLeft = Offset.Zero, size = Size(size.width, size.height))
                drawArc(color, -90f, 360f * score / 100f, false, style = stroke, topLeft = Offset.Zero, size = Size(size.width, size.height))
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("$score", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = color)
                Text("/ 100", fontSize = 10.sp, color = TextTertiary)
            }
        }
        Spacer(Modifier.height(4.dp))
        Text(levelLabel, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = color)
    }
}
