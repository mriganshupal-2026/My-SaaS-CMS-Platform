import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  Sparkles,
  Type,
  Palette,
  Check,
  Send,
  Sliders,
  DollarSign,
  Phone,
  Building,
  Mail,
  User,
  MessageSquare,
  ArrowRight,
  Loader2,
  RotateCcw,
  Square,
  Circle,
  Paintbrush,
  CheckSquare,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { cmsSettingsApi } from '../../lib/cms-client';
import type { SiteSettings, InquiryFormSettings } from '../../types/cms';

export const DEFAULT_INQUIRY_FORM_SETTINGS: InquiryFormSettings = {
  badge: "Let's Connect",
  headline: 'Start a Project',
  description: 'Tell us about your property, upcoming season, or campaign ideas.',
  backgroundColor: '#df0567',
  fieldBackgroundColor: 'rgba(255, 255, 255, 0.1)',
  fieldBorderColor: 'rgba(255, 255, 255, 0.3)',
  fieldFocusBorderColor: '#ffffff',
  fieldBorderWidth: '1px',
  fieldBorderStyle: 'solid',
  fieldTextColor: '#ffffff',
  fieldPlaceholderColor: 'rgba(255, 255, 255, 0.45)',
  fieldLabelColor: 'rgba(255, 255, 255, 0.9)',
  fieldBorderRadius: 'rounded-lg',
  dividerBorderColor: 'rgba(255, 255, 255, 0.2)',
  buttonBackgroundColor: '#ffffff',
  buttonTextColor: '#df0567',
  checkboxBorderColor: 'rgba(255, 255, 255, 0.4)',
  checkboxActiveBorderColor: '#df0567',
  checkboxActiveBgColor: '#df0567',
  checkboxCheckColor: '#ffffff',
  checkboxBorderRadius: 'rounded-md',
  serviceCardBackgroundColor: 'rgba(255, 255, 255, 0.06)',
  serviceCardBorderColor: 'rgba(255, 255, 255, 0.25)',
  serviceCardActiveBackgroundColor: '#ffffff',
  serviceCardActiveBorderColor: '#ffffff',
  serviceCardActiveTextColor: '#df0567',
  budgetPillBgColor: 'rgba(255, 255, 255, 0.1)',
  budgetPillBorderColor: 'rgba(255, 255, 255, 0.25)',
  budgetPillTextColor: '#ffffff',
  budgetPillActiveBgColor: '#ffffff',
  budgetPillActiveBorderColor: '#ffffff',
  budgetPillActiveTextColor: '#df0567',
  servicesTitle: 'What can we do for you?',
  showServices: true,
  services: [
    'Cinematic Production (4K Reels & Aerial Cinematography)',
    'Influencer Architecture & Creator Activations',
    'Full-Service Social Media & Growth Strategy',
    'Hospitality & Luxury Lifestyle Campaign',
  ],
  nameLabel: 'Your Name *',
  namePlaceholder: 'Elena Rossi',
  companyLabel: 'Company / Hotel *',
  companyPlaceholder: 'Grand Alpine Resort',
  showCompany: true,
  emailLabel: 'Email Address *',
  emailPlaceholder: 'elena@grandresort.com',
  phoneLabel: 'Phone / WhatsApp (Optional)',
  phonePlaceholder: '+39 02 9475 2830',
  showPhone: true,
  budgetLabel: 'Estimated Budget Range (Optional)',
  showBudget: true,
  budgetOptions: [
    '< $10,000',
    '$10,000 - $25,000',
    '$25,000 - $50,000',
    '$50,000 - $100,000',
    '$100,000+',
  ],
  messageLabel: 'Additional Information',
  messagePlaceholder: 'Tell us about your property, upcoming season, target channels, or campaign ideas...',
  submitButtonText: 'Send Project Request',
  submittingText: 'Sending Inquiry...',
  successBadge: 'Sent',
  successTitle: 'That Worked!',
  successMessage:
    'Thank you for reaching out. We have received your inquiry and our creative team will be in touch within 24 hours.',
  successButtonText: 'Done',
  responsePromiseText: 'Direct priority response within 24h',
  contactEmail: 'hello@viralmuse.agency',
};

const SERVICE_PRESET_PACKS = [
  {
    name: 'Luxury Hospitality & Travel',
    items: [
      'Cinematic Production (4K Reels & Aerial Cinematography)',
      'Influencer Architecture & Creator Activations',
      'Full-Service Social Media & Growth Strategy',
      'Hospitality & Luxury Lifestyle Campaign',
    ],
  },
  {
    name: 'High-Growth Creator & Brand',
    items: [
      'Viral Short-Form Video Strategy (Reels/TikTok)',
      'Creator Brand Identity & Aesthetic Redesign',
      'Paid Acquisition & Influencer Amplification',
      'Multi-Platform Channel Management',
    ],
  },
  {
    name: 'VIP Bespoke Commercial',
    items: [
      'High-End Fashion & Editorial Filmmaking',
      'Global Influencer Retreat / Event Activation',
      'Full Brand Rebranding & Visual Identity',
      'Strategic PR & Media Placement',
    ],
  },
];

