import Foundation

struct InsultResponse: Codable {
    let roasts: [String]
}

struct InsultRequest: Codable {
    let topic: String
    let language: String
    let isEmail: Bool
    let plan: String // "trial", "standard", "savage", "elite"
}
