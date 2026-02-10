import { Flame } from "lucide-react";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  iconOnly?: boolean;
}

export function Logo({
  className = "",
  iconClassName = "w-8 h-8",
  textClassName = "text-2xl font-black uppercase tracking-tighter italic",
  iconOnly = false
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Flame className={`${iconClassName} stroke-[3px] text-red-600 fill-yellow-400`} />
      {!iconOnly && (
        <span className={textClassName}>Jerkstore</span>
      )}
    </div>
  );
}
