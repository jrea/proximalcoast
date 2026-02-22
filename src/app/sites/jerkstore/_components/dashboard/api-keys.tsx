'use client';

import { useState } from 'react';
import { createApiKey, revokeApiKey, getApiKeys } from '../../actions/api-keys';
import { Trash2, Copy, Plus, Key as KeyIcon, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming global utils or similar

interface ApiKey {
  id: string;
  name: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  organizationId: string | null;
}

export function ApiKeys({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [keyName, setKeyName] = useState('');

  const handleCreate = async () => {
    if (!keyName.trim()) return;
    setIsCreating(true);
    try {
      const rawKey = await createApiKey(keyName);
      setNewKey(rawKey);
      setKeyName('');
      // Refresh list
      const updatedKeys = await getApiKeys();
      setKeys(updatedKeys);
    } catch (e) {
      console.error(e);
      alert("Failed to create key");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure? This will break any bots using this key.")) return;
    try {
      await revokeApiKey(id);
      // Optimistic update or refetch
      setKeys(keys.filter(k => k.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to revoke key");
    }
  };

  return (
    <div className="space-y-6 p-6 border rounded-xl bg-black/40 border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <KeyIcon className="w-5 h-5 text-neutral-400" />
            API Keys
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Manage keys for external access (e.g. Reddit Bots).
          </p>
        </div>
      </div>

      {newKey && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg animate-in fade-in slide-in-from-top-2">
          <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            New Key Generated
          </h3>
          <p className="text-neutral-300 text-sm mb-3">
            Copy this key now. You won&apos;t be able to see it again.
          </p>
          <div className="flex items-center gap-2 bg-black/50 p-2 rounded border border-white/10">
            <code className="text-sm flex-1 font-mono text-green-300 break-all">{newKey}</code>
            <button
              onClick={() => navigator.clipboard.writeText(newKey)}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <Copy className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="mt-4 text-xs text-neutral-500 hover:text-neutral-300 underline"
          >
            Close
          </button>
        </div>
      )}

      <div className="space-y-4">
        {keys.length === 0 && !newKey && (
          <div className="text-center py-8 text-neutral-500 text-sm italic">
            No active keys. Create one to get started.
          </div>
        )}

        {keys.map((key) => (
          <div key={key.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <div className="font-medium text-white">{key.name}</div>
                {key.organizationId && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 font-bold uppercase tracking-wider">
                    Org
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-500 flex gap-4 mt-1">
                <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                <span>Last used: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : 'Never'}</span>
              </div>
            </div>
            <button
              onClick={() => handleRevoke(key.id)}
              className="p-2 hover:bg-red-500/20 hover:text-red-400 text-neutral-500 rounded transition-colors"
              title="Revoke Key"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-end gap-3 pt-4 border-t border-white/10">
        <div className="flex-1 space-y-2">
          <label className="text-xs uppercase text-neutral-500 font-bold tracking-wider">New Key Name</label>
          <input
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="e.g. Reddit Roaster 3000"
            className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-500 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
        <button
          onClick={handleCreate}
          disabled={!keyName.trim() || isCreating}
          className="px-4 py-2 bg-white text-black text-sm font-bold rounded hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-[38px] flex items-center gap-2"
        >
          {isCreating ? 'Creating...' : (
            <>
              <Plus className="w-4 h-4" />
              Generate Key
            </>
          )}
        </button>
      </div>
    </div>
  );
}
