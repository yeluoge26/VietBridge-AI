// ============================================================================
// VietBridge AI — Auth View Model
// Manages login/register/forgot password state
// ============================================================================

import SwiftUI

@Observable
@MainActor
final class AuthViewModel {
    var email = ""
    var password = ""
    var name = ""
    var confirmPassword = ""
    var isLoading = false
    var errorMessage: String?
    var successMessage: String?
    var mode: AuthMode = .login

    enum AuthMode {
        case login
        case register
        case forgotPassword
    }

    private let authService = AuthService()

    func login(appState: AppState) async {
        guard validate() else { return }
        isLoading = true
        errorMessage = nil

        do {
            try await appState.login(email: email, password: password)
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func register(appState: AppState) async {
        guard validateRegister() else { return }
        isLoading = true
        errorMessage = nil

        do {
            try await appState.register(name: name, email: email, password: password)
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func forgotPassword() async {
        guard !email.isEmpty else {
            errorMessage = "请输入邮箱"
            return
        }
        isLoading = true
        errorMessage = nil

        do {
            try await authService.forgotPassword(email: email)
            successMessage = "重置链接已发送到您的邮箱"
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func clearMessages() {
        errorMessage = nil
        successMessage = nil
    }

    private func validate() -> Bool {
        if email.isEmpty || password.isEmpty {
            errorMessage = "请填写邮箱和密码"
            return false
        }
        return true
    }

    private func validateRegister() -> Bool {
        if name.isEmpty {
            errorMessage = "请填写姓名"
            return false
        }
        if email.isEmpty || password.isEmpty {
            errorMessage = "请填写邮箱和密码"
            return false
        }
        if password.count < 6 {
            errorMessage = "密码至少6个字符"
            return false
        }
        if password != confirmPassword {
            errorMessage = "两次密码输入不一致"
            return false
        }
        return true
    }
}
