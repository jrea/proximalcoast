"use client";

import { Rocket, AlertTriangle, Info } from "lucide-react";
// import { ProductForm, ProductData } from "./_components/product-form";
import { useState } from "react";

// Mock types for now to fix build
interface ProductData {
  name: string;
}

const ProductForm = ({ onSave }: { onSave: (data: ProductData) => void }) => <div>Product Form</div>;

export default function BacklinksPage() {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Beta Banner */}
      <div className="absolute top-0 left-0 w-full bg-yellow-400 text-black text-xs font-bold text-center py-1 z-50 flex justify-center items-center gap-2">
        <AlertTriangle size={12} />
        <span>BETA: This tool is a work in progress and probably doesn't work yet. Tag me on Twitter (@proximalcoast) if you want to see this actually work.</span>
      </div>

      {/* Sidebar / Tools Area */}
      <aside className="w-1/3 min-w-[350px] max-w-[500px] border-r border-neutral-200 bg-white flex flex-col pt-6">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Rocket size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Launchpad</h1>
          </div>
          <p className="text-sm text-neutral-500 mb-4">Your AI-powered directory submission agent.</p>

          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-xs bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded flex items-center gap-1 transition-colors"
          >
            <Info size={12} /> {showInstructions ? "Hide Setup Info" : "How to Setup"}
          </button>

          {showInstructions && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-900 rounded text-xs border border-blue-100">
              <strong>🚀 Setup Instructions:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Download the repository.</li>
                <li>Go to <code>chrome://extensions</code></li>
                <li>Enable "Developer Mode".</li>
                <li>Click "Load Unpacked".</li>
                <li>Select <code>src/app/sites/backlinks/extension</code> folder.</li>
                <li>Refresh this page.</li>
              </ol>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Product Info Section */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">1. Product Info</h2>
            <ProductForm onSave={setProduct} />
          </section>

          {/* Directory List Placeholder */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">2. Directory Queue</h2>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 bg-neutral-50 rounded border border-neutral-100 flex justify-between items-center group hover:border-blue-300 transition-colors cursor-pointer">
                  <span className="text-sm font-medium group-hover:text-blue-600">Directory {i}</span>
                  <span className="text-xs bg-neutral-200 px-2 py-1 rounded group-hover:bg-blue-100 group-hover:text-blue-700">Pending</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>

      {/* Main Content / Iframe Area */}
      <main className="flex-1 bg-neutral-100 flex flex-col relative pt-6">
        <div className="flex-1 flex items-center justify-center text-neutral-400 flex-col gap-4">
          <div className="w-16 h-16 border-4 border-neutral-200 rounded-full flex items-center justify-center animate-pulse">
            <Rocket size={32} className="text-neutral-300" />
          </div>
          <p>Select a directory to start magic submission</p>
        </div>

        {/* Iframe will go here */}
        {/* <iframe className="w-full h-full" src="..." /> */}
      </main>
    </div>
  );
}

