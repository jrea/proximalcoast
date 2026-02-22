import {
  LucideFileUp,
  LucideMousePointer2,
  LucideSend,
  LucideCheckCircle2,
  LucideChevronDown,
  LucideLock,
  LucideDownload,
  LucideZap,
  LucideUser,
  LucideCreditCard,
} from 'lucide-react';

export default function HankoHomePage() {
  const faqs = [
    {
      q: "Is signing legally binding?",
      a: "Yes. Hanko complies with the ESIGN Act and UETA. Every signature is time-stamped and logged, making it fully valid in legal proceedings."
    },
    {
      q: "What's the difference between free and paid?",
      a: "The free tier lets you sign your own documents — entirely in your browser, nothing leaves your machine. The paid tier lets you send documents to other people for their signature. We charge $0.10 per 1,000 signatures sent."
    },
    {
      q: "How does the $0.10 / 1,000 pricing work?",
      a: "We charge $0.10 per 1,000 signature requests. Sending to 10 people costs $0.001 — effectively free. Even heavy users sending thousands of documents a month spend cents."
    },
    {
      q: "Is there a subscription?",
      a: "No. You only pay when you send documents to others. Add a card, send a doc, and we charge per signature. No monthly fee, no seat licenses."
    },
    {
      q: "Is my document data private?",
      a: "For self-signing (free tier), your document never leaves your browser. For send-to-sign, documents are encrypted at rest and deleted after all parties have signed."
    }
  ];

  return (
    <div className="flex flex-col items-center min-h-screen hanko-slide-enter pb-32">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Hanko",
              "description": "Simple document signing. Sign yourself for free, or send to others for $0.10 per 1,000 signatures. No subscription.",
              "url": "https://hanko.proximalcoast.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "All",
              "offers": [
                { "@type": "Offer", "price": "0", "priceCurrency": "USD", "name": "Free — Self-Sign" },
                { "@type": "Offer", "price": "0.10", "priceCurrency": "USD", "name": "Pay-per-1000-signatures", "description": "$0.10 per 1,000 signature requests sent" }
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.q,
                "acceptedAnswer": { "@type": "Answer", "text": faq.a }
              }))
            }
          ])
        }}
      />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        className="w-full max-w-6xl mx-auto px-6 pt-20 pb-24"
        style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}
      >
        <div className="hanko-hero-grid" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '56px',
          flexWrap: 'wrap',
        }}>

          {/* Left: copy */}
          <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <p style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.5em',
              opacity: 0.4,
              fontWeight: 700,
            }}>
              Document Signing
            </p>

            <h1 className="hanko-h1" style={{ color: 'var(--hanko-ink)' }}>
              Sign &amp; Send.<br />
              <span style={{ color: 'var(--hanko-primary)', fontStyle: 'italic', fontWeight: 300 }}>
                Done.
              </span>
            </h1>

            <p className="hanko-body" style={{ opacity: 0.65, maxWidth: '420px' }}>
              Upload a PDF, mark where to sign, and either sign it yourself instantly —
              or send it to others for their signature. No subscription, no bloat.
            </p>

            {/* Two paths at a glance */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{
                padding: '10px 16px',
                border: '1px solid var(--hanko-border)',
                background: 'white',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <LucideUser style={{ width: 14, height: 14, opacity: 0.5 }} />
                <span style={{ opacity: 0.7 }}>Self-sign — <strong>Free</strong></span>
              </div>
              <div style={{
                padding: '10px 16px',
                border: '1px solid var(--hanko-border)',
                background: 'white',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <LucideCreditCard style={{ width: 14, height: 14, color: 'var(--hanko-primary)' }} />
                <span style={{ opacity: 0.7 }}>Send to others — <strong>$0.10 / 1k sigs</strong></span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <a href="/admin" className="hanko-btn-primary" style={{ fontSize: '12px' }}>
                Get Started <LucideZap style={{ width: 14, height: 14 }} />
              </a>
              <a href="#how-it-works" className="hanko-scroll-link" style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                color: 'inherit',
              }}>
                See how it works <LucideChevronDown style={{ width: 14, height: 14 }} />
              </a>
            </div>
          </div>

          {/* Right: animated doc demo */}
          <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center' }}>
            <div className="hanko-flow-demo">

              {/* Static document lines background */}
              <div className="hanko-doc-lines">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="hanko-doc-line" />
                ))}
              </div>

              {/* Step badges */}
              <div className="hanko-step-badge hanko-step-badge-1">Step 01 · Upload</div>
              <div className="hanko-step-badge hanko-step-badge-2">Step 02 · Select</div>
              <div className="hanko-step-badge hanko-step-badge-3">Step 03 · Send</div>

              {/* Step 1: Upload */}
              <div className="hanko-flow-step hanko-flow-step-1">
                <div className="hanko-step-icon">
                  <LucideFileUp style={{ width: 24, height: 24 }} />
                </div>
                <div>
                  <div className="hanko-step-label">Upload your PDF</div>
                  <div className="hanko-step-sublabel">drag &amp; drop or browse</div>
                </div>
                {/* Upload progress bar */}
                <div style={{
                  width: 120,
                  height: 2,
                  background: 'var(--hanko-border)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--hanko-primary)',
                    animation: 'hanko-upload-bar 7.5s linear infinite',
                  }} />
                </div>
              </div>

              {/* Step 2: Select area */}
              <div className="hanko-flow-step hanko-flow-step-2">
                <div className="hanko-step-icon">
                  <LucideMousePointer2 style={{ width: 24, height: 24 }} />
                </div>
                <div>
                  <div className="hanko-step-label">Select signature area</div>
                  <div className="hanko-step-sublabel">click &amp; drag on the document</div>
                </div>
              </div>

              {/* Step 3: Send */}
              <div className="hanko-flow-step hanko-flow-step-3">
                <div className="hanko-step-icon">
                  <LucideSend style={{ width: 24, height: 24 }} />
                </div>
                <div>
                  <div className="hanko-step-label">Send for signing</div>
                  <div className="hanko-step-sublabel">email sent · $0.10 / 1,000 sigs</div>
                </div>
              </div>

              {/* Step 2: dashed selection box */}
              <div className="hanko-select-box" />

              {/* Step 2: cursor SVG */}
              <div className="hanko-cursor">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4l7 18 3-7 7-3L4 4z" fill="var(--hanko-primary)" opacity="0.9" />
                </svg>
              </div>

              {/* Step 3: envelope */}
              <div className="hanko-send-envelope" style={{ top: '45%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--hanko-primary)" strokeWidth="1.5">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <polyline points="2,4 12,13 22,4" />
                </svg>
              </div>

              {/* Progress bar at bottom */}
              <div className="hanko-doc-step-bar">
                <div className="hanko-doc-step-bar-fill" />
              </div>

              {/* Step dots */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                zIndex: 2,
              }}>
                <div className="hanko-step-dot hanko-step-dot-1" />
                <div className="hanko-step-dot hanko-step-dot-2" />
                <div className="hanko-step-dot hanko-step-dot-3" />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" className="w-full max-w-5xl mx-auto px-6" style={{ marginTop: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', opacity: 0.4, fontWeight: 700, marginBottom: '12px' }}>
            Two ways to use Hanko
          </p>
          <h2 className="hanko-h2" style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}>
            Pick your path
          </h2>
        </div>

        <div className="hanko-path-grid">
          {/* Free path */}
          <div className="hanko-path-card">
            <div>
              <p style={{ fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.4, fontWeight: 700, marginBottom: '8px' }}>
                Free · No account needed
              </p>
              <h3 style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 700, fontSize: '18px' }}>
                Self-Sign
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { num: '1', label: 'Upload your PDF', active: false },
                { num: '2', label: 'Select the signature area', active: false },
                { num: '3', label: 'Sign it yourself (in browser)', active: false },
                { num: '✓', label: 'Download your signed PDF', active: true },
              ].map((s, i) => (
                <div key={i}>
                  <div className="hanko-path-step">
                    <div className={`hanko-path-step-num${s.active ? ' hanko-path-step-num--active' : ''}`}>
                      {s.num}
                    </div>
                    <span style={{ fontSize: '13px', opacity: 0.75 }}>{s.label}</span>
                  </div>
                  {i < 3 && <div className="hanko-path-connector" />}
                </div>
              ))}
            </div>

            <p style={{ fontSize: '11px', opacity: 0.45, lineHeight: 1.6 }}>
              Everything stays in your browser. Nothing is uploaded. Free forever.
            </p>

            <a href="/admin" className="hanko-btn-secondary" style={{ alignSelf: 'flex-start', fontSize: '11px' }}>
              Sign a document <LucideDownload style={{ width: 13, height: 13 }} />
            </a>
          </div>

          {/* Pro path */}
          <div className="hanko-path-card hanko-path-card--pro">
            <div>
              <p style={{ fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', opacity: 0.4, fontWeight: 700, marginBottom: '8px' }}>
                $0.10 / 1,000 signatures · Account required
              </p>
              <h3 style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 700, fontSize: '18px' }}>
                Send for Signing
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { num: '1', label: 'Upload your PDF', active: false },
                { num: '2', label: 'Select the signature area', active: false },
                { num: '3', label: 'Enter signer email & send', active: true },
                { num: '✓', label: 'Signer gets an email link', active: true },
              ].map((s, i) => (
                <div key={i}>
                  <div className="hanko-path-step">
                    <div className={`hanko-path-step-num${s.active ? ' hanko-path-step-num--active' : ''}`}>
                      {s.num}
                    </div>
                    <span style={{ fontSize: '13px', opacity: 0.75 }}>{s.label}</span>
                  </div>
                  {i < 3 && <div className="hanko-path-connector" />}
                </div>
              ))}
            </div>

            <p style={{ fontSize: '11px', opacity: 0.45, lineHeight: 1.6 }}>
              Charged per email sent. Send to 3 people = $0.30.
              Most users spend under a dollar.
            </p>

            <a href="/auth" className="hanko-btn-primary" style={{ alignSelf: 'flex-start', fontSize: '11px' }}>
              Get started <LucideSend style={{ width: 13, height: 13 }} />
            </a>
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section id="pricing" className="w-full max-w-5xl mx-auto px-6" style={{ marginTop: '96px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', opacity: 0.4, fontWeight: 700, marginBottom: '12px' }}>
            Pricing
          </p>
          <h2 className="hanko-h2" style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}>
            Simple. Honest.
          </h2>
          <p style={{ fontSize: '14px', opacity: 0.55, marginTop: '12px', maxWidth: 440, margin: '12px auto 0' }}>
            Free to sign your own documents. Pay only when you send to others.
          </p>
        </div>

        <div className="hanko-pricing-grid">
          {/* Free tier */}
          <div className="hanko-pricing-card">
            <div>
              <div className="hanko-pricing-tier">Free</div>
              <div className="hanko-pricing-price">$0</div>
              <div className="hanko-pricing-price-unit">forever — no card needed</div>
            </div>

            <div className="hanko-pricing-divider" />

            <ul className="hanko-pricing-feature-list">
              {[
                'Upload any PDF',
                'Select signature area',
                'Sign in your browser (self-sign)',
                'Download your signed PDF',
                'No account required',
                'Nothing uploaded to our servers',
              ].map((f, i) => (
                <li key={i}>
                  <LucideCheckCircle2 className="hanko-pricing-check" />
                  {f}
                </li>
              ))}
            </ul>

            <a href="/admin" className="hanko-btn-secondary" style={{ fontSize: '11px', alignSelf: 'flex-start' }}>
              Start signing free
            </a>
          </div>

          {/* Pay-per-signature tier */}
          <div className="hanko-pricing-card hanko-pricing-card--pro">
            <div>
              <div className="hanko-pricing-tier">Pay-per-Signature</div>
              <div className="hanko-pricing-price" style={{ color: 'white' }}>$0.10</div>
              <div className="hanko-pricing-price-unit">per 1,000 signatures sent</div>
            </div>

            <div className="hanko-pricing-divider" />

            <ul className="hanko-pricing-feature-list">
              {[
                'Everything in free',
                'Send documents to others via email',
                'Track signing status',
                'Download fully-signed agreement',
                'Signed documents encrypted & stored',
                'No monthly fee — pay as you go',
              ].map((f, i) => (
                <li key={i} style={{ color: 'rgba(255,255,255,0.8)' }}>
                  <LucideCheckCircle2 className="hanko-pricing-check" />
                  {f}
                </li>
              ))}
            </ul>

            <div style={{ fontSize: '11px', opacity: 0.45, lineHeight: 1.6, padding: '12px 0' }}>
              Example: 1,000 signers sent = $0.10 total
            </div>

            <a href="/auth" className="hanko-btn-primary" style={{ fontSize: '11px', alignSelf: 'flex-start', background: 'white', color: 'var(--hanko-ink)' }}>
              Add a card &amp; send <LucideCreditCard style={{ width: 13, height: 13 }} />
            </a>
          </div>
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '11px',
          opacity: 0.35,
          letterSpacing: '0.05em',
        }}>
          No surprise charges. No subscriptions. You only pay when you hit send.
        </p>
      </section>

      {/* ── TRUST SIGNALS ─────────────────────────────────── */}
      <section className="w-full max-w-5xl mx-auto px-6" style={{ marginTop: '96px' }}>
        <div style={{
          display: 'flex',
          gap: '1px',
          background: 'var(--hanko-border)',
          border: '1px solid var(--hanko-border)',
          flexWrap: 'wrap',
        }}>
          {[
            { icon: <LucideLock style={{ width: 20, height: 20 }} />, label: 'ESIGN & UETA', sub: 'Legally binding' },
            { icon: <LucideCheckCircle2 style={{ width: 20, height: 20 }} />, label: 'SHA-256 Hashed', sub: 'Tamper-proof' },
            { icon: <LucideUser style={{ width: 20, height: 20 }} />, label: 'No Account', sub: 'For self-sign' },
            { icon: <LucideSend style={{ width: 20, height: 20 }} />, label: 'Email Delivery', sub: 'For others' },
          ].map((item, i) => (
            <div key={i} style={{
              flex: '1 1 140px',
              background: 'var(--hanko-surface)',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'center',
            }}>
              <div style={{ color: 'var(--hanko-primary)', opacity: 0.7 }}>{item.icon}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: "'Noto Serif JP', serif", letterSpacing: '0.05em' }}>{item.label}</div>
              <div style={{ fontSize: '10px', opacity: 0.45, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="w-full max-w-4xl mx-auto px-6" style={{ marginTop: '96px', borderTop: '1px solid var(--hanko-border)', paddingTop: '64px' }}>
        <div style={{ marginBottom: '48px' }}>
          <p style={{ fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', opacity: 0.4, fontWeight: 700, marginBottom: '12px' }}>
            Common Questions
          </p>
          <h2 className="hanko-h2" style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}>
            Questions &amp; <span style={{ fontStyle: 'italic', fontWeight: 300 }}>Answers</span>
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {faqs.map((faq, i) => (
            <details key={i} className="hanko-faq group">
              <summary className="group-hover:text-[var(--hanko-primary)] transition-colors">
                {faq.q}
                <LucideChevronDown style={{ width: 16, height: 16 }} />
              </summary>
              <div className="hanko-faq-content">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────── */}
      <section style={{
        marginTop: '96px',
        width: '100%',
        maxWidth: '900px',
        background: 'var(--hanko-ink)',
        color: 'white',
        padding: 'clamp(48px, 8vw, 80px) clamp(32px, 6vw, 80px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(188,36,28,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
          <h2 style={{
            fontFamily: "'Shippori Mincho', serif",
            fontWeight: 800,
            fontSize: 'clamp(28px, 5vw, 52px)',
            lineHeight: 1.2,
          }}>
            Ready to sign?
          </h2>
          <p style={{ fontSize: '13px', opacity: 0.45, letterSpacing: '0.1em', maxWidth: '360px', lineHeight: 1.7 }}>
            No account needed to get started. Upload a PDF and sign it right now.
          </p>
          <a href="/admin" className="hanko-btn-primary" style={{
            background: 'white',
            color: 'var(--hanko-ink)',
            fontSize: '12px',
            marginTop: '16px',
          }}>
            Upload &amp; Sign Now <LucideZap style={{ width: 14, height: 14 }} />
          </a>
        </div>
      </section>

    </div>
  );
}
