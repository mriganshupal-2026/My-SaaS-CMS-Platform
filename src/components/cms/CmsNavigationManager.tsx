import { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Menu as MenuIcon,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  FileText,
  Sparkles,
} from 'lucide-react';
import { cmsNavigationApi, cmsPagesApi } from '../../lib/cms-client';
import type { NavigationItem, Page } from '../../types/cms';

export default function CmsNavigationManager() {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [availablePages, setAvailablePages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [navData, pagesData] = await Promise.all([
        cmsNavigationApi.get(),
        cmsPagesApi.getAll().catch(() => []),
      ]);
      setItems(navData);
      setAvailablePages(pagesData.filter((p) => !p.isHomepage && p.slug !== 'home'));
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
      const updated = await cmsNavigationApi.update(items);
      setItems(updated);
      setSaveMessage('✓ Global navigation menu saved and updated across all headers & footers!');
      window.dispatchEvent(new CustomEvent('cms-navigation-updated'));
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save navigation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncAllPages = () => {
    const newItems = [...items];
    let addedCount = 0;

    availablePages.forEach((page) => {
      const pageUrl = `/p/${page.slug}`;
      const pageLabel = page.title.replace(/^ViralMuse\s*[—–-]\s*/i, '').trim() || page.title;
      const navId = `nav_pg_${page.id}`;

      const exists = newItems.some(
        (n) => n.id === navId || n.id === page.id || n.url === pageUrl
      );

      if (!exists) {
        const maxOrder = newItems.reduce((max, it) => Math.max(max, it.orderIndex ?? 0), 0);
        newItems.push({
          id: navId,
          label: pageLabel,
          url: pageUrl,
          orderIndex: maxOrder + 1,
          isActive: true,
          target: '_self',
        });
        addedCount++;
      }
    });

    setItems(newItems);
    if (addedCount > 0) {
      setSaveMessage(`✓ Added ${addedCount} page(s) to navigation! Click "Save Navigation" to apply.`);
    } else {
      setSaveMessage('✓ All published pages are already in the navigation menu.');
    }
    setTimeout(() => setSaveMessage(null), 4000);
  };

  const addPageItem = (page: Page) => {
    const pageUrl = `/p/${page.slug}`;
    const pageLabel = page.title.replace(/^ViralMuse\s*[—–-]\s*/i, '').trim() || page.title;
    const navId = `nav_pg_${page.id}_${Date.now()}`;

    const newItem: NavigationItem = {
      id: navId,
      label: pageLabel,
      url: pageUrl,
      orderIndex: items.length,
      isActive: true,
      target: '_self',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIdx, 0, moved);

    newItems.forEach((it, idx) => {
      it.orderIndex = idx;
    });

    setItems(newItems);
  };

  const addItem = () => {
    const newItem: NavigationItem = {
      id: `nav_${Date.now()}`,
      label: 'New Link',
      url: '#',
      orderIndex: items.length,
      isActive: true,
      target: '_self',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (index: number, field: keyof NavigationItem, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setItems(newItems);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Global Navigation &amp; Pages</h2>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Manage links that automatically appear in the global Header Navbar, Menu Overlay Drawer, and Footer across all pages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {availablePages.length > 0 && (
            <button
              onClick={handleSyncAllPages}
              title="Ensure all published CMS pages are added to navigation"
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync All Pages</span>
            </button>
          )}

          <button
            onClick={addItem}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#df0567]" />
            <span>Add Custom Link</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-[#df0567]/25 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Navigation'}</span>
          </button>
        </div>
      </div>

      {/* Quick Add Page Shelf if pages exist */}
      {availablePages.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#df0567]/10 via-[#181822] to-[#131317] border border-[#df0567]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 text-xs text-white/90">
            <Sparkles className="w-4 h-4 text-[#df0567] shrink-0" />
            <span>
              <strong>Auto-detected CMS Pages:</strong> Click any page to append to navigation:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {availablePages.map((pg) => {
              const inNav = items.some((i) => i.url === `/p/${pg.slug}`);
              return (
                <button
                  key={pg.id}
                  onClick={() => addPageItem(pg)}
                  disabled={inNav}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    inNav
                      ? 'bg-white/5 text-white/40 border border-white/5 cursor-default'
                      : 'bg-white/10 hover:bg-[#df0567] text-white border border-white/15 hover:border-transparent hover:scale-105'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>{pg.title}</span>
                  {inNav && <span className="text-[9px] text-emerald-400">✓ In Nav</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {saveMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Menu Items List */}
      <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-3">
        {isLoading ? (
          <div className="py-12 text-center text-white/40 text-sm">Loading global navigation...</div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-white/40 text-sm">
            No navigation items. Click "Add Custom Link" or "Sync All Pages" above.
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            >
              {/* Left: Reorder & Inputs */}
              <div className="flex items-center space-x-3 w-full sm:w-auto flex-1">
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="p-1 rounded text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] uppercase font-semibold text-white/50">
                        Link Label
                      </label>
                      {item.url.startsWith('/p/') && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#df0567]/20 text-[#df0567] font-mono">
                          CMS Page
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateItem(idx, 'label', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-medium focus:outline-hidden focus:border-[#df0567]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] uppercase font-semibold text-white/50">
                        URL Destination
                      </label>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-white/40 hover:text-white flex items-center gap-0.5"
                      >
                        <span>Test</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => updateItem(idx, 'url', e.target.value)}
                      placeholder="#services, /blog, or /p/slug"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-hidden focus:border-[#df0567]"
                    />
                  </div>
                </div>
              </div>

              {/* Right: Active Toggle & Delete */}
              <div className="flex items-center space-x-3 self-end sm:self-center">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    onChange={(e) => updateItem(idx, 'isActive', e.target.checked)}
                    className="rounded-sm border-white/20 text-[#df0567] focus:ring-0"
                  />
                  <span className="text-white/70 text-[11px]">Active</span>
                </label>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer"
                  title="Remove from navigation"
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
