import React from 'react';
import { Disc } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IdentityDiskProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function IdentityDisk({ className, size = 'md' }: IdentityDiskProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 sm:w-10 sm:h-10',
    md: 'w-20 h-20',
    lg: 'w-24 h-24 sm:w-32 sm:h-32'
  };

  const ringClasses = {
    sm: 'border-[1.5px]',
    md: 'border-2',
    lg: 'border-[3px]'
  };

  const innerSize = {
    sm: 'w-3 h-3',
    md: 'w-8 h-8',
    lg: 'w-10 h-10 sm:w-14 sm:h-14'
  };

  const iconSize = {
    sm: 'w-2 h-2',
    md: 'w-4 h-4',
    lg: 'w-4 h-4 sm:w-6 sm:h-6'
  };

  return (
    <div className={cn("relative flex items-center justify-center rounded-full", sizeClasses[size], className)}>
      {/* Outer Glow Ring */}
      <div className={cn(
        "absolute inset-0 rounded-full border-[#28E7FF] shadow-[0_0_25px_#28E7FF,inset_0_0_15px_#28E7FF] opacity-80",
        ringClasses[size]
      )} />

      {/* Rotating Tech Segments (only for md and lg) */}
      {size !== 'sm' && (
        <div className="absolute inset-2 rounded-full border border-[#28E7FF]/20 animate-[spin_10s_linear_infinite]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#28E7FF]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-3 bg-[#28E7FF]" />
        </div>
      )}

      {/* Inner Glow Ring */}
      <div className={cn(
        "absolute rounded-full border-[#6FC3DF] shadow-[0_0_15px_rgba(111,195,223,0.5)]",
        size === 'sm' ? 'inset-1.5 border' : 'inset-4 border-2'
      )} />

      {/* Dark Center 'Hole' */}
      <div className={cn(
        "rounded-full bg-black shadow-[inset_0_0_20px_#000] flex items-center justify-center overflow-hidden",
        innerSize[size]
      )}>
        {size !== 'sm' && (
          <>
            <div className="w-full h-[1px] bg-[#28E7FF]/30 rotate-45" />
            <div className="w-full h-[1px] bg-[#28E7FF]/30 -rotate-45 absolute" />
          </>
        )}
        <Disc className={cn("text-[#28E7FF] opacity-40 animate-pulse", iconSize[size])} />
      </div>

      {/* Peripheral Orbitals (only for lg) */}
      {size === 'lg' && (
        <>
          <div className="absolute -inset-4 rounded-full border border-[#FF8F00]/10 animate-[spin_15s_linear_infinite]" />
          <div className="absolute -inset-8 rounded-full border border-[#28E7FF]/5 animate-[spin_25s_linear_infinite_reverse]" />
        </>
      )}
    </div>
  );
}
