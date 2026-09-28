import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Globe,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckCircle,
  Video,
  BarChart3,
  Briefcase,
  Type,
  Users2,
  MessageSquareQuote,
  GitMerge,
  Flame,
  FileText,
  Megaphone,
  Copy,
  LayoutTemplate,
} from 'lucide-react';
import { cmsPagesApi, publicApi } from '../../lib/cms-client';
import type { Page, PageSection, SectionType } from '../../types/cms';
import CmsMediaPickerModal from './CmsMediaPickerModal';
import CmsSectionTemplateModal from './CmsSectionTemplateModal';
import {
  HOMEPAGE_SECTION_TEMPLATES,
  PAGE_STARTER_TEMPLATES,
  type PageStarterTemplate,
} from '../../lib/sectionTemplates';

interface CmsPageEditorProps {
  pageId?: string; // If null/empty, creates new page
  onBack: () => void;
  onSaved?: () => void;
}

export default function CmsPageEditor({ pageId, onBack, onSaved }: CmsPageEditorProps) {
  const [page, setPage] = useState<Partial<Page>>({
    title: '',
    slug: '',
    status: 'DRAFT',
    isHomepage: false,
    sections: [],
    seo: {
      title: '',
      description: '',
      ogImage: '/og-image.jpg',
    },
  });

  const [activeTab, setActiveTab] = useState<'sections' | 'seo'>('sections');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Section Template Modal state
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Media Picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerCallback, setMediaPickerCallback] = useState<((url: string) => void) | null>(
    null
  );
  const [mediaPickerType, setMediaPickerType] = useState<'all' | 'image' | 'video'>('all');

  useEffect(() => {
    if (pageId) {
      loadPage(pageId);
    }
  }, [pageId]);

  const loadPage = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await cmsPagesApi.getById(id);
      setPage(data);
    } catch (err: any) {
      alert(err.message || 'Failed to load page');
    } finally {
      setIsLoading(false);
    }
  };

  const openMediaPicker = (
    onSelect: (url: string) => void,
    type: 'all' | 'image' | 'video' = 'all'
  ) => {
    setMediaPickerCallback(() => onSelect);
    setMediaPickerType(type);
    setMediaPickerOpen(true);
  };

  const handleSave = async (targetStatus?: 'DRAFT' | 'PUBLISHED') => {
    if (!page.title || !page.slug) {
      alert('Page title and slug are required.');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const payload: Partial<Page> = {
        ...page,
        status: targetStatus || page.status || 'DRAFT',
      };

      let saved: Page;
      if (page.id) {
        saved = await cmsPagesApi.update(page.id, payload);
      } else {
        saved = await cmsPagesApi.create(payload);
      }

      setPage(saved);
      setSaveMessage('✓ Page saved and published to database successfully!');
      // Dispatch real-time sync event for instant live preview updates
      window.dispatchEvent(new CustomEvent('cms-page-saved', { detail: saved }));
      setTimeout(() => setSaveMessage(null), 4000);
      onSaved?.();
    } catch (err: any) {
      alert(err.message || 'Failed to save page');
    } finally {
      setIsSaving(false);
    }
  };

  // Section reordering
  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!page.sections) return;
    const newSections = [...page.sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;

    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIdx, 0, moved);

    // Update orderIndex
    newSections.forEach((sec, idx) => {
      sec.orderIndex = idx;
    });

    setPage((prev) => ({ ...prev, sections: newSections }));
  };

  // Section deletion
  const deleteSection = (index: number) => {
    if (!page.sections) return;
    if (!confirm('Remove this section block?')) return;
    const newSections = page.sections.filter((_, idx) => idx !== index);
    setPage((prev) => ({ ...prev, sections: newSections }));
  };

  // Add new Section using pre-configured homepage templates
  const addSection = (type: SectionType) => {
    const currentSections = page.sections || [];
    const orderIndex = currentSections.length;

    const template = HOMEPAGE_SECTION_TEMPLATES.find((t) => t.type === type);
    const newSection: PageSection = template
      ? template.generateSection(orderIndex)
      : {
          id: `sec_${type}_${Date.now()}`,
          type,
          title: `${type.toUpperCase()} Section`,
          isEnabled: true,
          orderIndex,
          data: {} as any,
        };

    setPage((prev) => ({
      ...prev,
      sections: [...currentSections, newSection],
    }));
  };

  const handleInsertSection = (section: PageSection) => {
    const currentSections = page.sections || [];
    section.orderIndex = currentSections.length;
    setPage((prev) => ({
      ...prev,
      sections: [...currentSections, section],
    }));
  };

  const handleApplyPageTemplate = (template: PageStarterTemplate) => {
    const generated = template.generateSections();
    setPage((prev) => ({
      ...prev,
      title: prev.title || template.name,
      slug: prev.slug || template.recommendedSlug,
      sections: generated,
    }));
    setSaveMessage(`✓ Applied template: ${template.name} (${generated.length} sections)`);
    setTimeout(() => setSaveMessage(null), 4000);
  };

  const handleCloneAllHomepage = async () => {
    if (!confirm('Clone all 8 sections from the current homepage into this page? This will append the complete homepage layout.')) {
      return;
    }
    try {
      const home = await publicApi.getHomepage();
      if (home?.sections && home.sections.length > 0) {
        const clonedSections: PageSection[] = home.sections.map((s, idx) => ({
          ...JSON.parse(JSON.stringify(s)),
          id: `sec_${s.type}_${Date.now()}_${idx}`,
          orderIndex: (page.sections?.length || 0) + idx,
        }));
        setPage((prev) => ({
          ...prev,
          sections: [...(prev.sections || []), ...clonedSections],
        }));
        setSaveMessage(`✓ Cloned ${clonedSections.length} sections from homepage!`);
        setTimeout(() => setSaveMessage(null), 4000);
      } else {
        const fullTpl = PAGE_STARTER_TEMPLATES.find((t) => t.id === 'page_tpl_full_homepage_clone');
        if (fullTpl) {
          handleApplyPageTemplate(fullTpl);
        }
      }
    } catch (err: any) {
      alert('Failed to clone homepage: ' + err.message);
    }
  };

  // Update a specific section's data
  const updateSectionData = (index: number, field: string, value: any) => {
    if (!page.sections) return;
    const newSections = [...page.sections];
    const sec = { ...newSections[index] };
    (sec as any).data = {
      ...(sec as any).data,
      [field]: value,
    };
    newSections[index] = sec;
    setPage((prev) => ({ ...prev, sections: newSections }));
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-white/50 text-sm">Loading page builder...</div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Media Picker Modal */}
      <CmsMediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        acceptType={mediaPickerType}
        onSelect={(url) => {
          if (mediaPickerCallback) {
            mediaPickerCallback(url);
          }
        }}
      />

      {/* Section Template Library Modal */}
      <CmsSectionTemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onInsertSection={handleInsertSection}
        onApplyPageTemplate={handleApplyPageTemplate}
        currentIndex={page.sections?.length || 0}
      />

      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 bg-[#0d0d10]/90 backdrop-blur-md py-2 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{page.id ? `Edit: ${page.title || 'Untitled'}` : 'Create New Page'}</span>
              {page.isHomepage && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#df0567]/20 text-[#df0567] border border-[#df0567]/30">
                  Homepage
                </span>
              )}
            </h2>
            <p className="text-xs text-white/50 font-mono">
              URL: {page.isHomepage ? '/' : `/p/${page.slug || 'slug'}`}
            </p>
          </div>
        </div>

        {/* Save & Publish Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Section Templates Browser Trigger */}
          <button
            type="button"
            onClick={() => setTemplateModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#df0567]/15 hover:bg-[#df0567]/25 border border-[#df0567]/30 text-xs font-semibold text-[#df0567] hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Section Templates</span>
          </button>

          {/* Clone Homepage Sections */}
          {!page.isHomepage && (
            <button
              type="button"
              onClick={handleCloneAllHomepage}
              title="Duplicate all 8 sections from current homepage"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-white/60" />
              <span className="hidden sm:inline">Clone Homepage</span>
            </button>
          )}

          {page.id && (
            <a
              href={page.isHomepage ? '/' : `/p/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-white/60" />
              <span>Preview</span>
            </a>
          )}

          <button
            onClick={() => handleSave('DRAFT')}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            Save Draft
          </button>

          <button
            onClick={() => handleSave('PUBLISHED')}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-xs font-semibold text-white transition-all shadow-lg shadow-[#df0567]/30 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Publishing...' : 'Save & Publish'}</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Basic Settings Card */}
      <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 shadow-lg grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
            Page Title *
          </label>
          <input
            type="text"
            value={page.title || ''}
            onChange={(e) => {
              const title = e.target.value;
              setPage((prev) => ({
                ...prev,
                title,
                slug: prev.isHomepage
                  ? 'home'
                  : prev.slug ||
                    title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, ''),
              }));
            }}
            placeholder="e.g. VIP Hospitality Production"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-hidden focus:border-[#df0567]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
            URL Slug *
          </label>
          <input
            type="text"
            disabled={page.isHomepage}
            value={page.slug || ''}
            onChange={(e) =>
              setPage((prev) => ({
                ...prev,
                slug: e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-_]/g, '-'),
              }))
            }
            placeholder="e.g. vip-hospitality"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 font-mono disabled:opacity-50 focus:outline-hidden focus:border-[#df0567]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
            Publication Status
          </label>
          <select
            value={page.status || 'DRAFT'}
            onChange={(e) =>
              setPage((prev) => ({ ...prev, status: e.target.value as any }))
            }
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-[#df0567]"
          >
            <option value="DRAFT">Draft (Unpublished)</option>
            <option value="PUBLISHED">Published (Live)</option>
          </select>
        </div>
      </div>

      {/* Editor Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('sections')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'sections'
              ? 'bg-[#df0567] text-white shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Page Sections &amp; Content ({page.sections?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'seo'
              ? 'bg-[#df0567] text-white shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>SEO &amp; Social Share Cards</span>
        </button>
      </div>

      {/* Tab 1: Section Blocks Manager */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          {/* Section Blocks List */}
          {(!page.sections || page.sections.length === 0) ? (
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-[#131317] border border-white/10 shadow-2xl space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-[#df0567]/20 border border-[#df0567]/30 flex items-center justify-center text-[#df0567] mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-white">Start Building Your Page</h3>
                <p className="text-xs text-white/60">
                  Use section templates modeled from each section of the ViralMuse homepage, clone the full homepage layout, or pick from our library.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTemplateModalOpen(true)}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white text-xs font-semibold transition-all shadow-lg shadow-[#df0567]/30 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Browse Section Templates</span>
                </button>

                {!page.isHomepage && (
                  <button
                    type="button"
                    onClick={handleCloneAllHomepage}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-white/70" />
                    <span>Clone 8 Homepage Sections</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            page.sections.map((section, idx) => (
              <div
                key={section.id || idx}
                className="p-5 rounded-2xl bg-[#131317] border border-white/10 shadow-lg space-y-4"
              >
                {/* Block Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{section.title}</h4>
                      <span className="text-[10px] uppercase tracking-wider font-mono text-[#df0567]">
                        {section.type} block
                      </span>
                    </div>
                  </div>

                  {/* Reorder & Remove Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveSection(idx, 'up')}
                      disabled={idx === 0}
                      title="Move Up"
                      className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'down')}
                      disabled={idx === (page.sections?.length || 1) - 1}
                      title="Move Down"
                      className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSection(idx)}
                      title="Delete Block"
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Section Specific Structured Fields */}
                {section.type === 'hero' && (
                  <div className="space-y-4 text-xs">
                    {/* Typography & Copy */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/70 font-medium mb-1">Eyebrow Script Text</label>
                        <input
                          type="text"
                          value={(section.data as any)?.scriptText || ''}
                          onChange={(e) => updateSectionData(idx, 'scriptText', e.target.value)}
                          placeholder="we make you"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 font-medium mb-1">Main Giant Headline</label>
                        <input
                          type="text"
                          value={(section.data as any)?.mainHeadline || ''}
                          onChange={(e) => updateSectionData(idx, 'mainHeadline', e.target.value)}
                          placeholder="Command Attention"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 font-medium mb-1">Subscript Tagline</label>
                        <input
                          type="text"
                          value={(section.data as any)?.subscriptText || ''}
                          onChange={(e) => updateSectionData(idx, 'subscriptText', e.target.value)}
                          placeholder="Next-gen creators & social media agency"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 font-medium mb-1">Ambient Watermark Title</label>
                        <input
                          type="text"
                          value={(section.data as any)?.ambientTitle || ''}
                          onChange={(e) => updateSectionData(idx, 'ambientTitle', e.target.value)}
                          placeholder="VIRALMUSE"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-black/20 border border-white/5">
                      <div className="space-y-2">
                        <label className="block text-white/80 font-semibold text-[11px] uppercase tracking-wider text-[#df0567]">
                          Primary Action Button
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Button Text (e.g. Start Project)"
                            value={(section.data as any)?.ctaPrimaryText || ''}
                            onChange={(e) => updateSectionData(idx, 'ctaPrimaryText', e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                          />
                          <input
                            type="text"
                            placeholder="Destination Link (#inquiry)"
                            value={(section.data as any)?.ctaPrimaryLink || ''}
                            onChange={(e) => updateSectionData(idx, 'ctaPrimaryLink', e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-white/80 font-semibold text-[11px] uppercase tracking-wider text-white/60">
                          Secondary Action Button
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Button Text (e.g. Explore Work)"
                            value={(section.data as any)?.ctaSecondaryText || ''}
                            onChange={(e) => updateSectionData(idx, 'ctaSecondaryText', e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                          />
                          <input
                            type="text"
                            placeholder="Destination Link (#services)"
                            value={(section.data as any)?.ctaSecondaryLink || ''}
                            onChange={(e) => updateSectionData(idx, 'ctaSecondaryLink', e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* HERO VIDEO URL CONFIGURATION */}
                    <div className="p-4 rounded-xl bg-gradient-to-b from-[#181820] to-[#121216] border border-[#df0567]/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-white font-bold text-xs">
                          <Video className="w-4 h-4 text-[#df0567]" />
                          <span>Hero Background Video URL</span>
                          <span className="text-[10px] font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            Live Autoplay Video
                          </span>
                        </label>
                        <span className="text-[10px] text-white/50">Supports .mp4, .webm, CDN, or uploaded file</span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={(section.data as any)?.videoUrl || ''}
                          onChange={(e) => updateSectionData(idx, 'videoUrl', e.target.value)}
                          placeholder="/videos/hero.mp4 or https://cdn.example.com/video.mp4"
                          className="flex-1 bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-hidden focus:border-[#df0567]"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            openMediaPicker((url) => updateSectionData(idx, 'videoUrl', url), 'video')
                          }
                          className="px-3.5 py-2 rounded-lg bg-[#df0567] hover:bg-[#c4045a] text-white font-medium flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#df0567]/20 transition-all shrink-0"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Choose / Upload Video</span>
                        </button>
                      </div>

                      {/* Quick Video Presets */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] uppercase font-semibold text-white/40 mr-1">Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => updateSectionData(idx, 'videoUrl', '/videos/hero.mp4')}
                          className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-[10px] font-mono transition-colors"
                        >
                          /videos/hero.mp4 (Alpine Cinema)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSectionData(idx, 'videoUrl', '/videos/hero-loop.mp4')}
                          className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-[10px] font-mono transition-colors"
                        >
                          /videos/hero-loop.mp4 (Smooth Loop)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSectionData(idx, 'videoUrl', 'https://assets.cdn.filesafe.space/xSjwuaSnNYIVMgIONcb2/media/6ab3b5d98bf21de2ae3b42b0.mp4')}
                          className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-white/80 hover:text-white text-[10px] font-mono transition-colors"
                        >
                          Cloud 4K Stream (CDN)
                        </button>
                      </div>

                      {/* Live Video Preview Box */}
                      {(section.data as any)?.videoUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-white/10 bg-black relative max-h-48 flex items-center justify-center">
                          <video
                            key={(section.data as any)?.videoUrl}
                            src={(section.data as any)?.videoUrl}
                            poster={(section.data as any)?.posterUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full max-h-48 object-cover rounded-lg"
                          />
                          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs px-2 py-1 rounded text-[10px] text-white/90 font-mono">
                            Video Preview: {(section.data as any)?.videoUrl}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* BACKGROUND POSTER / FALLBACK IMAGE */}
                    <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-white/80 font-medium">Background Poster / Fallback Image URL</label>
                        <span className="text-[10px] text-white/40">Displayed while video buffers or on mobile power-save</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={(section.data as any)?.posterUrl || ''}
                          onChange={(e) => updateSectionData(idx, 'posterUrl', e.target.value)}
                          placeholder="/images/hero-fallback.jpg"
                          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            openMediaPicker((url) => updateSectionData(idx, 'posterUrl', url), 'image')
                          }
                          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Choose Image</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {section.type === 'stats' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                      <span className="font-semibold text-[#df0567]">Stat 1</span>
                      <input
                        type="text"
                        placeholder="Value (e.g. 15+)"
                        value={(section.data as any)?.stat1Value || ''}
                        onChange={(e) => updateSectionData(idx, 'stat1Value', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Label"
                        value={(section.data as any)?.stat1Label || ''}
                        onChange={(e) => updateSectionData(idx, 'stat1Label', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>

                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                      <span className="font-semibold text-[#df0567]">Stat 2</span>
                      <input
                        type="text"
                        placeholder="Value (e.g. 400+)"
                        value={(section.data as any)?.stat2Value || ''}
                        onChange={(e) => updateSectionData(idx, 'stat2Value', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Label"
                        value={(section.data as any)?.stat2Label || ''}
                        onChange={(e) => updateSectionData(idx, 'stat2Label', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>

                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                      <span className="font-semibold text-[#df0567]">Stat 3</span>
                      <input
                        type="text"
                        placeholder="Value (e.g. 150+)"
                        value={(section.data as any)?.stat3Value || ''}
                        onChange={(e) => updateSectionData(idx, 'stat3Value', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Label"
                        value={(section.data as any)?.stat3Label || ''}
                        onChange={(e) => updateSectionData(idx, 'stat3Label', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                      />
                    </div>
                  </div>
                )}

                {section.type === 'services' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/70 font-medium mb-1">Eyebrow</label>
                        <input
                          type="text"
                          value={(section.data as any)?.eyebrow || ''}
                          onChange={(e) => updateSectionData(idx, 'eyebrow', e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 font-medium mb-1">Section Heading</label>
                        <input
                          type="text"
                          value={(section.data as any)?.heading || ''}
                          onChange={(e) => updateSectionData(idx, 'heading', e.target.value)}
                          placeholder="OUR SERVICES"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-semibold"
                        />
                      </div>
                    </div>

                    {/* Service Cards (3 Cards) */}
                    <div className="space-y-3 pt-2">
                      <span className="font-semibold text-white/80 uppercase tracking-wider block text-[11px]">
                        Service Cards (Sticky Stacks)
                      </span>
                      {[0, 1, 2].map((cardIdx) => {
                        const items = (section.data as any)?.items || [];
                        const cardItem = items[cardIdx] || {};
                        const defaultTitles = ['Cinematic Production', 'Influencer Architecture', 'Growth & Social Strategy'];
                        const defaultDesc = [
                          'Photos, reels, drone videos, image campaigns & tailored model casting.',
                          'Curating elite tastemakers across lifestyle, hospitality, and culinary culture.',
                          'We engineer tailor-made growth strategies, spot cultural trends and elevate your brand\'s digital presence.',
                        ];

                        const updateCard = (field: string, val: string) => {
                          const newItems = [...items];
                          while (newItems.length <= cardIdx) {
                            newItems.push({
                              id: `srv_${newItems.length + 1}`,
                              title: defaultTitles[newItems.length] || '',
                              desc: defaultDesc[newItems.length] || '',
                            });
                          }
                          newItems[cardIdx] = {
                            ...newItems[cardIdx],
                            [field]: val,
                          };
                          updateSectionData(idx, 'items', newItems);
                        };

                        return (
                          <div key={cardIdx} className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                            <span className="font-semibold text-[#df0567]">Card {cardIdx + 1}</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-white/50 block mb-1">Service Title</label>
                                <input
                                  type="text"
                                  value={cardItem.title ?? defaultTitles[cardIdx]}
                                  onChange={(e) => updateCard('title', e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-semibold"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-white/50 block mb-1">Description Copy</label>
                                <input
                                  type="text"
                                  value={cardItem.desc ?? defaultDesc[cardIdx]}
                                  onChange={(e) => updateCard('desc', e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {section.type === 'word_marquee' && (
                  <div className="space-y-3 text-xs">
                    <span className="font-semibold text-white/80 uppercase tracking-wider block text-[11px]">
                      Typographic Kinetic Words
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-white/70 font-medium mb-1">Top-Left Text</label>
                        <input
                          type="text"
                          value={(section.data as any)?.line1?.[0] || ''}
                          onChange={(e) => {
                            const l1 = [...((section.data as any)?.line1 || ['Bold Vision', 'Viral Muse', 'Infinite Reach'])];
                            l1[0] = e.target.value;
                            updateSectionData(idx, 'line1', l1);
                          }}
                          placeholder="Bold Vision"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 font-medium mb-1">Center Text</label>
                        <input
                          type="text"
                          value={(section.data as any)?.line1?.[1] || ''}
                          onChange={(e) => {
                            const l1 = [...((section.data as any)?.line1 || ['Bold Vision', 'Viral Muse', 'Infinite Reach'])];
                            l1[1] = e.target.value;
                            updateSectionData(idx, 'line1', l1);
                          }}
                          placeholder="Viral Muse"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-bold text-[#df0567]"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 font-medium mb-1">Bottom-Right Text</label>
                        <input
                          type="text"
                          value={(section.data as any)?.line1?.[2] || ''}
                          onChange={(e) => {
                            const l1 = [...((section.data as any)?.line1 || ['Bold Vision', 'Viral Muse', 'Infinite Reach'])];
                            l1[2] = e.target.value;
                            updateSectionData(idx, 'line1', l1);
                          }}
                          placeholder="Infinite Reach"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {section.type === 'partners' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-white/70 font-medium mb-1">Partners Section Title</label>
                      <input
                        type="text"
                        value={(section.data as any)?.heading || ''}
                        onChange={(e) => updateSectionData(idx, 'heading', e.target.value)}
                        placeholder="OUR PARTNERS"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-semibold"
                      />
                    </div>
                  </div>
                )}

                {section.type === 'testimonials' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-white/70 font-medium mb-1">Section Heading</label>
                      <input
                        type="text"
                        value={(section.data as any)?.heading || ''}
                        onChange={(e) => updateSectionData(idx, 'heading', e.target.value)}
                        placeholder="NOTHING BUT THE TRUTH"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-semibold"
                      />
                    </div>

                    <div className="space-y-3">
                      <span className="font-semibold text-white/80 uppercase tracking-wider block text-[11px]">
                        Client Endorsements &amp; Quotes
                      </span>
                      {(((section.data as any)?.items || []) as any[]).map((tItem: any, tIdx: number) => (
                        <div key={tIdx} className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] text-white/50 block mb-1">Brand / Hotel</label>
                              <input
                                type="text"
                                value={tItem.company || ''}
                                onChange={(e) => {
                                  const items = [...((section.data as any)?.items || [])];
                                  items[tIdx] = { ...items[tIdx], company: e.target.value };
                                  updateSectionData(idx, 'items', items);
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-semibold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-white/50 block mb-1">Client Name</label>
                              <input
                                type="text"
                                value={tItem.name || ''}
                                onChange={(e) => {
                                  const items = [...((section.data as any)?.items || [])];
                                  items[tIdx] = { ...items[tIdx], name: e.target.value };
                                  updateSectionData(idx, 'items', items);
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-white/50 block mb-1">Role &amp; Location</label>
                              <input
                                type="text"
                                value={tItem.role || ''}
                                onChange={(e) => {
                                  const items = [...((section.data as any)?.items || [])];
                                  items[tIdx] = { ...items[tIdx], role: e.target.value };
                                  updateSectionData(idx, 'items', items);
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-white/50 block mb-1">Quote</label>
                            <textarea
                              rows={2}
                              value={tItem.quote || ''}
                              onChange={(e) => {
                                const items = [...((section.data as any)?.items || [])];
                                items[tIdx] = { ...items[tIdx], quote: e.target.value };
                                updateSectionData(idx, 'items', items);
                              }}
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.type === 'workflow' && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-white/70 font-medium mb-1">Workflow Heading</label>
                      <input
                        type="text"
                        value={(section.data as any)?.heading || ''}
                        onChange={(e) => updateSectionData(idx, 'heading', e.target.value)}
                        placeholder="OUR WORKFLOW"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-semibold"
                      />
                    </div>

                    <div className="space-y-3">
                      <span className="font-semibold text-white/80 uppercase tracking-wider block text-[11px]">
                        4-Step Strategic Blueprint
                      </span>
                      {[0, 1, 2, 3].map((stepIdx) => {
                        const steps = (section.data as any)?.steps || [];
                        const stepItem = steps[stepIdx] || {};
                        const defaultTitles = [
                          'Personal introduction',
                          'Content creation',
                          'Growth & marketing strategy',
                          'Ongoing performance & scale',
                        ];

                        const updateStep = (field: string, val: string) => {
                          const newSteps = [...steps];
                          while (newSteps.length <= stepIdx) {
                            newSteps.push({
                              n: `0${newSteps.length + 1}`,
                              title: defaultTitles[newSteps.length] || '',
                              copy: '',
                            });
                          }
                          newSteps[stepIdx] = {
                            ...newSteps[stepIdx],
                            n: `0${stepIdx + 1}`,
                            [field]: val,
                          };
                          updateSectionData(idx, 'steps', newSteps);
                        };

                        return (
                          <div key={stepIdx} className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                            <span className="font-semibold text-[#df0567]">Step 0{stepIdx + 1}</span>
                            <div>
                              <label className="text-[10px] text-white/50 block mb-1">Step Title</label>
                              <input
                                type="text"
                                value={stepItem.title ?? defaultTitles[stepIdx]}
                                onChange={(e) => updateStep('title', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white font-semibold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-white/50 block mb-1">Step Copy</label>
                              <textarea
                                rows={2}
                                value={stepItem.copy ?? ''}
                                onChange={(e) => updateStep('copy', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-xs"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {section.type === 'closing' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-white/70 font-medium mb-1">Line 1 Text</label>
                      <input
                        type="text"
                        value={(section.data as any)?.line1 || ''}
                        onChange={(e) => updateSectionData(idx, 'line1', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 font-medium mb-1">Line 2 (Hero Focus)</label>
                      <input
                        type="text"
                        value={(section.data as any)?.line2 || ''}
                        onChange={(e) => updateSectionData(idx, 'line2', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 font-medium mb-1">Line 3 Text</label>
                      <input
                        type="text"
                        value={(section.data as any)?.line3 || ''}
                        onChange={(e) => updateSectionData(idx, 'line3', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-white/70 font-medium mb-1">Background Image</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={(section.data as any)?.backgroundImage || ''}
                          onChange={(e) => updateSectionData(idx, 'backgroundImage', e.target.value)}
                          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            openMediaPicker(
                              (url) => updateSectionData(idx, 'backgroundImage', url),
                              'image'
                            )
                          }
                          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white flex items-center gap-1.5 cursor-pointer"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Select Image</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {section.type === 'rich_text' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-white/70 font-medium mb-1">Section Heading</label>
                      <input
                        type="text"
                        value={(section.data as any)?.heading || ''}
                        onChange={(e) => updateSectionData(idx, 'heading', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 font-medium mb-1">HTML / Rich Content</label>
                      <textarea
                        rows={4}
                        value={(section.data as any)?.content || ''}
                        onChange={(e) => updateSectionData(idx, 'content', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {section.type === 'cta_banner' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-white/70 font-medium mb-1">Heading</label>
                      <input
                        type="text"
                        value={(section.data as any)?.heading || ''}
                        onChange={(e) => updateSectionData(idx, 'heading', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 font-medium mb-1">Button Text</label>
                      <input
                        type="text"
                        value={(section.data as any)?.buttonText || ''}
                        onChange={(e) => updateSectionData(idx, 'buttonText', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Add Section Quick Palette */}
          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 text-center space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="text-left">
                <h4 className="text-xs uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#df0567]" />
                  <span>Homepage Section Templates</span>
                </h4>
                <p className="text-[11px] text-white/50">
                  Insert ready-to-customize sections extracted directly from the homepage.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setTemplateModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white text-xs font-semibold transition-all shadow-md shadow-[#df0567]/25 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Open Full Templates Library</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-left">
              <button
                type="button"
                onClick={() => addSection('hero')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#df0567]/40 text-xs text-white transition-all flex items-center space-x-2.5 group cursor-pointer"
              >
                <Video className="w-4 h-4 text-[#df0567] shrink-0" />
                <div className="truncate">
                  <span className="font-semibold block truncate">Hero Video</span>
                  <span className="text-[10px] text-white/40 block">4K Drone Loop</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => addSection('stats')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#df0567]/40 text-xs text-white transition-all flex items-center space-x-2.5 group cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-[#df0567] shrink-0" />
                <div className="truncate">
                  <span className="font-semibold block truncate">Stats Counter</span>
                  <span className="text-[10px] text-white/40 block">3 Milestones</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => addSection('services')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#df0567]/40 text-xs text-white transition-all flex items-center space-x-2.5 group cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-[#df0567] shrink-0" />
                <div className="truncate">
                  <span className="font-semibold block truncate">Services Cards</span>
                  <span className="text-[10px] text-white/40 block">Sticky Stacks</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => addSection('word_marquee')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#df0567]/40 text-xs text-white transition-all flex items-center space-x-2.5 group cursor-pointer"
              >
                <Type className="w-4 h-4 text-[#df0567] shrink-0" />
                <div className="truncate">
                  <span className="font-semibold block truncate">Word Marquee</span>
                  <span className="text-[10px] text-white/40 block">Kinetic Text</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => addSection('partners')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#df0567]/40 text-xs text-white transition-all flex items-center space-x-2.5 group cursor-pointer"
              >
                <Users2 className="w-4 h-4 text-[#df0567] shrink-0" />
                <div className="truncate">
                  <span className="font-semibold block truncate">Partners Grid</span>
                  <span className="text-[10px] text-white/40 block">15 Client Logos</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => addSection('testimonials')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#df0567]/40 text-xs text-white transition-all flex items-center space-x-2.5 group cursor-pointer"
              >
                <MessageSquareQuote className="w-4 h-4 text-[#df0567] shrink-0" />
                <div className="truncate">
                  <span className="font-semibold block truncate">Client Reviews</span>
                  <span className="text-[10px] text-white/40 block">Testimonials</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => addSection('workflow')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#df0567]/40 text-xs text-white transition-all flex items-center space-x-2.5 group cursor-pointer"
              >
                <GitMerge className="w-4 h-4 text-[#df0567] shrink-0" />
                <div className="truncate">
                  <span className="font-semibold block truncate">4-Step Blueprint</span>
                  <span className="text-[10px] text-white/40 block">Roadmap</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => addSection('closing')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#df0567]/40 text-xs text-white transition-all flex items-center space-x-2.5 group cursor-pointer"
              >
                <Flame className="w-4 h-4 text-[#df0567] shrink-0" />
                <div className="truncate">
                  <span className="font-semibold block truncate">Kinetic Finale</span>
                  <span className="text-[10px] text-white/40 block">Morph Section</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => addSection('rich_text')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#df0567]/40 text-xs text-white transition-all flex items-center space-x-2.5 group cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#df0567] shrink-0" />
                <div className="truncate">
                  <span className="font-semibold block truncate">Rich Content</span>
                  <span className="text-[10px] text-white/40 block">Editorial Text</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => addSection('cta_banner')}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#df0567]/40 text-xs text-white transition-all flex items-center space-x-2.5 group cursor-pointer"
              >
                <Megaphone className="w-4 h-4 text-[#df0567] shrink-0" />
                <div className="truncate">
                  <span className="font-semibold block truncate">CTA Banner</span>
                  <span className="text-[10px] text-white/40 block">Inquiry Prompt</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SEO & OpenGraph Social Cards */}
      {activeTab === 'seo' && (
        <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                SEO Meta Title
              </label>
              <input
                type="text"
                value={page.seo?.title || ''}
                onChange={(e) =>
                  setPage((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, title: e.target.value },
                  }))
                }
                placeholder="e.g. ViralMuse — Premier Hospitality Agency"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-hidden focus:border-[#df0567]"
              />
              <span className="text-[11px] text-white/40 mt-1 block">
                Recommended length: 50–60 characters.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={page.seo?.description || ''}
                onChange={(e) =>
                  setPage((prev) => ({
                    ...prev,
                    seo: { ...prev.seo, description: e.target.value },
                  }))
                }
                placeholder="High-end social media production for luxury hotels..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-hidden focus:border-[#df0567]"
              />
              <span className="text-[11px] text-white/40 mt-1 block">
                Recommended length: 140–160 characters.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                OpenGraph Social Share Image
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={page.seo?.ogImage || ''}
                  onChange={(e) =>
                    setPage((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, ogImage: e.target.value },
                    }))
                  }
                  placeholder="/og-image.jpg"
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={() =>
                    openMediaPicker((url) =>
                      setPage((prev) => ({
                        ...prev,
                        seo: { ...prev.seo, ogImage: url },
                      }))
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Choose Image</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
