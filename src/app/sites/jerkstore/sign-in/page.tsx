"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client"; // Assuming this exists based on previous files
import { Loader2, Zap, AlertTriangle, ArrowRight } from "lucide-react";
import { Logo } from "../_components/logo";
import { cn } from "@/lib/utils";

import { usePostHog } from 'posthog-js/react';

function SignInContent() {
  const posthog = usePostHog();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const getMessage = () => {
    switch (reason) {
      case "trial":
        return "Sign in to claim your burns (and that username).";
      case "limit":
        return "You hit your limit. Pay up or log in.";
      default:
        return "Welcome back, you monster.";
    }
  };

  const handleGoogleSignIn = async () => {
    posthog?.capture('auth_attempt', { provider: 'google', type: 'login' });
    setIsLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/app",
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const type = isSignUp ? 'signup' : 'login';
    posthog?.capture('auth_attempt', { provider: 'email', type });

    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0], // Default name if empty
          callbackURL: "/app",
        });
        if (error) throw error;
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/app",
        });
        if (error) throw error;
      }
    } catch (err: any) {
      posthog?.capture('auth_error', { provider: 'email', type, error: err.message });
      setError(err.message || "Authentication failed. Try harder.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <Link href="/" className="mb-8 hover:scale-105 transition-transform">
        <Logo textClassName="text-3xl sm:text-5xl" />
      </Link>

      <div className="w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-10 relative overflow-hidden">
        {/* Warning Tape */}
        <div className="absolute top-0 left-0 w-full bg-yellow-400 text-black text-[10px] font-mono font-bold uppercase py-1 text-center border-b-4 border-black">
          AUTHORIZED PERSONNEL ONLY • VIOLATORS WILL BE ROASTED
        </div>

        <div className="mt-6 mb-8 text-center">
          <h1 className="text-3xl font-black uppercase italic mb-2">
            {isSignUp ? "Join the Cult" : "Enter the Arena"}
          </h1>
          <p className="font-mono text-sm font-bold text-neutral-500 bg-neutral-100 p-2 border-2 border-neutral-200 inline-block rotate-1">
            {getMessage()}
          </p>
        </div>

        <div className="space-y-6">
          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-4 border-4 border-black bg-white hover:bg-neutral-50 text-black font-black uppercase text-lg flex items-center justify-center gap-3 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
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
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-neutral-300"></div>
            </div>
            <span className="relative bg-white px-2 font-mono text-xs font-bold text-neutral-400 uppercase">
              Or suffer manually
            </span>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border-2 border-red-500 text-red-600 font-bold text-xs uppercase flex items-center gap-2 animate-pulse">
                <AlertTriangle className="w-4 h-4" /> {error}
              </div>
            )}

            {isSignUp && (
              <div className="space-y-1">
                <label className="font-black text-xs uppercase ml-1">Name (Optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name (or alias)"
                  className="w-full p-3 border-4 border-black font-mono text-sm focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="font-black text-xs uppercase ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full p-3 border-4 border-black font-mono text-sm focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="font-black text-xs uppercase ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full p-3 border-4 border-black font-mono text-sm focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-black text-white border-4 border-black font-black uppercase text-lg hover:bg-neutral-800 transition-all shadow-[4px_4px_0px_0px_rgba(100,100,100,0.5)] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isSignUp ? "Create Account" : "Sign In"} <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                const newState = !isSignUp;
                setIsSignUp(newState);
                posthog?.capture('auth_mode_toggled', { mode: newState ? 'signup' : 'login' });
                setError(null);
              }}
              className="text-xs font-bold font-mono uppercase underline decoration-2 decoration-yellow-400 hover:bg-yellow-400 transition-all px-1"
            >
              {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-[10px] font-mono font-bold text-neutral-400 uppercase text-center max-w-sm leading-relaxed">
        By entering this site, you agree properly handle generated insults. We are not responsible for broken relationships.
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <SignInContent />
    </Suspense>
  );
}
