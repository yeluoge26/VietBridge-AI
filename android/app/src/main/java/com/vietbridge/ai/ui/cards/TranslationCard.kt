package com.vietbridge.ai.ui.cards

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Translate
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vietbridge.ai.data.model.ChatResponseData
import com.vietbridge.ai.ui.components.ActionButtonRow
import com.vietbridge.ai.ui.components.VBCard
import com.vietbridge.ai.ui.theme.*

@Composable
fun TranslationCard(data: ChatResponseData) {
    VBCard {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                Icon(Icons.Default.Translate, null, Modifier.size(14.dp), tint = TranslationAccent)
                Text("翻译", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TranslationAccent)
            }

            data.translation?.let { t ->
                Text(t, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                ActionButtonRow(t)
            }
            data.pinyin?.let { Text(it, fontSize = 14.sp, color = TextSecondary) }
            data.context?.takeIf { it.isNotEmpty() }?.let {
                Box(Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(BgInput).padding(8.dp)) {
                    Text(it, fontSize = 12.sp, color = TextSecondary)
                }
            }
            data.alternatives?.takeIf { it.isNotEmpty() }?.let { alts ->
                HorizontalDivider(color = BorderLight)
                Text("其他译法", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextSecondary)
                alts.forEach { alt ->
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(alt.text, fontSize = 14.sp)
                        alt.tone?.let {
                            Text(it, fontSize = 11.sp, color = TextSecondary,
                                modifier = Modifier.clip(RoundedCornerShape(4.dp)).background(BgInput).padding(horizontal = 6.dp, vertical = 2.dp))
                        }
                    }
                }
            }
        }
    }
}
