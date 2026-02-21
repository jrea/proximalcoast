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

  useEffect(() => {
    fetch(`/api/document/${id}/url`)
      .then(res => res.json())
      .then(data => {
        if (data.url) {
          setPdfUrl(data.url);
        }
      });

    fetch(`/api/document/${id}`)
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

    const res = await fetch('/api/sign', {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center p-8 relative overflow-hidden">
        <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-emerald-950/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 mix-blend-screen"></div>
        <div className="bg-stone-900/40 backdrop-blur-3xl p-12 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/5 text-center space-y-4 relative z-10 w-full max-w-lg">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
          <h2 className="text-2xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Authorization Complete</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Your signature has been securely logged.</p>
        </div>
      </div>
    );
  }

  if (!doc || !pdfUrl) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center p-8">
        <div className="bg-red-950/20 border border-red-500/30 p-8 rounded-2xl text-red-200 text-xs font-mono uppercase tracking-widest backdrop-blur-sm shadow-inner">
          [Error] Document payload missing or corrupted.
        </div>
      </div>
    );
  }

  const config = doc.config || {};
  const viewerWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth - 40, 800) : 800;

  return (
    <div className="bg-[#050505] min-h-screen text-stone-100 flex flex-col items-center p-4 md:p-8 font-sans selection:bg-emerald-900/50 selection:text-white relative overflow-hidden">

      {/* Background Organic Blurs */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-emerald-950/20 rounded-full blur-[150px] pointer-events-none -translate-x-1/3 -translate-y-1/3 mix-blend-screen"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-stone-900/40 rounded-full blur-[180px] pointer-events-none translate-x-1/3 translate-y-1/3 mix-blend-screen"></div>

      {/* Subtle Grain Overlay */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 pointer-events-none mix-blend-overlay z-0"></div>

      <div className="w-full max-w-5xl z-10 flex flex-col items-center space-y-8 relative">
        <div className="text-center space-y-2 mt-4 md:mt-8">
          <h1 className="text-xl md:text-2xl font-black tracking-widest uppercase text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Official Document Review</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/80">Please review and provide authorization</p>
        </div>

        <div className="bg-stone-900/30 backdrop-blur-3xl p-4 md:p-8 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/5 relative overflow-hidden flex justify-center group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

          <Document
            file={pdfUrl}
            className="max-w-full inline-block shadow-[0_20px_40px_rgba(0,0,0,0.9)] border border-white/5 bg-[#0a0a0a] relative z-10 rounded-sm overflow-hidden"
          >
            <div className="relative inline-block isolate bg-white">
              <Page
                pageNumber={config.page || 1}
                renderTextLayer={false}
                width={viewerWidth}
              />

              {/* Sign Here Button Overlay */}
              <button
                onClick={() => setShowSignaturePad(true)}
                className="absolute border border-stone-400 bg-stone-500/10 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:bg-stone-500/20 mix-blend-difference group/btn"
                style={{
                  left: `${config.x}%`,
                  top: `${config.y}%`,
                  width: `${config.width}%`,
                  height: `${config.height}%`,
                }}
              >
                <div className="absolute inset-0 border border-white/30 group-hover/btn:border-emerald-500/50 transition-colors animate-pulse m-1"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-200 bg-black/80 px-4 py-2 backdrop-blur-md border border-white/10 shadow-xl pointer-events-none absolute -top-12 md:static md:top-auto rounded-full">Authorize Here</span>
              </button>
            </div>
          </Document>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#0a0a0c] border border-white/5 rounded-3xl shadow-[0_10px_60px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)] p-6 md:p-8 w-full max-w-md relative overflow-hidden transform animate-in zoom-in-95 duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

            <div className="relative z-10 space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-black uppercase tracking-widest text-white drop-shadow-sm border-b border-white/10 pb-3 inline-block">Provide Authorization</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 pt-2">Sign within the designated area</p>
              </div>

              <div className="border hover:border-stone-400 border-white/10 bg-white shadow-inner rounded-xl overflow-hidden transition-colors">
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="#000000"
                  canvasProps={{ width: 400, height: 200, className: 'sigCanvas w-full cursor-crosshair mix-blend-multiply' }}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={clearSignature}
                  className="flex-1 px-4 py-3 bg-transparent border border-white/10 text-stone-400 hover:text-white hover:border-white/30 hover:bg-white/5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] transition-all"
                >
                  Clear Entry
                </button>
                <button
                  onClick={() => setShowSignaturePad(false)}
                  className="flex-1 px-4 py-3 bg-transparent border border-white/10 text-stone-400 hover:text-white hover:border-white/30 hover:bg-white/5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] transition-all"
                >
                  Terminate
                </button>
                <button
                  onClick={handleSubmit}
                  className="w-full sm:w-auto px-6 py-3 bg-stone-200 text-stone-900 rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white transition-all shadow-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-transparent active:scale-95"
                >
                  Commit Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
