import Foundation
import Combine

@MainActor
class InsultGeneratorViewModel: ObservableObject {
    @Published var topic: String = ""
    @Published var roasts: [String] = []
    @Published var isGenerating: Bool = false
    @Published var errorMessage: String?
    @Published var isEmailMode: Bool = false
    
    private let apiService = APIService.shared
    
    var canGenerate: Bool {
        return !topic.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    
    func generateInsult() async {
        guard canGenerate else { return }
        
        isGenerating = true
        errorMessage = nil
        roasts = []
        
        do {
            let result = try await apiService.generateInsult(topic: topic, isEmail: isEmailMode)
            roasts = result
        } catch {
             if let apiError = error as? APIError, case .serverError(let msg) = apiError {
                 errorMessage = msg
             } else {
                 errorMessage = "Failed to generate insult. The internet is protecting you."
             }
        }
        
        isGenerating = false
    }
}
