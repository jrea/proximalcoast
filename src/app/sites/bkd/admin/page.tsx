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

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setDocumentId(data.id);

    const urlRes = await fetch(`/api/document/${data.id}/url`);
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
    await fetch(`/api/document/${documentId}/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    alert("Configuration saved! You can now use the signing link.");
  };

  return (
    <div className="bg-[#050505] min-h-screen text-slate-100 flex flex-col items-center justify-between p-6 md:p-12 font-sans selection:bg-emerald-900/50 selection:text-white relative overflow-hidden">

      {/* Background Organic/Bonsai Atmosphere (Soft, deep, flowing) */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-emerald-950/20 rounded-full blur-[150px] pointer-events-none -translate-x-1/3 -translate-y-1/3 mix-blend-screen mix-blend-lighten"></div>
      <div className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-stone-900/40 rounded-full blur-[180px] pointer-events-none translate-x-1/3 translate-y-1/3 mix-blend-lighten"></div>
      <div className="fixed top-1/2 left-1/2 w-[600px] h-[600px] bg-emerald-900/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 mix-blend-screen"></div>

      {/* Subtle grain overlay */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 pointer-events-none mix-blend-overlay z-0"></div>

      <div className="w-full max-w-6xl space-y-12 z-10 flex flex-col flex-1 relative">

        {/* Persistent BKD Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto pt-4 md:pt-12 relative z-10">
          <div className="space-y-2 relative z-10">
            <h1 className="text-4xl md:text-5xl font-black tracking-widest uppercase text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" style={{ textShadow: "0 0 40px rgba(52,211,153,0.1), 0 0 10px rgba(255,255,255,0.2)" }}>
              Bushin Kan Dojo
            </h1>
            <p className="text-emerald-500/60 text-xs font-bold uppercase tracking-[0.4em] pt-2">
              Official Member Portal
            </p>
          </div>
          <div className="relative inline-block mt-4">
            <div className="absolute top-1/2 -left-8 w-6 h-px bg-stone-500/50"></div>
            <p className="text-stone-300/80 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] inline-block px-4">
              Administrative Access
            </p>
            <div className="absolute top-1/2 -right-8 w-6 h-px bg-stone-500/50"></div>
          </div>
        </div>

        {/* Samurai Katana Outer Container / Bonsai Inner Elements */}
        <div className="bg-black/40 backdrop-blur-2xl border-x-2 border-white/20 shadow-[0_10px_60px_rgba(0,0,0,0.9)] p-0 rounded-none relative overflow-hidden flex flex-col mb-16 transition-all duration-700">

          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

          {/* Belt Color Decorative Strip (Subtly embedded) */}
          <div className="h-1 w-full flex shrink-0 relative z-20 opacity-80 saturate-50 brightness-110">
            <div className="h-full flex-1 bg-stone-200" title="White Belt" />
            <div className="h-full flex-1 bg-yellow-500" title="Yellow Belt" />
            <div className="h-full flex-1 bg-emerald-600" title="Green Belt" />
            <div className="h-full flex-1 bg-cyan-700" title="Blue Belt" />
            <div className="h-full flex-1 bg-amber-800" title="Brown Belt" />
            <div className="h-full flex-1 bg-black border-l border-white/10" title="Black Belt" />
          </div>

          <div className="relative z-10 p-6 md:p-12 lg:p-16">
            {!documentId && (
              <div className="bg-stone-900/30 rounded-2xl border border-white/5 p-6 md:p-10 flex flex-col lg:flex-row gap-8 items-start lg:items-end justify-between backdrop-blur-xl relative overflow-hidden group shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-500">
                <div className="flex-1 w-full space-y-5 relative z-10 bg-transparent">
                  <label className="text-xs lg:text-sm uppercase font-black tracking-[0.3em] text-stone-200 pb-2 inline-block mb-2 drop-shadow-sm">Target Document</label>
                  <div className="relative group/input">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="application/pdf"
                      className="w-full text-sm text-stone-400 file:mr-6 file:py-4 file:px-8 file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-[0.2em] file:bg-white/5 file:text-white hover:file:bg-white/10 file:transition-colors file:cursor-pointer file:rounded-full bg-black/40 border border-white/5 p-2 rounded-full shadow-inner focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                    />
                    <div className="absolute inset-0 border border-transparent pointer-events-none transition-colors group-hover/input:border-emerald-500/30 rounded-full"></div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-[10px] text-stone-400 font-black uppercase tracking-[0.2em] inline-block px-4 py-2 bg-black/40 border border-white/5 backdrop-blur-sm rounded-full">
                    Maximum file size: 10MB
                  </div>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={!file}
                  className="bg-emerald-800/20 text-emerald-100 px-10 py-5 text-xs font-black uppercase tracking-[0.3em] rounded-full hover:bg-emerald-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0 border border-emerald-500/30 w-full lg:w-auto relative z-10 shadow-sm backdrop-blur-lg group overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  Upload & Configure
                </button>
              </div>
            )}

            {documentId && pdfUrl && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 lg:mt-2">
                <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 relative">

                  {/* Left: Document View */}
                  <div className="flex-1 rounded-sm border border-white/10 relative min-h-[600px] flex items-center justify-center bg-black/40 p-4 md:p-8 overflow-hidden group shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl">

                    <Document
                      file={pdfUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      className="max-w-full inline-block shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-white/5 bg-[#0a0a0a] relative z-10 transition-transform duration-700 rounded-sm overflow-hidden"
                    >
                      <div className="relative inline-block isolate bg-white">
                        <Page
                          pageNumber={pageNumber}
                          renderTextLayer={false}
                          width={600}
                          onLoadSuccess={onPageLoadSuccess}
                          className=""
                        />
                        {/* Visual signature box */}
                        {config.page === pageNumber && (
                          <div
                            className="absolute border border-slate-400 bg-slate-500/10 backdrop-blur-[2px] cursor-crosshair flex items-center justify-center transition-all duration-300 shadow-[0_0_30px_rgba(148,163,184,0.2)] hover:bg-slate-500/20 rounded-none mix-blend-difference"
                            style={{
                              left: `${config.x}%`,
                              top: `${config.y}%`,
                              width: `${config.width}%`,
                              height: `${config.height}%`,
                            }}
                          >
                            <span className="text-[10px] text-white bg-slate-800/90 backdrop-blur-md border border-slate-400/50 font-black uppercase tracking-[0.3em] px-3 py-1.5 select-none rounded-none whitespace-nowrap -translate-y-[200%] md:-translate-y-[150%] absolute md:static top-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                              Target Area
                            </span>
                            {/* Glass crosshairs */}
                            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-400/50 mix-blend-overlay"></div>
                            <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-400/50 mix-blend-overlay"></div>
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/80"></div>
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/80"></div>
                          </div>
                        )}
                      </div>
                    </Document>
                  </div>

                  {/* Right: Configuration Form */}
                  <div className="xl:w-[420px] shrink-0 bg-[#08080a]/80 backdrop-blur-3xl rounded-2xl border border-white/5 flex flex-col justify-between relative z-20 overflow-hidden shadow-[0_10px_40px_0_rgba(0,0,0,0.8)]">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-stone-400/30 to-transparent"></div>

                    <div className="p-6 md:p-8 space-y-8 flex-1">
                      <div className="space-y-3 relative">
                        <h2 className="text-sm md:text-base font-black uppercase tracking-[0.3em] text-stone-200 pb-3 inline-block relative z-10 drop-shadow-sm border-b border-stone-800">Coordinates</h2>
                        <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-[0.4em] pt-1">Layout Settings</p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-3 bg-white/[0.02] p-5 rounded-xl border border-white/5 shadow-inner backdrop-blur-sm">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300 flex justify-between">
                            <span>Target Page</span>
                            <span className="text-stone-500 font-mono tracking-widest">{pageNumber} of {numPages}</span>
                          </label>
                          <div className="relative group/page">
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
                              className="w-full bg-black/50 border border-white/5 rounded-full p-4 text-sm text-white font-black font-mono focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/20 text-center"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-white/[0.02] p-5 rounded-xl border border-white/5 shadow-inner backdrop-blur-sm">
                          {[
                            { label: "Left (X%)", field: "x" },
                            { label: "Top (Y%)", field: "y" },
                            { label: "Width (%)", field: "width" },
                            { label: "Height (%)", field: "height" }
                          ].map(({ label, field }) => (
                            <div key={field} className="space-y-2 relative group/field">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">{label}</label>
                              <input
                                type="number"
                                value={config[field as keyof typeof config]}
                                onChange={(e) => setConfig({ ...config, [field]: parseFloat(e.target.value) })}
                                className="w-full bg-black/50 border border-white/5 rounded-full p-4 text-sm text-white font-black font-mono focus:outline-none focus:border-emerald-500/50 transition-all text-center"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={saveConfig}
                          className="w-full bg-stone-200 text-stone-900 px-6 py-5 text-xs font-black uppercase tracking-[0.3em] rounded-full hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all active:scale-95 border border-transparent shadow-sm"
                        >
                          Save Layout
                        </button>
                      </div>

                      <div className="pt-8 border-t border-white/10 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400/60 drop-shadow-sm">Signing Link</p>
                        <a href={`/sign/${documentId}`} target="_blank" className="block w-full bg-black/60 border border-white/5 rounded-sm p-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white break-all hover:bg-black/80 transition-colors relative overflow-hidden group shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                          {window.location.origin.replace("https://", "").replace("http://", "")}/sign/{documentId}
                          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black group-hover:from-black/90 to-transparent pointer-events-none transition-colors"></div>
                        </a>
                      </div>
                    </div>

                    {/* Pagination Strip */}
                    {numPages > 1 && (
                      <div className="flex items-center justify-between border-t border-white/5 bg-black/60 h-16 backdrop-blur-lg">
                        <button
                          disabled={pageNumber <= 1}
                          onClick={() => {
                            setPageNumber(p => p - 1);
                            setConfig(c => ({ ...c, page: c.page - 1 }));
                          }}
                          className="flex-1 h-full px-4 text-[10px] font-black uppercase tracking-[0.3em] disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/5 transition-colors border-r border-white/5 flex items-center justify-center text-stone-400 hover:text-white"
                        >
                          &larr; Prev
                        </button>
                        <span className="flex-1 text-center text-xs font-black font-mono tracking-[0.2em] px-2 text-stone-200">{pageNumber} <span className="text-stone-600">/</span> {numPages}</span>
                        <button
                          disabled={pageNumber >= numPages}
                          onClick={() => {
                            setPageNumber(p => p + 1);
                            setConfig(c => ({ ...c, page: c.page + 1 }));
                          }}
                          className="flex-1 h-full px-4 text-[10px] font-black uppercase tracking-[0.3em] disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/5 transition-colors border-l border-white/5 flex items-center justify-center text-stone-400 hover:text-white"
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

      {/* Persistent BKD Footer */}
      <div className="relative text-center z-10 w-full pt-8 pb-4 opacity-50">
        <p className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-black border-t border-white/10 inline-block pt-8 px-12 mix-blend-screen">
          Dai Nippon Butoku Kai
        </p>
      </div>
    </div>
  );
}
