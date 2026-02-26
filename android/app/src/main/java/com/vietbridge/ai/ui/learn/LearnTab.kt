package com.vietbridge.ai.ui.learn

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vietbridge.ai.data.model.DailyPhrase
import com.vietbridge.ai.data.model.SceneInfo
import com.vietbridge.ai.ui.components.ActionButton
import com.vietbridge.ai.ui.components.VBCard
import com.vietbridge.ai.ui.theme.*
import com.vietbridge.ai.util.TTSHelper
import java.util.Calendar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LearnTab(modifier: Modifier = Modifier) {
    var selectedTab by remember { mutableIntStateOf(0) }
    var sceneFilter by remember { mutableStateOf<String?>(null) }

    Column(modifier.fillMaxSize()) {
        CenterAlignedTopAppBar(
            title = { Text("学越语", fontWeight = FontWeight.Bold, fontSize = 18.sp) },
            colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = BgPrimary),
        )

        // Tabs
        TabRow(selectedTab, containerColor = BgPrimary, contentColor = TextPrimary) {
            listOf("每日一句", "场景", "短语").forEachIndexed { i, title ->
                Tab(selected = selectedTab == i, onClick = { selectedTab = i }) {
                    Text(title, Modifier.padding(12.dp), fontWeight = if (selectedTab == i) FontWeight.Bold else FontWeight.Normal)
                }
            }
        }

        when (selectedTab) {
            0 -> DailyTab()
            1 -> SceneGrid(onSceneClick = { sceneFilter = it; selectedTab = 2 })
            2 -> PhraseList(sceneFilter = sceneFilter, onClearFilter = { sceneFilter = null })
        }
    }
}

@Composable
private fun DailyTab() {
    val day = Calendar.getInstance().get(Calendar.DAY_OF_MONTH)
    val phrases = remember {
        val start = (day * 3) % DailyPhrase.all.size
        (0 until 3).map { DailyPhrase.all[(start + it) % DailyPhrase.all.size] }
    }

    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        items(phrases) { phrase -> DailyCard(phrase) }
    }
}

@Composable
private fun DailyCard(phrase: DailyPhrase) {
    VBCard {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(phrase.vi, fontWeight = FontWeight.Bold, fontSize = 16.sp, modifier = Modifier.weight(1f))
                FilledIconButton(
                    onClick = { TTSHelper.speakVietnamese(phrase.vi) },
                    modifier = Modifier.size(32.dp),
                    colors = IconButtonDefaults.filledIconButtonColors(containerColor = VBAccent.copy(0.1f), contentColor = VBAccent),
                ) { Icon(Icons.Default.VolumeUp, null, Modifier.size(16.dp)) }
            }
            Text(phrase.pinyin, fontSize = 12.sp, color = TextSecondary)
            Text(phrase.zh, fontSize = 14.sp, color = TextPrimary)
        }
    }
}

@Composable
private fun SceneGrid(onSceneClick: (String) -> Unit) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        items(SceneInfo.all) { scene ->
            VBCard(Modifier.clickable { onSceneClick(scene.id) }) {
                Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(scene.name, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Spacer(Modifier.height(4.dp))
                    Text(scene.description, fontSize = 12.sp, color = TextSecondary)
                }
            }
        }
    }
}

@Composable
private fun PhraseList(sceneFilter: String?, onClearFilter: () -> Unit) {
    val phrases = remember(sceneFilter) {
        if (sceneFilter != null) DailyPhrase.all.filter { it.scene == sceneFilter } else DailyPhrase.all
    }

    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (sceneFilter != null) {
            item {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("筛选: ${SceneInfo.all.find { it.id == sceneFilter }?.name}", fontSize = 12.sp, color = TextSecondary)
                    Spacer(Modifier.weight(1f))
                    TextButton(onClick = onClearFilter) { Text("清除筛选", fontSize = 12.sp) }
                }
            }
        }
        items(phrases) { phrase -> PhraseRow(phrase) }
    }
}

@Composable
private fun PhraseRow(phrase: DailyPhrase) {
    var expanded by remember { mutableStateOf(false) }

    VBCard(Modifier.clickable { expanded = !expanded }) {
        Column(Modifier.padding(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(phrase.vi, fontWeight = FontWeight.Bold)
                    Text(phrase.zh, fontSize = 12.sp, color = TextSecondary)
                }
                Icon(
                    if (expanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    null, tint = TextTertiary,
                )
            }
            AnimatedVisibility(expanded) {
                Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(phrase.pinyin, fontSize = 12.sp, color = TextSecondary, modifier = Modifier.weight(1f))
                    ActionButton(Icons.Default.VolumeUp) { TTSHelper.speakVietnamese(phrase.vi) }
                    FilledIconButton(
                        onClick = { TTSHelper.speakChinese(phrase.zh) },
                        modifier = Modifier.size(32.dp),
                        shape = CircleShape,
                        colors = IconButtonDefaults.filledIconButtonColors(containerColor = TranslationAccent.copy(0.1f), contentColor = TranslationAccent),
                    ) { Icon(Icons.Default.Abc, null, Modifier.size(16.dp)) }
                }
            }
        }
    }
}
