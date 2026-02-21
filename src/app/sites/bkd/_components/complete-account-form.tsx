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
      <div className="text-center space-y-6 py-12 bg-black/60 border-y border-white/40 backdrop-blur-3xl px-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative overflow-hidden text-white group">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"></div>
        {/* Diagonal Blade Glare */}
        <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-[25deg] group-hover:animate-[blade-glint_2s_ease-in-out_infinite] opacity-50 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex justify-center mb-6 relative">
            <div className="absolute inset-0 bg-slate-400/20 blur-xl rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
            <CheckCircle2 className="w-16 h-16 text-slate-100 animate-in zoom-in duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] relative z-10" />
          </div>
          <div className="space-y-4 mb-10">
            <h2 className="text-3xl font-black uppercase tracking-widest text-white" style={{ textShadow: "0 4px 20px rgba(255,255,255,0.2), 0 0 2px rgba(255,255,255,0.6)" }}>Registration Complete</h2>
            <div className="relative inline-block mt-2">
              <div className="absolute left-0 top-0 w-[2px] h-full bg-white opacity-20"></div>
              <div className="absolute right-0 top-0 w-[2px] h-full bg-white opacity-20"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 bg-black/80 px-4 py-1 border-y border-white/10 shadow-[0_0_10px_rgba(0,0,0,0.5)]">Welcome to the dojo.</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = "/"}
            className="group w-full py-5 px-8 bg-gradient-to-br from-zinc-200 via-white to-zinc-400 text-black rounded-none font-black text-sm uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(255,255,255,0.2),inset_0_2px_10px_rgba(255,255,255,0.8)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4),inset_0_2px_15px_rgba(255,255,255,1)] border-t border-white hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
          >
            <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent transform -skew-x-[25deg] group-hover:animate-[blade-glint_1.5s_ease-in-out_infinite] opacity-50 pointer-events-none"></div>
            <span className="relative z-10">Enter Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-10 bg-black/60 border-x-2 border-white/40 backdrop-blur-3xl px-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] relative overflow-hidden text-white group/form">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-[25deg] group-hover/form:animate-[blade-glint_2s_ease-in-out_infinite] opacity-50 pointer-events-none"></div>

      <div className="relative z-10 bg-[#0a0a0a]/90 p-8 sm:p-10 border border-white/5">
        <div className="text-center space-y-4 mb-10">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white" style={{ textShadow: "0 4px 20px rgba(255,255,255,0.2), 0 0 2px rgba(255,255,255,0.6)" }}>Complete Registration</h2>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Establish a secure passcode to proceed.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3 relative group">
            <label className="flex justify-between items-baseline px-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80 flex items-center gap-2">
                <span className="w-1 h-3 bg-white shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
                Account Passcode
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Min 8 Chars</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full p-4 bg-black border-y border-white/20 rounded-none focus:outline-none focus:border-white/60 transition-all font-mono text-sm placeholder:text-white/20 text-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]"
                placeholder="••••••••"
              />
              <div className="absolute left-0 top-0 w-1 h-full bg-white opacity-20 pointer-events-none"></div>
            </div>
            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-white group-focus-within:w-full transition-all duration-500"></div>
          </div>

          {error && (
            <div className={`p-4 relative border-y backdrop-blur-sm animate-in zoom-in-95 duration-300 font-mono text-xs uppercase tracking-widest bg-red-950/80 border-red-500/50 text-red-200 mt-4`}>
              <span className={`absolute left-0 top-0 w-1 h-full opacity-50 bg-red-500`}></span>
              &gt;_ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group/btn w-full py-5 px-8 mt-6 bg-gradient-to-br from-zinc-200 via-white to-zinc-400 text-black rounded-none font-black text-sm uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(255,255,255,0.2),inset_0_2px_10px_rgba(255,255,255,0.8)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4),inset_0_2px_15px_rgba(255,255,255,1)] border-t border-white hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
          >
            <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent transform -skew-x-[25deg] group-hover/btn:animate-[blade-glint_1.5s_ease-in-out_infinite] opacity-50 pointer-events-none"></div>
            <div className="relative z-10 flex items-center justify-center gap-3">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Complete Registration
            </div>
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes blade-glint {
          0% { left: -100%; }
          50%, 100% { left: 200%; }
        }
      `}} />
    </div>
  );
}
