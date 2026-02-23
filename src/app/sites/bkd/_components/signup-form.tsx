"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function SignupForm() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err: any) {
      toast.error("Failed to sign in with Google");
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
          name: email.split("@")[0],
          callbackURL: "/",
        });
        if (signUpError) throw new Error(signUpError.message || "Failed to create account");
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/",
        });
        if (signInError) throw new Error(signInError.message || "Failed to sign in");
      }

      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (isSessionPending) {
    return (
      <div className="flex justify-center p-8">
        <svg className="bkd-enso-loader w-8 h-8 opacity-50" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" />
        </svg>
      </div>
    );
  }

  if (session) return null;

  return (
    <div className="w-full max-w-lg mx-auto bkd-shoji-enter">
      <div className="space-y-12">
        {/* Minimal Header */}
        <div className="text-center space-y-4">
          <h2 className="bkd-h2 uppercase tracking-[0.4em] text-2xl font-black">
            {mode === "login" ? "Sign In" : "Join Now"}
          </h2>
          <p className="bkd-mono text-[10px] opacity-40 tracking-widest font-bold">
            {mode === "login" ? "Welcome Back" : "Let's Get Started"}
          </p>
        </div>

        <div className="bg-white border border-[var(--bkd-border)] p-6 md:p-12 shadow-xl space-y-10 relative overflow-hidden">
          {/* Vertical watermark restored */}
          <span className="absolute -right-2 top-1/2 -translate-y-1/2 writing-mode-vertical opacity-[0.02] text-7xl font-black select-none pointer-events-none">
            {mode === "login" ? "SIGN IN" : "JOIN"}
          </span>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="space-y-4">
              <label className="bkd-mono text-[10px] font-bold opacity-60 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="bkd-input text-base py-5 border-x-0 border-t-0 focus:padding-0 focus:translate-y-0"
                placeholder="email@example.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-4">
              <label className="bkd-mono text-[10px] font-bold opacity-60 uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="bkd-input text-base py-5 border-x-0 border-t-0 focus:padding-0 focus:translate-y-0"
                placeholder="Your Password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <div className="p-5 border border-[#BC241C] text-[11px] bkd-mono bg-[#BC241C]/5 text-[#BC241C] text-center shadow-inner">
                &gt;_ ERROR: {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`bkd-btn-primary w-full py-6 md:py-8 text-base md:text-lg shadow-lg relative overflow-hidden ${loading ? 'bkd-loading text-white/50' : ''}`}
            >
              <span className="relative z-10 tracking-[0.3em] font-black">
                {loading ? (mode === "login" ? "Signing In..." : "Creating Account...") : (mode === "login" ? "SIGN IN" : "CREATE ACCOUNT")}
              </span>
              <div className="bkd-btn-progress" />
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--bkd-border)] opacity-30"></div></div>
            <span className="relative bg-white px-6 bkd-mono text-[10px] opacity-40 tracking-[0.5em] font-bold">OR</span>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-6 p-6 border border-[var(--bkd-border)] hover:bg-[var(--bkd-surface)] transition-all bkd-mono text-[11px] font-bold tracking-[0.3em] uppercase group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
            className="bkd-mono text-[9px] opacity-40 hover:opacity-100 transition-all underline underline-offset-8"
          >
            {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
