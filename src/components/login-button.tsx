"use client";

import { authClient } from "@/lib/auth-client";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";

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

  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/app", // Redirect to dashboard after login
    });
  };

  return (
    <button
      onClick={handleLogin}
      className={className}
    >
      {icon && <Zap className="fill-yellow-400 text-yellow-400" />} {text}
    </button>
  );
}
