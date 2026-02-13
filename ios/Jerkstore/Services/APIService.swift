import Foundation

enum APIError: Error {
    case invalidURL
    case networkError(Error)
    case invalidResponse
    case decodingError(Error)
    case serverError(String)
}

class APIService {
    static let shared = APIService()
    
    // Change this to your local IP for dev, or the prod URL
    private let baseURL = "https://jerkstore.proximalcoast.com/api" 
    
    func generateInsult(topic: String, isEmail: Bool = false) async throws -> [String] {
        guard let url = URL(string: "\(baseURL)/generate-insult") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Mocking the subscription plan for now - in a real app this would come from the user's receipt/entitlement
        // We'll simulate a 'standard' user for the native app MVP unless IAP is active
        let body = InsultRequest(
            topic: topic,
            language: "English",
            isEmail: isEmail,
            plan: "standard" // TODO: Hook up to StoreKitManager
        )
        
        do {
            request.httpBody = try JSONEncoder().encode(body)
        } catch {
            throw APIError.networkError(error)
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        if !(200...299).contains(httpResponse.statusCode) {
             let errorMessage = String(data: data, encoding: .utf8) ?? "Unknown server error"
            throw APIError.serverError(errorMessage)
        }
        
        do {
            let result = try JSONDecoder().decode(InsultResponse.self, from: data)
            return result.roasts
        } catch {
            throw APIError.decodingError(error)
        }
    }
}
