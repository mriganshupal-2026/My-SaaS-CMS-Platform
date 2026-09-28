import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  ExternalLink,
  Instagram,
  Eye,
  Sparkles,
  Link as LinkIcon,
  Mail,
  Type,
  Palette,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { cmsSettingsApi } from '../../lib/cms-client';
import type { SiteSettings, FooterSettings, FooterLinkItem } from '../../types/cms';

const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  headline: "LET'S WORK TOGETHER",
  email: 'hello@viralmuse.agency',
  logoTitle: 'ViralMuse',
  logoSubtitle: 'social media agency',
  showNavigation: true,
  navigationTitle: 'Global Navigation & Pages',
  social: {
    instagram: 'https://instagram.com/viralmuse',
    tiktok: 'https://tiktok.com/@viralmuse',
    whatsapp: 'https://wa.me/491512345678',
    linkedin: 'https://linkedin.com/company/viralmuse',
    youtube: 'https://youtube.com/@viralmuse',
    twitter: 'https://x.com/viralmuse',
  },
  links: [
    { id: 'lnk_1', label: 'Imprint', href: '#', target: '_self' },
    { id: 'lnk_2', label: 'Privacy Policy', href: '#', target: '_self' },
    { id: 'lnk_3', label: 'Cookie Settings', href: '#', target: '_self' },
  ],
  credits: '© 2026 ViralMuse Agency. All rights reserved.',
  backgroundColor: '#df0567',
  showLanguageSwitcher: true,
};

const HEADLINE_PRESETS = [
  "LET'S WORK TOGETHER",
  "LET'S SHAPE CULTURE",
  "CREATE ICONIC WORK",
  "COMMAND ATTENTION",
  "START A CONVERSATION",
  "JOIN THE MOVEMENT",
];

