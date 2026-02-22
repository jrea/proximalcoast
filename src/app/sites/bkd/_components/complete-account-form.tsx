"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function CompleteAccountForm({ sessionId }: { sessionId: string }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/complete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, password }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Attempt to sign them in immediately
      const { error: signInError } = await authClient.signIn.email({
        email: data.email,
        password: password,
      });

      if (signInError) {
        console.warn("Auto sign-in failed after setPassword:", signInError);
        // We still show success, they can sign in manually
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-6 bkd-card-header bkd-shoji-enter">
        <span className="bg-text">SUCCESS</span>
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-[#BC241C]" />
        </div>
        <div className="space-y-4 mb-10">
          <h2 className="bkd-h2">Registration Complete</h2>
          <p className="bkd-mono text-[10px] opacity-70">Welcome to the dojo.</p>
        </div>
        <button
          onClick={() => window.location.href = "/"}
          className="bkd-btn-primary w-full"
        >
          Enter Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bkd-card-detail bg-[var(--bkd-surface)] w-full max-w-md mx-auto bkd-shoji-enter mt-8">
      <div className="text-center space-y-4 mb-10">
        <h2 className="bkd-h2 border-b border-[var(--bkd-border)] pb-2 inline-block">Complete Registration</h2>
        <p className="bkd-mono text-[10px] opacity-70 mt-2">Establish a secure passcode to proceed.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="flex justify-between items-baseline px-1 bkd-label">
            <span>Account Passcode</span>
            <span className="text-[10px] opacity-50">Min 8 Chars</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="bkd-input"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-4 border border-[#BC241C] text-[10px] bkd-mono bg-[#BC241C]/5 text-[#BC241C] mt-4 text-center">
            &gt;_ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bkd-btn-primary w-full mt-6"
        >
          {loading ? <svg className="bkd-enso-loader mx-auto w-5 h-5" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" /></svg> : "Complete Registration"}
        </button>
      </form>
    </div>
  );
}
