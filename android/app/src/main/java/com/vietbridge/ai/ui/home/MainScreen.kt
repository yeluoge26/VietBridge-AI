package com.vietbridge.ai.ui.home

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.DocumentScanner
import androidx.compose.material.icons.filled.Forum
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import com.vietbridge.ai.ui.learn.LearnTab
import com.vietbridge.ai.ui.profile.ProfileTab
import com.vietbridge.ai.ui.scan.ScanTab
import com.vietbridge.ai.ui.theme.BgPrimary
import com.vietbridge.ai.ui.theme.TextPrimary
import com.vietbridge.ai.ui.theme.TextTertiary

data class BottomNavItem(val label: String, val icon: ImageVector)

private val navItems = listOf(
    BottomNavItem("对话", Icons.Default.Forum),
    BottomNavItem("扫描", Icons.Default.DocumentScanner),
    BottomNavItem("学习", Icons.Default.Book),
    BottomNavItem("我的", Icons.Default.Person),
)

@Composable
fun MainScreen(onSignOut: () -> Unit) {
    var selectedTab by remember { mutableIntStateOf(0) }

    Scaffold(
        containerColor = BgPrimary,
        bottomBar = {
            NavigationBar(containerColor = BgPrimary) {
                navItems.forEachIndexed { index, item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.label) },
                        label = { Text(item.label) },
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = TextPrimary,
                            selectedTextColor = TextPrimary,
                            unselectedIconColor = TextTertiary,
                            unselectedTextColor = TextTertiary,
                            indicatorColor = BgPrimary,
                        ),
                    )
                }
            }
        },
    ) { padding ->
        when (selectedTab) {
            0 -> HomeTab(Modifier.padding(padding))
            1 -> ScanTab(Modifier.padding(padding))
            2 -> LearnTab(Modifier.padding(padding))
            3 -> ProfileTab(Modifier.padding(padding), onSignOut = onSignOut)
        }
    }
}
