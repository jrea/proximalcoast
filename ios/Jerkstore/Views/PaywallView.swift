import SwiftUI
import StoreKit

struct PaywallView: View {
    @EnvironmentObject var storeManager: StoreKitManager
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack(spacing: 30) {
                HStack {
                    Spacer()
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .font(.title)
                            .foregroundColor(.white)
                    }
                }
                .padding()
                
                Text("UNLIMITED RAGE")
                    .font(.system(size: 36, weight: .black))
                    .foregroundColor(.yellow)
                    .italic()
                
                Text("Unlock the full power of the machine gods. Infinite roasts. Maximum cruelty.")
                    .font(.body)
                    .fontWeight(.bold)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                
                if storeManager.isLoading {
                    ProgressView("Loading Products...")
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .foregroundColor(.white)
                } else if storeManager.products.isEmpty {
                     Text("No products found. Check App Store Connect configuration.")
                        .foregroundColor(.red)
                        .font(.caption)
                } else {
                    VStack(spacing: 16) {
                        ForEach(storeManager.products) { product in
                            Button(action: {
                                Task {
                                    try? await storeManager.purchase(product)
                                }
                            }) {
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text(product.displayName)
                                            .font(.headline)
                                            .fontWeight(.black)
                                        Text(product.description)
                                            .font(.caption)
                                            .foregroundColor(.gray)
                                    }
                                    Spacer()
                                    Text(product.displayPrice)
                                        .fontWeight(.bold)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 4)
                                        .background(Color.yellow)
                                        .foregroundColor(.black)
                                        .cornerRadius(4)
                                }
                                .padding()
                                .background(Color(UIColor.systemGray6))
                                .cornerRadius(8)
                            }
                            .foregroundColor(.black)
                        }
                    }
                    .padding()
                }
                
                Spacer()
                
                Button("Restore Purchases") {
                    Task {
                        try? await AppStore.sync()
                    }
                }
                .font(.caption)
                .foregroundColor(.gray)
                .padding(.bottom)
            }
        }
        .task {
            await storeManager.loadProducts()
        }
    }
}
