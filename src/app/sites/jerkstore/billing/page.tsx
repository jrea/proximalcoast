"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, CreditCard, ChevronLeft, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function BillingManagementPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteSlug: "jerkstore" }),
      });
      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Portal Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 p-8 font-sans selection:bg-red-600 selection:text-white">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12 flex justify-between items-center">
          <Link
            href="/app"
            className="flex items-center gap-2 text-lg font-black uppercase hover:text-red-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> Back to App
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-lg font-black uppercase underline decoration-2 underline-offset-4 hover:text-red-600"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </header>

        <main className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-yellow-300 p-3 border-2 border-black">
              <CreditCard className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-4xl font-black uppercase italic">Subscription Management</h1>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-neutral-50 border-2 border-black/10 rounded-lg">
              <h2 className="text-xl font-bold uppercase mb-2">Jerkstore Pro Status</h2>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <span className="font-mono font-bold text-lg">ACTIVE & UNHINGED</span>
              </div>
              <p className="mt-4 text-neutral-600 font-mono text-sm uppercase">You have full access to our soul-crushing AI models.</p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleManage}
                disabled={loading}
                className="w-full bg-black text-white font-black text-2xl py-6 border-4 border-black hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 active:translate-x-1 active:translate-y-1"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Manage Billing via Stripe"}
              </button>
              <p className="text-center font-mono text-xs text-neutral-400 uppercase">Updates to your subscription take effect immediately.</p>
            </div>
          </div>
        </main>

        <footer className="mt-12 text-center">
          <p className="font-mono font-bold text-neutral-500 uppercase text-sm">Need help? Don't ask us. We're busy making people sad.</p>
        </footer>
      </div>
    </div>
  );
}
