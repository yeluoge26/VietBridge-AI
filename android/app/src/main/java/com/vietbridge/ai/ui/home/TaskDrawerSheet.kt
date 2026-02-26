package com.vietbridge.ai.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vietbridge.ai.ui.theme.*

private data class TaskOption(val id: String?, val label: String, val icon: ImageVector, val color: androidx.compose.ui.graphics.Color)

private val tasks = listOf(
    TaskOption(null, "自动", Icons.Default.AutoAwesome, TextSecondary),
    TaskOption("translate", "翻译", Icons.Default.Translate, TranslationAccent),
    TaskOption("reply", "回复", Icons.Default.Forum, ReplyAccent),
    TaskOption("risk", "风险", Icons.Default.Shield, RiskAccentColor),
    TaskOption("learn", "教学", Icons.Default.School, TeachAccent),
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskDrawerSheet(
    selectedTask: String?,
    langDir: String,
    tone: Int,
    onTaskChange: (String?) -> Unit,
    onLangDirChange: (String) -> Unit,
    onToneChange: (Int) -> Unit,
    onDismiss: () -> Unit,
) {
    var localTone by remember { mutableFloatStateOf(tone.toFloat()) }

    ModalBottomSheet(onDismissRequest = onDismiss, containerColor = BgPrimary) {
        Column(Modifier.padding(24.dp)) {
            // Tasks
            Text("任务类型", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Spacer(Modifier.height(12.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                tasks.forEach { task ->
                    val selected = selectedTask == task.id
                    FilterChip(
                        selected = selected,
                        onClick = { onTaskChange(task.id) },
                        label = { Text(task.label, fontSize = 12.sp, fontWeight = FontWeight.Bold) },
                        leadingIcon = { Icon(task.icon, null, Modifier.size(16.dp)) },
                        shape = RoundedCornerShape(12.dp),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = task.color.copy(alpha = 0.12f),
                            selectedLeadingIconColor = task.color,
                            selectedLabelColor = task.color,
                            containerColor = BgInput,
                        ),
                        border = null,
                    )
                }
            }

            Spacer(Modifier.height(24.dp))

            // Language direction
            Text("翻译方向", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                listOf("zh2vi" to "中→越", "vi2zh" to "越→中").forEach { (id, label) ->
                    FilterChip(
                        selected = langDir == id,
                        onClick = { onLangDirChange(id) },
                        label = { Text(label, fontWeight = FontWeight.Bold) },
                        shape = RoundedCornerShape(12.dp),
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = TextPrimary,
                            selectedLabelColor = BgPrimary,
                            containerColor = BgInput,
                        ),
                        border = null,
                        modifier = Modifier.weight(1f),
                    )
                }
            }

            Spacer(Modifier.height(24.dp))

            // Tone
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("语气", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Spacer(Modifier.weight(1f))
                Text(
                    when {
                        localTone < 20 -> "很随意"
                        localTone < 40 -> "随意"
                        localTone < 60 -> "中性"
                        localTone < 80 -> "正式"
                        else -> "很正式"
                    },
                    fontSize = 12.sp, color = TextSecondary,
                )
            }
            Slider(
                value = localTone,
                onValueChange = { localTone = it },
                onValueChangeFinished = { onToneChange(localTone.toInt()) },
                valueRange = 0f..100f,
                colors = SliderDefaults.colors(thumbColor = TextPrimary, activeTrackColor = TextPrimary),
            )
            Row {
                Text("随意", fontSize = 11.sp, color = TextTertiary)
                Spacer(Modifier.weight(1f))
                Text("正式", fontSize = 11.sp, color = TextTertiary)
            }

            Spacer(Modifier.height(32.dp))
        }
    }
}
