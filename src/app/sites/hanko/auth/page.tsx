"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/admin",
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign in with Google");
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0],
          callbackURL: "/admin",
        });
        if (error) throw error;
        toast.success("Account created successfully");
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/admin",
        });
        if (error) throw error;
      }
      router.push("/admin");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || `Failed to ${mode}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 hanko-slide-enter px-6 pb-20">
      <div className="hanko-card-detail space-y-8">
        <div className="text-center space-y-4">
          <h1 className="hanko-h2 uppercase border-b border-[var(--hanko-ink)] pb-4 inline-block">
            {mode === "login" ? "Sign In" : "Create Account"}
          </h1>
          <p className="text-sm opacity-60 tracking-widest uppercase">Identity Verification</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest opacity-80">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-b-2 border-[var(--hanko-ink)] py-2 focus:outline-none focus:border-[var(--hanko-primary)] cursor-crosshair transition-colors"
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest opacity-80">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-b-2 border-[var(--hanko-ink)] py-2 focus:outline-none focus:border-[var(--hanko-primary)] cursor-crosshair transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="hanko-btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Verifying..." : (mode === "login" ? "Sign In" : "Register")}
          </button>
        </form>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--hanko-border)]"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[var(--hanko-surface)] px-4 text-[10px] uppercase tracking-widest opacity-40">OR</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="hanko-btn-secondary w-full flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
          Google SSO
        </button>

        <div className="pt-8 border-t border-[var(--hanko-border)] text-center space-y-4">
          <p className="text-xs opacity-60">
            {mode === "login" ? "New to the platform?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-[var(--hanko-primary)] font-bold uppercase tracking-wider hover:underline"
            >
              {mode === "login" ? "Register" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
