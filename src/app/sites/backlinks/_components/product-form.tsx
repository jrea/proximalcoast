"use client";

import { useState, useEffect } from "react";
import { Save, Sparkles } from "lucide-react";

export interface ProductData {
  productName: string;
  productUrl: string;
  shortDescription: string;
  longDescription: string;
  twitter: string;
}

export function ProductForm({ onSave }: { onSave: (data: ProductData) => void }) {
  const [data, setData] = useState<ProductData>({
    productName: "",
    productUrl: "",
    shortDescription: "",
    longDescription: "",
    twitter: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("backlinks_product_data");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved product data", e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem("backlinks_product_data", JSON.stringify(data));
    onSave(data);
  };

  const handleGenerate = async () => {
    // Placeholder for AI generation
    // const generated = await fetch('/api/generate-description', ...);
    // setData(...)
    alert("AI Generation Coming Soon!");
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      <div>
        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Product Name</label>
        <input
          name="productName"
          value={data.productName}
          onChange={handleChange}
          className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="e.g. Jerkstore"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">URL</label>
        <input
          name="productUrl"
          value={data.productUrl}
          onChange={handleChange}
          className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Twitter / X</label>
        <input
          name="twitter"
          value={data.twitter}
          onChange={handleChange}
          className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="@handle"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1 flex justify-between">
          <span>Short Description (One-Liner)</span>
          <button onClick={handleGenerate} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-[10px]"><Sparkles size={10} /> AI Generate</button>
        </label>
        <input
          name="shortDescription"
          value={data.shortDescription}
          onChange={handleChange}
          className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="The world's most aggressive AI insult generator."
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Long Description</label>
        <textarea
          name="longDescription"
          value={data.longDescription}
          onChange={handleChange}
          rows={4}
          className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Detailed description of your product..."
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        <Save size={16} /> Save Product Info
      </button>
    </div>
  );
}
