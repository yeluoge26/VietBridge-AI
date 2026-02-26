package com.vietbridge.ai.ui.scan

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vietbridge.ai.data.model.DocumentType
import com.vietbridge.ai.data.model.OcrAnalyzeResponse
import com.vietbridge.ai.data.model.OcrAnalyzeRequest
import com.vietbridge.ai.data.remote.ApiClient
import com.vietbridge.ai.ui.components.VBCard
import com.vietbridge.ai.ui.theme.*
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.chinese.ChineseTextRecognizerOptions
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

enum class ScanState { IDLE, RECOGNIZING, ANALYZING, RESULT, ERROR }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScanTab(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var scanState by remember { mutableStateOf(ScanState.IDLE) }
    var docType by remember { mutableStateOf(DocumentType.MENU) }
    var result by remember { mutableStateOf<OcrAnalyzeResponse?>(null) }
    var errorMsg by remember { mutableStateOf("") }

    val imagePicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri ?: return@rememberLauncherForActivityResult
        scope.launch {
            scanState = ScanState.RECOGNIZING
            try {
                val image = InputImage.fromFilePath(context, uri)
                val recognizer = TextRecognition.getClient(ChineseTextRecognizerOptions.Builder().build())
                val visionText = recognizer.process(image).await()
                val ocrText = visionText.text
                if (ocrText.isBlank()) { scanState = ScanState.ERROR; errorMsg = "未能识别到文字"; return@launch }

                scanState = ScanState.ANALYZING
                result = ApiClient.api.ocrAnalyze(OcrAnalyzeRequest(ocrText, docType.name.lowercase()))
                scanState = ScanState.RESULT
            } catch (e: Exception) {
                errorMsg = e.message ?: "识别失败"
                scanState = ScanState.ERROR
            }
        }
    }

    Column(modifier.fillMaxSize()) {
        CenterAlignedTopAppBar(
            title = { Text("文档扫描", fontWeight = FontWeight.Bold, fontSize = 18.sp) },
            colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = BgPrimary),
        )

        Column(
            Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            when (scanState) {
                ScanState.IDLE -> {
                    // Document type
                    Text("文档类型", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        DocumentType.entries.forEach { type ->
                            FilterChip(
                                selected = docType == type,
                                onClick = { docType = type },
                                label = { Text(type.label, fontWeight = FontWeight.Bold, fontSize = 12.sp) },
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.weight(1f),
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = TextPrimary, selectedLabelColor = BgPrimary,
                                    containerColor = BgCard,
                                ),
                                border = null,
                            )
                        }
                    }

                    // Pick image
                    Button(
                        onClick = { imagePicker.launch("image/*") },
                        modifier = Modifier.fillMaxWidth().height(50.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = TextPrimary),
                    ) {
                        Icon(Icons.Default.PhotoLibrary, null, Modifier.size(20.dp))
                        Spacer(Modifier.width(8.dp))
                        Text("从相册选择", fontWeight = FontWeight.Bold)
                    }
                }

                ScanState.RECOGNIZING -> ProgressState("正在识别文字...")
                ScanState.ANALYZING -> ProgressState("正在分析文档...")

                ScanState.RESULT -> result?.let { res ->
                    res.data.summaryZh?.let {
                        VBCard { Column(Modifier.padding(16.dp)) {
                            Text("分析结果", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Spacer(Modifier.height(8.dp))
                            Text(it, color = TextPrimary)
                        } }
                    }
                    res.data.items?.takeIf { it.isNotEmpty() }?.let { items ->
                        VBCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("项目明细", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            items.forEach { item ->
                                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(BgInput).padding(10.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween) {
                                    Column {
                                        item.nameVi?.let { Text(it, fontWeight = FontWeight.Bold, fontSize = 14.sp) }
                                        item.nameZh?.let { Text(it, fontSize = 12.sp, color = TextSecondary) }
                                    }
                                    item.price?.let { Text(it, fontWeight = FontWeight.Bold,
                                        color = if (item.priceReasonable == false) RiskRed else VBAccent) }
                                }
                            }
                        } }
                    }
                    res.data.warnings?.takeIf { it.isNotEmpty() }?.let { warnings ->
                        VBCard { Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                Icon(Icons.Default.Warning, null, Modifier.size(16.dp), tint = RiskOrange)
                                Text("风险提示", fontWeight = FontWeight.Bold, color = RiskOrange)
                            }
                            warnings.forEach { Text("• $it", fontSize = 14.sp) }
                        } }
                    }
                    OutlinedButton(
                        onClick = { scanState = ScanState.IDLE; result = null },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                    ) { Text("重新扫描", fontWeight = FontWeight.Bold) }
                }

                ScanState.ERROR -> {
                    Column(Modifier.fillMaxWidth().padding(top = 80.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Default.Warning, null, Modifier.size(48.dp), tint = RiskOrange)
                        Spacer(Modifier.height(12.dp))
                        Text(errorMsg, color = TextSecondary)
                        Spacer(Modifier.height(16.dp))
                        TextButton(onClick = { scanState = ScanState.IDLE }) { Text("重试", fontWeight = FontWeight.Bold) }
                    }
                }
            }
        }
    }
}

@Composable
private fun ProgressState(title: String) {
    Column(
        Modifier.fillMaxWidth().padding(top = 80.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        CircularProgressIndicator(color = VBAccent)
        Spacer(Modifier.height(16.dp))
        Text(title, fontWeight = FontWeight.Bold, color = TextPrimary)
    }
}
