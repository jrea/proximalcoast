"use client";

import { useState, useEffect, useRef } from "react";
import { pdfjs } from "react-pdf";
import { LucideLoader2, LucideDownload, LucideCheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";
import { ConsentGate } from "./_components/consent-gate";

const Document = dynamic(() => import("react-pdf").then(mod => mod.Document), { ssr: false });
const Page = dynamic(() => import("react-pdf").then(mod => mod.Page), { ssr: false });
import SignatureCanvas from "react-signature-canvas";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function SigningInterface({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signed, setSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    (async () => {
      try {
        const [docRes, urlRes] = await Promise.all([
          fetch(`/api/hanko/document/${id}`).then(r => r.json()),
          fetch(`/api/hanko/document/${id}/url`).then(r => r.json()),
        ]);

        setDoc(docRes);
        if (urlRes.url) setPdfUrl(urlRes.url);
        if (docRes.status === "SEALED") setSigned(true);
        if (docRes.consentRecord) setConsentGiven(true);
      } catch {
        // handled below via missing doc check
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) return;
    setSubmitting(true);

    const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");

    const res = await fetch("/api/hanko/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentId: id,
        eventType: "SIGNATURE",
        signerEmail: doc?.signerEmail || "signer@bkd.com",
        signatureData,
      }),
    });

    if (res.ok) {
      setSigned(true);
      setShowSignaturePad(false);
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Error signing document. Please try again.");
    }
    setSubmitting(false);
  };

  const clearSignature = () => sigCanvas.current?.clear();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-[var(--bkd-border)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden bkd-shoji-enter">
        <div className="bkd-card-header text-center space-y-8 max-w-lg w-full">
          <span className="bg-text">COMPLETE</span>
          <div>
            <h2 className="bkd-h2">Authorization Complete</h2>
            <p className="bkd-mono text-[10px] opacity-70 mt-2">
              Your signature has been forensically recorded &amp; sealed.
            </p>
          </div>

          {/* Trust signals */}
          <div className="bkd-card-detail space-y-3 text-left">
            {[
              "ESIGN · UETA · eIDAS 2.0 compliant",
              "SHA-256 hash chain preserved",
              "IP, geo & timestamp recorded per mark",
              "Consent event logged",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bkd-mono text-[10px]">
                <span className="w-1.5 h-1.5 bg-[#16a34a] shrink-0" />
                <span className="opacity-70">{item}</span>
              </div>
            ))}
          </div>

          {/* Certificate download */}
          <a
            href={`/api/hanko/certificate/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bkd-btn-primary w-full inline-flex items-center justify-center gap-3"
          >
            <svg><rect x="0" y="0" width="100%" height="100%" /></svg>
            <span className="relative z-10 flex items-center gap-2">
              Download Certificate of Completion
              <LucideDownload style={{ width: 13, height: 13 }} />
            </span>
          </a>

          <p className="bkd-mono text-[10px] opacity-30">
            The certificate contains the full forensic audit trail for this document.
          </p>
        </div>
      </div>
    );
  }

  if (!doc || !pdfUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-[#BC241C]/5 border border-[#BC241C] p-8 text-[#BC241C] text-[10px] bkd-mono uppercase tracking-widest shadow-inner">
          [Error] Document payload missing or corrupted.
        </div>
      </div>
    );
  }

  // Show BKD consent gate before the document
  if (!consentGiven) {
    return (
      <ConsentGate
        documentId={id}
        signerEmail={doc.signerEmail || ""}
        onConsented={() => setConsentGiven(true)}
      />
    );
  }

  const config = doc.config || {};
  const viewerWidth = typeof window !== "undefined" ? Math.min(window.innerWidth - 40, 800) : 800;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 relative overflow-hidden">
      <div className="w-full max-w-5xl z-10 flex flex-col items-center space-y-8 relative bkd-shoji-enter">
        <div className="text-center space-y-2 mt-4 md:mt-8">
          <h1 className="bkd-h1 uppercase">Official Document Review</h1>
          <p className="bkd-mono text-[10px] text-[#BC241C] font-bold">
            Please review and provide authorization
          </p>
        </div>

        <div className="bg-[var(--bkd-surface)] p-4 md:p-8 shadow-md border border-[var(--bkd-border)] relative overflow-hidden flex justify-center group w-full">
          <Document
            file={pdfUrl}
            className="max-w-full inline-block shadow-xl border border-[var(--bkd-border)] bg-white relative z-10 overflow-hidden mix-blend-multiply"
          >
            <div className="relative inline-block isolate bg-white">
              <Page
                pageNumber={config.page || 1}
                renderTextLayer={false}
                width={viewerWidth}
              />
              <button
                onClick={() => setShowSignaturePad(true)}
                className="absolute border border-[var(--bkd-ink)] bg-[#BC241C]/10 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-[#BC241C]/20 group/btn"
                style={{
                  left: `${config.x}%`,
                  top: `${config.y}%`,
                  width: `${config.width}%`,
                  height: `${config.height}%`,
                }}
              >
                <div className="absolute inset-0 border border-[#BC241C]/50 group-hover/btn:border-[#BC241C] transition-colors animate-pulse m-1" />
                <span className="bkd-mono text-[10px] text-white bg-[#BC241C] px-4 py-2 border border-[#BC241C] shadow-lg pointer-events-none absolute -top-12 md:static md:top-auto">
                  Authorize Here
                </span>
              </button>
            </div>
          </Document>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-[#F7F2E8]/90 z-50 flex items-center justify-center p-4">
          <div className="bkd-card-detail bg-[var(--bkd-surface)] p-6 md:p-8 w-full max-w-md relative overflow-hidden shadow-xl">
            <div className="relative z-10 space-y-6">
              <div className="text-center space-y-2">
                <h3 className="bkd-h2 border-b border-[var(--bkd-border)] pb-3 inline-block">
                  Provide Authorization
                </h3>
                <p className="bkd-mono text-[10px] text-[#BC241C] pt-2">
                  Sign within the designated area
                </p>
              </div>

              <div className="border border-[var(--bkd-border)] bg-white overflow-hidden">
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="#1A1A1B"
                  canvasProps={{
                    width: 400,
                    height: 200,
                    className: "sigCanvas w-full cursor-crosshair mix-blend-multiply",
                  }}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button onClick={clearSignature} className="flex-1 bkd-btn-secondary">
                  <svg><rect x="0" y="0" width="100%" height="100%" /></svg>
                  <span className="relative z-10">Clear Entry</span>
                </button>
                <button onClick={() => setShowSignaturePad(false)} className="flex-1 bkd-btn-secondary">
                  <svg><rect x="0" y="0" width="100%" height="100%" /></svg>
                  <span className="relative z-10">Cancel</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full sm:w-auto bkd-btn-primary"
                  style={{ opacity: submitting ? 0.6 : 1 }}
                >
                  <svg><rect x="0" y="0" width="100%" height="100%" /></svg>
                  {submitting ? (
                    <span className="flex items-center gap-2 relative z-10">
                      <LucideLoader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} />
                      Sealing...
                    </span>
                  ) : (
                    <span className="relative z-10">Commit Signature</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
