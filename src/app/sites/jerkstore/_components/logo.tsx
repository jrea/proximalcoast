import { Flame } from "lucide-react";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  iconOnly?: boolean;
}

export function Logo({
  className = "",
  iconClassName = "w-5 h-5 text-red-600",
  textClassName = "text-2xl font-black uppercase tracking-[0.1em] italic font-[family-name:var(--font-bebas)]",
  iconOnly = false
}: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-current">
        <Flame className={iconClassName} fill="none" strokeWidth={2.5} />
      </div>
      {!iconOnly && (
        <span className={textClassName}>Jerkstore</span>
      )}
    </div>
  );
}
