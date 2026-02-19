import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { ApiKeys } from "../../_components/dashboard/api-keys";
import { UserProfile } from "../../_components/user-profile";
import { getApiKeys } from "../../actions/api-keys";
import { LogoutButton } from "../../_components/logout-button";
import { Logo } from "../../_components/logo";

import { JerkstoreNav } from "../../_components/nav";

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
      <JerkstoreNav />

      <main className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-3xl font-black uppercase italic mb-6 tracking-tighter">Account Settings</h1>

          <UserProfile initialName={session.user.name || ""} email={session.user.email} />

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
