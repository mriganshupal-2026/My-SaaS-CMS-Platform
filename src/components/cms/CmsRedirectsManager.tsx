import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, CornerDownRight, CheckCircle } from 'lucide-react';
import { cmsRedirectsApi } from '../../lib/cms-client';
import type { RedirectRule } from '../../types/cms';

export default function CmsRedirectsManager() {
  const [redirects, setRedirects] = useState<RedirectRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    loadRedirects();
  }, []);

  const loadRedirects = async () => {
    setIsLoading(true);
    try {
      const data = await cmsRedirectsApi.get();
      setRedirects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const updated = await cmsRedirectsApi.update(redirects);
      setRedirects(updated);
      setSaveMessage('✓ Redirect rules updated successfully!');
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save redirects');
    } finally {
      setIsSaving(false);
    }
  };

  const addRedirect = () => {
    setRedirects((prev) => [
      ...prev,
      {
        id: `redir_${Date.now()}`,
        source: '/old-path',
        destination: '/',
        statusCode: 301,
        isActive: true,
      },
    ]);
  };

  const removeRedirect = (id: string) => {
    setRedirects((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRedirect = (index: number, field: keyof RedirectRule, value: any) => {
    const next = [...redirects];
    next[index] = { ...next[index], [field]: value };
    setRedirects(next);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">URL Redirect Rules</h2>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Configure 301 Permanent and 302 Temporary redirects to preserve SEO equity.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={addRedirect}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#df0567]" />
            <span>Add Redirect</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-[#df0567]/25 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Redirects'}</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Rules List */}
      <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-white/40 text-sm">Loading redirect rules...</div>
        ) : redirects.length === 0 ? (
          <div className="py-12 text-center text-white/40 text-sm">
            No active redirects. Click "Add Redirect" above to create one.
          </div>
        ) : (
          redirects.map((rule, idx) => (
            <div
              key={rule.id}
              className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 w-full">
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-white/50 mb-1">
                    Source Path
                  </label>
                  <input
                    type="text"
                    value={rule.source}
                    onChange={(e) => updateRedirect(idx, 'source', e.target.value)}
                    placeholder="/old-service"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-white/50 mb-1">
                    Target Destination
                  </label>
                  <input
                    type="text"
                    value={rule.destination}
                    onChange={(e) => updateRedirect(idx, 'destination', e.target.value)}
                    placeholder="/new-service"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-white/50 mb-1">
                    Type
                  </label>
                  <select
                    value={rule.statusCode}
                    onChange={(e) => updateRedirect(idx, 'statusCode', parseInt(e.target.value, 10))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                  >
                    <option value={301}>301 Permanent</option>
                    <option value={302}>302 Temporary</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end sm:self-center">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.isActive}
                    onChange={(e) => updateRedirect(idx, 'isActive', e.target.checked)}
                    className="rounded-sm border-white/20 text-[#df0567]"
                  />
                  <span className="text-white/70 text-[11px]">Enabled</span>
                </label>

                <button
                  onClick={() => removeRedirect(rule.id)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
