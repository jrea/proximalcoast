import SwiftUI

@main
struct JerkstoreApp: App {
    @StateObject private var storeManager = StoreKitManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(storeManager)
                .preferredColorScheme(.light) // Force light mode for now to match web style, or adapt later
        }
    }
}
