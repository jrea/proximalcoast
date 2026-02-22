"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

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
        toast.error("File size must be strictly 10MB or less. Otherwise it'll explode.");
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

    const urlRes = await fetch(`/api/hanko/document/${data.id}/url`);
    const urlData = await urlRes.json();
    setPdfUrl(urlData.url);
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
    toast.success("Configuration saved! You can now use the signing link.");
  };

  return (
    <div className="flex flex-col items-center justify-between p-6 md:p-12 relative overflow-hidden min-h-screen">
      <div className="w-full max-w-6xl space-y-16 z-10 flex flex-col flex-1 relative mt-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto relative z-10">
          <div className="space-y-4 relative z-10">
            <h1 className="bkd-h1 uppercase">Bushin Kan Dojo</h1>
            <p className="bkd-mono text-xs font-bold uppercase tracking-[0.4em] pt-2 border-b border-[var(--bkd-border)] pb-4 inline-block opacity-60">
              Official Member Portal
            </p>
          </div>
          <div className="relative inline-block mt-4">
            <p className="opacity-80 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] inline-block px-4">
              Administrative Access
            </p>
          </div>
        </div>

        <div className="bkd-card-detail bg-[var(--bkd-surface)] p-0 rounded-none relative overflow-hidden flex flex-col mb-16 transition-all duration-700 border-none">
          <div className="relative z-10 p-6 md:p-12 lg:p-16">
            {!documentId && (
              <div className="bkd-card-header flex flex-col lg:flex-row gap-8 items-start lg:items-end justify-between group bg-white">
                <span className="bg-text">DOCUMENT</span>
                <div className="flex-1 w-full space-y-5 relative z-10">
                  <label className="bkd-label mb-2">Target Document</label>
                  <div className="relative group/input">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="application/pdf"
                      className="bkd-input"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-3 bkd-mono text-[10px] opacity-70 px-4 py-2 border border-[var(--bkd-border)] rounded-none inline-block">
                    Maximum file size: 10MB
                  </div>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={!file}
                  className="bkd-btn-primary w-full lg:w-auto relative z-10 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload & Configure
                </button>
              </div>
            )}

            {documentId && pdfUrl && (
              <div className="bkd-shoji-enter lg:mt-2">
                <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 relative">

                  {/* Left: Document View */}
                  <div className="flex-1 rounded-sm border border-[var(--bkd-border)] relative min-h-[600px] flex items-center justify-center p-4 md:p-8 overflow-hidden group mix-blend-multiply bg-white">
                    <Document
                      file={pdfUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      className="max-w-full inline-block shadow-lg border border-[var(--bkd-border)] relative z-10 transition-transform duration-700 rounded-sm overflow-hidden"
                    >
                      <div className="relative inline-block isolate bg-white">
                        <Page
                          pageNumber={pageNumber}
                          renderTextLayer={false}
                          width={600}
                          onLoadSuccess={onPageLoadSuccess}
                        />
                        {/* Visual signature box */}
                        {config.page === pageNumber && (
                          <div
                            className="absolute border-2 border-[#BC241C] bg-[#BC241C]/10 cursor-crosshair flex items-center justify-center transition-all duration-300"
                            style={{
                              left: `${config.x}%`,
                              top: `${config.y}%`,
                              width: `${config.width}%`,
                              height: `${config.height}%`,
                            }}
                          >
                            <span className="text-[10px] bkd-mono bg-white text-[#BC241C] border border-[#BC241C] px-3 py-1.5 select-none whitespace-nowrap -translate-y-[200%] absolute md:static top-0 shadow-md">
                              Target Area
                            </span>
                          </div>
                        )}
                      </div>
                    </Document>
                  </div>

                  {/* Right: Configuration Form */}
                  <div className="xl:w-[420px] shrink-0 border border-[var(--bkd-border)] flex flex-col justify-between relative z-20 overflow-hidden bg-white shadow-sm">
                    <div className="p-6 md:p-8 space-y-8 flex-1">
                      <div className="space-y-3 relative">
                        <h2 className="bkd-h2 text-xl inline-block relative z-10 border-b border-[var(--bkd-border)] pb-2">Coordinates</h2>
                        <p className="bkd-mono text-[10px] opacity-70 pt-1">Layout Settings</p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3 bg-[var(--bkd-surface)] p-5 border border-[var(--bkd-border)] hidden">
                          <label className="bkd-mono text-[10px] opacity-70 flex justify-between">
                            <span>Target Page</span>
                            <span className="font-mono">{pageNumber} // {numPages}</span>
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={numPages}
                            value={pageNumber}
                            onChange={(e) => {
                              const p = parseInt(e.target.value) || 1;
                              setPageNumber(p);
                              setConfig({ ...config, page: p });
                            }}
                            className="bkd-input text-center"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-[var(--bkd-surface)] p-5 border border-[var(--bkd-border)]">
                          {[
                            { label: "Left (X%)", field: "x" },
                            { label: "Top (Y%)", field: "y" },
                            { label: "Width (%)", field: "width" },
                            { label: "Height (%)", field: "height" }
                          ].map(({ label, field }) => (
                            <div key={field} className="space-y-2 relative group/field">
                              <label className="bkd-mono text-[10px] opacity-70">{label}</label>
                              <input
                                type="number"
                                value={config[field as keyof typeof config]}
                                onChange={(e) => setConfig({ ...config, [field]: parseFloat(e.target.value) || 0 })}
                                className="bkd-input text-center"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={saveConfig}
                          className="bkd-btn-primary w-full shadow-sm"
                        >
                          Save Layout
                        </button>
                      </div>

                      <div className="pt-8 border-t border-[var(--bkd-border)] space-y-4">
                        <p className="bkd-mono text-[10px] opacity-70">Signing Link</p>
                        <a href={`/sign/${documentId}`} target="_blank" className="block w-full border border-[var(--bkd-border)] p-5 text-[10px] bkd-mono hover:bg-[#BC241C] hover:text-white hover:border-[#BC241C] break-all transition-colors relative overflow-hidden group bg-white shadow-sm">
                          {window.location.origin.replace("https://", "").replace("http://", "")}/sign/{documentId}
                        </a>
                      </div>
                    </div>

                    {/* Pagination Strip */}
                    {numPages > 1 && (
                      <div className="flex items-center justify-between border-t border-[var(--bkd-border)] bg-[var(--bkd-surface)] h-16">
                        <button
                          disabled={pageNumber <= 1}
                          onClick={() => {
                            setPageNumber(p => p - 1);
                            setConfig(c => ({ ...c, page: c.page - 1 }));
                          }}
                          className="flex-1 h-full px-4 bkd-mono text-[10px] disabled:opacity-20 hover:bg-[#BC241C] hover:text-white transition-colors border-r border-[var(--bkd-border)] flex items-center justify-center opacity-70"
                        >
                          &larr; Prev
                        </button>
                        <span className="flex-1 text-center text-xs font-mono font-bold">{pageNumber} / {numPages}</span>
                        <button
                          disabled={pageNumber >= numPages}
                          onClick={() => {
                            setPageNumber(p => p + 1);
                            setConfig(c => ({ ...c, page: c.page + 1 }));
                          }}
                          className="flex-1 h-full px-4 bkd-mono text-[10px] disabled:opacity-20 hover:bg-[#BC241C] hover:text-white transition-colors border-l border-[var(--bkd-border)] flex items-center justify-center opacity-70"
                        >
                          Next &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative text-center z-10 w-full pt-8 pb-4 opacity-50">
        <p className="bkd-mono text-[10px] border-t border-[var(--bkd-border)] inline-block pt-8 px-12">
          Dai Nippon Butoku Kai
        </p>
      </div>
    </div>
  );
}
