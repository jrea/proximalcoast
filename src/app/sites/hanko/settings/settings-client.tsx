"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LucideUser, LucideLogOut, LucideZap, LucideCalendar, LucideMail } from "lucide-react";
import { CreditsCheckout } from "../_components/credits-checkout";
import { toast } from "sonner";

export default function SettingsClient({
  name,
  email,
  credits,
  memberSince,
}: {
  name: string;
  email: string;
  credits: number;
  memberSince: string;
}) {
  const router = useRouter();
  const [currentCredits, setCurrentCredits] = useState(credits);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setLoggingOut(true);
    try {
      await authClient.signOut();
      router.push("/auth");
    } catch {
      toast.error("Sign out failed.");
      setLoggingOut(false);
    }
  };

  const joined = memberSince
    ? new Date(memberSince).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : null;

  return (
    <div className="hanko-slide-enter max-w-2xl mx-auto w-full pb-32" style={{ display: "flex", flexDirection: "column", gap: 2 }}>

      <div style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 9, letterSpacing: "0.5em", textTransform: "uppercase", opacity: 0.4, fontWeight: 700, marginBottom: 8 }}>
          Account
        </p>
        <h1 className="hanko-h2" style={{ fontSize: "clamp(24px, 3vw, 36px)" }}>Settings</h1>
      </div>

      {/* Profile card */}
      <div className="hanko-card-detail" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.4em", opacity: 0.35, fontWeight: 700 }}>
          Profile
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Name */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "1px solid var(--hanko-border)" }}>
            <div style={{ width: 36, height: 36, background: "var(--hanko-ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LucideUser style={{ width: 16, height: 16, color: "white" }} />
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 2 }}>Name</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{name}</div>
            </div>
          </div>

          {/* Email */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "1px solid var(--hanko-border)" }}>
            <div style={{ width: 36, height: 36, background: "var(--hanko-surface)", border: "1px solid var(--hanko-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LucideMail style={{ width: 16, height: 16, opacity: 0.5 }} />
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 2 }}>Email</div>
              <div style={{ fontSize: 15 }}>{email}</div>
            </div>
          </div>

          {/* Member since */}
          {joined && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, background: "var(--hanko-surface)", border: "1px solid var(--hanko-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <LucideCalendar style={{ width: 16, height: 16, opacity: 0.5 }} />
              </div>
              <div>
                <div style={{ fontSize: 10, opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 2 }}>Member Since</div>
                <div style={{ fontSize: 15 }}>{joined}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Credits card */}
      <div className="hanko-card-detail" style={{ marginTop: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <LucideZap style={{ width: 14, height: 14, color: "var(--hanko-primary)" }} />
          <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.4em", opacity: 0.35, fontWeight: 700 }}>
            Signature Credits
          </span>
        </div>

        <CreditsCheckout
          initialCredits={currentCredits}
          onBalanceChange={setCurrentCredits}
        />

        <p style={{ fontSize: 11, opacity: 0.35, lineHeight: 1.6, paddingTop: 8, borderTop: "1px solid var(--hanko-border)" }}>
          Credits are used when you send a document to someone for their signature.
          Each signature request costs 1 credit. $0.10 buys 1,000 credits.
        </p>
      </div>

      {/* Sign out */}
      <div className="hanko-card-detail" style={{ marginTop: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.4em", opacity: 0.35, fontWeight: 700, marginBottom: 4 }}>
              Session
            </div>
            <div style={{ fontSize: 13, opacity: 0.6 }}>You are signed in as <strong>{email}</strong></div>
          </div>

          <button
            onClick={handleSignOut}
            disabled={loggingOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              border: "1.5px solid var(--hanko-border)",
              background: "transparent",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontWeight: 700,
              cursor: "crosshair",
              color: "var(--hanko-ink)",
              opacity: loggingOut ? 0.4 : 1,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--hanko-primary)";
              e.currentTarget.style.color = "var(--hanko-primary)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--hanko-border)";
              e.currentTarget.style.color = "var(--hanko-ink)";
            }}
          >
            <LucideLogOut style={{ width: 13, height: 13 }} />
            {loggingOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </div>

    </div>
  );
}
