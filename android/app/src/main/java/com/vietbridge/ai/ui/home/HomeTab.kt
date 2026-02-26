package com.vietbridge.ai.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.vietbridge.ai.data.model.ChatMessage
import com.vietbridge.ai.data.model.SceneInfo
import com.vietbridge.ai.ui.components.LoadingDots
import com.vietbridge.ai.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeTab(modifier: Modifier = Modifier) {
    val vm: ChatViewModel = viewModel()
    val state by vm.state.collectAsState()
    var inputText by remember { mutableStateOf("") }
    var showTaskDrawer by remember { mutableStateOf(false) }
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()

    // Auto-scroll on new messages
    LaunchedEffect(state.messages.size, state.streamingContent) {
        if (state.messages.isNotEmpty()) {
            listState.animateScrollToItem(state.messages.size - 1 + if (state.isStreaming) 1 else 0)
        }
    }

    Column(modifier.fillMaxSize()) {
        // Top bar
        CenterAlignedTopAppBar(
            title = { Text("VietBridge AI", fontWeight = FontWeight.Bold, fontSize = 18.sp) },
            navigationIcon = {
                IconButton(onClick = { vm.newConversation() }) {
                    Icon(Icons.Default.Add, "新对话")
                }
            },
            colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = BgPrimary),
        )

        // Scene chips
        SceneChips(selected = state.selectedScene, onSelect = { vm.setScene(it) })

        // Messages
        LazyColumn(
            state = listState,
            modifier = Modifier.weight(1f).fillMaxWidth(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            if (state.messages.isEmpty()) {
                item { EmptyState() }
            }
            items(state.messages, key = { it.id }) { msg ->
                MessageBubble(msg)
            }
            if (state.isStreaming) {
                item { StreamingBubble(state.streamingContent) }
            }
        }

        // Input bar
        InputBar(
            text = inputText,
            onTextChange = { inputText = it },
            onSend = {
                vm.send(inputText)
                inputText = ""
                scope.launch { listState.animateScrollToItem(state.messages.size) }
            },
            onTaskClick = { showTaskDrawer = true },
            isStreaming = state.isStreaming,
            selectedTask = state.selectedTask,
        )
    }

    // Task drawer
    if (showTaskDrawer) {
        TaskDrawerSheet(
            selectedTask = state.selectedTask,
            langDir = state.langDir,
            tone = state.tone,
            onTaskChange = { vm.setTask(it) },
            onLangDirChange = { vm.setLangDir(it) },
            onToneChange = { vm.setTone(it) },
            onDismiss = { showTaskDrawer = false },
        )
    }
}

// ── Scene Chips ─────────────────────────────────────────────────────────

@Composable
private fun SceneChips(selected: String, onSelect: (String) -> Unit) {
    LazyRow(
        contentPadding = PaddingValues(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.padding(vertical = 8.dp),
    ) {
        items(SceneInfo.all) { scene ->
            FilterChip(
                selected = selected == scene.id,
                onClick = { onSelect(scene.id) },
                label = { Text(scene.name, fontSize = 12.sp, fontWeight = FontWeight.Bold) },
                shape = CircleShape,
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = TextPrimary,
                    selectedLabelColor = BgPrimary,
                    containerColor = BgInput,
                    labelColor = TextSecondary,
                ),
                border = null,
            )
        }
    }
}

// ── Message Bubble ──────────────────────────────────────────────────────

@Composable
private fun MessageBubble(msg: ChatMessage) {
    val isUser = msg.role == ChatMessage.MessageRole.USER
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start,
    ) {
        Box(
            modifier = Modifier
                .widthIn(max = 300.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(if (isUser) TextPrimary else BgCard)
                .padding(12.dp),
        ) {
            Text(
                msg.content,
                color = if (isUser) BgPrimary else TextPrimary,
                fontSize = 15.sp,
            )
        }
    }
}

// ── Streaming Bubble ────────────────────────────────────────────────────

@Composable
private fun StreamingBubble(content: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Start) {
        Box(
            Modifier.widthIn(max = 300.dp).clip(RoundedCornerShape(16.dp)).background(BgCard).padding(12.dp),
        ) {
            if (content.isEmpty()) LoadingDots()
            else Text(content, color = TextPrimary, fontSize = 15.sp)
        }
    }
}

// ── Empty State ─────────────────────────────────────────────────────────

@Composable
private fun EmptyState() {
    Column(
        modifier = Modifier.fillMaxWidth().padding(top = 80.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(Icons.Default.Language, null, Modifier.size(48.dp), tint = TextTertiary)
        Spacer(Modifier.height(16.dp))
        Text("你好！我是 VietBridge AI", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = TextPrimary)
        Spacer(Modifier.height(8.dp))
        Text(
            "输入中文或越南语，我来帮你翻译、回复建议、风险评估或教你越南语",
            fontSize = 14.sp, color = TextSecondary,
            modifier = Modifier.padding(horizontal = 32.dp),
            lineHeight = 20.sp,
        )
    }
}

// ── Input Bar ───────────────────────────────────────────────────────────

@Composable
private fun InputBar(
    text: String,
    onTextChange: (String) -> Unit,
    onSend: () -> Unit,
    onTaskClick: () -> Unit,
    isStreaming: Boolean,
    selectedTask: String?,
) {
    HorizontalDivider(color = BorderLight)
    Row(
        modifier = Modifier.fillMaxWidth().background(BgPrimary).padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        // Task button
        IconButton(onClick = onTaskClick, modifier = Modifier.size(36.dp)) {
            Icon(
                when (selectedTask) {
                    "translate" -> Icons.Default.Translate
                    "reply" -> Icons.Default.Forum
                    "risk" -> Icons.Default.Shield
                    "learn" -> Icons.Default.School
                    else -> Icons.Default.GridView
                },
                null, tint = TextSecondary,
            )
        }

        // Text field
        OutlinedTextField(
            value = text,
            onValueChange = onTextChange,
            placeholder = { Text("输入中文或越南语...", fontSize = 14.sp) },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(20.dp),
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedContainerColor = BgInput,
                focusedContainerColor = BgInput,
                unfocusedBorderColor = BgInput,
                focusedBorderColor = BorderLight,
            ),
            maxLines = 4,
            singleLine = false,
        )

        // Send button
        IconButton(
            onClick = onSend,
            enabled = text.isNotBlank() && !isStreaming,
            modifier = Modifier.size(36.dp),
        ) {
            Icon(Icons.AutoMirrored.Filled.Send, null,
                tint = if (text.isNotBlank()) TextPrimary else TextTertiary)
        }
    }
}
