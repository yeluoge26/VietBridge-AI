// ============================================================================
// VietBridge AI — Scan Tab
// Document scanning with camera/photo library + OCR analysis
// ============================================================================

import SwiftUI
import PhotosUI

struct ScanTab: View {
    @State private var viewModel = ScanViewModel()
    @State private var selectedItem: PhotosPickerItem?
    @State private var showCamera = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    switch viewModel.state {
                    case .idle:
                        idleState
                    case .recognizing:
                        progressState(title: "正在识别文字...", icon: "text.viewfinder")
                    case .analyzing:
                        progressState(title: "正在分析文档...", icon: "brain")
                    case .result:
                        if let result = viewModel.result {
                            resultView(result)
                        }
                    case .error(let msg):
                        errorState(msg)
                    }
                }
                .padding(16)
            }
            .background(Color.bgPrimary)
            .navigationTitle("文档扫描")
            .navigationBarTitleDisplayMode(.inline)
        }
        .onChange(of: selectedItem) { _, item in
            Task {
                if let data = try? await item?.loadTransferable(type: Data.self),
                   let image = UIImage(data: data) {
                    await viewModel.processImage(image)
                }
            }
        }
    }

    // MARK: - Idle State

    private var idleState: some View {
        VStack(spacing: 24) {
            // Document type selector
            VStack(alignment: .leading, spacing: 12) {
                Text("文档类型")
                    .font(.headline)
                HStack(spacing: 10) {
                    ForEach(DocumentType.allCases) { type in
                        Button {
                            viewModel.documentType = type
                        } label: {
                            VStack(spacing: 6) {
                                Image(systemName: type.icon)
                                    .font(.title3)
                                Text(type.label)
                                    .font(.caption.bold())
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(
                                viewModel.documentType == type
                                ? Color.textPrimary
                                : Color.bgCard
                            )
                            .foregroundStyle(
                                viewModel.documentType == type
                                ? .white
                                : .textSecondary
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                }
            }

            // Capture buttons
            VStack(spacing: 12) {
                PhotosPicker(selection: $selectedItem, matching: .images) {
                    Label("从相册选择", systemImage: "photo.on.rectangle")
                        .font(.body.bold())
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.textPrimary)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                Button {
                    showCamera = true
                } label: {
                    Label("拍照", systemImage: "camera")
                        .font(.body.bold())
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.bgCard)
                        .foregroundStyle(.textPrimary)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12)
                                .stroke(Color.borderLight, lineWidth: 1)
                        )
                }
            }

            // Preview
            if let image = viewModel.selectedImage {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
                    .frame(maxHeight: 200)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
        }
    }

    // MARK: - Progress

    private func progressState(title: String, icon: String) -> some View {
        VStack(spacing: 16) {
            Spacer().frame(height: 80)
            Image(systemName: icon)
                .font(.system(size: 48))
                .foregroundStyle(.textTertiary)
                .symbolEffect(.pulse)
            Text(title)
                .font(.headline)
                .foregroundStyle(.textPrimary)
            ProgressView()
        }
    }

    // MARK: - Result

    private func resultView(_ response: OcrAnalyzeResponse) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // Summary
            if let summary = response.data.summaryZh {
                VStack(alignment: .leading, spacing: 8) {
                    Text("分析结果")
                        .font(.headline)
                    Text(summary)
                        .font(.body)
                        .foregroundStyle(.textPrimary)
                }
                .padding(16)
                .cardStyle()
            }

            // Items
            if let items = response.data.items, !items.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("项目明细")
                        .font(.headline)
                    ForEach(items) { item in
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                if let vi = item.nameVi {
                                    Text(vi).font(.subheadline.bold())
                                }
                                if let zh = item.nameZh {
                                    Text(zh)
                                        .font(.caption)
                                        .foregroundStyle(.textSecondary)
                                }
                            }
                            Spacer()
                            if let price = item.price {
                                Text(price)
                                    .font(.subheadline.bold())
                                    .foregroundStyle(
                                        item.priceReasonable == false
                                        ? .riskRed
                                        : .accentGreen
                                    )
                            }
                        }
                        .padding(10)
                        .background(Color.bgInput)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }
                .padding(16)
                .cardStyle()
            }

            // Warnings
            if let warnings = response.data.warnings, !warnings.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Label("风险提示", systemImage: "exclamationmark.triangle.fill")
                        .font(.headline)
                        .foregroundStyle(.riskOrange)
                    ForEach(warnings, id: \.self) { warning in
                        Text("• \(warning)")
                            .font(.subheadline)
                            .foregroundStyle(.textPrimary)
                    }
                }
                .padding(16)
                .cardStyle()
            }

            // Reset button
            Button {
                viewModel.reset()
                selectedItem = nil
            } label: {
                Text("重新扫描")
                    .font(.body.bold())
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(Color.bgCard)
                    .foregroundStyle(.textPrimary)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.borderLight, lineWidth: 1)
                    )
            }
        }
    }

    // MARK: - Error

    private func errorState(_ message: String) -> some View {
        VStack(spacing: 16) {
            Spacer().frame(height: 80)
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundStyle(.riskOrange)
            Text(message)
                .font(.body)
                .foregroundStyle(.textSecondary)
                .multilineTextAlignment(.center)
            Button("重试") {
                viewModel.reset()
                selectedItem = nil
            }
            .font(.body.bold())
            .foregroundStyle(.textPrimary)
        }
    }
}
