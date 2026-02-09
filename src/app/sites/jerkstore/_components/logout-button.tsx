"use client";

import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/");
            },
          },
        });
      }}
      className="p-2 hover:bg-red-500 hover:text-white border-2 border-transparent hover:border-black transition-all"
      title="Log Out"
    >
      <LogOut className="w-6 h-6" />
    </button>
  );
}
