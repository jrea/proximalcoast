import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo as JerkstoreLogo } from "../sites/jerkstore/_components/logo";

export function JerkstoreCard() {
  return (
    <Link
      href="https://jerkstore.proximalcoast.com"
      className="group relative border-4 border-black bg-yellow-300 p-6 sm:p-8 transition-all hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0 active:shadow-none flex flex-col justify-between h-full"
    >
      {/* Neobrutalist Sticker Tag */}
      <div className="absolute -top-1 -right-4 bg-red-600 text-white px-6 py-1 font-black uppercase text-[10px] tracking-[0.3em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-12 z-20 border-2 border-black">
        Warning_Damage
      </div>

      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="w-6 h-6 text-black" />
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12">
        <div className="shrink-0 transform rotate-[-3deg] group-hover:rotate-0 transition-transform duration-500 pt-2">
          <JerkstoreLogo variant="feature" iconClassName="fill-red-600" textClassName="text-3xl sm:text-5xl" />
        </div>

        <div className="flex-1 text-center sm:text-left pt-2">
          <div className="mb-4 flex justify-center sm:justify-start">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-black text-white px-3 py-1 border-2 border-black">
              System_Type: Emotional_Warfare
            </span>
          </div>
          <p className="text-base sm:text-xl font-black uppercase tracking-tighter leading-none text-black max-w-sm mb-6 transform skew-x-[-1deg]">
            The world's most <span className="underline decoration-8 decoration-red-600 underline-offset-4">aggressive</span> AI insult generator.
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-black">
            <span className="flex items-center gap-2 font-[family-name:var(--font-geist-mono)]"><div className="w-2 h-2 bg-red-600 border border-black" /> UNHINGED_LLM</span>
            <span className="flex items-center gap-2 font-[family-name:var(--font-geist-mono)]"><div className="w-2 h-2 bg-white border border-black" /> $1_MINIMUM</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
