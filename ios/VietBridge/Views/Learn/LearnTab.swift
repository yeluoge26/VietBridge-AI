// ============================================================================
// VietBridge AI — Learn Tab
// Daily phrases, scene grid, phrase library
// ============================================================================

import SwiftUI

struct LearnTab: View {
    @State private var viewModel = LearnViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Tab picker
                    Picker("", selection: $viewModel.selectedTab) {
                        Text("每日一句").tag(0)
                        Text("场景").tag(1)
                        Text("短语").tag(2)
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal, 16)

                    switch viewModel.selectedTab {
                    case 0:
                        dailyView
                    case 1:
                        sceneGridView
                    default:
                        phraseListView
                    }
                }
                .padding(.vertical, 16)
            }
            .background(Color.bgPrimary)
            .navigationTitle("学越语")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    // MARK: - Daily

    private var dailyView: some View {
        VStack(spacing: 12) {
            ForEach(viewModel.todayPhrases) { phrase in
                DailyCard(phrase: phrase)
            }
        }
        .padding(.horizontal, 16)
    }

    // MARK: - Scene Grid

    private var sceneGridView: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            ForEach(viewModel.scenes) { scene in
                Button {
                    viewModel.selectedScene = scene.id
                    viewModel.selectedTab = 2
                } label: {
                    VStack(spacing: 8) {
                        Image(systemName: scene.icon)
                            .font(.title2)
                        Text(scene.name)
                            .font(.subheadline.bold())
                        Text(scene.description)
                            .font(.caption)
                            .foregroundStyle(.textSecondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 20)
                    .background(Color.bgCard)
                    .foregroundStyle(.textPrimary)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .shadow(color: .black.opacity(0.04), radius: 4, y: 2)
                }
            }
        }
        .padding(.horizontal, 16)
    }

    // MARK: - Phrase List

    private var phraseListView: some View {
        VStack(spacing: 8) {
            // Scene filter
            if viewModel.selectedScene != nil {
                HStack {
                    Text("筛选: \(viewModel.scenes.first { $0.id == viewModel.selectedScene }?.name ?? "")")
                        .font(.caption)
                        .foregroundStyle(.textSecondary)
                    Spacer()
                    Button("清除筛选") {
                        viewModel.selectedScene = nil
                    }
                    .font(.caption)
                }
                .padding(.horizontal, 16)
            }

            ForEach(viewModel.filteredPhrases) { phrase in
                PhraseRow(phrase: phrase)
            }
        }
        .padding(.horizontal, 16)
    }
}

// MARK: - Phrase Row

struct PhraseRow: View {
    let phrase: DailyPhrase
    @State private var isExpanded = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Button {
                withAnimation(.spring(duration: 0.2)) {
                    isExpanded.toggle()
                }
            } label: {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(phrase.vi)
                            .font(.body.bold())
                            .foregroundStyle(.textPrimary)
                        Text(phrase.zh)
                            .font(.caption)
                            .foregroundStyle(.textSecondary)
                    }
                    Spacer()
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundStyle(.textTertiary)
                }
            }

            if isExpanded {
                HStack(spacing: 4) {
                    Text(phrase.pinyin)
                        .font(.caption)
                        .foregroundStyle(.textSecondary)
                    Spacer()
                    Button {
                        TTSService.shared.speakVietnamese(phrase.vi)
                    } label: {
                        Image(systemName: "speaker.wave.2.fill")
                            .font(.caption)
                            .foregroundStyle(.accent)
                            .padding(6)
                            .background(Color.accent.opacity(0.1))
                            .clipShape(Circle())
                    }
                    Button {
                        TTSService.shared.speakChinese(phrase.zh)
                    } label: {
                        Image(systemName: "character.textbox")
                            .font(.caption)
                            .foregroundStyle(.translationAccent)
                            .padding(6)
                            .background(Color.translationAccent.opacity(0.1))
                            .clipShape(Circle())
                    }
                }
            }
        }
        .padding(12)
        .background(Color.bgCard)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
