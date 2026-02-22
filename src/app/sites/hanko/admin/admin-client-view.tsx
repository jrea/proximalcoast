"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { LucideAlertTriangle } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { CreditsCheckout } from "../_components/credits-checkout";

const Document = dynamic(() => import("react-pdf").then(mod => mod.Document), { ssr: false });
const Page = dynamic(() => import("react-pdf").then(mod => mod.Page), { ssr: false });

import { useEffect } from "react";

export default function AdminClientView({
  session,
  initialCredits,
}: {
  session: any;
  initialCredits: number;
}) {
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
  const [credits, setCredits] = useState(initialCredits);
  const [signerEmail, setSignerEmail] = useState("");
  const [sending, setSending] = useState(false);

  const [config, setConfig] = useState<{ x: number; y: number; width: number; height: number; page: number }>({
    x: 10,
    y: 10,
    width: 20,
    height: 5,
    page: 1,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size must be strictly 10MB or less.");
        setFile(null);
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/hanko/document/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Upload failed.");
      return;
    }
    setDocumentId(data.id);
    // Fetch a presigned URL for the PDF viewer
    const urlRes = await fetch(`/api/hanko/document/${data.id}/url`);
    const urlData = await urlRes.json();
    setPdfUrl(urlData.url ?? null);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = (page: any) => {
    setPageDimensions({ width: page.width, height: page.height });
  };

  const saveConfig = async () => {
    if (!documentId) return;
    await fetch(`/api/hanko/document/${documentId}/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    toast.success("Signature area saved.");
  };

  const handleSend = async () => {
    if (!signerEmail) return toast.error("Please enter a recipient email.");
    if (!documentId) return toast.error("No document loaded.");
    if (credits < 1) {
      toast.error("You need signature credits to send. Top up below.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/hanko/send-signing-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, email: signerEmail }),
      });

      const data = await res.json();

      if (res.status === 402) {
        toast.error("Insufficient signature credits. Please top up.");
        return;
      }

      if (!res.ok) {
        toast.error(data.error ?? "Failed to send signing link.");
        return;
      }

      // Update credit balance from server response
      if (typeof data.credits === "number") {
        setCredits(data.credits);
      }

      toast.success(`Signing link sent to ${signerEmail}.`);
      setSignerEmail("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[80vh] hanko-slide-enter pb-32">
      <div className="text-center space-y-4 mb-16 relative">
        <h1 className="hanko-h1 uppercase tracking-wider relative z-10">Document Management</h1>
        <p className="text-sm tracking-widest uppercase opacity-40">Administrative Portal</p>
      </div>

      {!documentId ? (
        <div className="hanko-card-header max-w-3xl mx-auto w-full">
          <div className="flex flex-col gap-8">
            <h2 className="hanko-h2">Prepare Document</h2>

            <div className="space-y-4">
              <label className="text-sm tracking-widest uppercase opacity-80 block">
                Target Document
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="application/pdf"
                className="w-full bg-transparent border-b-2 border-[var(--hanko-ink)] text-[var(--hanko-ink)] py-2 focus:outline-none focus:border-[var(--hanko-primary)] cursor-crosshair file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-[var(--hanko-ink)] file:text-white hover:file:bg-[var(--hanko-primary)] file:cursor-crosshair file:transition-colors file:uppercase file:tracking-widest rounded-none"
              />
              <p className="text-xs tracking-wider opacity-60">Maximum size: 10MB</p>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file}
              className="hanko-btn-primary w-fit disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload Document
            </button>
          </div>
        </div>
      ) : (
        <div className="hanko-grid w-full hanko-slide-enter">

          {/* Left: Document View - 8 cols */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-[var(--hanko-border)] min-h-[600px] flex items-center justify-center p-8 relative overflow-hidden hanko-image-multiply">
            <div className="absolute inset-0 border border-[var(--hanko-border)] m-2 pointer-events-none"></div>
            {pdfUrl && (
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                className="max-w-full shadow-md border border-[var(--hanko-border)] relative z-10"
              >
                <div className="relative inline-block bg-white">
                  <Page
                    pageNumber={pageNumber}
                    renderTextLayer={false}
                    width={600}
                    onLoadSuccess={onPageLoadSuccess}
                  />
                  {config.page === pageNumber && (
                    <div
                      className="absolute border-2 border-[var(--hanko-primary)] bg-[var(--hanko-primary)]/10 flex items-center justify-center cursor-move"
                      style={{
                        left: `${config.x}%`,
                        top: `${config.y}%`,
                        width: `${config.width}%`,
                        height: `${config.height}%`,
                      }}
                    >
                      <span className="bg-[var(--hanko-primary)] text-white px-2 py-1 text-xs absolute -top-8 uppercase tracking-widest whitespace-nowrap">Signature Area</span>
                    </div>
                  )}
                </div>
              </Document>
            )}
          </div>

          {/* Right: Configuration - 4 cols */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

            {/* Coordinates panel */}
            <div className="hanko-card-detail flex-1">
              <h3 className="hanko-h2 mb-8 text-2xl border-b border-[var(--hanko-ink)] pb-4 inline-block">Placement</h3>

              <div className="grid grid-cols-2 gap-8 mb-12">
                {[
                  { label: "Left (X%)", field: "x" },
                  { label: "Top (Y%)", field: "y" },
                  { label: "Width (%)", field: "width" },
                  { label: "Height (%)", field: "height" }
                ].map(({ label, field }) => (
                  <div key={field} className="space-y-2">
                    <label className="text-xs uppercase tracking-wider opacity-80">{label}</label>
                    <input
                      type="number"
                      value={config[field as keyof typeof config]}
                      onChange={(e) => setConfig({ ...config, [field]: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-transparent border-b-2 border-[var(--hanko-ink)] text-center text-xl pb-2 focus:outline-none focus:border-[var(--hanko-primary)] cursor-crosshair transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-6">
                <button onClick={saveConfig} className="hanko-btn-primary w-full">
                  Save Signature Area
                </button>

                <div className="pt-8 space-y-4">
                  <p className="text-xs uppercase tracking-wider opacity-80">Signing Link</p>
                  <a
                    href={`/sign/${documentId}`}
                    target="_blank"
                    className="block w-full border border-[var(--hanko-ink)] p-4 text-sm hover:bg-[var(--hanko-primary)] hover:border-[var(--hanko-primary)] hover:text-white break-all transition-colors cursor-crosshair text-center"
                  >
                    {typeof window !== "undefined" ? `${window.location.host}/sign/${documentId}` : `/sign/${documentId}`}
                  </a>
                </div>
              </div>
            </div>

            {/* Pagination */}
            {numPages > 1 && (
              <div className="border border-[var(--hanko-ink)] flex items-center justify-between h-16">
                <button
                  disabled={pageNumber <= 1}
                  onClick={() => { setPageNumber(p => p - 1); setConfig(c => ({ ...c, page: c.page - 1 })); }}
                  className="flex-1 h-full hanko-btn-secondary text-sm border-0 border-r-2 border-[var(--hanko-ink)] disabled:opacity-20"
                >
                  Prev
                </button>
                <span className="flex-1 text-center font-bold">{pageNumber} // {numPages}</span>
                <button
                  disabled={pageNumber >= numPages}
                  onClick={() => { setPageNumber(p => p + 1); setConfig(c => ({ ...c, page: c.page + 1 })); }}
                  className="flex-1 h-full hanko-btn-secondary text-sm border-0 border-l-2 border-[var(--hanko-ink)] disabled:opacity-20"
                >
                  Next
                </button>
              </div>
            )}

            {/* Credits panel */}
            <div className="hanko-card-detail">
              <CreditsCheckout
                initialCredits={credits}
                onBalanceChange={setCredits}
              />
            </div>

            {/* Send for signing panel */}
            <div className="hanko-card-detail space-y-6">
              <div>
                <h3 className="text-xs uppercase tracking-[0.3em] font-bold opacity-40 mb-1">Send for Signing</h3>
                <p className="text-[10px] opacity-30 tracking-wide">1 credit per recipient</p>
              </div>

              {credits < 1 && (
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "10px 12px",
                  background: "rgba(188,36,28,0.05)",
                  border: "1px solid rgba(188,36,28,0.2)",
                  fontSize: 11,
                  color: "var(--hanko-primary)",
                  lineHeight: 1.5,
                }}>
                  <LucideAlertTriangle style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }} />
                  No credits remaining. Top up above to send.
                </div>
              )}

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest opacity-60">Recipient Email</label>
                <input
                  type="email"
                  placeholder="signer@example.com"
                  value={signerEmail}
                  onChange={e => setSignerEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-[var(--hanko-ink)] py-2 text-sm focus:outline-none focus:border-[var(--hanko-primary)] hanko-body"
                />
              </div>

              <button
                onClick={handleSend}
                disabled={sending || credits < 1 || !signerEmail}
                className="w-full border border-[var(--hanko-ink)] py-3 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[var(--hanko-ink)] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {sending ? "Sending…" : "Send Signing Link"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
