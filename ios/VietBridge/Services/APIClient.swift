import Foundation

actor APIClient {
    static let shared = APIClient()

    private let baseURL = "https://api.vietbrige.com"

    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.dateDecodingStrategy = .iso8601
        return d
    }()

    private func buildRequest(_ path: String, method: String = "GET", body: (any Encodable)? = nil) throws -> URLRequest {
        guard let url = URL(string: baseURL + path) else { throw APIError.invalidURL }
        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("VietBridge-iOS/1.0", forHTTPHeaderField: "User-Agent")

        if let token = KeychainHelper.load(key: "authToken") {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        } else {
            var guestId = UserDefaults.standard.string(forKey: "guestId")
            if guestId == nil {
                guestId = UUID().uuidString.lowercased()
                UserDefaults.standard.set(guestId, forKey: "guestId")
            }
            req.setValue(guestId!, forHTTPHeaderField: "X-Guest-Id")
        }

        if let body {
            req.httpBody = try JSONEncoder().encode(body)
        }
        return req
    }

    func get<T: Decodable>(_ path: String) async throws -> T {
        let req = try buildRequest(path)
        let (data, response) = try await URLSession.shared.data(for: req)
        try checkResponse(response)
        return try decoder.decode(T.self, from: data)
    }

    func post<T: Decodable>(_ path: String, body: some Encodable) async throws -> T {
        let req = try buildRequest(path, method: "POST", body: body)
        let (data, response) = try await URLSession.shared.data(for: req)
        try checkResponse(response)
        return try decoder.decode(T.self, from: data)
    }

    func postRaw(_ path: String, body: some Encodable) async throws -> Data {
        let req = try buildRequest(path, method: "POST", body: body)
        let (data, response) = try await URLSession.shared.data(for: req)
        try checkResponse(response)
        return data
    }

    func streamSSE(_ path: String, body: some Encodable) async throws -> URLSession.AsyncBytes {
        let req = try buildRequest(path, method: "POST", body: body)
        let (bytes, response) = try await URLSession.shared.bytes(for: req)
        try checkResponse(response)
        return bytes
    }

    func delete(_ path: String) async throws {
        let req = try buildRequest(path, method: "DELETE")
        let (_, response) = try await URLSession.shared.data(for: req)
        try checkResponse(response)
    }

    private func checkResponse(_ response: URLResponse) throws {
        guard let http = response as? HTTPURLResponse else { return }
        if http.statusCode == 401 { throw APIError.unauthorized }
        guard (200...299).contains(http.statusCode) else {
            throw APIError.httpError(http.statusCode)
        }
    }
}

enum APIError: LocalizedError {
    case invalidURL
    case unauthorized
    case httpError(Int)

    var errorDescription: String? {
        switch self {
        case .invalidURL: "Invalid URL"
        case .unauthorized: "请先登录"
        case .httpError(let code): "请求失败 (\(code))"
        }
    }
}
