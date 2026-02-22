"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { LucideCheck, LucideLoader2, LucideX } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Credits represent $0.05 / mark. Packs priced at volume:
// 1 document (base $1.50) + marks at $0.05 each.
const PACKS = [
  { id: "starter", label: "30 marks", price: "$1.50", note: "~1 document" },
  { id: "pro", label: "200 marks", price: "$9.00", note: "~6–7 documents" },
  { id: "studio", label: "1,000 marks", price: "$40", note: "High volume" },
] as const;

type PackId = (typeof PACKS)[number]["id"];

/* ─── Inner form (inside Elements provider) ─── */
function CheckoutForm({
  onSuccess,
  credits,
}: {
  onSuccess: (newBalance: number) => void;
  credits: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: submitErr } = await elements.submit();
    if (submitErr) {
      setError(submitErr.message ?? "Payment failed");
      setLoading(false);
      return;
    }

    const { error: confirmErr, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (confirmErr) {
      setError(confirmErr.message ?? "Payment failed");
    } else if (paymentIntent?.status === "succeeded") {
      // Fetch updated balance from server
      const res = await fetch("/api/credits");
      const data = await res.json().catch(() => ({}));
      onSuccess(data.credits ?? credits);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PaymentElement
        options={{
          layout: "tabs",
          fields: { billingDetails: { address: "never" } },
        }}
      />

      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          color: "var(--hanko-primary)", fontSize: 12, padding: "8px 0",
        }}>
          <LucideX style={{ width: 14, height: 14 }} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe}
        className="hanko-btn-primary"
        style={{ fontSize: 12, opacity: loading ? 0.6 : 1 }}
      >
        {loading ? (
          <LucideLoader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />
        ) : (
          "Complete Purchase"
        )}
      </button>
    </form>
  );
}

/* ─── Main exported component ─── */
export function CreditsCheckout({
  initialCredits,
  onBalanceChange,
}: {
  initialCredits: number;
  onBalanceChange?: (newBalance: number) => void;
}) {
  const [credits, setCredits] = useState(initialCredits);
  const [selectedPack, setSelectedPack] = useState<PackId>("starter");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showShop, setShowShop] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    setSuccess(false);
    setClientSecret(null);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pack: selectedPack }),
    });

    const data = await res.json();

    if (data.immediate) {
      // Charged instantly with saved card
      const newBal = data.newBalance ?? credits + data.creditsAdded;
      setCredits(newBal);
      onBalanceChange?.(newBal);
      setSuccess(true);
      setLoading(false);
      setTimeout(() => { setSuccess(false); setShowShop(false); }, 3000);
      return;
    }

    if (data.clientSecret) {
      setClientSecret(data.clientSecret);
    }

    setLoading(false);
  };

  const handlePaymentSuccess = (newBalance: number) => {
    setCredits(newBalance);
    onBalanceChange?.(newBalance);
    setClientSecret(null);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setShowShop(false); }, 3000);
  };

  const elementsOptions = clientSecret
    ? {
      clientSecret,
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#BC241C",
          colorBackground: "#F7F2E8",
          colorText: "#1A1A1B",
          colorDanger: "#BC241C",
          borderRadius: "0px",
          fontFamily: "Inter, sans-serif",
          fontSizeBase: "13px",
        },
      },
    }
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Balance row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.3em", opacity: 0.4, fontWeight: 700 }}>
            Signature Credits
          </div>
          <div style={{
            fontFamily: "'Shippori Mincho', serif",
            fontWeight: 800,
            fontSize: 28,
            color: credits === 0 ? "var(--hanko-primary)" : "var(--hanko-ink)",
            lineHeight: 1.2,
          }}>
            {credits.toLocaleString()}
          </div>
          <div style={{ fontSize: 10, opacity: 0.4 }}>
            {credits === 0 ? "No credits remaining" : `${credits} mark${credits === 1 ? "" : "s"} · ≈ ${(credits * 0.05).toFixed(2)} value`}
          </div>
        </div>

        {success ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#16a34a", fontSize: 12, fontWeight: 600 }}>
            <LucideCheck style={{ width: 16, height: 16 }} /> Added!
          </div>
        ) : (
          <button
            onClick={() => setShowShop(s => !s)}
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              fontWeight: 700,
              opacity: 0.5,
              background: "none",
              border: "none",
              cursor: "crosshair",
              padding: 0,
              color: "inherit",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0.5")}
          >
            {showShop ? "Cancel" : "Top Up →"}
          </button>
        )}
      </div>

      {/* Shop panel */}
      {showShop && !success && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Pack selector */}
          {!clientSecret && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--hanko-border)" }}>
                {PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    onClick={() => setSelectedPack(pack.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: selectedPack === pack.id ? "var(--hanko-ink)" : "var(--hanko-surface)",
                      color: selectedPack === pack.id ? "white" : "var(--hanko-ink)",
                      border: "none",
                      cursor: "crosshair",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{pack.label}</div>
                      <div style={{ fontSize: 10, opacity: 0.5 }}>{pack.note}</div>
                    </div>
                    <div style={{
                      fontFamily: "'Shippori Mincho', serif",
                      fontWeight: 800,
                      fontSize: 18,
                    }}>
                      {pack.price}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleBuy}
                disabled={loading}
                className="hanko-btn-primary"
                style={{ fontSize: 12, width: "100%", justifyContent: "center", opacity: loading ? 0.6 : 1 }}
              >
                {loading ? (
                  <LucideLoader2 style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }} />
                ) : (
                  `Buy ${PACKS.find(p => p.id === selectedPack)?.label}`
                )}
              </button>
            </>
          )}

          {/* Payment form */}
          {clientSecret && elementsOptions && (
            <div style={{ padding: 16, border: "1px solid var(--hanko-border)", background: "white" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.3em", opacity: 0.4, marginBottom: 16, fontWeight: 700 }}>
                Add Payment Method
              </div>
              <Elements stripe={stripePromise} options={elementsOptions}>
                <CheckoutForm onSuccess={handlePaymentSuccess} credits={credits} />
              </Elements>
              <button
                onClick={() => setClientSecret(null)}
                style={{ marginTop: 12, fontSize: 11, opacity: 0.4, background: "none", border: "none", cursor: "crosshair", padding: 0 }}
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
