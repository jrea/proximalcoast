"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
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
      <div className="text-center space-y-6 py-8">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 animate-in zoom-in duration-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Account Secured!</h2>
          <p className="text-neutral-500">Your membership is now active. Welcome to DNBK Karatedo.</p>
        </div>
        <button
          onClick={() => window.location.href = "/"}
          className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-lg"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Payment Successful!</h2>
        <p className="text-neutral-500">Set a password to complete your account and access your membership.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full p-4 bg-white border border-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            placeholder="••••••••"
          />
          <p className="text-[10px] text-neutral-400 ml-1">Must be at least 8 characters.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 italic font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 bg-black text-white rounded-xl font-bold text-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          Complete Registration
        </button>
      </form>
    </div>
  );
}
