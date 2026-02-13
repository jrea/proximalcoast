import Foundation
import StoreKit

// Update with your actual Product IDs from App Store Connect
public enum SubscriptionTier: String, CaseIterable {
    case standard = "com.proximalcoast.jerkstore.standard" // Monthly
    case savage = "com.proximalcoast.jerkstore.savage"   // Yearly
    
    var displayName: String {
        switch self {
        case .standard: return "Standard Jerk"
        case .savage: return "Savage Mode"
        }
    }
}

@MainActor
class StoreKitManager: ObservableObject {
    @Published var products: [Product] = []
    @Published var purchasedProductIDs: Set<String> = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private var updates: Task<Void, Never>? = nil

    init() {
        updates = newTransactionListenerTask()
    }

    deinit {
        updates?.cancel()
    }
    
    func loadProducts() async {
        isLoading = true
        errorMessage = nil
        do {
            let productIds = SubscriptionTier.allCases.map { $0.rawValue }
            products = try await Product.products(for: productIds)
            await updatePurchasedStatus()
        } catch {
            errorMessage = "Failed to load products: \(error.localizedDescription)"
        }
        isLoading = false
    }
    
    func purchase(_ product: Product) async throws {
        let result = try await product.purchase()
        
        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await updatePurchasedStatus()
            await transaction.finish()
        case .userCancelled:
            break
        case .pending:
            break
        @unknown default:
            break
        }
    }
    
    func updatePurchasedStatus() async {
        for await result in Transaction.currentEntitlements {
            do {
                let transaction = try checkVerified(result)
                purchasedProductIDs.insert(transaction.productID)
            } catch {
                // Handle verification error
            }
        }
    }

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified:
            throw StoreError.failedVerification
        case .verified(let safe):
            return safe
        }
    }

    private func newTransactionListenerTask() -> Task<Void, Never> {
        Task(priority: .background) {
            for await result in Transaction.updates {
                do {
                    let transaction = try checkVerified(result)
                    await updatePurchasedStatus()
                    await transaction.finish()
                } catch {
                    // Log error
                }
            }
        }
    }
    
    var hasActiveSubscription: Bool {
        return !purchasedProductIDs.isEmpty
    }
}

enum StoreError: Error {
    case failedVerification
}
