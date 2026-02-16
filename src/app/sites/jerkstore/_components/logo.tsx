import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  iconOnly?: boolean;
  variant?: "default" | "savage" | "feature";
}

export function Logo({
  className = "",
  iconClassName = "",
  textClassName = "",
  iconOnly = false,
  variant = "default"
}: LogoProps) {
  const isSavage = variant === "savage";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "flex items-center justify-center rounded-full border-[3px] border-current",
        variant === "feature" ? "w-12 h-12 sm:w-16 sm:h-16 border-4" : "w-10 h-10",
        isSavage ? "text-white border-white" : "text-current"
      )}>
        <Flame
          className={cn(
            isSavage ? "text-white" : "text-red-600",
            variant === "feature" ? "w-6 h-6 sm:w-8 sm:h-8" : "w-5 h-5",
            iconClassName
          )}
          fill="none"
          strokeWidth={2.5}
        />
      </div>
      {!iconOnly && (
        <span className={cn(
          "font-black uppercase tracking-tighter italic font-[family-name:var(--font-bebas)]",
          variant === "feature" ? "text-2xl sm:text-4xl" : "text-2xl",
          isSavage ? "text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,0.8)]" : "",
          textClassName
        )}>
          Jerkstore
        </span>
      )}
    </div>
  );
}
