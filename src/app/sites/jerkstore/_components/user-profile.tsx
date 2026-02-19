"use client";
import { useState } from "react";
import { Loader2, Check, X, Pencil } from "lucide-react";

export function UserProfile({ initialName, email }: { initialName: string, email: string }) {
  const [name, setName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/update-handle", {
        method: "POST",
        body: JSON.stringify({ handle: name }), // sending as 'handle' to match previous intent
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update name");
      }
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 p-6 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-xl font-bold uppercase mb-4 border-b-2 border-black pb-2">Your Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Email</label>
          <div className="font-mono text-lg">{email}</div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Name (Handle)</label>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-2 border-black p-2 font-mono flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your handle"
                maxLength={20}
              />
              <button onClick={handleSave} disabled={loading} className="p-2 bg-black text-white hover:bg-neutral-800 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
              </button>
              <button onClick={() => { setIsEditing(false); setName(initialName); setError(null); }} className="p-2 border-2 border-black hover:bg-neutral-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <span className="font-mono text-lg font-bold border-b-2 border-transparent">{name || "Anonymous"}</span>
              <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-black">
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
          {error && <p className="text-red-600 text-xs font-bold mt-2 uppercase animate-pulse">{error}</p>}
        </div>
      </div>
    </div>
  );
}
