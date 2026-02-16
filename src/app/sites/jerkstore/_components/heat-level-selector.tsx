import { cn } from "@/lib/utils";
import { Baby, Flame, Skull, Lock, Brain } from "lucide-react";
import { HeatLevel, HEAT_LEVELS } from "../constants";

interface HeatLevelSelectorProps {
  heatLevel: HeatLevel;
  setHeatLevel: (level: HeatLevel) => void;
  className?: string;
  isTrial?: boolean;
  onLockedClick?: () => void;
  useReasoning: boolean;
  setUseReasoning: (use: boolean) => void;
}

export function HeatLevelSelector({ heatLevel, setHeatLevel, className, isTrial, onLockedClick, useReasoning, setUseReasoning }: HeatLevelSelectorProps) {
  const getIcon = (level: HeatLevel) => {
    switch (level) {
      case HeatLevel.MILD: return Baby;
      case HeatLevel.SPICY: return Flame;
      case HeatLevel.NUCLEAR: return Skull;
    }
  };

  return (
    <div className={cn("flex bg-white border-2 border-black border-t-0 p-1 gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]", className)}>
      {HEAT_LEVELS.map(level => {
        const isSelected = heatLevel === level.value;
        const Icon = getIcon(level.value as HeatLevel);

        const isLocked = isTrial && (level.value === HeatLevel.SPICY || level.value === HeatLevel.NUCLEAR);

        return (
          <button
            key={level.value}
            type="button"
            onClick={() => {
              if (isLocked) {
                onLockedClick?.();
              } else {
                setHeatLevel(level.value as HeatLevel);
              }
            }}
            title={isLocked ? "Upgrade to unlock" : `${level.label} - ${level.desc}`}
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 border-2 border-black transition-all duration-100 flex items-center justify-center relative",
              isSelected
                ? "bg-neutral-200 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] translate-y-[1px] translate-x-[1px]"
                : "bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]",
              level.value === HeatLevel.NUCLEAR && isSelected ? "text-red-600 bg-red-50" :
                level.value === HeatLevel.SPICY && isSelected ? "text-orange-600 bg-orange-50" :
                  level.value === HeatLevel.MILD && isSelected ? "text-blue-600 bg-blue-50" : "text-black",
              isLocked && "opacity-50 cursor-pointer text-neutral-400 bg-neutral-100"
            )}
          >
            {isLocked && <Lock className="absolute w-3 h-3 sm:w-4 sm:h-4 text-black/50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
            <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", isLocked && "opacity-20")} strokeWidth={2.5} />
          </button>
        );
      })}

      {/* Separator */}
      <div className="w-[2px] bg-black/10 mx-0.5 self-stretch rounded-full" />

      {/* Reasoning Toggle */}
      <button
        type="button"
        onClick={() => setUseReasoning(!useReasoning)}
        title={useReasoning ? "Disable Deep Think" : "Enable Deep Think (Slower but Smarter)"}
        className={cn(
          "w-8 h-8 sm:w-10 sm:h-10 border-2 border-black transition-all duration-100 flex items-center justify-center relative",
          useReasoning
            ? "bg-purple-100 text-purple-600 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] translate-y-[1px] translate-x-[1px]"
            : "bg-white text-neutral-400 hover:bg-neutral-50 hover:text-purple-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
        )}
      >
        <Brain className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
      </button>
    </div>
  );
}
