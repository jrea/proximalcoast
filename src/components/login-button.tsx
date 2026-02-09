"use client";

import { authClient } from "@/lib/auth-client";
import { Zap, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ALTERNATIVE_LABELS = [
  "Go to Roaster",
  "Roast Someone",
  "Enter the Jerkstore",
  "Damage Humanity",
  "Start Roasting",
  "Back to the Lab",
  "The Oven",
  "Fire it Up",
  "Destroy Hopes",
  "Cook Some More",
  "Insult Engine",
  "Back to Base",
  "Rage Room",
  "The Salt Mine",
  "Toxic Waste",
  "Burn Center",
  "Mean Machine",
  "Evil Genius",
  "Roast Station",
  "Degenerate HQ",
  "The Roast Pit",
  "Cyber Bully",
  "Emotional Damage",
  "Sick Burns",
  "The Jerk",
  "Roast Master",
  "Insult Lab",
  "Hatred Factory",
  "The Salt Shaker",
  "Mean Spirited",
  "Destroy Careers",
  "End Friendships",
  "Vicious Cycle",
  "Injustice System",
  "The Hate Machine",
  "Savage Garden",
  "Pointless Cruelty",
  "Total Meltdown",
  "Zero Decency",
  "Unfiltered Salt",
  "The Burn Ward",
  "Cringe Factory",
  "Bridge Burner",
];

export function LoginButton({
  text = "Login",
  className = "",
  icon = false
}: {
  text?: string;
  className?: string;
  icon?: boolean;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [randomLabel, setRandomLabel] = useState("");

  useEffect(() => {
    // Pick a random label only once on mount or when session changes
    if (session) {
      const randomIndex = Math.floor(Math.random() * ALTERNATIVE_LABELS.length);
      setRandomLabel(ALTERNATIVE_LABELS[randomIndex]);
    }
  }, [session]);

  const handleAction = async () => {
    if (session) {
      router.push("/app");
    } else {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/app", // Redirect to dashboard after login
      });
    }
  };

  if (isPending) {
    return (
      <button className={`${className} opacity-50`} disabled>
        Loading...
      </button>
    );
  }

  const displayText = session ? (randomLabel || "Go to App") : text;

  return (
    <button
      onClick={handleAction}
      className={className}
    >
      <span className="flex items-center gap-2 justify-center">
        {icon && !session && <Zap className="fill-yellow-400 text-yellow-400 w-5 h-5 flex-shrink-0" />}
        {session && <ArrowRight className="w-5 h-5 flex-shrink-0" />}
        <span>{displayText}</span>
      </span>
    </button>
  );
}
