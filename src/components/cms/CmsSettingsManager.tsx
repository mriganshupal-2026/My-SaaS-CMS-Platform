import React, { useState, useEffect } from 'react';
import {
  Save,
  Lock,
  Building2,
  Mail,
  Phone,
  MapPin,
  Instagram,
  CheckCircle,
  KeyRound,
  Globe,
  PanelBottom,
  ArrowRight,
  Link as LinkIcon,
} from 'lucide-react';
import { cmsSettingsApi, cmsAuthApi } from '../../lib/cms-client';
import type { SiteSettings } from '../../types/cms';

export default function CmsSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passMessage, setPassMessage] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

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

  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const updated = await cmsSettingsApi.update(settings);
      setSettings(updated);
      setSaveMessage('✓ Global agency settings saved successfully!');
      window.dispatchEvent(new CustomEvent('cms-settings-updated', { detail: updated }));
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setIsChangingPass(true);
    setPassMessage(null);
    setPassError(null);

    try {
      await cmsAuthApi.changePassword(currentPassword, newPassword);
      setPassMessage('✓ Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPassMessage(null), 4000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password');
    } finally {
      setIsChangingPass(false);
    }
  };

  if (isLoading || !settings) {
    return <div className="py-12 text-center text-white/40 text-sm">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Site &amp; Agency Settings</h2>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Agency branding, contact channels, social networks, and security credentials.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-[#df0567]/25 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {saveMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Agency Contact & Branding Card */}
      <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-[#df0567]" />
          <span>Agency Profile &amp; Contact Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-white/70 font-semibold mb-1">Site / Brand Name</label>
            <input
              type="text"
              value={settings.siteName || ''}
              onChange={(e) => setSettings((prev) => (prev ? { ...prev, siteName: e.target.value } : null))}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-white/70 font-semibold mb-1">Agency Tagline</label>
            <input
              type="text"
              value={settings.tagline || ''}
              onChange={(e) => setSettings((prev) => (prev ? { ...prev, tagline: e.target.value } : null))}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-white/70 font-semibold mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#df0567]" />
              <span>Contact Email</span>
            </label>
            <input
              type="email"
              value={settings.contactEmail || ''}
              onChange={(e) =>
                setSettings((prev) => (prev ? { ...prev, contactEmail: e.target.value } : null))
              }
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
            />
          </div>

          <div>
            <label className="block text-white/70 font-semibold mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#df0567]" />
              <span>Contact Phone</span>
            </label>
            <input
              type="text"
              value={settings.contactPhone || ''}
              onChange={(e) =>
                setSettings((prev) => (prev ? { ...prev, contactPhone: e.target.value } : null))
              }
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-white/70 font-semibold mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#df0567]" />
              <span>Site Domain / Canonical Base URL</span>
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
                            siteName: prev.siteName || 'ViralMuse',
                            siteDescription: '',
                            contactEmail: prev.contactEmail || '',
                            phone: prev.contactPhone || '',
                            address: prev.address || '',
                          }),
                          siteUrl: e.target.value,
                        },
                      }
                    : null
                )
              }
              placeholder="https://viral-agency-cinematic-social-influencer-agency.ai.studio"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs"
            />
            <p className="text-[11px] text-white/40 mt-1">
              Active domain for sitemap.xml, robots.txt, and social media preview links.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-white/70 font-semibold mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#df0567]" />
              <span>Headquarters Location / Address</span>
            </label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={(e) => setSettings((prev) => (prev ? { ...prev, address: e.target.value } : null))}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
            />
          </div>
        </div>
      </div>

      {/* Footer & Bottom Bar Card */}
      <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-bold text-base text-white flex items-center space-x-2">
            <PanelBottom className="w-4 h-4 text-[#df0567]" />
            <span>Footer &amp; Bottom Bar Configuration</span>
          </h3>
          <span className="text-[11px] text-[#df0567] bg-[#df0567]/10 px-2.5 py-1 rounded-full border border-[#df0567]/20 font-semibold">
            Global Live Footer
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-white/70 font-semibold mb-1">Giant Marquee Headline</label>
            <input
              type="text"
              value={settings.footer?.headline || ''}
              onChange={(e) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        footer: {
                          ...(prev.footer || { headline: '', email: '', links: [], credits: '' }),
                          headline: e.target.value,
                        },
                      }
                    : null
                )
              }
              placeholder="LET'S WORK TOGETHER"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-bold uppercase"
            />
          </div>

          <div>
            <label className="block text-white/70 font-semibold mb-1">Contact Inquiry Email</label>
            <input
              type="email"
              value={settings.footer?.email || ''}
              onChange={(e) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        footer: {
                          ...(prev.footer || { headline: '', email: '', links: [], credits: '' }),
                          email: e.target.value,
                        },
                      }
                    : null
                )
              }
              placeholder="hello@viralmuse.agency"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-white/70 font-semibold mb-1">Subfooter Credits / Copyright Text</label>
            <input
              type="text"
              value={settings.footer?.credits || ''}
              onChange={(e) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        footer: {
                          ...(prev.footer || { headline: '', email: '', links: [], credits: '' }),
                          credits: e.target.value,
                        },
                      }
                    : null
                )
              }
              placeholder="© 2026 ViralMuse Agency. All rights reserved."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
            />
          </div>
        </div>
      </div>

      {/* Resend Email Integration Settings */}
      <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center space-x-2">
          <Mail className="w-4 h-4 text-[#df0567]" />
          <span>Resend Email Integration (Transactional Credentials)</span>
        </h3>
        <p className="text-xs text-white/60">
          Configure your Resend API Key to automatically dispatch real emails (such as team member login credentials) to your team.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="block text-white/70 font-semibold mb-1">Resend API Key</label>
            <input
              type="password"
              value={settings.resendApiKey || ''}
              onChange={(e) =>
                setSettings((prev) => (prev ? { ...prev, resendApiKey: e.target.value } : null))
              }
              placeholder="re_123456789..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-white/70 font-semibold mb-1">Sender Email Address</label>
            <input
              type="text"
              value={settings.emailSender || ''}
              onChange={(e) =>
                setSettings((prev) => (prev ? { ...prev, emailSender: e.target.value } : null))
              }
              placeholder="ViralMuse <onboarding@resend.dev>"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center space-x-2">
          <Instagram className="w-4 h-4 text-[#df0567]" />
          <span>Social Media Handles &amp; Links</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-white/70 font-semibold mb-1">Instagram URL</label>
            <input
              type="text"
              value={settings.socialLinks?.instagram || ''}
              onChange={(e) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        socialLinks: { ...prev.socialLinks, instagram: e.target.value },
                      }
                    : null
                )
              }
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-white/70 font-semibold mb-1">TikTok URL</label>
            <input
              type="text"
              value={settings.socialLinks?.tiktok || ''}
              onChange={(e) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        socialLinks: { ...prev.socialLinks, tiktok: e.target.value },
                      }
                    : null
                )
              }
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-white/70 font-semibold mb-1">LinkedIn URL</label>
            <input
              type="text"
              value={settings.socialLinks?.linkedin || ''}
              onChange={(e) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        socialLinks: { ...prev.socialLinks, linkedin: e.target.value },
                      }
                    : null
                )
              }
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-white/70 font-semibold mb-1">YouTube URL</label>
            <input
              type="text"
              value={settings.socialLinks?.youtube || ''}
              onChange={(e) =>
                setSettings((prev) =>
                  prev
                    ? {
                        ...prev,
                        socialLinks: { ...prev.socialLinks, youtube: e.target.value },
                      }
                    : null
                )
              }
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Admin Password Change Form */}
      <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center space-x-2">
          <KeyRound className="w-4 h-4 text-[#df0567]" />
          <span>Update Admin Password</span>
        </h3>

        {passMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
            {passMessage}
          </div>
        )}

        {passError && (
          <div className="p-3 rounded-xl bg-red-500/10 text-red-400 text-xs border border-red-500/20">
            {passError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-white/70 font-semibold mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter existing password"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-hidden focus:border-[#df0567]"
              required
            />
          </div>

          <div>
            <label className="block text-white/70 font-semibold mb-1">New Password (Min. 8 chars)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new strong password"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-hidden focus:border-[#df0567]"
              required
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isChangingPass}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              {isChangingPass ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
