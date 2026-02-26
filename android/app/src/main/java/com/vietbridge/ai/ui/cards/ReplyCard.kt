package com.vietbridge.ai.ui.cards

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Forum
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vietbridge.ai.data.model.ChatResponseData
import com.vietbridge.ai.ui.components.ActionButton
import com.vietbridge.ai.ui.components.VBCard
import com.vietbridge.ai.ui.theme.*
import com.vietbridge.ai.util.TTSHelper

@Composable
fun ReplyCard(data: ChatResponseData) {
    VBCard {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Icon(Icons.Default.Forum, null, Modifier.size(14.dp), tint = ReplyAccent)
                Text("回复建议", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = ReplyAccent)
            }

            data.replies?.forEach { reply ->
                Column(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(BgInput).padding(10.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Text(reply.text, fontWeight = FontWeight.Bold, color = TextPrimary)
                    reply.pinyin?.let { Text(it, fontSize = 12.sp, color = TextSecondary) }
                    reply.translation?.let { Text(it, fontSize = 12.sp, color = TextTertiary) }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        reply.tone?.let {
                            Text(it, fontSize = 11.sp, color = ReplyAccent,
                                modifier = Modifier.clip(RoundedCornerShape(4.dp)).background(ReplyAccent.copy(0.1f)).padding(horizontal = 6.dp, vertical = 2.dp))
                        }
                        Spacer(Modifier.weight(1f))
                        ActionButton(Icons.Default.VolumeUp) { TTSHelper.speakVietnamese(reply.text) }
                        ActionButton(Icons.Default.ContentCopy) { /* clipboard handled in ActionButton */ }
                    }
                }
            }

            data.culturalNote?.takeIf { it.isNotEmpty() }?.let {
                Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(ReplyAccent.copy(0.06f)).padding(8.dp)) {
                    Text(it, fontSize = 12.sp, color = TextSecondary)
                }
            }
        }
    }
}
