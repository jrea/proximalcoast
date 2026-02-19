"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Document = dynamic(() => import("react-pdf").then(mod => mod.Document), { ssr: false });
const Page = dynamic(() => import("react-pdf").then(mod => mod.Page), { ssr: false });
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

export default function AdminPage() {
  useEffect(() => {
    import("react-pdf").then((mod) => {
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
    });
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number } | null>(null);
  // Config now stores percentages (0-100)
  const [config, setConfig] = useState<{ x: number; y: number; width: number; height: number; page: number }>({
    x: 10, // 10%
    y: 10, // 10%
    width: 20, // 20%
    height: 5, // 5%
    page: 1,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/sites/bkd/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setDocumentId(data.id);

    // Get presigned URL
    const urlRes = await fetch(`/sites/bkd/api/document/${data.id}/url`);
    const urlData = await urlRes.json();
    setPdfUrl(urlData.url);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = (page: any) => {
    setPageDimensions({ width: page.width, height: page.height }); // Original PDF dimensions usually? No, react-pdf page object.
    // Actually, react-pdf's onLoadSuccess for Page returns the PDFPageProxy which has original width/height.
    // But we are rendering at a specific width (600).
    // The "page" object in onLoadSuccess has original dimensions.
    // We don't strictly need original dimensions if we use CSS percentages on the container.
    // Let's just stick to 0-100 inputs for now, simplest for Admin MVP.
  };

  const handlePageClick = (e: any) => {
    // Basic click handling to set X/Y - relative to the page container
    // This is tricky because react-pdf renders canvas.
    // We might just use manual inputs for now or a simple draggable box overlay.
    // Let's rely on the draggable box overlay.
  };

  const saveConfig = async () => {
    if (!documentId) return;
    await fetch(`/sites/bkd/api/document/${documentId}/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    alert("Configuration saved! You can now use the signing link.");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">BKD PDF Signing Admin</h1>

      {!documentId && (
        <div className="flex gap-4 items-center">
          <input type="file" onChange={handleFileChange} accept="application/pdf" className="border p-2 rounded" />
          <button
            onClick={handleUpload}
            disabled={!file}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Upload
          </button>
        </div>
      )}

      {documentId && pdfUrl && (
        <div className="mt-8">
          <div className="flex gap-8">
            <div className="relative border border-gray-300 inline-block">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                className="max-w-full"
              >
                <div className="relative">
                  <Page
                    pageNumber={pageNumber}
                    renderTextLayer={false}
                    width={600}
                    onLoadSuccess={onPageLoadSuccess}
                  />
                  {/* Visual indicator of signature box */}
                  {config.page === pageNumber && (
                    <div
                      className="absolute border-2 border-red-500 bg-red-500/20 cursor-move"
                      style={{
                        left: `${config.x}%`,
                        top: `${config.y}%`,
                        width: `${config.width}%`,
                        height: `${config.height}%`,
                      }}
                    // Simple drag implementation could go here, for now inputs
                    >
                      <span className="text-xs text-red-700 font-bold p-1">Sign Here</span>
                    </div>
                  )}
                </div>
              </Document>
            </div>

            <div className="w-64 space-y-4">
              <h2 className="font-semibold">Signature Config (%)</h2>
              <div>
                <label className="block text-sm">Page</label>
                <input
                  type="number"
                  min={1}
                  max={numPages}
                  value={pageNumber}
                  onChange={(e) => {
                    const p = parseInt(e.target.value);
                    setPageNumber(p);
                    setConfig({ ...config, page: p });
                  }}
                  className="border p-1 w-full"
                />
              </div>
              <div>
                <label className="block text-sm">X % (Left)</label>
                <input
                  type="number"
                  value={config.x}
                  onChange={(e) => setConfig({ ...config, x: parseFloat(e.target.value) })}
                  className="border p-1 w-full"
                />
              </div>
              <div>
                <label className="block text-sm">Y % (Top)</label>
                <input
                  type="number"
                  value={config.y}
                  onChange={(e) => setConfig({ ...config, y: parseFloat(e.target.value) })}
                  className="border p-1 w-full"
                />
              </div>
              <div>
                <label className="block text-sm">Width %</label>
                <input
                  type="number"
                  value={config.width}
                  onChange={(e) => setConfig({ ...config, width: parseFloat(e.target.value) })}
                  className="border p-1 w-full"
                />
              </div>
              <div>
                <label className="block text-sm">Height %</label>
                <input
                  type="number"
                  value={config.height}
                  onChange={(e) => setConfig({ ...config, height: parseFloat(e.target.value) })}
                  className="border p-1 w-full"
                />
              </div>

              <button
                onClick={saveConfig}
                className="w-full bg-green-600 text-white px-4 py-2 rounded mt-4"
              >
                Save Configuration
              </button>

              <div className="mt-8 pt-8 border-t">
                <p className="text-sm text-gray-500">Signing Link:</p>
                <a href={`/sites/bkd/sign/${documentId}`} target="_blank" className="text-blue-600 break-all text-sm hover:underline">
                  /sites/bkd/sign/{documentId}
                </a>
              </div>
            </div>
          </div>

          {numPages > 1 && (
            <div className="mt-4 flex gap-2">
              <button
                disabled={pageNumber <= 1}
                onClick={() => {
                  setPageNumber(p => p - 1);
                  setConfig(c => ({ ...c, page: c.page - 1 }));
                }}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {pageNumber} of {numPages}</span>
              <button
                disabled={pageNumber >= numPages}
                onClick={() => {
                  setPageNumber(p => p + 1);
                  setConfig(c => ({ ...c, page: c.page + 1 }));
                }}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