const BORDER_STYLE_PRESETS = [
  {
    label: 'Viral Magenta Modern',
    fieldBg: 'rgba(255, 255, 255, 0.1)',
    fieldBorder: 'rgba(255, 255, 255, 0.3)',
    focusBorder: '#ffffff',
    checkboxBorder: 'rgba(255, 255, 255, 0.4)',
    checkboxActiveBorder: '#df0567',
    checkboxActiveBg: '#df0567',
    cardBorder: 'rgba(255, 255, 255, 0.25)',
    cardActiveBorder: '#ffffff',
  },
  {
    label: 'Ultra Crisp White',
    fieldBg: 'rgba(0, 0, 0, 0.2)',
    fieldBorder: '#ffffff',
    focusBorder: '#f9b8d2',
    checkboxBorder: '#ffffff',
    checkboxActiveBorder: '#ffffff',
    checkboxActiveBg: '#ffffff',
    cardBorder: '#ffffff',
    cardActiveBorder: '#ffffff',
  },
  {
    label: 'Neon Pink Glow',
    fieldBg: 'rgba(223, 5, 103, 0.15)',
    fieldBorder: '#df0567',
    focusBorder: '#ff66aa',
    checkboxBorder: '#df0567',
    checkboxActiveBorder: '#ff007f',
    checkboxActiveBg: '#df0567',
    cardBorder: 'rgba(223, 5, 103, 0.4)',
    cardActiveBorder: '#ff66aa',
  },
  {
    label: 'Sleek Dark Glass',
    fieldBg: 'rgba(0, 0, 0, 0.45)',
    fieldBorder: 'rgba(255, 255, 255, 0.15)',
    focusBorder: '#ffffff',
    checkboxBorder: 'rgba(255, 255, 255, 0.3)',
    checkboxActiveBorder: '#000000',
    checkboxActiveBg: '#000000',
    cardBorder: 'rgba(255, 255, 255, 0.12)',
    cardActiveBorder: '#ffffff',
  },
  {
    label: 'Gold / Luxury Brass',
    fieldBg: 'rgba(0, 0, 0, 0.3)',
    fieldBorder: '#d4af37',
    focusBorder: '#f3e5ab',
    checkboxBorder: '#d4af37',
    checkboxActiveBorder: '#d4af37',
    checkboxActiveBg: '#d4af37',
    cardBorder: 'rgba(212, 175, 55, 0.4)',
    cardActiveBorder: '#d4af37',
  },
];

