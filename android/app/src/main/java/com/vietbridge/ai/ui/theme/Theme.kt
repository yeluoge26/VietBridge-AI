package com.vietbridge.ai.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary = TextPrimary,
    onPrimary = BgPrimary,
    secondary = VBAccent,
    onSecondary = TextPrimary,
    background = BgPrimary,
    onBackground = TextPrimary,
    surface = BgCard,
    onSurface = TextPrimary,
    surfaceVariant = BgInput,
    onSurfaceVariant = TextSecondary,
    outline = BorderLight,
    error = RiskRed,
)

@Composable
fun VietBridgeTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content,
    )
}
