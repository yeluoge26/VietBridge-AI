import SwiftUI
import PhotosUI

struct ScanTab: View {
    @State private var vm = ScanViewModel()
    @State private var showPhotoPicker = false
    @State private var showCamera = false
    @State private var selectedItem: PhotosPickerItem?

    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(alignment: .leading, spacing: 2) {
                Text("拍照翻译")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(.textPrimary)
                Text("拍照或选择图片，识别越南语文字")
                    .font(.system(size: 13))
                    .foregroundStyle(.textTertiary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 16)
            .padding(.top, 16)
            .padding(.bottom, 12)
            .background(Color.bgPrimary)

            ScrollView {
                VStack(spacing: 16) {
                    // Document type selector
                    docTypeSelector

                    if let image = vm.image {
                        // Show selected image
                        imagePreview(image)

                        // OCR result
                        if vm.ocrLoading {
                            ProgressView("识别中...")
                                .padding(.vertical, 20)
                        } else if !vm.ocrText.isEmpty {
                            ocrResultView
                        }

                        // Analysis result
                        if vm.analyzeLoading {
                            ProgressView("AI分析中...")
                                .padding(.vertical, 20)
                        } else if let result = vm.analysisResult {
                            analysisResultView(result)
                        }

                        // Reset button
                        Button {
                            vm.reset()
                        } label: {
                            Text("重新扫描")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundStyle(.textSecondary)
                                .padding(.horizontal, 20)
                                .padding(.vertical, 10)
                                .background(Color.bgCard)
                                .clipShape(Capsule())
                                .overlay(Capsule().stroke(Color.borderLight, lineWidth: 1))
                        }
                        .padding(.top, 8)
                    } else {
                        // Photo selection area
                        photoSelectionArea
                    }

                    if let error = vm.error {
                        Text(error)
                            .font(.system(size: 13))
                            .foregroundStyle(.red)
                            .padding(12)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.red.opacity(0.05))
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }
                .padding(16)
            }
        }
        .background(Color.bgPrimary)
        .photosPicker(isPresented: $showPhotoPicker, selection: $selectedItem, matching: .images)
        .onChange(of: selectedItem) { _, item in
            guard let item else { return }
            Task {
                if let data = try? await item.loadTransferable(type: Data.self),
                   let uiImage = UIImage(data: data) {
                    vm.performOCR(on: uiImage)
                }
            }
        }
        .fullScreenCover(isPresented: $showCamera) {
            CameraPickerView { uiImage in
                if let uiImage {
                    vm.performOCR(on: uiImage)
                }
            }
        }
    }

    // MARK: - Document Type

    private var docTypeSelector: some View {
        HStack(spacing: 8) {
            ForEach(ScanViewModel.DocumentType.allCases, id: \.self) { type in
                Button {
                    vm.documentType = type
                } label: {
                    VStack(spacing: 4) {
                        Image(systemName: type.icon)
                            .font(.system(size: 16))
                        Text(type.label)
                            .font(.system(size: 12, weight: .medium))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .foregroundStyle(vm.documentType == type ? .white : Color.textSecondary)
                    .background(vm.documentType == type ? Color.textPrimary : Color.bgCard)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .overlay(
                        RoundedRectangle(cornerRadius: 10)
                            .stroke(vm.documentType == type ? Color.clear : Color.borderLight, lineWidth: 1)
                    )
                }
            }
        }
    }

    // MARK: - Photo Selection

    private var photoSelectionArea: some View {
        VStack(spacing: 16) {
            Spacer().frame(height: 20)

            Image(systemName: "camera.viewfinder")
                .font(.system(size: 48))
                .foregroundStyle(.textTertiary)

            Text("选择图片进行文字识别")
                .font(.system(size: 15))
                .foregroundStyle(.textSecondary)

            HStack(spacing: 16) {
                Button {
                    showCamera = true
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "camera.fill")
                        Text("拍照")
                    }
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.textPrimary)
                    .clipShape(Capsule())
                }

                Button {
                    showPhotoPicker = true
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "photo.on.rectangle")
                        Text("相册")
                    }
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(.textPrimary)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.bgCard)
                    .clipShape(Capsule())
                    .overlay(Capsule().stroke(Color.borderLight, lineWidth: 1))
                }
            }

            Spacer()
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Image Preview

    private func imagePreview(_ uiImage: UIImage) -> some View {
        Image(uiImage: uiImage)
            .resizable()
            .scaledToFit()
            .frame(maxHeight: 250)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.borderLight, lineWidth: 1)
            )
    }

    // MARK: - OCR Result

    private var ocrResultView: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("识别结果")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(.textPrimary)
                Spacer()
                Button {
                    UIPasteboard.general.string = vm.ocrText
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "doc.on.doc")
                        Text("复制")
                    }
                    .font(.system(size: 12))
                    .foregroundStyle(.textSecondary)
                }
            }

            Text(vm.ocrText)
                .font(.system(size: 13))
                .foregroundStyle(.textPrimary)
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.bgInput)
                .clipShape(RoundedRectangle(cornerRadius: 8))

            Button {
                vm.analyzeText()
            } label: {
                HStack(spacing: 6) {
                    Image(systemName: "sparkles")
                    Text("AI智能分析")
                }
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(Color.vbAccent)
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding(16)
        .cardStyle()
    }

    // MARK: - Analysis Result

    private func analysisResultView(_ result: OcrAnalysisResult) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 4) {
                Image(systemName: "sparkles")
                    .font(.system(size: 12))
                    .foregroundStyle(.vbAccent)
                Text("AI分析结果")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(.vbAccent)
            }

            if let data = result.data {
                if let summary = data.summaryZh {
                    Text(summary)
                        .font(.system(size: 13))
                        .foregroundStyle(.textPrimary)
                        .padding(10)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.bgInput)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }

                if let items = data.items, !items.isEmpty {
                    Text("识别项目")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(.textPrimary)

                    ForEach(items) { item in
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                if let vi = item.nameVi {
                                    Text(vi)
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundStyle(.textPrimary)
                                }
                                if let zh = item.nameZh {
                                    Text(zh)
                                        .font(.system(size: 12))
                                        .foregroundStyle(.textSecondary)
                                }
                            }
                            Spacer()
                            if let price = item.price {
                                Text(price)
                                    .font(.system(size: 13, weight: .semibold))
                                    .foregroundStyle(item.priceReasonable == false ? .red : .textPrimary)
                            }
                        }
                        .padding(8)
                        .background(Color.bgInput)
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                    }
                }

                if let total = data.totalEstimate {
                    HStack {
                        Text("预估总计")
                            .font(.system(size: 13, weight: .semibold))
                        Spacer()
                        Text(total)
                            .font(.system(size: 15, weight: .bold))
                            .foregroundStyle(.vbAccent)
                    }
                    .padding(10)
                    .background(Color.vbAccent.opacity(0.05))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }

                if let warnings = data.warnings, !warnings.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        ForEach(warnings, id: \.self) { w in
                            Text("⚠️ \(w)")
                                .font(.system(size: 12))
                                .foregroundStyle(Color(hex: "#92722E"))
                        }
                    }
                    .padding(10)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(hex: "#FFF8E1"))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
            }
        }
        .padding(16)
        .cardStyle()
    }
}

// MARK: - Camera Picker (UIImagePickerController wrapper)

struct CameraPickerView: UIViewControllerRepresentable {
    let onImagePicked: (UIImage?) -> Void

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(onImagePicked: onImagePicked)
    }

    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let onImagePicked: (UIImage?) -> Void

        init(onImagePicked: @escaping (UIImage?) -> Void) {
            self.onImagePicked = onImagePicked
        }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            let image = info[.originalImage] as? UIImage
            onImagePicked(image)
            picker.dismiss(animated: true)
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            onImagePicked(nil)
            picker.dismiss(animated: true)
        }
    }
}
