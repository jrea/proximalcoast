"use client";

import { useState } from "react";
import { LucideShieldCheck, LucideLoader2 } from "lucide-react";

interface ConsentGateProps {
  documentId: string;
  signerEmail: string;
  onConsented: () => void;
}

/**
 * ConsentGate — shown before the signing interface.
 * Captures affirmative consent per ESIGN Act § 101(c)(1) and eIDAS 2.0 requirements.
 * Logs browser version, viewport size, and IP (via server) to prove the signer
 * had visibility of and agreed to the Electronic Business Consent.
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
    <div
      className="min-h-screen flex items-center justify-center p-6 hanko-slide-enter"
      style={{ background: "var(--hanko-surface)" }}
    >
      <div
        style={{
          maxWidth: 560,
          width: "100%",
          border: "1px solid var(--hanko-border)",
          background: "white",
          padding: "48px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LucideShieldCheck
              style={{ width: 22, height: 22, color: "var(--hanko-primary)", flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.4em",
                fontWeight: 700,
                opacity: 0.5,
              }}
            >
              Electronic Business Consent
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Noto Serif JP', 'Shippori Mincho', serif",
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.3,
              color: "var(--hanko-ink)",
            }}
          >
            Review &amp; Consent to Sign Electronically
          </h1>
        </div>

        {/* Consent body */}
        <div
          style={{
            fontSize: 12,
            lineHeight: 1.9,
            opacity: 0.7,
            padding: "20px 0",
            borderTop: "1px solid var(--hanko-border)",
            borderBottom: "1px solid var(--hanko-border)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <p>
            You are about to electronically sign a legally binding document. By clicking{" "}
            <strong>"I Agree &amp; Continue"</strong>, you confirm:
          </p>
          <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            <li>
              You have read and agree to conduct this transaction using electronic signatures.
            </li>
            <li>
              You understand that your electronic signature is legally equivalent to a handwritten
              signature under the <strong>ESIGN Act</strong>, <strong>UETA</strong>, and{" "}
              <strong>eIDAS 2.0</strong>.
            </li>
            <li>
              Your consent, browser information, viewport size, IP address, and the exact time of
              this action will be logged as a forensic record of your intent.
            </li>
            <li>
              You have the ability to download a paper copy by printing the signed PDF after
              completion.
            </li>
          </ul>
          <p style={{ fontSize: 11, opacity: 0.55, fontStyle: "italic" }}>
            If you do not consent to electronic signing, please close this page.
          </p>
        </div>

        {/* Signer email confirmation */}
        <div
          style={{
            padding: "12px 16px",
            background: "var(--hanko-surface)",
            border: "1px solid var(--hanko-border)",
            fontSize: 11,
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <span style={{ opacity: 0.45, textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Signing as:
          </span>
          <span style={{ fontWeight: 700 }}>{signerEmail}</span>
        </div>

        {error && (
          <div style={{ fontSize: 12, color: "var(--hanko-primary)", padding: "8px 0" }}>
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleConsent}
          disabled={loading}
          className="hanko-btn-primary"
          style={{ width: "100%", justifyContent: "center", opacity: loading ? 0.6 : 1 }}
        >
          {loading ? (
            <LucideLoader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
          ) : (
            "I Agree & Continue"
          )}
        </button>

        <p style={{ fontSize: 10, opacity: 0.35, textAlign: "center", lineHeight: 1.6 }}>
          This consent is recorded as Event #1 of your signing session audit trail.
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
