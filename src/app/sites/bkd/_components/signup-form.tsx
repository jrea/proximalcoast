"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
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
      const response = await fetch("/sites/bkd/api/checkout", {
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
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (checkoutClientSecret) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret: checkoutClientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    );
  }

  if (session) {
    return (
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <p className="text-neutral-600">You're signed in as <span className="font-medium text-neutral-900">{session.user.email}</span></p>
          <button
            onClick={() => authClient.signOut()}
            className="text-sm text-neutral-400 hover:text-neutral-600 underline"
          >
            Sign out
          </button>
        </div>
        <button
          onClick={startCheckout}
          disabled={loading}
          className="w-full py-4 px-6 bg-black text-white rounded-xl font-bold text-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          Continue to Secure Checkout
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
      <h2 className="text-2xl font-bold text-center mb-8">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 bg-black text-white rounded-xl font-bold text-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 mt-4"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {mode === "signup" ? "Get Started" : "Sign In"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-neutral-500">
          {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
          <button
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            className="font-bold text-black hover:underline"
          >
            {mode === "signup" ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
