"use client";

import { useState, useEffect, useRef } from "react";
import { pdfjs } from "react-pdf";
import dynamic from "next/dynamic";

const Document = dynamic(() => import("react-pdf").then(mod => mod.Document), { ssr: false });
const Page = dynamic(() => import("react-pdf").then(mod => mod.Page), { ssr: false });
import SignatureCanvas from "react-signature-canvas";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function SigningInterface({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState<any>(null); // DB record
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signed, setSigned] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  // Need to fetch doc info to get config coordinates
  useEffect(() => {
    // We don't have a direct route for doc metadata yet, but we can derive it from the URL route 
    // or just fetch it. I should probably add a route to get doc metadata + config.
    // For now, I'll assume the URL route returns what I need or creates a new one.
    // Actually I should have a route to get the doc details.
    // I'll make a quick fetch to the URL route, but that only returns URL.
    // I'll just rely on the API routes I made. wait, I didn't make a "get doc" route.
    // I'll add a fetch to `GET /api/document/[id]` logic here if I can, or update url route to return config.
    // Let's update the URL route to return metadata + url.

    // For now, let's assume I'll update the URL route to include config.
    fetch(`/sites/bkd/api/document/${id}/url`)
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          setPdfUrl(data.url);
          // We also need the config.
          // I'll implement a `GET /api/document/[id]` route quickly or stub it.
          // Actually, I can just fetch the config via a server action or new route.
          // I will fetch the config from a new route I'll create `GET /api/bkd/document/[id]`.
        }
      });

    fetch(`/sites/bkd/api/document/${id}`)
      .then(res => res.json())
      .then(data => {
        setDoc(data);
        setLoading(false);
        if (data.status === 'SIGNED') {
          setSigned(true);
        }
      })
      .catch(() => setLoading(false));

  }, [id]);

  const handleSubmit = async () => {
    if (!sigCanvas.current) return;

    // trimmed canvas data
    const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');

    const res = await fetch('/sites/bkd/api/sign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId: id,
        signatureData
      })
    });

    if (res.ok) {
      setSigned(true);
      setShowSignaturePad(false);
    } else {
      alert("Error signing document");
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (signed) return <div className="p-8 text-green-600 text-xl font-bold">Document Successfully Signed!</div>;
  if (!doc || !pdfUrl) return <div className="p-8 text-red-600">Document not found or error loading.</div>;

  const config = doc.config || {};

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col items-center">
      <div className="bg-white shadow-lg p-1 relative">
        <Document
          file={pdfUrl}
          className="max-w-full"
        >
          <Page
            pageNumber={config.page || 1}
            renderTextLayer={false}
            width={Math.min(window.innerWidth - 40, 800)} // Responsive width
          />

          {/* Sign Here Button Overlay */}
          <button
            onClick={() => setShowSignaturePad(true)}
            className="absolute bg-yellow-300/50 border-2 border-yellow-600 hover:bg-yellow-400/60 flex items-center justify-center cursor-pointer transition-colors"
            style={{
              left: `${config.x}%`,
              top: `${config.y}%`,
              width: `${config.width}%`,
              height: `${config.height}%`,
            }}
          >
            <span className="font-bold text-yellow-900">CLICK TO SIGN</span>
          </button>
        </Document>
      </div>

      {/* Signature Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Please Sign Below</h3>
            <div className="border border-gray-300 rounded mb-4">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="black"
                canvasProps={{ width: 400, height: 200, className: 'sigCanvas w-full' }}
              />
            </div>
            <div className="flex gap-4 justify-end">
              <button
                onClick={clearSignature}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Clear
              </button>
              <button
                onClick={() => setShowSignaturePad(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Apply Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
