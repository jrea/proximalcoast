import Link from "next/link";
import { IdentityDisk } from "../sites/slice/_components/identity-disk";

export function SliceCard() {
  return (
    <Link
      href="https://slice.proximalcoast.com"
      className="group relative overflow-hidden rounded-2xl border border-[#28E7FF]/20 bg-[#02090E] p-6 sm:p-8 transition-all hover:shadow-[0_0_50px_rgba(40,231,255,0.15)] hover:border-[#28E7FF]/50 font-mono"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(40,231,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(40,231,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] transform rotateX-[60deg] scale-150" />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_50%,#28E7FF_50%)] bg-[size:100%_4px] animate-[scan_10s_linear_infinite]" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12">
        <div className="shrink-0 relative">
          <IdentityDisk size="md" className="group-hover:scale-105 transition-transform duration-500 shadow-[0_0_30px_rgba(40,231,255,0.2)]" />
        </div>

        <div className="flex-1 text-center sm:text-left pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 justify-center sm:justify-start">
            <h3 className="text-2xl font-black italic tracking-tighter flex items-center gap-1 transform skew-x-[-12deg]">
              <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">SLICE</span>
              <span className="flex tracking-[-0.3em] ml-1">
                <span className="text-[#FF8F00] drop-shadow-[0_0_10px_#FF8F00]">/</span>
                <span className="text-[#28E7FF] drop-shadow-[0_0_10px_#28E7FF]">/</span>
              </span>
            </h3>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#28E7FF] bg-[#28E7FF]/10 px-2 py-0.5 border border-[#28E7FF]/20 rounded-full">
              EDGE_NODE
            </span>
          </div>
          <p className="text-xs text-[#6FC3DF] font-bold uppercase tracking-widest leading-relaxed max-w-sm opacity-80">
            High-performance <span className="text-white">Pan & Zoom</span> editor. Browser-native architecture with zero-friction rendering core.
          </p>

          <div className="mt-6 flex items-center justify-center sm:justify-start gap-6 text-[8px] font-black uppercase tracking-[0.4em] text-white/20">
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[#28E7FF] rounded-full" /> NO_LOGIN</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-[#FF8F00] rounded-full" /> 100%_FREE</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