export default function CmsInquiryFormManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [formConfig, setFormConfig] = useState<InquiryFormSettings>(DEFAULT_INQUIRY_FORM_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'header' | 'styling' | 'checkboxes' | 'services' | 'fields' | 'success' | 'preview'>('styling');

  // Interactive preview state
  const [previewSelectedServices, setPreviewSelectedServices] = useState<string[]>([]);
  const [previewSelectedBudget, setPreviewSelectedBudget] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'form' | 'success'>('form');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await cmsSettingsApi.get();
      setSettings(data);
      if (data.inquiryForm) {
        setFormConfig({
          ...DEFAULT_INQUIRY_FORM_SETTINGS,
          ...data.inquiryForm,
          services: Array.isArray(data.inquiryForm.services) && data.inquiryForm.services.length > 0
            ? data.inquiryForm.services
            : DEFAULT_INQUIRY_FORM_SETTINGS.services,
          budgetOptions: Array.isArray(data.inquiryForm.budgetOptions) && data.inquiryForm.budgetOptions.length > 0
            ? data.inquiryForm.budgetOptions
            : DEFAULT_INQUIRY_FORM_SETTINGS.budgetOptions,
        });
      }
    } catch (err) {
      console.error('Failed to load inquiry form settings:', err);
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
        inquiryForm: formConfig,
      };

      const updated = await cmsSettingsApi.update(payload);
      setSettings(updated);
      setSaveMessage('✓ Inquiry Popup Form, Checkbox & Field Borders updated live!');

      // Dispatch event to inform live modal component
      window.dispatchEvent(new CustomEvent('cms-settings-updated', { detail: payload }));

      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to save inquiry form settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyBorderPreset = (p: typeof BORDER_STYLE_PRESETS[0]) => {
    setFormConfig((prev) => ({
      ...prev,
      fieldBackgroundColor: p.fieldBg,
      fieldBorderColor: p.fieldBorder,
      fieldFocusBorderColor: p.focusBorder,
      checkboxBorderColor: p.checkboxBorder,
      checkboxActiveBorderColor: p.checkboxActiveBorder,
      checkboxActiveBgColor: p.checkboxActiveBg,
      serviceCardBorderColor: p.cardBorder,
      serviceCardActiveBorderColor: p.cardActiveBorder,
    }));
  };

  // Service helpers
  const handleAddService = () => {
    setFormConfig((prev) => ({
      ...prev,
      services: [...(prev.services || []), 'New Service Option'],
    }));
  };

  const handleUpdateService = (index: number, value: string) => {
    setFormConfig((prev) => {
      const updated = [...(prev.services || [])];
      updated[index] = value;
      return { ...prev, services: updated };
    });
  };

  const handleDeleteService = (index: number) => {
    setFormConfig((prev) => ({
      ...prev,
      services: (prev.services || []).filter((_, i) => i !== index),
    }));
  };

  const handleMoveService = (index: number, direction: 'up' | 'down') => {
    setFormConfig((prev) => {
      const updated = [...(prev.services || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, services: updated };
    });
  };

  // Budget helpers
  const handleAddBudgetOption = () => {
    setFormConfig((prev) => ({
      ...prev,
      budgetOptions: [...(prev.budgetOptions || []), '$10k - $25k'],
    }));
  };

  const handleUpdateBudgetOption = (index: number, value: string) => {
    setFormConfig((prev) => {
      const updated = [...(prev.budgetOptions || [])];
      updated[index] = value;
      return { ...prev, budgetOptions: updated };
    });
  };

  const handleDeleteBudgetOption = (index: number) => {
    setFormConfig((prev) => ({
      ...prev,
      budgetOptions: (prev.budgetOptions || []).filter((_, i) => i !== index),
    }));
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-white/40 text-sm font-mono animate-pulse">
        Loading Inquiry Form settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#df0567]/20 text-[#df0567] border border-[#df0567]/30">
              Popup &amp; Modal Form
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-white/50 bg-white/5">
              Triggered by &quot;Get Started&quot; &amp; &quot;Start Project&quot;
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Inquiry Popup Form</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Configure form copy, checkbox border colors, field borders, corner radius, budget selectors, and live styles.
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
            <span>{isSaving ? 'Saving & Publishing...' : 'Save & Publish Form'}</span>
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('styling')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'styling'
              ? 'bg-white/10 text-white shadow-xs'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Paintbrush className="w-3.5 h-3.5 text-[#df0567]" />
          <span>Field &amp; Form Borders</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('checkboxes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'checkboxes'
              ? 'bg-white/10 text-white shadow-xs'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>Checkbox &amp; Card Borders</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'services'
              ? 'bg-white/10 text-white shadow-xs'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#df0567]" />
          <span>Services List ({formConfig.services?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fields')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'fields'
              ? 'bg-white/10 text-white shadow-xs'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-[#df0567]" />
          <span>Form Fields &amp; Labels</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('header')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'header'
              ? 'bg-white/10 text-white shadow-xs'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Type className="w-3.5 h-3.5 text-[#df0567]" />
          <span>Header &amp; Theme</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('success')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'success'
              ? 'bg-white/10 text-white shadow-xs'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-[#df0567]" />
          <span>Success Screen</span>
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

      {/* TAB 1: Field & Form Borders */}
      {activeTab === 'styling' && (
        <div className="space-y-6">
          {/* Preset themes */}
          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Paintbrush className="w-4 h-4 text-[#df0567]" />
              <span>Border Style &amp; Theme Presets</span>
            </h3>
            <p className="text-xs text-white/50">
              Select a preset to automatically coordinate all field borders, checkboxes, and focus states.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              {BORDER_STYLE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyBorderPreset(p)}
                  className="p-3 rounded-xl border border-white/10 hover:border-[#df0567] bg-black/40 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-md border"
                      style={{ backgroundColor: p.fieldBg, borderColor: p.fieldBorder }}
                    />
                    <div
                      className="w-3.5 h-3.5 rounded-sm border"
                      style={{ backgroundColor: p.checkboxActiveBg, borderColor: p.checkboxActiveBorder }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-[#df0567] transition-colors block truncate">
                    {p.label}
                  </span>
                  <span className="text-[10px] text-white/40 block truncate mt-0.5">{p.fieldBorder}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Input Field Borders */}
          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-5">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#df0567]" />
              <span>Input Field &amp; Textarea Borders</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              {/* Field Border Color */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2.5">
                <label className="block text-white/80 font-bold">
                  Field Border Color (Default State)
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={formConfig.fieldBorderColor?.startsWith('#') ? formConfig.fieldBorderColor : '#ffffff'}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, fieldBorderColor: e.target.value }))
                    }
                    className="w-9 h-9 rounded-lg bg-transparent border border-white/20 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formConfig.fieldBorderColor || ''}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, fieldBorderColor: e.target.value }))
                    }
                    placeholder="e.g. rgba(255, 255, 255, 0.3) or #ffffff"
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap pt-1 text-[10px]">
                  {['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.5)', '#ffffff', '#df0567', '#f9b8d2', '#000000'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormConfig((prev) => ({ ...prev, fieldBorderColor: c }))}
                      className="px-2 py-0.5 rounded-md bg-white/10 text-white/80 hover:bg-white/20"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field Focus Border Color */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2.5">
                <label className="block text-white/80 font-bold">
                  Field Focus Highlight Border Color
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={formConfig.fieldFocusBorderColor?.startsWith('#') ? formConfig.fieldFocusBorderColor : '#ffffff'}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, fieldFocusBorderColor: e.target.value }))
                    }
                    className="w-9 h-9 rounded-lg bg-transparent border border-white/20 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formConfig.fieldFocusBorderColor || ''}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, fieldFocusBorderColor: e.target.value }))
                    }
                    placeholder="#ffffff"
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap pt-1 text-[10px]">
                  {['#ffffff', '#f9b8d2', '#df0567', '#38bdf8', '#4ade80'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormConfig((prev) => ({ ...prev, fieldFocusBorderColor: c }))}
                      className="px-2 py-0.5 rounded-md bg-white/10 text-white/80 hover:bg-white/20"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field Border Width & Style */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2.5">
                <label className="block text-white/80 font-bold">
                  Field Border Thickness &amp; Line Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-white/50 block mb-1">Thickness</span>
                    <select
                      value={formConfig.fieldBorderWidth || '1px'}
                      onChange={(e) => setFormConfig((prev) => ({ ...prev, fieldBorderWidth: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                    >
                      <option value="1px">1px (Thin)</option>
                      <option value="1.5px">1.5px (Medium)</option>
                      <option value="2px">2px (Thick)</option>
                      <option value="3px">3px (Heavy)</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block mb-1">Style</span>
                    <select
                      value={formConfig.fieldBorderStyle || 'solid'}
                      onChange={(e) => setFormConfig((prev) => ({ ...prev, fieldBorderStyle: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                    >
                      <option value="solid">Solid Line</option>
                      <option value="dashed">Dashed Line</option>
                      <option value="dotted">Dotted Line</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Field Background Color */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2.5">
                <label className="block text-white/80 font-bold">
                  Field Background Color
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={formConfig.fieldBackgroundColor?.startsWith('#') ? formConfig.fieldBackgroundColor : '#ffffff'}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, fieldBackgroundColor: e.target.value }))
                    }
                    className="w-9 h-9 rounded-lg bg-transparent border border-white/20 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formConfig.fieldBackgroundColor || ''}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, fieldBackgroundColor: e.target.value }))
                    }
                    placeholder="e.g. rgba(255, 255, 255, 0.1) or #000000"
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Field Corner Radius */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2.5 sm:col-span-2">
                <label className="block text-white/80 font-bold">
                  Field &amp; Textarea Corner Radius
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { label: 'Sharp (4px)', val: 'rounded-sm' },
                    { label: 'Standard (8px)', val: 'rounded-lg' },
                    { label: 'Modern (12px)', val: 'rounded-xl' },
                    { label: 'Curved (16px)', val: 'rounded-2xl' },
                    { label: 'Pill Form', val: 'rounded-full' },
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => setFormConfig((prev) => ({ ...prev, fieldBorderRadius: r.val }))}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        formConfig.fieldBorderRadius === r.val
                          ? 'bg-[#df0567] text-white border-[#df0567] shadow-sm'
                          : 'bg-black/40 text-white/70 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawer Divider Border Color & Label Color */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2.5 sm:col-span-2">
                <label className="block text-white/80 font-bold">
                  Drawer Dividers &amp; Field Labels Color
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-white/60 block mb-1">Divider Lines Color</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formConfig.dividerBorderColor?.startsWith('#') ? formConfig.dividerBorderColor : '#ffffff'}
                        onChange={(e) =>
                          setFormConfig((prev) => ({ ...prev, dividerBorderColor: e.target.value }))
                        }
                        className="w-8 h-8 rounded-md bg-transparent border border-white/20 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={formConfig.dividerBorderColor || 'rgba(255, 255, 255, 0.2)'}
                        onChange={(e) =>
                          setFormConfig((prev) => ({ ...prev, dividerBorderColor: e.target.value }))
                        }
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-white/60 block mb-1">Field Label Text Color</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formConfig.fieldLabelColor?.startsWith('#') ? formConfig.fieldLabelColor : '#ffffff'}
                        onChange={(e) =>
                          setFormConfig((prev) => ({ ...prev, fieldLabelColor: e.target.value }))
                        }
                        className="w-8 h-8 rounded-md bg-transparent border border-white/20 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={formConfig.fieldLabelColor || 'rgba(255, 255, 255, 0.9)'}
                        onChange={(e) =>
                          setFormConfig((prev) => ({ ...prev, fieldLabelColor: e.target.value }))
                        }
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Checkbox & Card Borders */}
      {activeTab === 'checkboxes' && (
        <div className="space-y-6">
          {/* Checkbox Box Styles */}
          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-5">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Checkbox Square Border &amp; Color Customization</span>
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Configure the small checkbox square/circle that shows checkmarks next to service options.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              {/* Unchecked Checkbox Border */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2.5">
                <label className="block text-white/80 font-bold">
                  Checkbox Unchecked Border Color
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={formConfig.checkboxBorderColor?.startsWith('#') ? formConfig.checkboxBorderColor : '#ffffff'}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, checkboxBorderColor: e.target.value }))
                    }
                    className="w-9 h-9 rounded-lg bg-transparent border border-white/20 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formConfig.checkboxBorderColor || ''}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, checkboxBorderColor: e.target.value }))
                    }
                    placeholder="e.g. rgba(255, 255, 255, 0.4) or #ffffff"
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap pt-1 text-[10px]">
                  {['rgba(255, 255, 255, 0.4)', '#ffffff', '#df0567', 'rgba(0,0,0,0.5)'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormConfig((prev) => ({ ...prev, checkboxBorderColor: c }))}
                      className="px-2 py-0.5 rounded-md bg-white/10 text-white/80 hover:bg-white/20"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checked Checkbox Border & Fill */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2.5">
                <label className="block text-white/80 font-bold">
                  Checkbox Active Border &amp; Fill Color
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-white/60 block mb-1">Active Border</span>
                    <input
                      type="text"
                      value={formConfig.checkboxActiveBorderColor || '#df0567'}
                      onChange={(e) =>
                        setFormConfig((prev) => ({ ...prev, checkboxActiveBorderColor: e.target.value }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-white/60 block mb-1">Active Fill</span>
                    <input
                      type="text"
                      value={formConfig.checkboxActiveBgColor || '#df0567'}
                      onChange={(e) =>
                        setFormConfig((prev) => ({ ...prev, checkboxActiveBgColor: e.target.value }))
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Checkmark Tick Color */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2.5">
                <label className="block text-white/80 font-bold">
                  Checkmark Tick Icon Color
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={formConfig.checkboxCheckColor?.startsWith('#') ? formConfig.checkboxCheckColor : '#ffffff'}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, checkboxCheckColor: e.target.value }))
                    }
                    className="w-9 h-9 rounded-lg bg-transparent border border-white/20 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formConfig.checkboxCheckColor || '#ffffff'}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, checkboxCheckColor: e.target.value }))
                    }
                    placeholder="#ffffff"
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Checkbox Shape */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2.5">
                <label className="block text-white/80 font-bold">
                  Checkbox Corner Shape
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Square (4px)', val: 'rounded-sm' },
                    { label: 'Rounded (6px)', val: 'rounded-md' },
                    { label: 'Circle', val: 'rounded-full' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setFormConfig((prev) => ({ ...prev, checkboxBorderRadius: s.val }))}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                        formConfig.checkboxBorderRadius === s.val
                          ? 'bg-[#df0567] text-white border-[#df0567]'
                          : 'bg-black/40 text-white/70 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Service Option Cards Border */}
          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-5">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#df0567]" />
              <span>Service Selection Cards Border &amp; Background</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              {/* Inactive Card Border */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2.5">
                <label className="block text-white/80 font-bold">
                  Unselected Service Card Border
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={formConfig.serviceCardBorderColor?.startsWith('#') ? formConfig.serviceCardBorderColor : '#ffffff'}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, serviceCardBorderColor: e.target.value }))
                    }
                    className="w-9 h-9 rounded-lg bg-transparent border border-white/20 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formConfig.serviceCardBorderColor || 'rgba(255, 255, 255, 0.25)'}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, serviceCardBorderColor: e.target.value }))
                    }
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Active Card Border */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2.5">
                <label className="block text-white/80 font-bold">
                  Selected Service Card Border (Active)
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={formConfig.serviceCardActiveBorderColor?.startsWith('#') ? formConfig.serviceCardActiveBorderColor : '#ffffff'}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, serviceCardActiveBorderColor: e.target.value }))
                    }
                    className="w-9 h-9 rounded-lg bg-transparent border border-white/20 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formConfig.serviceCardActiveBorderColor || '#ffffff'}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, serviceCardActiveBorderColor: e.target.value }))
                    }
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Inactive & Active Card Background */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2.5">
                <label className="block text-white/80 font-bold">
                  Unselected Card Background
                </label>
                <input
                  type="text"
                  value={formConfig.serviceCardBackgroundColor || 'rgba(255, 255, 255, 0.06)'}
                  onChange={(e) =>
                    setFormConfig((prev) => ({ ...prev, serviceCardBackgroundColor: e.target.value }))
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs"
                />
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2.5">
                <label className="block text-white/80 font-bold">
                  Selected Card Background (Active)
                </label>
                <input
                  type="text"
                  value={formConfig.serviceCardActiveBackgroundColor || '#ffffff'}
                  onChange={(e) =>
                    setFormConfig((prev) => ({ ...prev, serviceCardActiveBackgroundColor: e.target.value }))
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Budget Option Pills Border */}
          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-5">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Budget Bracket Pills Border &amp; Colors</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <span className="font-bold text-white block">Unselected Budget Pill Border</span>
                <input
                  type="text"
                  value={formConfig.budgetPillBorderColor || 'rgba(255, 255, 255, 0.25)'}
                  onChange={(e) =>
                    setFormConfig((prev) => ({ ...prev, budgetPillBorderColor: e.target.value }))
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                />
              </div>

              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <span className="font-bold text-white block">Selected Budget Pill Border (Active)</span>
                <input
                  type="text"
                  value={formConfig.budgetPillActiveBorderColor || '#ffffff'}
                  onChange={(e) =>
                    setFormConfig((prev) => ({ ...prev, budgetPillActiveBorderColor: e.target.value }))
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Selectable Services */}
      {activeTab === 'services' && (
        <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#df0567]" />
                <span>Service &amp; Project Option Checkboxes</span>
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Visitors can toggle one or multiple services when submitting their inquiry.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddService}
                className="px-3.5 py-1.5 rounded-lg bg-[#df0567] hover:bg-[#c4045a] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-[#df0567]/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service Option</span>
              </button>
            </div>
          </div>

          {/* Section Enable Toggle & Section Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-white/5">
              <div>
                <span className="font-semibold text-white block">Enable Services Selection</span>
                <span className="text-[11px] text-white/50">
                  Shows the checkbox selector pills at the top of the form
                </span>
              </div>
              <input
                type="checkbox"
                checked={formConfig.showServices !== false}
                onChange={(e) =>
                  setFormConfig((prev) => ({ ...prev, showServices: e.target.checked }))
                }
                className="w-4 h-4 accent-[#df0567] rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-white/70 font-semibold mb-1">
                Services Section Label
              </label>
              <input
                type="text"
                value={formConfig.servicesTitle || ''}
                onChange={(e) =>
                  setFormConfig((prev) => ({ ...prev, servicesTitle: e.target.value }))
                }
                placeholder="What can we do for you?"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-medium text-xs"
              />
            </div>
          </div>

          {/* Preset Packs */}
          <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
            <span className="text-[11px] uppercase font-bold text-white/40 block">
              Quick Preset Packs:
            </span>
            <div className="flex flex-wrap gap-2">
              {SERVICE_PRESET_PACKS.map((pack) => (
                <button
                  key={pack.name}
                  type="button"
                  onClick={() =>
                    setFormConfig((prev) => ({ ...prev, services: [...pack.items] }))
                  }
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-semibold transition-colors cursor-pointer border border-white/10 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-[#df0567]" />
                  <span>{pack.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Services List */}
          <div className="space-y-2.5">
            {(!formConfig.services || formConfig.services.length === 0) && (
              <div className="py-8 text-center text-white/40 text-xs border border-dashed border-white/10 rounded-xl">
                No service options configured. Click &quot;Add Service Option&quot; or choose a preset pack.
              </div>
            )}

            {formConfig.services?.map((svc, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center gap-3 transition-all hover:border-white/20"
              >
                <span className="text-[11px] font-mono text-white/40 w-6 text-center shrink-0">
                  #{idx + 1}
                </span>

                <input
                  type="text"
                  value={svc}
                  onChange={(e) => handleUpdateService(idx, e.target.value)}
                  placeholder="e.g. Cinematic Production (4K Reels & Aerial Cinematography)"
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3.5 py-2 text-white font-medium text-xs focus:outline-hidden focus:border-[#df0567]"
                />

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveService(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                    title="Move up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveService(idx, 'down')}
                    disabled={idx === (formConfig.services?.length || 0) - 1}
                    className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                    title="Move down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(idx)}
                    className="p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer ml-1"
                    title="Delete service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Form Fields & Labels */}
      {activeTab === 'fields' && (
        <div className="space-y-6">
          {/* Inputs Config */}
          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-5">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#df0567]" />
              <span>Input Fields &amp; Placeholders</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              {/* Name Field */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#df0567]" />
                    <span>Name Field</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">Required</span>
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Field Label</label>
                  <input
                    type="text"
                    value={formConfig.nameLabel || ''}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, nameLabel: e.target.value }))
                    }
                    placeholder="Your Name *"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Placeholder Text</label>
                  <input
                    type="text"
                    value={formConfig.namePlaceholder || ''}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, namePlaceholder: e.target.value }))
                    }
                    placeholder="Elena Rossi"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              {/* Company Field */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#df0567]" />
                    <span>Company / Hotel Field</span>
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-white/70 text-[11px]">
                    <input
                      type="checkbox"
                      checked={formConfig.showCompany !== false}
                      onChange={(e) =>
                        setFormConfig((prev) => ({ ...prev, showCompany: e.target.checked }))
                      }
                      className="accent-[#df0567]"
                    />
                    <span>Enabled</span>
                  </label>
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Field Label</label>
                  <input
                    type="text"
                    value={formConfig.companyLabel || ''}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, companyLabel: e.target.value }))
                    }
                    placeholder="Company / Hotel *"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Placeholder Text</label>
                  <input
                    type="text"
                    value={formConfig.companyPlaceholder || ''}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, companyPlaceholder: e.target.value }))
                    }
                    placeholder="Grand Alpine Resort"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#df0567]" />
                    <span>Email Address Field</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">Required</span>
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Field Label</label>
                  <input
                    type="text"
                    value={formConfig.emailLabel || ''}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, emailLabel: e.target.value }))
                    }
                    placeholder="Email Address *"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Placeholder Text</label>
                  <input
                    type="text"
                    value={formConfig.emailPlaceholder || ''}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, emailPlaceholder: e.target.value }))
                    }
                    placeholder="elena@grandresort.com"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#df0567]" />
                    <span>Phone / WhatsApp Field</span>
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-white/70 text-[11px]">
                    <input
                      type="checkbox"
                      checked={formConfig.showPhone !== false}
                      onChange={(e) =>
                        setFormConfig((prev) => ({ ...prev, showPhone: e.target.checked }))
                      }
                      className="accent-[#df0567]"
                    />
                    <span>Enabled</span>
                  </label>
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Field Label</label>
                  <input
                    type="text"
                    value={formConfig.phoneLabel || ''}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, phoneLabel: e.target.value }))
                    }
                    placeholder="Phone / WhatsApp (Optional)"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Placeholder Text</label>
                  <input
                    type="text"
                    value={formConfig.phonePlaceholder || ''}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, phonePlaceholder: e.target.value }))
                    }
                    placeholder="+39 02 9475 2830"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                  />
                </div>
              </div>

              {/* Message Field */}
              <div className="sm:col-span-2 p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#df0567]" />
                    <span>Message &amp; Project Description Field</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/60 mb-1">Field Label</label>
                    <input
                      type="text"
                      value={formConfig.messageLabel || ''}
                      onChange={(e) =>
                        setFormConfig((prev) => ({ ...prev, messageLabel: e.target.value }))
                      }
                      placeholder="Additional Information"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 mb-1">Placeholder Text</label>
                    <input
                      type="text"
                      value={formConfig.messagePlaceholder || ''}
                      onChange={(e) =>
                        setFormConfig((prev) => ({
                          ...prev,
                          messagePlaceholder: e.target.value,
                        }))
                      }
                      placeholder="Tell us about your property, upcoming season, target channels, or campaign ideas..."
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="sm:col-span-2 p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-[#df0567]" />
                    <span>Submit Button Copy &amp; Colors</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/60 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={formConfig.submitButtonText || ''}
                      onChange={(e) =>
                        setFormConfig((prev) => ({ ...prev, submitButtonText: e.target.value }))
                      }
                      placeholder="Send Project Request"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 mb-1">Submitting / Loading Text</label>
                    <input
                      type="text"
                      value={formConfig.submittingText || ''}
                      onChange={(e) =>
                        setFormConfig((prev) => ({ ...prev, submittingText: e.target.value }))
                      }
                      placeholder="Sending Inquiry..."
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Range Options */}
          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#df0567]" />
                  <span>Estimated Budget Range Selector</span>
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Allows clients to select their target budget bracket.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-white cursor-pointer bg-black/30 px-3 py-1.5 rounded-lg border border-white/10">
                  <input
                    type="checkbox"
                    checked={formConfig.showBudget !== false}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, showBudget: e.target.checked }))
                    }
                    className="accent-[#df0567] rounded"
                  />
                  <span>Show Budget Selector</span>
                </label>

                <button
                  type="button"
                  onClick={handleAddBudgetOption}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tier</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-white/70 font-semibold mb-1">
                  Budget Section Label
                </label>
                <input
                  type="text"
                  value={formConfig.budgetLabel || ''}
                  onChange={(e) =>
                    setFormConfig((prev) => ({ ...prev, budgetLabel: e.target.value }))
                  }
                  placeholder="Estimated Budget Range (Optional)"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white"
                />
              </div>

              {formConfig.budgetOptions?.map((opt, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center gap-2"
                >
                  <span className="text-[10px] font-mono text-white/40 w-4 text-center">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleUpdateBudgetOption(idx, e.target.value)}
                    className="flex-1 bg-transparent border-0 text-white font-medium text-xs focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteBudgetOption(idx)}
                    className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Header & Theme */}
      {activeTab === 'header' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-[#df0567]" />
              <span>Drawer Header &amp; Top Branding</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">
                  Top Badge / Small Tagline
                </label>
                <input
                  type="text"
                  value={formConfig.badge || ''}
                  onChange={(e) => setFormConfig((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="Let's Connect"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-semibold uppercase tracking-wider"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={formConfig.headline || ''}
                  onChange={(e) => setFormConfig((prev) => ({ ...prev, headline: e.target.value }))}
                  placeholder="Start a Project"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-black uppercase text-base"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-white/70 font-semibold mb-1">
                  Sub-description / Context Note (Optional)
                </label>
                <input
                  type="text"
                  value={formConfig.description || ''}
                  onChange={(e) => setFormConfig((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell us about your property, upcoming season, or campaign ideas."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
            </div>
          </div>

          {/* Drawer Background Styling */}
          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#df0567]" />
              <span>Drawer Background Color</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">
                  Drawer Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formConfig.backgroundColor?.startsWith('#') ? formConfig.backgroundColor : '#df0567'}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, backgroundColor: e.target.value }))
                    }
                    className="w-10 h-10 rounded-xl bg-transparent border border-white/20 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formConfig.backgroundColor || '#df0567'}
                    onChange={(e) =>
                      setFormConfig((prev) => ({ ...prev, backgroundColor: e.target.value }))
                    }
                    className="flex-1 max-w-xs bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormConfig((prev) => ({ ...prev, backgroundColor: '#df0567' }))
                    }
                    className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Viral Magenta</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Success Screen */}
      {activeTab === 'success' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Success Confirmation Screen</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">
                  Success Screen Headline
                </label>
                <input
                  type="text"
                  value={formConfig.successTitle || ''}
                  onChange={(e) =>
                    setFormConfig((prev) => ({ ...prev, successTitle: e.target.value }))
                  }
                  placeholder="That Worked!"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-black text-lg uppercase"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">
                  Confirmation Message Text
                </label>
                <textarea
                  rows={3}
                  value={formConfig.successMessage || ''}
                  onChange={(e) =>
                    setFormConfig((prev) => ({ ...prev, successMessage: e.target.value }))
                  }
                  placeholder="Thank you for reaching out. We have received your inquiry and our creative team will be in touch within 24 hours."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white leading-relaxed resize-none"
                />
              </div>

              <div className="max-w-xs">
                <label className="block text-white/70 font-semibold mb-1">
                  Close Button Label
                </label>
                <input
                  type="text"
                  value={formConfig.successButtonText || ''}
                  onChange={(e) =>
                    setFormConfig((prev) => ({ ...prev, successButtonText: e.target.value }))
                  }
                  placeholder="Done"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white font-bold"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#df0567]" />
              <span>Drawer Micro-Footer &amp; SLA Note</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">
                  Response Promise Note
                </label>
                <input
                  type="text"
                  value={formConfig.responsePromiseText || ''}
                  onChange={(e) =>
                    setFormConfig((prev) => ({
                      ...prev,
                      responsePromiseText: e.target.value,
                    }))
                  }
                  placeholder="Direct priority response within 24h"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">
                  Fallback Support Email
                </label>
                <input
                  type="email"
                  value={formConfig.contactEmail || ''}
                  onChange={(e) =>
                    setFormConfig((prev) => ({ ...prev, contactEmail: e.target.value }))
                  }
                  placeholder="hello@viralmuse.agency"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: Live Interactive Preview */}
      {activeTab === 'preview' && (
        <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Live Drawer Interactive Simulation</span>
              </h3>
              <p className="text-xs text-white/50">
                Click checkboxes, toggle states, and test your custom checkbox borders and field border styling live.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode('form')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  previewMode === 'form'
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                Form State
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('success')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  previewMode === 'success'
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/15'
                }`}
              >
                Success State
              </button>
            </div>
          </div>

          {/* Drawer Simulation Container */}
          <div className="flex justify-center p-4 bg-black/40 rounded-2xl border border-white/5">
            <div
              style={{ backgroundColor: formConfig.backgroundColor || '#df0567' }}
              className="w-full max-w-xl rounded-2xl text-white p-6 sm:p-8 shadow-2xl transition-colors duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div
                  style={{ borderColor: formConfig.dividerBorderColor || 'rgba(255, 255, 255, 0.2)' }}
                  className="flex items-center justify-between pb-4 border-b mb-6"
                >
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-[#f9b8d2] font-semibold">
                      {formConfig.badge || "Let's Connect"}
                    </span>
                    <h2 className="font-headline text-2xl sm:text-3xl uppercase tracking-wide leading-none mt-1">
                      {formConfig.headline || 'Start a Project'}
                    </h2>
                    {formConfig.description && (
                      <p className="text-xs text-white/80 mt-1">{formConfig.description}</p>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
                    ✕
                  </div>
                </div>

                {previewMode === 'success' ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center">
                    <div
                      style={{
                        backgroundColor: formConfig.buttonBackgroundColor || '#ffffff',
                        color: formConfig.buttonTextColor || '#df0567',
                      }}
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-xl"
                    >
                      <Check size={28} strokeWidth={3} />
                    </div>
                    <h3 className="font-headline text-3xl uppercase tracking-wider mb-2">
                      {formConfig.successTitle || 'That Worked!'}
                    </h3>
                    <p className="text-xs text-white/90 max-w-sm mx-auto leading-relaxed">
                      {formConfig.successMessage ||
                        'Thank you for reaching out. We have received your inquiry and our creative team will be in touch within 24 hours.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('form')}
                      style={{
                        backgroundColor: formConfig.buttonBackgroundColor || '#ffffff',
                        color: formConfig.buttonTextColor || '#df0567',
                      }}
                      className="mt-6 px-6 py-2 rounded-full font-bold text-xs uppercase"
                    >
                      {formConfig.successButtonText || 'Done'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Services selection */}
                    {formConfig.showServices !== false &&
                      formConfig.services &&
                      formConfig.services.length > 0 && (
                        <div>
                          <label
                            style={{ color: formConfig.fieldLabelColor || 'rgba(255, 255, 255, 0.9)' }}
                            className="block text-[11px] uppercase tracking-wider font-semibold mb-2"
                          >
                            {formConfig.servicesTitle || 'What can we do for you?'}
                          </label>
                          <div className="space-y-1.5">
                            {formConfig.services.map((svc) => {
                              const isChecked = previewSelectedServices.includes(svc);
                              return (
                                <button
                                  type="button"
                                  key={svc}
                                  onClick={() =>
                                    setPreviewSelectedServices((prev) =>
                                      prev.includes(svc)
                                        ? prev.filter((s) => s !== svc)
                                        : [...prev, svc]
                                    )
                                  }
                                  style={{
                                    backgroundColor: isChecked
                                      ? formConfig.serviceCardActiveBackgroundColor || '#ffffff'
                                      : formConfig.serviceCardBackgroundColor || 'rgba(255, 255, 255, 0.06)',
                                    borderColor: isChecked
                                      ? formConfig.serviceCardActiveBorderColor || '#ffffff'
                                      : formConfig.serviceCardBorderColor || 'rgba(255, 255, 255, 0.25)',
                                    borderWidth: formConfig.fieldBorderWidth || '1px',
                                    borderStyle: formConfig.fieldBorderStyle || 'solid',
                                    color: isChecked
                                      ? formConfig.serviceCardActiveTextColor || '#df0567'
                                      : '#ffffff',
                                  }}
                                  className="w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer"
                                >
                                  <span>{svc}</span>
                                  <span
                                    style={{
                                      backgroundColor: isChecked
                                        ? formConfig.checkboxActiveBgColor || '#df0567'
                                        : 'transparent',
                                      borderColor: isChecked
                                        ? formConfig.checkboxActiveBorderColor || '#df0567'
                                        : formConfig.checkboxBorderColor || 'rgba(255, 255, 255, 0.4)',
                                      color: formConfig.checkboxCheckColor || '#ffffff',
                                    }}
                                    className={`w-4 h-4 border flex items-center justify-center ${
                                      formConfig.checkboxBorderRadius || 'rounded-md'
                                    }`}
                                  >
                                    {isChecked && <Check size={10} strokeWidth={3} />}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label
                          style={{ color: formConfig.fieldLabelColor || 'rgba(255, 255, 255, 0.9)' }}
                          className="block text-[10px] uppercase font-semibold mb-1"
                        >
                          {formConfig.nameLabel || 'Your Name *'}
                        </label>
                        <input
                          type="text"
                          placeholder={formConfig.namePlaceholder || 'Elena Rossi'}
                          style={{
                            backgroundColor: formConfig.fieldBackgroundColor || 'rgba(255, 255, 255, 0.1)',
                            borderColor: formConfig.fieldBorderColor || 'rgba(255, 255, 255, 0.3)',
                            borderWidth: formConfig.fieldBorderWidth || '1px',
                            borderStyle: formConfig.fieldBorderStyle || 'solid',
                            color: formConfig.fieldTextColor || '#ffffff',
                          }}
                          className={`w-full px-3 py-2 border text-xs ${formConfig.fieldBorderRadius || 'rounded-lg'}`}
                          readOnly
                        />
                      </div>

                      {formConfig.showCompany !== false && (
                        <div>
                          <label
                            style={{ color: formConfig.fieldLabelColor || 'rgba(255, 255, 255, 0.9)' }}
                            className="block text-[10px] uppercase font-semibold mb-1"
                          >
                            {formConfig.companyLabel || 'Company / Hotel *'}
                          </label>
                          <input
                            type="text"
                            placeholder={formConfig.companyPlaceholder || 'Grand Alpine Resort'}
                            style={{
                              backgroundColor: formConfig.fieldBackgroundColor || 'rgba(255, 255, 255, 0.1)',
                              borderColor: formConfig.fieldBorderColor || 'rgba(255, 255, 255, 0.3)',
                              borderWidth: formConfig.fieldBorderWidth || '1px',
                              borderStyle: formConfig.fieldBorderStyle || 'solid',
                              color: formConfig.fieldTextColor || '#ffffff',
                            }}
                            className={`w-full px-3 py-2 border text-xs ${formConfig.fieldBorderRadius || 'rounded-lg'}`}
                            readOnly
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label
                          style={{ color: formConfig.fieldLabelColor || 'rgba(255, 255, 255, 0.9)' }}
                          className="block text-[10px] uppercase font-semibold mb-1"
                        >
                          {formConfig.emailLabel || 'Email Address *'}
                        </label>
                        <input
                          type="email"
                          placeholder={formConfig.emailPlaceholder || 'elena@grandresort.com'}
                          style={{
                            backgroundColor: formConfig.fieldBackgroundColor || 'rgba(255, 255, 255, 0.1)',
                            borderColor: formConfig.fieldBorderColor || 'rgba(255, 255, 255, 0.3)',
                            borderWidth: formConfig.fieldBorderWidth || '1px',
                            borderStyle: formConfig.fieldBorderStyle || 'solid',
                            color: formConfig.fieldTextColor || '#ffffff',
                          }}
                          className={`w-full px-3 py-2 border text-xs ${formConfig.fieldBorderRadius || 'rounded-lg'}`}
                          readOnly
                        />
                      </div>

                      {formConfig.showPhone !== false && (
                        <div>
                          <label
                            style={{ color: formConfig.fieldLabelColor || 'rgba(255, 255, 255, 0.9)' }}
                            className="block text-[10px] uppercase font-semibold mb-1"
                          >
                            {formConfig.phoneLabel || 'Phone / WhatsApp (Optional)'}
                          </label>
                          <input
                            type="text"
                            placeholder={formConfig.phonePlaceholder || '+39 02 9475 2830'}
                            style={{
                              backgroundColor: formConfig.fieldBackgroundColor || 'rgba(255, 255, 255, 0.1)',
                              borderColor: formConfig.fieldBorderColor || 'rgba(255, 255, 255, 0.3)',
                              borderWidth: formConfig.fieldBorderWidth || '1px',
                              borderStyle: formConfig.fieldBorderStyle || 'solid',
                              color: formConfig.fieldTextColor || '#ffffff',
                            }}
                            className={`w-full px-3 py-2 border text-xs ${formConfig.fieldBorderRadius || 'rounded-lg'}`}
                            readOnly
                          />
                        </div>
                      )}
                    </div>

                    {/* Budget Pills in Preview */}
                    {formConfig.showBudget !== false &&
                      formConfig.budgetOptions &&
                      formConfig.budgetOptions.length > 0 && (
                        <div>
                          <label
                            style={{ color: formConfig.fieldLabelColor || 'rgba(255, 255, 255, 0.9)' }}
                            className="block text-[10px] uppercase font-semibold mb-1.5"
                          >
                            {formConfig.budgetLabel || 'Estimated Budget Range'}
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {formConfig.budgetOptions.map((opt) => {
                              const isBudgetChecked = previewSelectedBudget === opt;
                              return (
                                <button
                                  type="button"
                                  key={opt}
                                  onClick={() =>
                                    setPreviewSelectedBudget((prev) =>
                                      prev === opt ? '' : opt
                                    )
                                  }
                                  style={{
                                    backgroundColor: isBudgetChecked
                                      ? formConfig.budgetPillActiveBgColor || '#ffffff'
                                      : formConfig.budgetPillBgColor || 'rgba(255, 255, 255, 0.1)',
                                    borderColor: isBudgetChecked
                                      ? formConfig.budgetPillActiveBorderColor || '#ffffff'
                                      : formConfig.budgetPillBorderColor || 'rgba(255, 255, 255, 0.25)',
                                    color: isBudgetChecked
                                      ? formConfig.budgetPillActiveTextColor || '#df0567'
                                      : formConfig.budgetPillTextColor || '#ffffff',
                                  }}
                                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer border"
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {/* Message Area */}
                    <div>
                      <label
                        style={{ color: formConfig.fieldLabelColor || 'rgba(255, 255, 255, 0.9)' }}
                        className="block text-[10px] uppercase font-semibold mb-1"
                      >
                        {formConfig.messageLabel || 'Additional Information'}
                      </label>
                      <textarea
                        rows={2}
                        placeholder={
                          formConfig.messagePlaceholder ||
                          'Tell us about your property, upcoming season, target channels...'
                        }
                        style={{
                          backgroundColor: formConfig.fieldBackgroundColor || 'rgba(255, 255, 255, 0.1)',
                          borderColor: formConfig.fieldBorderColor || 'rgba(255, 255, 255, 0.3)',
                          borderWidth: formConfig.fieldBorderWidth || '1px',
                          borderStyle: formConfig.fieldBorderStyle || 'solid',
                          color: formConfig.fieldTextColor || '#ffffff',
                        }}
                        className={`w-full px-3 py-2 border text-xs resize-none ${formConfig.fieldBorderRadius || 'rounded-lg'}`}
                        readOnly
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setPreviewMode('success')}
                        style={{
                          backgroundColor: formConfig.buttonBackgroundColor || '#ffffff',
                          color: formConfig.buttonTextColor || '#df0567',
                        }}
                        className="w-full py-3 px-4 rounded-full font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        <span>{formConfig.submitButtonText || 'Send Project Request'}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Micro Footer inside Drawer */}
              <div
                style={{ borderColor: formConfig.dividerBorderColor || 'rgba(255, 255, 255, 0.2)' }}
                className="mt-8 pt-3 border-t flex items-center justify-between text-[11px] text-white/70"
              >
                <span className="flex items-center gap-1">
                  <Sparkles size={11} className="text-[#f9b8d2]" />
                  {formConfig.responsePromiseText || 'Direct priority response within 24h'}
                </span>
                <span>{formConfig.contactEmail || 'hello@viralmuse.agency'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
