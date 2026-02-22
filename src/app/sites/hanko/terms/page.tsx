export default function HankoTermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 space-y-16 hanko-slide-enter">
      <div className="space-y-4">
        <h1 className="hanko-h1 text-4xl">Legal & Liability</h1>
        <p className="text-xs uppercase tracking-[0.4em] opacity-40 font-bold">Document Signing Terms of Service</p>
      </div>

      <div className="prose prose-sm max-w-none opacity-80 space-y-12 hanko-body">
        <section className="space-y-6">
          <h2 className="text-lg font-bold uppercase tracking-widest border-b border-[var(--hanko-border)] pb-2">1. Electronic Records and Signatures</h2>
          <p>
            By using Hanko, you consent to use electronic records and signatures. This service is designed to comply with
            the Electronic Signatures in Global and National Commerce Act (ESIGN) and the Uniform Electronic Transactions Act (UETA).
            Your electronic signature on a document is as legally binding as a physical signature on paper.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-lg font-bold uppercase tracking-widest border-b border-[var(--hanko-border)] pb-2">2. Liability Disclaimer</h2>
          <p>
            HANKO IS PROVIDED "AS IS" WITHOUT ANY WARRANTIES. Proximal Coast and its affiliates are not responsible
            for the legal validity, enforceability, or content of any documents signed using this platform. It is
            the responsibility of the signing parties to ensure their documents meet local legal requirements.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-lg font-bold uppercase tracking-widest border-b border-[var(--hanko-border)] pb-2">3. Cryptographic Verification</h2>
          <p>
            Hanko provides cryptographic hashing (SHA-256) and audit logs for document integrity. However, this
            does not constitute a guarantee of identity. Users should verify the identity of signers independently
            before relying on any signed document.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-lg font-bold uppercase tracking-widest border-b border-[var(--hanko-border)] pb-2">4. Document Storage</h2>
          <p>
            While we provide secure storage for your documents, Hanko is not a permanent archive service.
            Users are advised to download and backup their signed documents upon completion. We reserve the
            right to purge documents in accordance with our data retention policies.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-lg font-bold uppercase tracking-widest border-b border-[var(--hanko-border)] pb-2">5. Compliance</h2>
          <p>
            You agree to use this service only for lawful purposes. You are solely responsible for compliance
            with all applicable laws, including data protection and privacy regulations (GDPR, CCPA, etc.).
          </p>
        </section>
      </div>

      <div className="pt-24 border-t border-[var(--hanko-border)] opacity-30 text-center">
        <p className="text-[10px] uppercase tracking-[0.5em]">Proximal Coast • Hanko Division • {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
