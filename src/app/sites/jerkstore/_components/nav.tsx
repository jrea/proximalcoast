
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Settings, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { LogoutButton } from "./logout-button";

export function JerkstoreNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="max-w-2xl mx-auto mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-center bg-white border-4 border-black p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] gap-4 sm:gap-0">
      <div className="flex items-center gap-4">
        <Logo textClassName="text-lg sm:text-xl font-black uppercase italic tracking-tighter" />
      </div>

      <nav className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/app"
          className={cn(
            "flex items-center justify-center p-2 sm:p-2.5 border-2 border-transparent transition-all",
            isActive("/app")
              ? "bg-yellow-300 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "hover:bg-neutral-100 hover:border-black/10"
          )}
          title="Dashboard"
        >
          <Flame className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>

        <Link
          href="/billing"
          className={cn(
            "flex items-center justify-center p-2 sm:p-2.5 border-2 border-transparent transition-all",
            isActive("/billing")
              ? "bg-yellow-300 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "hover:bg-neutral-100 hover:border-black/10"
          )}
          title="Subscription"
        >
          <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>

        <Link
          href="/app/settings"
          className={cn(
            "flex items-center justify-center p-2 sm:p-2.5 border-2 border-transparent transition-all",
            isActive("/app/settings")
              ? "bg-yellow-300 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              : "hover:bg-neutral-100 hover:border-black/10"
          )}
          title="Settings"
        >
          <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>

        <div className="w-px h-6 bg-neutral-200 mx-1" />

        <LogoutButton />
      </nav>
    </header>
  );
}
