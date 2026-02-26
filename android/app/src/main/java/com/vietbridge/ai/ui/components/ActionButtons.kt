package com.vietbridge.ai.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.vietbridge.ai.ui.theme.BgInput
import com.vietbridge.ai.ui.theme.TextSecondary
import com.vietbridge.ai.util.TTSHelper

@Composable
fun ActionButton(icon: ImageVector, onClick: () -> Unit) {
    FilledIconButton(
        onClick = onClick,
        modifier = Modifier.size(32.dp),
        shape = CircleShape,
        colors = IconButtonDefaults.filledIconButtonColors(containerColor = BgInput, contentColor = TextSecondary),
    ) {
        Icon(icon, null, Modifier.size(16.dp))
    }
}

@Composable
fun ActionButtonRow(
    text: String,
    language: String = "zh",
) {
    val context = LocalContext.current
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        ActionButton(Icons.Default.VolumeUp) {
            if (language == "vi") TTSHelper.speakVietnamese(text)
            else TTSHelper.speakChinese(text)
        }
        ActionButton(Icons.Default.ContentCopy) {
            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            clipboard.setPrimaryClip(ClipData.newPlainText("VietBridge", text))
        }
        ActionButton(Icons.Default.Share) {
            context.startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_TEXT, text)
            }, "分享"))
        }
    }
}
