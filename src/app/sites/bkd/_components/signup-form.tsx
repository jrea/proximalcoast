"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function SignupForm() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState<string | null>(null);
  const [mode, setMode] = useState<"signup" | "login">("signup");

  const startCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      if (data.clientSecret) {
        setCheckoutClientSecret(data.clientSecret);
      } else if (data.restored) {
        window.location.href = "/?success=true";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0], // Simple name fallback
          callbackURL: window.location.href,
        });
        if (signUpError) throw new Error(signUpError.message || "Failed to sign up");
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
          callbackURL: window.location.href,
        });
        if (signInError) throw new Error(signInError.message || "Failed to sign in");
      }

      // After successful auth, start checkout
      await startCheckout();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (isSessionPending) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (checkoutClientSecret) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-black/40 backdrop-blur-2xl rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/10 overflow-hidden text-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"></div>
        <div className="relative z-10 p-2">
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret: checkoutClientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="text-center space-y-6 bg-stone-900/40 backdrop-blur-2xl p-8 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)] border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <p className="text-emerald-500/80 text-[10px] font-black uppercase tracking-[0.2em]">Authorized Access As</p>
            <p className="font-mono text-stone-200 tracking-widest bg-black/40 py-2 border border-white/5 rounded-xl">{session.user.email}</p>
            <button
              onClick={() => authClient.signOut()}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors mt-2 underline decoration-slate-500/50 underline-offset-4"
            >
              Sign out
            </button>
          </div>
          <button
            onClick={startCheckout}
            disabled={loading}
            className="w-full py-4 px-6 bg-stone-200 text-stone-900 rounded-full font-black text-xs uppercase tracking-[0.3em] hover:bg-white transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 border border-transparent"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Continue Checkout Process
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8 py-10 bg-black/40 border-x-2 border-white/20 backdrop-blur-2xl px-8 shadow-[0_10px_60px_rgba(0,0,0,0.9)] relative overflow-hidden text-stone-200 group/form mt-8 rounded-none">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

      {/* Katana Glare */}
      <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-[25deg] group-hover/form:animate-[blade-glint_2s_ease-in-out_infinite] opacity-50 pointer-events-none"></div>

      {/* Bonsai Inner Container */}
      <div className="relative z-10 bg-stone-900/30 p-8 sm:p-10 border border-white/5 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl">
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white drop-shadow-sm border-b border-white/10 pb-4 inline-block">
            {mode === "signup" ? "Create Account" : "Sign In"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 relative group">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300 flex items-center gap-2 mb-2">
                <span className="w-1 h-3 bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-4 bg-black/40 border-y border-white/10 rounded-none focus:outline-none focus:border-stone-400 transition-all font-mono text-sm placeholder:text-stone-500 text-white shadow-inner"
                  placeholder="you@example.com"
                />
                <div className="absolute left-0 top-0 w-1 h-full bg-white opacity-20 pointer-events-none"></div>
              </div>
              <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-white group-focus-within:w-full transition-all duration-500"></div>
            </div>

            <div className="space-y-2 relative group">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300 flex items-center gap-2 mb-2">
                <span className="w-1 h-3 bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-4 bg-black/40 border-y border-white/10 rounded-none focus:outline-none focus:border-stone-400 transition-all font-mono text-sm placeholder:text-stone-500 text-white shadow-inner"
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
              className="group/btn w-full py-5 px-8 mt-6 bg-stone-200 text-stone-900 rounded-full font-black text-sm uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 border border-transparent relative overflow-hidden shadow-sm"
            >
              <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent transform -skew-x-[25deg] group-hover/btn:animate-[blade-glint_1.5s_ease-in-out_infinite] opacity-50 pointer-events-none"></div>
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
                {mode === "signup" ? "Create Account" : "Sign In"}
              </div>
            </button>
          </form>

          <div className="mt-8 text-center pt-6 relative border-t border-white/5">
            <p className="text-[10px] uppercase font-black tracking-widest text-stone-500">
              {mode === "signup" ? "Existing Member?" : "New Student?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                className="text-stone-300 hover:text-white transition-colors ml-2 border-b border-white/10 pb-1 hover:border-emerald-500 transition-all font-bold"
              >
                {mode === "signup" ? "Sign In" : "Register"}
              </button>
            </p>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
        @keyframes blade-glint {
          0% { left: -100%; }
          50%, 100% { left: 200%; }
        }
      `}} />
      </div>
    </div>
  );
}
