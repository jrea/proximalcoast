import { AccessModal } from "@/components/access-modal";

export default function AccessPage() {
  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fake App Background for context */}
      <div className="absolute inset-0 opacity-20 grayscale pointer-events-none">
        <div className="p-8 max-w-xl mx-auto space-y-8">
          <div className="h-16 bg-black/20" />
          <div className="h-96 bg-black/10" />
        </div>
      </div>

      <AccessModal />
    </div>
  );
}
