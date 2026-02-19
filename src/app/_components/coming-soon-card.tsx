export function ComingSoonCard() {
  return (
    <div className="relative border-4 border-black bg-zinc-100 dark:bg-zinc-900/50 p-6 sm:p-8 opacity-30 group transition-all hover:opacity-60 border-dashed flex items-center">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-none bg-black text-white border-4 border-black transform rotate-6 group-hover:rotate-0 transition-transform flex-shrink-0">
          <span className="text-3xl font-black">?</span>
        </div>
        <div className="text-center sm:text-left pt-2">
          <h3 className="text-xl font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-100 mb-2">
            Redacted_Project
          </h3>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-black uppercase tracking-[0.4em] leading-relaxed">
            Initializing next system breach... <br />
            Access level: [REDACTED]
          </p>
        </div>
      </div>
    </div>
  );
}
