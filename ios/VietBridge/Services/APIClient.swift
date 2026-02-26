// ============================================================================
// VietBridge AI — API Client
// Base HTTP client with JWT token interceptor
// ============================================================================

import Foundation

enum APIError: LocalizedError {
    case unauthorized
    case badRequest(String)
    case serverError(String)
    case networkError(Error)
    case decodingError(Error)

    var errorDescription: String? {
        switch self {
        case .unauthorized:
            "登录已过期，请重新登录"
        case .badRequest(let msg):
            msg
        case .serverError(let msg):
            msg
        case .networkError(let error):
            "网络连接失败: \(error.localizedDescription)"
        case .decodingError:
            "数据解析失败"
        }
    }
}

struct APIErrorResponse: Codable {
    let error: String
}

actor APIClient {
    static let shared = APIClient()

    #if DEBUG
    private let baseURL = "http://localhost:3000"
    #else
    private let baseURL = "https://vietbridge.ai"
    #endif

    private let session: URLSession
    private let decoder: JSONDecoder

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30
        config.timeoutIntervalForResource = 120
        session = URLSession(configuration: config)

        decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
    }

    // MARK: - Core Request

    func request<T: Decodable>(
        _ method: String,
        path: String,
        body: (any Encodable)? = nil,
        queryItems: [URLQueryItem]? = nil
    ) async throws -> T {
        let request = try buildRequest(method, path: path, body: body, queryItems: queryItems)
        let (data, response) = try await performRequest(request)
        try validateResponse(response, data: data)
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }

    func requestVoid(
        _ method: String,
        path: String,
        body: (any Encodable)? = nil,
        queryItems: [URLQueryItem]? = nil
    ) async throws {
        let request = try buildRequest(method, path: path, body: body, queryItems: queryItems)
        let (data, response) = try await performRequest(request)
        try validateResponse(response, data: data)
    }

    // MARK: - Streaming (SSE)

    func streamRequest(
        path: String,
        body: some Encodable
    ) async throws -> URLSession.AsyncBytes {
        var request = try buildRequest("POST", path: path, body: body)
        request.timeoutInterval = 120

        let (bytes, response) = try await session.bytes(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.serverError("无效的服务器响应")
        }

        if httpResponse.statusCode == 401 {
            throw APIError.unauthorized
        }

        if httpResponse.statusCode != 200 {
            throw APIError.serverError("服务器错误 (\(httpResponse.statusCode))")
        }

        return bytes
    }

    // MARK: - Private

    private func buildRequest(
        _ method: String,
        path: String,
        body: (any Encodable)? = nil,
        queryItems: [URLQueryItem]? = nil
    ) throws -> URLRequest {
        var components = URLComponents(string: baseURL + path)!
        if let queryItems { components.queryItems = queryItems }

        var request = URLRequest(url: components.url!)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("VietBridge-iOS/1.0", forHTTPHeaderField: "User-Agent")

        // Attach JWT token
        if let token = KeychainHelper.getToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        return request
    }

    private func performRequest(_ request: URLRequest) async throws -> (Data, URLResponse) {
        do {
            return try await session.data(for: request)
        } catch {
            throw APIError.networkError(error)
        }
    }

    private func validateResponse(_ response: URLResponse, data: Data) throws {
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.serverError("无效的服务器响应")
        }

        switch httpResponse.statusCode {
        case 200...299:
            return
        case 401:
            throw APIError.unauthorized
        case 400...499:
            let errorResponse = try? JSONDecoder().decode(APIErrorResponse.self, from: data)
            throw APIError.badRequest(errorResponse?.error ?? "请求错误")
        default:
            let errorResponse = try? JSONDecoder().decode(APIErrorResponse.self, from: data)
            throw APIError.serverError(errorResponse?.error ?? "服务器错误")
        }
    }
}
