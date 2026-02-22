"use client";

import { useState } from "react";
import { LucideLoader2 } from "lucide-react";

interface ConsentGateProps {
  documentId: string;
  signerEmail: string;
  onConsented: () => void;
}

/**
 * BKD-styled consent gate — same logic as Hanko ConsentGate,
 * using bkd-* CSS classes and BKD brand voice.
 */
export function ConsentGate({ documentId, signerEmail, onConsented }: ConsentGateProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConsent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hanko/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          signerEmail,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          browserVersion: navigator.userAgent,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to record consent.");
      }

      onConsented();
    } catch (err: any) {
      setError(err.message ?? "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bkd-shoji-enter">
      <div className="bkd-card-header max-w-xl w-full space-y-8">
        <span className="bg-text">CONSENT</span>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#BC241C] text-white px-3 py-1 bkd-mono text-[10px]">
            <div className="w-1.5 h-1.5 bg-white shadow-[0_0_8px_rgba(255,255,255,1)]" />
            Electronic Authorization Required
          </div>
          <h1 className="bkd-h1">Review &amp; Authorize</h1>
          <p className="bkd-mono text-[10px] opacity-60 uppercase tracking-widest">
            Bushin Kan Dojo · Official Document System
          </p>
        </div>

        {/* Consent body */}
        <div className="bkd-card-detail space-y-4 relative">
          <p className="bkd-mono text-[11px] leading-relaxed opacity-80">
            You are about to electronically authorize a legally binding document.
            By confirming below, you agree to:
          </p>
          <ul className="space-y-3">
            {[
              "Conduct this transaction using an electronic signature.",
              "That your authorization is legally equivalent to a handwritten signature under the ESIGN Act, UETA, and eIDAS 2.0.",
              "That your consent, browser information, viewport size, IP address, and timestamp will be recorded as a forensic audit event.",
              "That a Certificate of Completion will be generated mapping every mark to its forensic data.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-[#BC241C] shrink-0 mt-1.5" />
                <span className="bkd-mono text-[10px] opacity-70 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
          <p className="bkd-mono text-[10px] opacity-40 italic pt-2 border-t border-[var(--bkd-border)]">
            If you do not consent to electronic authorization, close this page.
          </p>
        </div>

        {/* Signer */}
        <div className="flex items-center gap-3 border border-[var(--bkd-border)] px-5 py-3 bg-[var(--bkd-surface)]">
          <span className="bkd-mono text-[10px] opacity-50 uppercase tracking-[0.2em]">Authorizing as:</span>
          <span className="bkd-mono text-[10px] font-bold">{signerEmail || "—"}</span>
        </div>

        {error && (
          <div className="bkd-mono text-[10px] text-[#BC241C] bg-[#BC241C]/5 border border-[#BC241C] px-4 py-3">
            &gt;_ {error}
          </div>
        )}

        <button
          onClick={handleConsent}
          disabled={loading}
          className="bkd-btn-primary w-full"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          <svg><rect x="0" y="0" width="100%" height="100%" /></svg>
          {loading ? (
            <span className="flex items-center justify-center gap-2 relative z-10">
              <LucideLoader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
              Recording consent...
            </span>
          ) : (
            <span className="relative z-10">I Authorize &amp; Continue</span>
          )}
        </button>

        <p className="bkd-mono text-[10px] opacity-30 text-center">
          This consent is recorded as Event #1 of your signing session audit trail.
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
