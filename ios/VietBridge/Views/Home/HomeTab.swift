// ============================================================================
// VietBridge AI — Home (Chat) Tab
// Main chat interface with task/scene selectors
// ============================================================================

import SwiftUI

struct HomeTab: View {
    @Environment(AppState.self) private var appState
    @State private var chatVM = ChatViewModel()
    @State private var showTaskDrawer = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Scene chips
                SceneChips(selected: $chatVM.selectedScene)

                // Chat messages
                ChatView(viewModel: chatVM)

                // Input bar
                InputBar(viewModel: chatVM, showTaskDrawer: $showTaskDrawer)
            }
            .background(Color.bgPrimary)
            .navigationTitle("VietBridge AI")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        chatVM.newConversation()
                    } label: {
                        Image(systemName: "plus.bubble")
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    NavigationLink {
                        ConversationListView()
                    } label: {
                        Image(systemName: "clock.arrow.circlepath")
                    }
                }
            }
            .sheet(isPresented: $showTaskDrawer) {
                TaskDrawer(
                    selectedTask: $chatVM.selectedTask,
                    langDir: $chatVM.langDir,
                    tone: $chatVM.tone
                )
                .presentationDetents([.medium])
                .presentationDragIndicator(.visible)
            }
        }
    }
}

// MARK: - Conversation List (placeholder)

struct ConversationListView: View {
    @State private var conversations: [Conversation] = []
    @State private var isLoading = true
    private let service = ConversationService()

    var body: some View {
        List {
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .listRowBackground(Color.bgPrimary)
            } else if conversations.isEmpty {
                ContentUnavailableView(
                    "暂无对话",
                    systemImage: "bubble.left.and.bubble.right",
                    description: Text("开始对话后会显示在这里")
                )
            } else {
                ForEach(conversations) { conv in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(conv.title ?? "对话")
                            .font(.body.bold())
                        HStack {
                            Text(conv.taskType)
                                .font(.caption)
                                .foregroundStyle(.textSecondary)
                            Spacer()
                            Text("\(conv.count?.messages ?? 0) 条消息")
                                .font(.caption)
                                .foregroundStyle(.textTertiary)
                        }
                    }
                    .padding(.vertical, 4)
                }
                .onDelete { indexSet in
                    Task { await deleteConversation(at: indexSet) }
                }
            }
        }
        .navigationTitle("对话历史")
        .listStyle(.plain)
        .background(Color.bgPrimary)
        .task { await load() }
    }

    private func load() async {
        do {
            let result = try await service.list()
            conversations = result.conversations
        } catch {}
        isLoading = false
    }

    private func deleteConversation(at indexSet: IndexSet) async {
        for index in indexSet {
            let conv = conversations[index]
            try? await service.delete(id: conv.id)
            conversations.remove(at: index)
        }
    }
}