export default function CmsFooterManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [footer, setFooter] = useState<FooterSettings>(DEFAULT_FOOTER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'links' | 'social' | 'preview'>('content');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await cmsSettingsApi.get();
      setSettings(data);
      if (data.footer) {
        setFooter({
          headline: data.footer.headline || DEFAULT_FOOTER_SETTINGS.headline,
          email: data.footer.email || data.contactEmail || DEFAULT_FOOTER_SETTINGS.email,
          logoTitle: data.footer.logoTitle || data.siteName || DEFAULT_FOOTER_SETTINGS.logoTitle,
          logoSubtitle: data.footer.logoSubtitle || DEFAULT_FOOTER_SETTINGS.logoSubtitle,
          showNavigation: data.footer.showNavigation !== false,
          navigationTitle: data.footer.navigationTitle || DEFAULT_FOOTER_SETTINGS.navigationTitle,
          social: {
            instagram: data.footer.social?.instagram || data.socialLinks?.instagram || data.social?.instagram || DEFAULT_FOOTER_SETTINGS.social?.instagram || '',
            tiktok: data.footer.social?.tiktok || data.socialLinks?.tiktok || data.social?.tiktok || DEFAULT_FOOTER_SETTINGS.social?.tiktok || '',
            whatsapp: data.footer.social?.whatsapp || DEFAULT_FOOTER_SETTINGS.social?.whatsapp || '',
            linkedin: data.footer.social?.linkedin || data.socialLinks?.linkedin || data.social?.linkedin || DEFAULT_FOOTER_SETTINGS.social?.linkedin || '',
            youtube: data.footer.social?.youtube || data.socialLinks?.youtube || data.social?.youtube || DEFAULT_FOOTER_SETTINGS.social?.youtube || '',
            twitter: data.footer.social?.twitter || data.socialLinks?.twitter || data.social?.twitter || DEFAULT_FOOTER_SETTINGS.social?.twitter || '',
          },
          links: Array.isArray(data.footer.links) && data.footer.links.length > 0
            ? data.footer.links
            : DEFAULT_FOOTER_SETTINGS.links,
          credits: data.footer.credits || DEFAULT_FOOTER_SETTINGS.credits,
          backgroundColor: data.footer.backgroundColor || DEFAULT_FOOTER_SETTINGS.backgroundColor,
          showLanguageSwitcher: data.footer.showLanguageSwitcher !== false,
        });
      }
    } catch (err) {
      console.error('Failed to load site settings for footer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const payload: SiteSettings = {
        ...settings,
        footer,
        // Also keep socialLinks in sync for other components
        socialLinks: {
          ...settings.socialLinks,
          instagram: footer.social?.instagram,
          tiktok: footer.social?.tiktok,
          linkedin: footer.social?.linkedin,
          youtube: footer.social?.youtube,
          twitter: footer.social?.twitter,
        },
      };

      const updated = await cmsSettingsApi.update(payload);
      setSettings(updated);
      setSaveMessage('✓ Footer configuration saved and published live!');

      // Dispatch event to inform live Footer component to reload state immediately
      window.dispatchEvent(new CustomEvent('cms-settings-updated', { detail: payload }));

      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save footer settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Link management helpers
  const handleAddLink = () => {
    const newLink: FooterLinkItem = {
      id: `lnk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      label: 'New Link',
      href: '#',
      target: '_self',
    };
    setFooter((prev) => ({
      ...prev,
      links: [...(prev.links || []), newLink],
    }));
  };

  const handleUpdateLink = (index: number, field: keyof FooterLinkItem, value: any) => {
    setFooter((prev) => {
      const updated = [...(prev.links || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, links: updated };
    });
  };

  const handleDeleteLink = (index: number) => {
    setFooter((prev) => {
      const updated = (prev.links || []).filter((_, i) => i !== index);
      return { ...prev, links: updated };
    });
  };

  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    setFooter((prev) => {
      const updated = [...(prev.links || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, links: updated };
    });
  };

  const handleAddLegalPack = () => {
    const legalPack: FooterLinkItem[] = [
      { id: `lnk_imp_${Date.now()}`, label: 'Impressum / Imprint', href: '/p/impressum', target: '_self' },
      { id: `lnk_priv_${Date.now()}`, label: 'Privacy Policy', href: '/p/privacy-policy', target: '_self' },
      { id: `lnk_terms_${Date.now()}`, label: 'Terms & Conditions', href: '/p/terms', target: '_self' },
      { id: `lnk_cookie_${Date.now()}`, label: 'Cookie Preferences', href: '#cookies', target: '_self' },
    ];
    setFooter((prev) => ({
      ...prev,
      links: legalPack,
    }));
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-white/40 text-sm font-mono animate-pulse">
        Loading Footer CMS settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#df0567]/20 text-[#df0567] border border-[#df0567]/30">
              Live Global Component
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Footer &amp; Bottom Links</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Manage the giant marquee CTA headline, contact email, social channels, legal links, and footer branding.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-[#df0567]/25 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving & Publishing...' : 'Save & Publish Footer'}</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'content'
              ? 'bg-white/10 text-white shadow-xs'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Type className="w-3.5 h-3.5 text-[#df0567]" />
          <span>Headline &amp; Brand Copy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('links')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'links'
              ? 'bg-white/10 text-white shadow-xs'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5 text-[#df0567]" />
          <span>Legal &amp; Subfooter Links</span>
          <span className="px-1.5 py-0.2 bg-white/10 rounded-full text-[10px] text-white/80">
            {footer.links?.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'social'
              ? 'bg-white/10 text-white shadow-xs'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Instagram className="w-3.5 h-3.5 text-[#df0567]" />
          <span>Social Media Channels</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-white/10 text-white shadow-xs'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>Live Interactive Preview</span>
        </button>
      </div>

      {/* TAB 1: Headline & Brand Copy */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Main Giant Headline */}
          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-[#df0567]" />
                <span>Giant Edge-to-Edge Headline</span>
              </h3>
              <span className="text-[11px] text-white/40">Displays full-width in bold uppercase</span>
            </div>

            <input
              type="text"
              value={footer.headline || ''}
              onChange={(e) => setFooter((prev) => ({ ...prev, headline: e.target.value }))}
              placeholder="LET'S WORK TOGETHER"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-black tracking-wider uppercase focus:outline-hidden focus:border-[#df0567]"
            />

            {/* Headline Preset Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] uppercase font-semibold text-white/40 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#df0567]" />
                Quick Presets:
              </span>
              {HEADLINE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFooter((prev) => ({ ...prev, headline: preset }))}
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Email & Logo Copy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#df0567]" />
                <span>Contact / Inquiry Email</span>
              </h3>
              <div>
                <label className="block text-white/70 font-semibold text-xs mb-1">
                  Primary Clickable Email Address
                </label>
                <input
                  type="email"
                  value={footer.email || ''}
                  onChange={(e) => setFooter((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="hello@viralmuse.agency"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs font-mono focus:outline-hidden focus:border-[#df0567]"
                />
                <p className="text-[11px] text-white/40 mt-1">
                  Clicking this link automatically opens the user's default email client.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#df0567]" />
                <span>Footer Background &amp; Styling</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-white/70 font-semibold mb-1">
                    Footer Background Color (Hex Code)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={footer.backgroundColor || '#df0567'}
                      onChange={(e) => setFooter((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-9 h-9 rounded-lg bg-transparent border border-white/20 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={footer.backgroundColor || '#df0567'}
                      onChange={(e) => setFooter((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-hidden focus:border-[#df0567]"
                    />
                    <button
                      type="button"
                      onClick={() => setFooter((prev) => ({ ...prev, backgroundColor: '#df0567' }))}
                      className="px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-[11px]"
                    >
                      Reset Magenta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Title & Subtitle Branding */}
          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#df0567]" />
              <span>Centered Footer Logo &amp; Subtitle</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">Logo Headline</label>
                <input
                  type="text"
                  value={footer.logoTitle || ''}
                  onChange={(e) => setFooter((prev) => ({ ...prev, logoTitle: e.target.value }))}
                  placeholder="ViralMuse"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Logo Subtitle</label>
                <input
                  type="text"
                  value={footer.logoSubtitle || ''}
                  onChange={(e) => setFooter((prev) => ({ ...prev, logoSubtitle: e.target.value }))}
                  placeholder="social media agency"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white lowercase"
                />
              </div>
            </div>
          </div>

          {/* Global Navigation Strip & Copyright */}
          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#df0567]" />
              <span>Navigation Strip &amp; Bottom Bar Credits</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5">
                <div>
                  <span className="font-semibold text-white block">Display Global Navigation in Footer</span>
                  <span className="text-[11px] text-white/50">
                    Shows all active published pages and anchor links above the social icons
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={footer.showNavigation !== false}
                  onChange={(e) => setFooter((prev) => ({ ...prev, showNavigation: e.target.checked }))}
                  className="w-4 h-4 accent-[#df0567] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5">
                <div>
                  <span className="font-semibold text-white block">Display Language Switcher</span>
                  <span className="text-[11px] text-white/50">
                    Shows the DE / EN / IT selector in the bottom subfooter bar
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={footer.showLanguageSwitcher !== false}
                  onChange={(e) => setFooter((prev) => ({ ...prev, showLanguageSwitcher: e.target.checked }))}
                  className="w-4 h-4 accent-[#df0567] rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">
                  Subfooter Copyright / Credits Line
                </label>
                <input
                  type="text"
                  value={footer.credits || ''}
                  onChange={(e) => setFooter((prev) => ({ ...prev, credits: e.target.value }))}
                  placeholder="© 2026 ViralMuse Agency. All rights reserved."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Legal & Subfooter Links */}
      {activeTab === 'links' && (
        <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#df0567]" />
                <span>Subfooter Legal &amp; Custom Links</span>
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                These links appear in the bottom subfooter bar (e.g. Imprint, Privacy Policy, Terms).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddLegalPack}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#df0567]" />
                <span>Load Legal Pack</span>
              </button>

              <button
                type="button"
                onClick={handleAddLink}
                className="px-3.5 py-1.5 rounded-lg bg-[#df0567] hover:bg-[#c4045a] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-[#df0567]/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>
          </div>

          {/* Links List */}
          <div className="space-y-3">
            {(!footer.links || footer.links.length === 0) && (
              <div className="py-8 text-center text-white/40 text-xs border border-dashed border-white/10 rounded-xl">
                No custom subfooter links added yet. Click &quot;Add Link&quot; or &quot;Load Legal Pack&quot; to begin.
              </div>
            )}

            {footer.links?.map((link, idx) => (
              <div
                key={link.id || idx}
                className="p-3.5 rounded-xl bg-black/30 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3 transition-all hover:border-white/20"
              >
                <span className="text-[11px] font-mono text-white/40 w-6 text-center shrink-0">
                  #{idx + 1}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 flex-1 w-full text-xs">
                  <div>
                    <input
                      type="text"
                      value={link.label}
                      onChange={(e) => handleUpdateLink(idx, 'label', e.target.value)}
                      placeholder="Link Label (e.g. Privacy Policy)"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white font-medium focus:outline-hidden focus:border-[#df0567]"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={link.href}
                      onChange={(e) => handleUpdateLink(idx, 'href', e.target.value)}
                      placeholder="Destination URL (e.g. /p/privacy or https://...)"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-hidden focus:border-[#df0567]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={link.target || '_self'}
                      onChange={(e) => handleUpdateLink(idx, 'target', e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs cursor-pointer focus:outline-hidden"
                    >
                      <option value="_self">Same Tab (_self)</option>
                      <option value="_blank">New Tab (_blank)</option>
                    </select>

                    {link.href && link.href !== '#' && (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white"
                        title="Test link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveLink(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                    title="Move up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveLink(idx, 'down')}
                    disabled={idx === (footer.links?.length || 0) - 1}
                    className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                    title="Move down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLink(idx)}
                    className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer ml-1"
                    title="Delete link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Social Media Channels */}
      {activeTab === 'social' && (
        <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-6">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Instagram className="w-4 h-4 text-[#df0567]" />
              <span>Footer Social Media Profiles</span>
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              These icon buttons are featured directly on the footer with animated ripple interactions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Instagram */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
              <label className="block text-white/80 font-semibold flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-[#df0567]" />
                <span>Instagram Profile URL</span>
              </label>
              <input
                type="text"
                value={footer.social?.instagram || ''}
                onChange={(e) =>
                  setFooter((prev) => ({
                    ...prev,
                    social: { ...prev.social, instagram: e.target.value },
                  }))
                }
                placeholder="https://instagram.com/viralmuse"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-hidden focus:border-[#df0567]"
              />
            </div>

            {/* TikTok */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
              <label className="block text-white/80 font-semibold flex items-center gap-1.5">
                <span>TikTok Channel URL</span>
              </label>
              <input
                type="text"
                value={footer.social?.tiktok || ''}
                onChange={(e) =>
                  setFooter((prev) => ({
                    ...prev,
                    social: { ...prev.social, tiktok: e.target.value },
                  }))
                }
                placeholder="https://tiktok.com/@viralmuse"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-hidden focus:border-[#df0567]"
              />
            </div>

            {/* WhatsApp */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
              <label className="block text-white/80 font-semibold flex items-center gap-1.5">
                <span>WhatsApp Direct Chat Link</span>
              </label>
              <input
                type="text"
                value={footer.social?.whatsapp || ''}
                onChange={(e) =>
                  setFooter((prev) => ({
                    ...prev,
                    social: { ...prev.social, whatsapp: e.target.value },
                  }))
                }
                placeholder="https://wa.me/491512345678"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-hidden focus:border-[#df0567]"
              />
            </div>

            {/* LinkedIn */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
              <label className="block text-white/80 font-semibold flex items-center gap-1.5">
                <span>LinkedIn Company Page</span>
              </label>
              <input
                type="text"
                value={footer.social?.linkedin || ''}
                onChange={(e) =>
                  setFooter((prev) => ({
                    ...prev,
                    social: { ...prev.social, linkedin: e.target.value },
                  }))
                }
                placeholder="https://linkedin.com/company/viralmuse"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-hidden focus:border-[#df0567]"
              />
            </div>

            {/* YouTube */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
              <label className="block text-white/80 font-semibold flex items-center gap-1.5">
                <span>YouTube Channel URL</span>
              </label>
              <input
                type="text"
                value={footer.social?.youtube || ''}
                onChange={(e) =>
                  setFooter((prev) => ({
                    ...prev,
                    social: { ...prev.social, youtube: e.target.value },
                  }))
                }
                placeholder="https://youtube.com/@viralmuse"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-hidden focus:border-[#df0567]"
              />
            </div>

            {/* Twitter / X */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
              <label className="block text-white/80 font-semibold flex items-center gap-1.5">
                <span>X (formerly Twitter) URL</span>
              </label>
              <input
                type="text"
                value={footer.social?.twitter || ''}
                onChange={(e) =>
                  setFooter((prev) => ({
                    ...prev,
                    social: { ...prev.social, twitter: e.target.value },
                  }))
                }
                placeholder="https://x.com/viralmuse"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-hidden focus:border-[#df0567]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Live Interactive Preview */}
      {activeTab === 'preview' && (
        <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live Footer Rendering Preview</span>
            </h3>
            <span className="text-[11px] text-white/40">Visual simulation of the footer as styled</span>
          </div>

          <div
            style={{ backgroundColor: footer.backgroundColor || '#df0567' }}
            className="rounded-2xl p-8 sm:p-12 text-white text-center select-none shadow-2xl transition-colors"
          >
            {/* Giant Headline */}
            <h2 className="font-headline text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight uppercase mb-6 leading-tight">
              {footer.headline || "LET'S WORK TOGETHER"}
            </h2>

            {/* Email Link */}
            <div className="mb-8">
              <a
                href={`mailto:${footer.email}`}
                className="text-base sm:text-xl font-normal underline underline-offset-6 text-white/95 hover:text-white"
              >
                {footer.email || 'hello@viralmuse.agency'}
              </a>
            </div>

            {/* Navigation Strip if enabled */}
            {footer.showNavigation !== false && (
              <div className="mb-8 border-t border-b border-white/20 py-4 max-w-xl mx-auto">
                <div className="text-[10px] uppercase font-bold tracking-widest text-white/60 mb-2 font-mono">
                  {footer.navigationTitle || 'Global Navigation & Pages'}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold uppercase tracking-wider">
                  <span>Services</span>
                  <span>•</span>
                  <span>Partners</span>
                  <span>•</span>
                  <span>Reviews</span>
                  <span>•</span>
                  <span>Blueprint</span>
                  <span>•</span>
                  <span>Editorial</span>
                </div>
              </div>
            )}

            {/* Social Icons Bar */}
            <div className="flex items-center justify-center gap-4 mb-10">
              {footer.social?.instagram && (
                <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center">
                  <Instagram className="w-5 h-5" />
                </div>
              )}
              {footer.social?.tiktok && (
                <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center text-xs font-bold font-mono">
                  TT
                </div>
              )}
              {footer.social?.whatsapp && (
                <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center text-xs font-bold font-mono">
                  WA
                </div>
              )}
              {footer.social?.linkedin && (
                <div className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center text-xs font-bold font-mono">
                  IN
                </div>
              )}
            </div>

            {/* Logo Center */}
            <div className="mb-10">
              <div className="font-headline text-4xl sm:text-5xl font-bold tracking-tight">
                {footer.logoTitle || 'ViralMuse'}
              </div>
              <div className="text-sm font-sans tracking-widest lowercase opacity-90">
                {footer.logoSubtitle || 'social media agency'}
              </div>
            </div>

            {/* Subfooter Bottom Bar */}
            <div className="pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/80">
              <div className="flex flex-wrap items-center gap-4">
                {footer.links?.map((lnk, i) => (
                  <span key={i} className="hover:underline cursor-pointer">
                    {lnk.label}
                  </span>
                ))}
              </div>

              {footer.showLanguageSwitcher !== false && (
                <div className="px-2 py-0.5 rounded bg-black/20 text-[11px] font-mono">
                  [DE] [EN] [IT]
                </div>
              )}

              <div>{footer.credits || '© 2026 ViralMuse Agency. All rights reserved.'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
