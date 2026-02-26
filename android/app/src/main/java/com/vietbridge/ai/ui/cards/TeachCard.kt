package com.vietbridge.ai.ui.cards

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vietbridge.ai.data.model.ChatResponseData
import com.vietbridge.ai.ui.components.ActionButton
import com.vietbridge.ai.ui.components.ActionButtonRow
import com.vietbridge.ai.ui.components.VBCard
import com.vietbridge.ai.ui.theme.*
import com.vietbridge.ai.util.TTSHelper

@Composable
fun TeachCard(data: ChatResponseData) {
    VBCard {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Icon(Icons.Default.School, null, Modifier.size(14.dp), tint = TeachAccent)
                Text("越语教学", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TeachAccent)
            }

            data.phrase?.let { phrase ->
                Text(phrase, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                ActionButtonRow(phrase, language = "vi")
            }
            data.pinyin?.let { Text(it, fontSize = 14.sp, color = TextSecondary) }
            data.meaning?.let { Text(it, fontSize = 15.sp, color = TextPrimary) }

            data.examples?.takeIf { it.isNotEmpty() }?.let { examples ->
                HorizontalDivider(color = BorderLight)
                Text("例句", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextSecondary)
                examples.forEach { ex ->
                    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(BgInput).padding(8.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(ex.vi, fontWeight = FontWeight.Bold, fontSize = 14.sp, modifier = Modifier.weight(1f))
                            ActionButton(Icons.Default.VolumeUp) { TTSHelper.speakVietnamese(ex.vi) }
                        }
                        Text(ex.zh, fontSize = 12.sp, color = TextSecondary)
                        ex.situation?.let { Text(it, fontSize = 11.sp, color = TextTertiary) }
                    }
                }
            }

            data.culturalNote?.takeIf { it.isNotEmpty() }?.let {
                Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(TeachAccent.copy(0.06f)).padding(8.dp)) {
                    Text(it, fontSize = 12.sp, color = TextSecondary)
                }
            }
        }
    }
}
