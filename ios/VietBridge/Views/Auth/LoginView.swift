// ============================================================================
// VietBridge AI — Login View
// ============================================================================

import SwiftUI

struct LoginView: View {
    @Environment(AppState.self) private var appState
    @State private var viewModel = AuthViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 32) {
                    // Logo
                    VStack(spacing: 12) {
                        Image(systemName: "globe.asia.australia.fill")
                            .font(.system(size: 56))
                            .foregroundStyle(.accent)
                        Text("VietBridge AI")
                            .font(.title.bold())
                            .foregroundStyle(.textPrimary)
                        Text("在越华人智能助手")
                            .font(.subheadline)
                            .foregroundStyle(.textSecondary)
                    }
                    .padding(.top, 60)

                    // Form
                    VStack(spacing: 16) {
                        switch viewModel.mode {
                        case .login:
                            loginFields
                        case .register:
                            registerFields
                        case .forgotPassword:
                            forgotPasswordFields
                        }
                    }
                    .padding(.horizontal, 24)

                    // Error / Success
                    if let error = viewModel.errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(.riskRed)
                            .padding(.horizontal, 24)
                    }

                    if let success = viewModel.successMessage {
                        Text(success)
                            .font(.caption)
                            .foregroundStyle(.accentGreen)
                            .padding(.horizontal, 24)
                    }

                    // Primary button
                    Button {
                        Task { await primaryAction() }
                    } label: {
                        Group {
                            if viewModel.isLoading {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Text(primaryButtonTitle)
                                    .font(.body.bold())
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(Color.textPrimary)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                    .disabled(viewModel.isLoading)
                    .padding(.horizontal, 24)

                    // Mode switch
                    modeSwitch
                        .padding(.horizontal, 24)
                }
                .padding(.bottom, 40)
            }
            .background(Color.bgPrimary)
            .scrollDismissesKeyboard(.interactively)
        }
    }

    // MARK: - Fields

    private var loginFields: some View {
        Group {
            VBTextField(
                placeholder: "邮箱",
                text: $viewModel.email,
                icon: "envelope",
                keyboardType: .emailAddress,
                textContentType: .emailAddress
            )
            VBSecureField(
                placeholder: "密码",
                text: $viewModel.password,
                icon: "lock"
            )
        }
    }

    private var registerFields: some View {
        Group {
            VBTextField(
                placeholder: "姓名",
                text: $viewModel.name,
                icon: "person",
                textContentType: .name
            )
            VBTextField(
                placeholder: "邮箱",
                text: $viewModel.email,
                icon: "envelope",
                keyboardType: .emailAddress,
                textContentType: .emailAddress
            )
            VBSecureField(
                placeholder: "密码",
                text: $viewModel.password,
                icon: "lock"
            )
            VBSecureField(
                placeholder: "确认密码",
                text: $viewModel.confirmPassword,
                icon: "lock.shield"
            )
        }
    }

    private var forgotPasswordFields: some View {
        VBTextField(
            placeholder: "邮箱",
            text: $viewModel.email,
            icon: "envelope",
            keyboardType: .emailAddress,
            textContentType: .emailAddress
        )
    }

    // MARK: - Mode Switch

    private var modeSwitch: some View {
        VStack(spacing: 12) {
            switch viewModel.mode {
            case .login:
                Button("还没有账号？注册") {
                    viewModel.clearMessages()
                    viewModel.mode = .register
                }
                Button("忘记密码？") {
                    viewModel.clearMessages()
                    viewModel.mode = .forgotPassword
                }
            case .register:
                Button("已有账号？登录") {
                    viewModel.clearMessages()
                    viewModel.mode = .login
                }
            case .forgotPassword:
                Button("返回登录") {
                    viewModel.clearMessages()
                    viewModel.mode = .login
                }
            }
        }
        .font(.footnote)
        .foregroundStyle(.textSecondary)
    }

    // MARK: - Actions

    private var primaryButtonTitle: String {
        switch viewModel.mode {
        case .login: "登录"
        case .register: "注册"
        case .forgotPassword: "发送重置链接"
        }
    }

    private func primaryAction() async {
        switch viewModel.mode {
        case .login:
            await viewModel.login(appState: appState)
        case .register:
            await viewModel.register(appState: appState)
        case .forgotPassword:
            await viewModel.forgotPassword()
        }
    }
}

// MARK: - Custom Text Fields

struct VBTextField: View {
    let placeholder: String
    @Binding var text: String
    var icon: String = ""
    var keyboardType: UIKeyboardType = .default
    var textContentType: UITextContentType?

    var body: some View {
        HStack(spacing: 12) {
            if !icon.isEmpty {
                Image(systemName: icon)
                    .foregroundStyle(.textTertiary)
                    .frame(width: 20)
            }
            TextField(placeholder, text: $text)
                .keyboardType(keyboardType)
                .textContentType(textContentType)
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)
        }
        .padding(.horizontal, 16)
        .frame(height: 50)
        .background(Color.bgInput)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct VBSecureField: View {
    let placeholder: String
    @Binding var text: String
    var icon: String = ""
    @State private var isVisible = false

    var body: some View {
        HStack(spacing: 12) {
            if !icon.isEmpty {
                Image(systemName: icon)
                    .foregroundStyle(.textTertiary)
                    .frame(width: 20)
            }
            Group {
                if isVisible {
                    TextField(placeholder, text: $text)
                } else {
                    SecureField(placeholder, text: $text)
                }
            }
            .textContentType(.password)
            .autocorrectionDisabled()
            .textInputAutocapitalization(.never)

            Button {
                isVisible.toggle()
            } label: {
                Image(systemName: isVisible ? "eye.slash" : "eye")
                    .foregroundStyle(.textTertiary)
            }
        }
        .padding(.horizontal, 16)
        .frame(height: 50)
        .background(Color.bgInput)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}
