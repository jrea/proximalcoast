
import { InsultGenerator } from "../components/insult-generator";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function JerkstorePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <InsultGenerator />
    </div>
  );
}
