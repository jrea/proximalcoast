# Jerkstore iOS Native App

This directory contains the Swift source files for the native iOS application.

## Setup Instructions

1.  **Open Xcode** and create a new **iOS App** project.
    -   **Product Name**: Jerkstore
    -   **Interface**: SwiftUI
    -   **Language**: Swift
    -   **Organization Identifier**: `com.proximalcoast` (or your preferred ID)

2.  **Add Files**:
    -   Drag and drop the `Models`, `ViewModels`, `Views`, and `Services` folders from this directory into your Xcode project navigator.
    -   Make sure "Copy items if needed" is unchecked (if you want to edit them here) or checked (if you want Xcode to own them).
    -   Replace the default `JerkstoreApp.swift` (or whatever your app entry file is named) with the content of `JerkstoreApp.swift` provided here.

3.  **Configure Capabilities**:
    -   Go to **Signing & Capabilities**.
    -   Add **In-App Purchase**.

4.  **App Store Connect**:
    -   Create your In-App Purchase products in App Store Connect.
    -   Update `StoreKitManager.swift` with your actual Product IDs:
        -   `com.proximalcoast.jerkstore.standard`
        -   `com.proximalcoast.jerkstore.savage`

5.  **Build and Run**:
    -   Select a simulator or your connected device and run the app.

## Notes
-   The current API endpoint in `APIService.swift` points to `http://localhost:3000/api` for development. Change this to `https://jerkstore.proximalcoast.com/api` for production.
-   Ensure your Next.js local server is running if testing locally (`pnpm dev`).
