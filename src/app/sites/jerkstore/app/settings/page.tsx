import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { ApiKeys } from "../../_components/dashboard/api-keys";
import { getApiKeys } from "../../actions/api-keys";
import { LogoutButton } from "../../_components/logout-button";
import { Logo } from "../../_components/logo";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const keys = await getApiKeys();

  return (
    <div className="min-h-screen bg-neutral-100 p-4 relative overflow-x-hidden">
      {/* App Header */}
      <header className="max-w-2xl mx-auto mb-6 sm:mb-8 flex justify-between items-center bg-white border-4 border-black p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-4">
          <Link href="/app" className="hover:bg-yellow-300 p-1 rounded transition-colors" title="Back to Dashboard">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <Logo textClassName="text-lg sm:text-xl font-black uppercase italic tracking-tighter" />
        </div>
        <div className="flex gap-2 sm:gap-4">
          <Link
            href="/billing"
            className="p-1.5 sm:p-2 hover:bg-yellow-300 border-2 border-transparent hover:border-black transition-all"
            title="Manage Subscription"
          >
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-3xl font-black uppercase italic mb-6 tracking-tighter">Account Settings</h1>

          <div className="mb-8">
            <h2 className="text-xl font-bold uppercase mb-4 border-b-2 border-black pb-2">Developer Access</h2>
            <ApiKeys initialKeys={keys} />
          </div>

          <div className="text-sm text-neutral-500 italic">
            Need help? Yell at us on <a href="https://twitter.com/chieftrashofcr" className="underline hover:text-black">Twitter</a>.
          </div>
        </div>
      </main>
    </div>
  );
}
