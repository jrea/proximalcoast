"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: org, error } = await authClient.organization.create({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      });

      if (error) throw error;

      if (org) {
        // Set the new org as active
        await authClient.organization.setActive({
          organizationId: org.id
        });
        toast.success("Organization created successfully");
        router.push("/admin");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 hanko-slide-enter">
      <div className="hanko-card-detail space-y-8">
        <div className="text-center space-y-4">
          <h1 className="hanko-h2 uppercase border-b border-[var(--hanko-ink)] pb-4 inline-block">Onboarding</h1>
          <p className="text-sm opacity-60 tracking-widest text-balance">Create your organization to start managing documents.</p>
        </div>

        <form onSubmit={handleCreateOrg} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest opacity-80">Organization Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-transparent border-b-2 border-[var(--hanko-ink)] py-2 focus:outline-none focus:border-[var(--hanko-primary)] cursor-crosshair transition-colors"
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest opacity-80">URL Slug (Optional)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-transparent border-b-2 border-[var(--hanko-ink)] py-2 focus:outline-none focus:border-[var(--hanko-primary)] cursor-crosshair transition-colors"
              placeholder="e.g. acme-corp"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name}
            className="hanko-btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Creating..." : "Set Up Organization"}
          </button>
        </form>
      </div>
    </div>
  );
}
