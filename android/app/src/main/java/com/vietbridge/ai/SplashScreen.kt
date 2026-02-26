package com.vietbridge.ai

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Language
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vietbridge.ai.ui.theme.BgPrimary
import com.vietbridge.ai.ui.theme.TextPrimary
import com.vietbridge.ai.ui.theme.VBAccent

@Composable
fun SplashScreen() {
    Column(
        modifier = Modifier.fillMaxSize().background(BgPrimary),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(
            Icons.Default.Language,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = VBAccent,
        )
        Spacer(Modifier.height(16.dp))
        Text("VietBridge AI", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
        Spacer(Modifier.height(16.dp))
        CircularProgressIndicator(color = VBAccent, strokeWidth = 2.dp)
    }
}
