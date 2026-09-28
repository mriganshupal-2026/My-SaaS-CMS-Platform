import { useState, useEffect } from 'react';
import {
  Save,
  Globe,
  Share2,
  CheckCircle,
  ExternalLink,
  Image as ImageIcon,
  FileCode,
} from 'lucide-react';
import { cmsSettingsApi } from '../../lib/cms-client';
import type { SiteSettings } from '../../types/cms';
import CmsMediaPickerModal from './CmsMediaPickerModal';

export default function CmsSeoManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await cmsSettingsApi.get();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const updated = await cmsSettingsApi.update(settings);
      setSettings(updated);
      setSaveMessage('✓ Global SEO and social graph settings updated!');
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save SEO settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return <div className="py-12 text-center text-white/40 text-sm">Loading SEO settings...</div>;
  }

  const seo = settings.seoDefaults || {};

  return (
    <div className="space-y-6 max-w-4xl">
      <CmsMediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        acceptType="image"
        onSelect={(url) => {
          setSettings((prev) =>
            prev
              ? {
                  ...prev,
                  seoDefaults: {
                    ...prev.seoDefaults,
                    ogImage: url,
                  },
                }
              : null
          );
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Global SEO &amp; Social Share Cards</h2>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Default OpenGraph tags, Twitter cards, search crawler index rules, and structured schema.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-[#df0567]/25 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Global SEO'}</span>
        </button>
      </div>

      {saveMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Social Card Simulator */}
      {(() => {
        const currentSiteUrl =
          settings.siteUrl ||
          settings.general?.siteUrl ||
          'https://viral-agency-cinematic-social-influencer-agency.ai.studio';
        let displayHost = 'VIRAL-AGENCY-CINEMATIC-SOCIAL-INFLUENCER-AGENCY.AI.STUDIO';
        try {
          const u = new URL(currentSiteUrl.startsWith('http') ? currentSiteUrl : `https://${currentSiteUrl}`);
          displayHost = u.hostname.toUpperCase();
        } catch {
          displayHost = currentSiteUrl.replace(/^https?:\/\//i, '').split('/')[0].toUpperCase();
        }

        return (
          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-[#df0567]" />
                <span>OpenGraph Social Preview (1200×630)</span>
              </h3>
              <span className="text-xs text-[#df0567] font-mono font-medium">
                {displayHost.toLowerCase()}
              </span>
            </div>

            <div className="max-w-md mx-auto rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl">
              <div className="aspect-[1.91/1] bg-black/80 relative overflow-hidden">
                <img
                  src={seo.ogImage || '/og-image.jpg'}
                  alt="OG Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 bg-[#18181f]">
                <div className="flex items-center gap-1.5 text-white/50 mb-1">
                  <Globe className="w-3 h-3 text-[#df0567]" />
                  <span className="text-[10px] uppercase tracking-wider font-mono font-semibold truncate">
                    {displayHost}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-1">
                  {seo.title || 'ViralMuse — Social Media Agency'}
                </h4>
                <p className="text-xs text-white/60 line-clamp-2 mt-1">
                  {seo.description ||
                    'Premier luxury hospitality and travel social media, 4K cinematic production & influencer architecture agency.'}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SEO Form */}
      <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#df0567]" />
              <span>Canonical Site URL / Domain</span>
            </span>
            <span className="text-[11px] text-white/40 normal-case font-normal">
              Syncs with OpenGraph tags, dynamic Sitemap &amp; Robots.txt
            </span>
          </label>
          <input
            type="url"
            value={settings.siteUrl || ''}
            onChange={(e) =>
              setSettings((prev) =>
                prev
                  ? {
                      ...prev,
                      siteUrl: e.target.value,
                      general: {
                        ...(prev.general || {
                          siteName: 'ViralMuse',
                          siteDescription: '',
                          contactEmail: '',
                          phone: '',
                          address: '',
                        }),
                        siteUrl: e.target.value,
                      },
                    }
                  : null
              )
            }
            placeholder="https://viral-agency-cinematic-social-influencer-agency.ai.studio"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-hidden focus:border-[#df0567]"
          />
          <p className="text-[11px] text-white/40 mt-1">
            Current live canonical domain:{' '}
            <span className="text-[#df0567] font-mono font-medium">
              {settings.siteUrl || 'https://viral-agency-cinematic-social-influencer-agency.ai.studio'}
            </span>
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
            Default Site Title (Title Tag)
          </label>
          <input
            type="text"
            value={seo.title || ''}
            onChange={(e) =>
              setSettings((prev) =>
                prev
                  ? {
                      ...prev,
                      seoDefaults: { ...prev.seoDefaults, title: e.target.value },
                    }
                  : null
              )
            }
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-[#df0567]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
            Default Meta Description
          </label>
          <textarea
            rows={3}
            value={seo.description || ''}
            onChange={(e) =>
              setSettings((prev) =>
                prev
                  ? {
                      ...prev,
                      seoDefaults: { ...prev.seoDefaults, description: e.target.value },
                    }
                  : null
              )
            }
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-hidden focus:border-[#df0567]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
            Global Social Share Image (OG Image)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={seo.ogImage || ''}
              onChange={(e) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        seoDefaults: { ...prev.seoDefaults, ogImage: e.target.value },
                      }
                    : null
                )
              }
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono"
            />
            <button
              type="button"
              onClick={() => setMediaPickerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Select Media</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic SEO Utilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-xl bg-[#131317] border border-white/10 hover:border-white/20 flex items-center justify-between group transition-colors"
        >
          <div className="flex items-center space-x-3">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-sm font-semibold text-white group-hover:text-[#df0567] transition-colors block">
                Dynamic XML Sitemap
              </span>
              <span className="text-xs text-white/50 font-mono">/sitemap.xml</span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white" />
        </a>

        <a
          href="/robots.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-xl bg-[#131317] border border-white/10 hover:border-white/20 flex items-center justify-between group transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-purple-400" />
            <div>
              <span className="text-sm font-semibold text-white group-hover:text-[#df0567] transition-colors block">
                Robots.txt Crawler Rules
              </span>
              <span className="text-xs text-white/50 font-mono">/robots.txt</span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white" />
        </a>
      </div>
    </div>
  );
}
