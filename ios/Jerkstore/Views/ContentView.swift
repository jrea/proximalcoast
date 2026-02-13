import SwiftUI

struct ContentView: View {
    @EnvironmentObject var storeManager: StoreKitManager
    @StateObject private var viewModel = InsultGeneratorViewModel()
    @State private var showPaywall = false
    
    var body: some View {
        NavigationView {
            ZStack {
                Color.white.ignoresSafeArea()
                
                VStack(spacing: 20) {
                    // Header
                    HStack {
                        Text("JERKSTORE")
                            .font(.system(size: 28, weight: .black, design: .default))
                            .italic()
                        Spacer()
                        Button(action: { showPaywall = true }) {
                            Image(systemName: "crown.fill")
                                .font(.title2)
                                .foregroundColor(.yellow)
                        }
                    }
                    .padding()
                    .padding(.top, 40)
                    .background(Color.black)
                    .foregroundColor(.white)
                    
                    ScrollView {
                        VStack(spacing: 24) {
                            // Input Section
                            VStack(alignment: .leading, spacing: 12) {
                                Text("CHOOSE A VICTIM")
                                    .font(.headline)
                                    .fontWeight(.black)
                                
                                TextField("Enter topic (e.g., 'My Boss', 'Dave from Accounting')", text: $viewModel.topic)
                                    .padding()
                                    .background(Color(UIColor.systemGray6))
                                    .border(Color.black, width: 4)
                                    .font(.system(size: 18, weight: .bold, design: .monospaced))
                                    .foregroundColor(.black)
                                    .textInputAutocapitalization(.never)
                                
                                Toggle("EMAIL MODE (MAXIMUM EFFORT)", isOn: $viewModel.isEmailMode)
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .padding(.top, 4)
                            }
                            .padding(.horizontal)
                            
                            // Generate Button
                            Button(action: {
                                Task {
                                    await viewModel.generateInsult()
                                }
                            }) {
                                HStack {
                                    if viewModel.isGenerating {
                                        ProgressView()
                                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                    } else {
                                        Text("DESTROY THEIR EGO")
                                            .fontWeight(.black)
                                            .font(.title3)
                                    }
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(viewModel.isGenerating ? Color.gray : Color.red)
                                .foregroundColor(.white)
                                .border(Color.black, width: 4)
                                .shadow(color: .black, radius: 0, x: 8, y: 8)
                            }
                            .padding(.horizontal)
                            .disabled(viewModel.isGenerating || !viewModel.canGenerate)
                            
                            // Results
                            if let error = viewModel.errorMessage {
                                Text(error)
                                    .foregroundColor(.red)
                                    .font(.caption)
                                    .fontWeight(.bold)
                                    .multilineTextAlignment(.center)
                                    .padding()
                            }
                            
                            ForEach(viewModel.roasts, id: \.self) { roast in
                                VStack(alignment: .leading) {
                                    Text(roast)
                                        .font(.system(size: 16, weight: .medium, design: .serif))
                                        .padding()
                                        .multilineTextAlignment(.leading)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color.white)
                                .border(Color.black, width: 4)
                                .shadow(color: .black, radius: 0, x: 4, y: 4)
                                .padding(.horizontal)
                                .contextMenu {
                                    Button(action: {
                                        UIPasteboard.general.string = roast
                                    }) {
                                        Text("Copy Roast")
                                        Image(systemName: "doc.on.doc")
                                    }
                                }
                            }
                        }
                        .padding(.bottom, 40)
                    }
                }
            }
            .ignoresSafeArea(.all, edges: .top)
            .sheet(isPresented: $showPaywall) {
                PaywallView()
            }
        }
        .task {
            // Check subscription status on launch
            await storeManager.updatePurchasedStatus()
        }
    }
}
