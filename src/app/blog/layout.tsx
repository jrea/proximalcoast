import { GundamSidebar } from "@/components/gundam-sidebar";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-[#050505] font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Premium Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />

      {/* Gundam-style Vertical Sidebar */}
      <GundamSidebar />

      <div className="flex-1 md:ml-32 lg:ml-36 relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
