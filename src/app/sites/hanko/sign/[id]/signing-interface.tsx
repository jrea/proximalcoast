"use client";

import { useState, useEffect, useRef } from "react";
import { pdfjs } from "react-pdf";
import { LucidePenTool, LucideType, LucideCheckCircle2, LucideDownload, LucideLoader2 } from "lucide-react";
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
  const [signMode, setSignMode] = useState<"DRAW" | "TYPE">("DRAW");
  const [typedName, setTypedName] = useState("");
  const [selectedFont, setSelectedFont] = useState("font-signature-1");
  const sigCanvas = useRef<SignatureCanvas>(null);

  const fonts = [
    { id: "font-signature-1", name: "Elegant", class: 'font-["Dancing_Script"]' },
    { id: "font-signature-2", name: "Classic", class: 'font-["Great_Vibes"]' },
    { id: "font-signature-3", name: "Modern", class: 'font-["Alex_Brush"]' },
  ];

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
        // If consent was already given in a previous session
        if (docRes.consentRecord) setConsentGiven(true);
      } catch {
        // handled via missing doc check below
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    let signatureData = "";

    if (signMode === "DRAW") {
      if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
        setSubmitting(false);
        return;
      }
      signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
    } else {
      if (!typedName.trim()) {
        setSubmitting(false);
        return;
      }
    }

    const res = await fetch("/api/hanko/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentId: id,
        eventType: "SIGNATURE",
        signerEmail: doc?.signerEmail || "signer@unknown.com",
        signatureData: signatureData || undefined,
        signerName: signMode === "TYPE" ? typedName : undefined,
        signatureFont: signMode === "TYPE" ? selectedFont : undefined,
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
      <div className="min-h-screen flex items-center justify-center p-8 hanko-slide-enter">
        <div className="w-12 h-12 border-4 border-t-transparent border-[var(--hanko-primary)] animate-spin" />
      </div>
    );
  }

  if (signed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden hanko-slide-enter">
        <div className="hanko-card-detail text-center space-y-8 max-w-lg w-full">
          <div className="w-24 h-24 mx-auto border-4 border-[var(--hanko-primary)] rounded-full flex items-center justify-center relative">
            <span className="font-['Shippori_Mincho'] text-5xl text-[var(--hanko-primary)] absolute">判</span>
          </div>
          <div>
            <h2 className="hanko-h1 text-4xl mt-8">Seal Applied</h2>
            <p className="text-sm tracking-widest uppercase opacity-70 mt-3">
              Your signature has been forensically recorded &amp; sealed.
            </p>
          </div>

          {/* Trust signals */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "20px 0",
            borderTop: "1px solid var(--hanko-border)",
            borderBottom: "1px solid var(--hanko-border)",
          }}>
            {[
              { icon: <LucideCheckCircle2 style={{ width: 14, height: 14 }} />, text: "ESIGN · UETA · eIDAS 2.0 compliant" },
              { icon: <LucideCheckCircle2 style={{ width: 14, height: 14 }} />, text: "SHA-256 hash chain preserved" },
              { icon: <LucideCheckCircle2 style={{ width: 14, height: 14 }} />, text: "IP, geo &amp; timestamp recorded per mark" },
              { icon: <LucideCheckCircle2 style={{ width: 14, height: 14 }} />, text: "Consent event logged" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 12,
                color: "#16a34a",
              }}>
                {item.icon}
                <span dangerouslySetInnerHTML={{ __html: item.text }} />
              </div>
            ))}
          </div>

          {/* Certificate download */}
          <a
            href={`/api/hanko/certificate/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hanko-btn-primary"
            style={{ alignSelf: "center", gap: 8, fontSize: 12 }}
          >
            Download Certificate of Completion
            <LucideDownload style={{ width: 14, height: 14 }} />
          </a>

          <p style={{ fontSize: 10, opacity: 0.35, letterSpacing: "0.1em" }}>
            The certificate contains the full forensic audit trail for this document.
          </p>
        </div>
      </div>
    );
  }

  if (!doc || !pdfUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-[var(--hanko-primary)]/10 border-l-8 border-[var(--hanko-primary)] p-8 text-[var(--hanko-primary)] text-sm tracking-widest uppercase shadow-sm">
          [Error] Document payload missing or expired.
        </div>
      </div>
    );
  }

  // Show consent gate first
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
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 relative overflow-hidden hanko-slide-enter">
      <div className="w-full max-w-5xl flex flex-col items-center space-y-12">
        <div className="text-center space-y-4 pt-12 relative">
          <div className="absolute top-0 transform -translate-y-1/2 left-1/2 -translate-x-1/2 opacity-5 text-9xl font-['Shippori_Mincho'] pointer-events-none select-none">
            誓
          </div>
          <h1 className="hanko-h1 text-5xl relative z-10">Review Protocol</h1>
          <p className="text-sm tracking-widest uppercase text-[var(--hanko-primary)] pt-4 relative z-10">
            Please review and affix your seal
          </p>
        </div>

        <div className="w-full hanko-card-detail p-4 md:p-8 flex justify-center group bg-white shadow-xl hanko-image-multiply">
          <Document
            file={pdfUrl}
            className="max-w-full inline-block border border-[var(--hanko-border)] bg-white relative z-10"
          >
            <div className="relative inline-block isolate bg-white">
              <Page
                pageNumber={config.page || 1}
                renderTextLayer={false}
                width={viewerWidth}
              />
              <button
                onClick={() => setShowSignaturePad(true)}
                className="absolute border border-[var(--hanko-primary)] bg-[var(--hanko-primary)]/10 flex items-center justify-center cursor-crosshair transition-all duration-300 hover:bg-[var(--hanko-primary)]/20 group/btn"
                style={{
                  left: `${config.x}%`,
                  top: `${config.y}%`,
                  width: `${config.width}%`,
                  height: `${config.height}%`,
                }}
              >
                <div className="absolute inset-0 border-2 border-[var(--hanko-primary)]/50 group-hover/btn:border-[var(--hanko-primary)] transition-colors animate-pulse m-1" />
                <span className="text-xs tracking-widest text-white bg-[var(--hanko-primary)] px-4 py-2 border border-[var(--hanko-primary)] shadow-md pointer-events-none absolute -top-12 md:static md:top-auto whitespace-nowrap uppercase hanko-btn-primary">
                  Affix Seal
                </span>
              </button>
            </div>
          </Document>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-[#F7F2E8]/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="hanko-card-header w-full max-w-lg shadow-2xl bg-white border-2 border-[var(--hanko-ink)]">
            <div className="space-y-8 relative z-10 p-4">
              <div className="text-center space-y-4 border-b-2 border-[var(--hanko-ink)] pb-6 relative">
                <div className="absolute top-0 right-0 opacity-10 text-6xl font-['Shippori_Mincho']">印</div>
                <h3 className="hanko-h2 text-3xl">Affix Your Seal</h3>
                <p className="text-xs tracking-widest uppercase text-[var(--hanko-primary)]">
                  Draw within the designated boundary
                </p>
              </div>

              <div className="flex border-b border-[var(--hanko-border)]">
                <button
                  onClick={() => setSignMode("DRAW")}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all ${signMode === "DRAW" ? "bg-[var(--hanko-ink)] text-white" : "opacity-40 hover:opacity-100"}`}
                >
                  <LucidePenTool className="w-4 h-4" /> Draw
                </button>
                <button
                  onClick={() => setSignMode("TYPE")}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs uppercase tracking-widest transition-all ${signMode === "TYPE" ? "bg-[var(--hanko-ink)] text-white" : "opacity-40 hover:opacity-100"}`}
                >
                  <LucideType className="w-4 h-4" /> Type
                </button>
              </div>

              {signMode === "DRAW" ? (
                <div className="border border-[var(--hanko-ink)] bg-[var(--hanko-surface)] shadow-inner">
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor="#1A1A1B"
                    canvasProps={{
                      width: 400,
                      height: 200,
                      className: "sigCanvas w-full cursor-crosshair hanko-image-multiply bg-transparent",
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold">Full Name</label>
                    <input
                      type="text"
                      value={typedName}
                      onChange={e => setTypedName(e.target.value)}
                      placeholder="Type your name..."
                      className="w-full bg-[var(--hanko-surface)] border border-[var(--hanko-border)] p-4 text-xl tracking-wide focus:outline-none focus:border-[var(--hanko-primary)] transition-colors hanko-body"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {fonts.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFont(f.id)}
                        className={`p-4 border text-center transition-all ${selectedFont === f.id ? "border-[var(--hanko-primary)] bg-[var(--hanko-primary)]/5" : "border-[var(--hanko-border)] opacity-40 hover:opacity-100"}`}
                      >
                        <div className={`${f.class} text-lg truncate`}>{typedName || f.name}</div>
                        <div className="text-[8px] uppercase tracking-tighter mt-1">{f.name}</div>
                      </button>
                    ))}
                  </div>
                  <div className="p-8 border border-dashed border-[var(--hanko-border)] bg-[var(--hanko-surface)] flex items-center justify-center relative group min-h-[120px]">
                    <div className="absolute top-2 left-2 text-[8px] uppercase tracking-widest opacity-20">Preview</div>
                    {typedName ? (
                      <div className={`${fonts.find(f => f.id === selectedFont)?.class} text-5xl text-[var(--hanko-ink)] hanko-image-multiply`}>
                        {typedName}
                      </div>
                    ) : (
                      <div className="text-xs italic opacity-20">Awaiting input...</div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button onClick={clearSignature} className="flex-1 hanko-btn-secondary text-sm">
                  Clear Entry
                </button>
                <button onClick={() => setShowSignaturePad(false)} className="flex-1 hanko-btn-secondary text-sm">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={submitting} className="w-full sm:w-auto hanko-btn-primary" style={{ opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? (
                    <LucideLoader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
                  ) : (
                    "Commit Seal"
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
