import { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Layers,
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
  Check,
  Search,
  ArrowRight,
  RefreshCw,
  Copy,
  LayoutTemplate,
} from 'lucide-react';
import {
  HOMEPAGE_SECTION_TEMPLATES,
  PAGE_STARTER_TEMPLATES,
  cloneSectionFromLivePage,
  type SectionTemplateMeta,
  type PageStarterTemplate,
} from '../../lib/sectionTemplates';
import { publicApi } from '../../lib/cms-client';
import type { PageSection } from '../../types/cms';

interface CmsSectionTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSection: (section: PageSection) => void;
  onApplyPageTemplate?: (template: PageStarterTemplate) => void;
  currentIndex?: number;
}

export default function CmsSectionTemplateModal({
  isOpen,
  onClose,
  onInsertSection,
  onApplyPageTemplate,
  currentIndex = 0,
}: CmsSectionTemplateModalProps) {
  const [activeTab, setActiveTab] = useState<'sections' | 'full_pages' | 'clone_live'>('sections');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveHomepageSections, setLiveHomepageSections] = useState<PageSection[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'clone_live' && liveHomepageSections.length === 0) {
      loadLiveHomepage();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const loadLiveHomepage = async () => {
    setIsLoadingLive(true);
    try {
      const data = await publicApi.getHomepage();
      if (data?.sections) {
        setLiveHomepageSections(data.sections);
      }
    } catch (err) {
      console.error('Failed to load live homepage for cloning:', err);
    } finally {
      setIsLoadingLive(false);
    }
  };

  const getIcon = (name: string, className = 'w-5 h-5') => {
    switch (name) {
      case 'Video':
        return <Video className={className} />;
      case 'BarChart3':
        return <BarChart3 className={className} />;
      case 'Briefcase':
        return <Briefcase className={className} />;
      case 'Type':
        return <Type className={className} />;
      case 'Users2':
        return <Users2 className={className} />;
      case 'MessageSquareQuote':
        return <MessageSquareQuote className={className} />;
      case 'GitMerge':
        return <GitMerge className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'FileText':
        return <FileText className={className} />;
      case 'Megaphone':
        return <Megaphone className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  const categories = [
    'ALL',
    'Hero & Intro',
    'Services & Work',
    'Social Proof',
    'Process',
    'Branding & Visuals',
    'Content',
    'Call to Action',
  ];

  const filteredSectionTemplates = HOMEPAGE_SECTION_TEMPLATES.filter((tpl) => {
    const matchesCat = selectedCategory === 'ALL' || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddTemplate = (tpl: SectionTemplateMeta) => {
    const newSection = tpl.generateSection(currentIndex);
    onInsertSection(newSection);
    setJustAddedId(tpl.id);
    setTimeout(() => {
      setJustAddedId(null);
      onClose();
    }, 600);
  };

  const handleAddLiveSection = (liveSec: PageSection) => {
    const cloned = cloneSectionFromLivePage(liveSec, currentIndex);
    onInsertSection(cloned);
    setJustAddedId(liveSec.id);
    setTimeout(() => {
      setJustAddedId(null);
      onClose();
    }, 600);
  };

  const handleApplyFullPage = (pageTpl: PageStarterTemplate) => {
    if (onApplyPageTemplate) {
      onApplyPageTemplate(pageTpl);
      onClose();
    }
  };

  const renderVisualScreenshot = (tplId: string) => {
    switch (tplId) {
      case 'tpl_hero':
        return (
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gradient-to-br from-black via-[#111118] to-[#1e1022] border border-white/10 flex flex-col items-center justify-center p-3 text-center shadow-inner my-2">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#df0567_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="w-7 h-7 rounded-full bg-[#df0567]/30 border border-[#df0567]/60 flex items-center justify-center text-white mb-1 shadow-lg shadow-[#df0567]/30">
              <Video className="w-3.5 h-3.5 text-[#df0567]" />
            </div>
            <span className="font-script text-[11px] text-[#df0567] font-bold">Let's Go Viral</span>
            <span className="font-headline text-xs font-black text-white tracking-wide uppercase">Command Attention</span>
            <div className="flex gap-1.5 mt-1.5">
              <span className="px-2 py-0.5 rounded-full bg-[#df0567] text-[8px] font-bold text-white">Project Inquiry</span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[8px] font-semibold text-white/80">Explore Work</span>
            </div>
          </div>
        );
      case 'tpl_stats':
        return (
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gradient-to-br from-[#121216] to-[#1a1420] border border-white/10 flex items-center justify-around p-3 shadow-inner my-2">
            <div className="text-center p-2 rounded-lg bg-white/5 border border-white/5 w-[30%]">
              <span className="text-sm font-black text-[#df0567] block">15+</span>
              <span className="text-[8px] text-white/60 font-semibold block truncate">Specialists</span>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/5 border border-white/5 w-[30%]">
              <span className="text-sm font-black text-white block">400+</span>
              <span className="text-[8px] text-white/60 font-semibold block truncate">Creators</span>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/5 border border-white/5 w-[30%]">
              <span className="text-sm font-black text-[#df0567] block">150+</span>
              <span className="text-[8px] text-white/60 font-semibold block truncate">Clients</span>
            </div>
          </div>
        );
      case 'tpl_services':
        return (
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gradient-to-br from-[#14141a] to-[#1a1218] border border-white/10 p-3 flex flex-col justify-between shadow-inner my-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-[#df0567] uppercase tracking-wider">01 / Sticky Card</span>
              <span className="px-1.5 py-0.5 rounded bg-[#df0567]/20 text-[8px] font-bold text-[#df0567]">+280% ROI</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 w-3/4 rounded bg-white/20" />
              <div className="h-1 w-1/2 rounded bg-white/10" />
            </div>
            <div className="flex gap-1">
              <span className="px-1.5 py-0.5 rounded bg-black/40 text-[8px] text-white/70">4K Production</span>
              <span className="px-1.5 py-0.5 rounded bg-black/40 text-[8px] text-white/70">Drone</span>
            </div>
          </div>
        );
      case 'tpl_word_marquee':
        return (
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gradient-to-br from-black to-[#1a1018] border border-white/10 flex flex-col justify-center gap-2.5 p-2 shadow-inner my-2 overflow-hidden">
            <div className="whitespace-nowrap flex gap-3 text-[11px] font-black uppercase text-[#df0567] tracking-wider">
              <span>✦ YOUNG</span>
              <span>✦ PINK VIBES</span>
              <span>✦ MINDS</span>
              <span>✦ BOLD IMPACT</span>
            </div>
            <div className="whitespace-nowrap flex gap-3 text-[11px] font-black uppercase text-white/80 tracking-wider">
              <span>✦ BOLD VISION</span>
              <span>✦ VIRAL IMPACT</span>
              <span>✦ LUXURY ORBIT</span>
            </div>
          </div>
        );
      case 'tpl_partners':
        return (
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gradient-to-br from-[#121216] to-[#181820] border border-white/10 grid grid-cols-5 gap-1.5 p-2.5 items-center justify-items-center shadow-inner my-2">
            {['LUMINA', 'AURA', 'SOLSTICE', 'VANGUARD', 'ATELIER', 'CHROMA', 'KAIROS', 'MIRAGE', 'ORBIT', 'PRISM'].map((brand, i) => (
              <div key={i} className="px-1.5 py-1 rounded bg-white/5 border border-white/5 text-[8px] font-mono font-bold text-white/60 tracking-wider truncate w-full text-center">
                {brand}
              </div>
            ))}
          </div>
        );
      case 'tpl_testimonials':
        return (
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gradient-to-br from-[#14141a] to-[#1e121a] border border-white/10 p-3.5 flex flex-col justify-between shadow-inner my-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-[#df0567] text-[9px] font-bold text-white flex items-center justify-center">AW</div>
              <div>
                <span className="text-[10px] font-bold text-white block leading-tight">Alexander Wright</span>
                <span className="text-[8px] text-[#df0567] block">CEO, Lumina Grand Hotel</span>
              </div>
            </div>
            <p className="text-[10px] text-white/70 italic leading-snug line-clamp-2">
              "Partnering with ViralMuse transformed our digital footprint into our highest-converting reservation channel..."
            </p>
          </div>
        );
      case 'tpl_workflow':
        return (
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gradient-to-br from-[#121216] to-[#1a141e] border border-white/10 p-2.5 flex items-center justify-between gap-1.5 shadow-inner my-2">
            {['01', '02', '03', '04'].map((step, idx) => (
              <div key={idx} className="flex-1 p-2 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center text-center">
                <span className="text-[9px] font-mono font-black text-[#df0567] mb-0.5">{step}</span>
                <div className="h-1 w-3/4 rounded bg-white/20 mb-1" />
                <div className="h-1 w-1/2 rounded bg-white/10" />
              </div>
            ))}
          </div>
        );
      case 'tpl_closing':
        return (
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-black border border-white/10 flex flex-col items-center justify-center p-3 text-center shadow-inner my-2">
            <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase">And</span>
            <span className="text-base font-headline font-black text-[#df0567] uppercase tracking-tight my-0.5">Go Iconic</span>
            <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase">Then</span>
          </div>
        );
      case 'tpl_rich_text':
        return (
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-[#121216] border border-white/10 p-3.5 flex flex-col justify-center space-y-1.5 shadow-inner my-2">
            <div className="h-2.5 w-1/2 rounded bg-[#df0567]/60 mb-1" />
            <div className="h-1.5 w-full rounded bg-white/20" />
            <div className="h-1.5 w-5/6 rounded bg-white/15" />
            <div className="h-1.5 w-3/4 rounded bg-white/10" />
          </div>
        );
      case 'tpl_cta_banner':
        return (
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gradient-to-r from-[#df0567]/30 via-[#14141a] to-[#df0567]/20 border border-[#df0567]/40 p-3.5 flex flex-col items-center justify-center text-center space-y-1.5 shadow-inner my-2">
            <span className="text-[9px] font-bold text-[#df0567] uppercase tracking-widest">Ready to Scale</span>
            <span className="text-xs font-bold text-white">Elevate Your Digital Prestige</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-[#df0567] text-white text-[9px] font-bold shadow-md">Book Strategy Call</span>
          </div>
        );
      default:
        return (
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-[#14141a] border border-white/10 flex items-center justify-center text-white/40 text-xs font-mono my-2">
            Section Preview
          </div>
        );
    }
  };

  const renderPageBlueprintPreview = (pageTplId: string) => {
    return (
      <div className="relative w-full h-28 rounded-xl overflow-hidden bg-gradient-to-br from-[#121216] to-[#1a1420] border border-white/10 p-2.5 flex flex-col justify-center space-y-1 shadow-inner my-2">
        <span className="text-[9px] font-mono text-[#df0567] uppercase tracking-wider font-bold mb-0.5">
          Blueprint Structure Preview
        </span>
        <div className="space-y-1">
          {pageTplId === 'page_tpl_landing' && ['Hero Video 4K', 'Kinetic Stats Counter', 'Sticky Luxury Services', 'Client Endorsements', 'CTA Conversion Banner'].map((s, i) => (
            <div key={i} className="flex items-center justify-between px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-white/80">
              <span>0{i + 1}. {s}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#df0567]" />
            </div>
          ))}
          {pageTplId === 'page_tpl_services_deepdive' && ['Hero Video 4K', 'Sticky Luxury Services', '4-Step Strategic Blueprint', 'Client Endorsements', 'Kinetic Finale'].map((s, i) => (
            <div key={i} className="flex items-center justify-between px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-white/80">
              <span>0{i + 1}. {s}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#df0567]" />
            </div>
          ))}
          {pageTplId === 'page_tpl_social_proof' && ['Hero Video 4K', 'Kinetic Stats Counter', 'Partners Brand Grid', 'Client Endorsements', 'CTA Conversion Banner'].map((s, i) => (
            <div key={i} className="flex items-center justify-between px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-white/80">
              <span>0{i + 1}. {s}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#df0567]" />
            </div>
          ))}
          {pageTplId === 'page_tpl_full_homepage_clone' && ['All 8 Homepage Sections (Hero, Stats, Services, Marquee, Partners, Reviews, Workflow, Closing)'].map((s, i) => (
            <div key={i} className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#df0567]/20 border border-[#df0567]/40 text-[9px] font-mono text-white font-bold">
              <span>✨ {s}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0f0f13] border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#14141a]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#df0567]/20 border border-[#df0567]/30 flex items-center justify-center text-[#df0567]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Section &amp; Page Templates Library</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#df0567]/20 text-[#df0567] border border-[#df0567]/30">
                  Homepage Driven
                </span>
              </h3>
              <p className="text-xs text-white/60">
                Insert pre-built sections derived directly from the ViralMuse homepage or load full page blueprints.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#111116]">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('sections')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'sections'
                  ? 'bg-[#df0567] text-white shadow-lg shadow-[#df0567]/25'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Homepage Section Templates ({HOMEPAGE_SECTION_TEMPLATES.length})</span>
            </button>

            {onApplyPageTemplate && (
              <button
                onClick={() => setActiveTab('full_pages')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'full_pages'
                    ? 'bg-[#df0567] text-white shadow-lg shadow-[#df0567]/25'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutTemplate className="w-4 h-4" />
                <span>Full Page Starter Blueprints ({PAGE_STARTER_TEMPLATES.length})</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('clone_live');
                loadLiveHomepage();
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'clone_live'
                  ? 'bg-[#df0567] text-white shadow-lg shadow-[#df0567]/25'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Copy className="w-4 h-4" />
              <span>Clone from Current Live Homepage</span>
            </button>
          </div>

          {/* Search box (only for sections) */}
          {activeTab === 'sections' && (
            <div className="relative w-full sm:w-64 pb-2 sm:pb-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-hidden focus:border-[#df0567]"
              />
            </div>
          )}
        </div>

        {/* Category Pills (Sections view) */}
        {activeTab === 'sections' && (
          <div className="px-6 py-2.5 border-b border-white/5 bg-[#0e0e12] flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold tracking-wide whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
          
          {/* TAB 1: Individual Section Templates */}
          {activeTab === 'sections' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSectionTemplates.map((tpl) => {
                const isJustAdded = justAddedId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    className="p-5 rounded-2xl bg-[#14141a] hover:bg-[#181822] border border-white/10 hover:border-[#df0567]/50 transition-all flex flex-col justify-between group shadow-lg"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-[#df0567]/20 border border-white/10 group-hover:border-[#df0567]/40 flex items-center justify-center text-white/80 group-hover:text-[#df0567] transition-all">
                            {getIcon(tpl.iconName)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-[#df0567] transition-colors">
                              {tpl.name}
                            </h4>
                            <span className="text-[10px] uppercase font-mono tracking-wider text-white/40">
                              {tpl.category}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/5 text-white/70 border border-white/10">
                          {tpl.badge}
                        </span>
                      </div>

                      <p className="text-xs text-white/60 leading-relaxed">
                        {tpl.description}
                      </p>

                      {/* Visual Template Screenshot / Mockup Preview */}
                      {renderVisualScreenshot(tpl.id)}

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tpl.highlights.map((h, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-black/40 text-white/50 border border-white/5"
                          >
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-mono text-white/40">
                        Type: {tpl.type}
                      </span>

                      <button
                        onClick={() => handleAddTemplate(tpl)}
                        disabled={isJustAdded}
                        className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isJustAdded
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[#df0567] hover:bg-[#c4045a] text-white shadow-md shadow-[#df0567]/20'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <span>Use Section Template</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: Full Page Starter Blueprints */}
          {activeTab === 'full_pages' && onApplyPageTemplate && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <span>⚠️ Note: Applying a full page blueprint will populate this page with the curated set of section templates.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PAGE_STARTER_TEMPLATES.map((pageTpl) => (
                  <div
                    key={pageTpl.id}
                    className="p-6 rounded-2xl bg-[#14141a] hover:bg-[#181822] border border-white/10 hover:border-[#df0567]/50 transition-all flex flex-col justify-between shadow-xl"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-[#df0567]/20 border border-[#df0567]/30 flex items-center justify-center text-[#df0567]">
                            <LayoutTemplate className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{pageTpl.name}</h4>
                            <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400">
                              {pageTpl.badge}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-white/60 leading-relaxed">
                        {pageTpl.description}
                      </p>

                      {/* Visual Blueprint Structure Preview */}
                      {renderPageBlueprintPreview(pageTpl.id)}

                      <div className="pt-2">
                        <span className="text-[10px] uppercase font-semibold text-white/40 block mb-1.5">
                          Included Sections:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {pageTpl.sectionTypes.map((st, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2.5 py-1 rounded-lg bg-black/50 text-white/70 border border-white/10 font-mono"
                            >
                              {i + 1}. {st}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-5 mt-5 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] text-white/40 font-mono">
                        Suggested slug: /{pageTpl.recommendedSlug}
                      </span>

                      <button
                        onClick={() => handleApplyFullPage(pageTpl)}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white text-xs font-semibold transition-all shadow-md shadow-[#df0567]/20 cursor-pointer"
                      >
                        <span>Apply Blueprint</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Clone from Current Live Homepage */}
          {activeTab === 'clone_live' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#14141a] border border-white/10">
                <div>
                  <h4 className="text-sm font-bold text-white">Live Published Homepage Sections</h4>
                  <p className="text-xs text-white/60">
                    Instantly clone sections with your exact live custom copy, media links, and counters currently active on the homepage.
                  </p>
                </div>
                <button
                  onClick={loadLiveHomepage}
                  disabled={isLoadingLive}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingLive ? (
                <div className="py-16 text-center text-white/40 text-xs">
                  Loading live homepage sections...
                </div>
              ) : liveHomepageSections.length === 0 ? (
                <div className="py-16 text-center text-white/40 text-xs">
                  No live homepage sections retrieved.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveHomepageSections.map((sec, idx) => {
                    const isJustAdded = justAddedId === sec.id;
                    return (
                      <div
                        key={sec.id || idx}
                        className="p-5 rounded-2xl bg-[#14141a] border border-white/10 flex flex-col justify-between shadow-lg"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                              {idx + 1}
                            </span>
                            <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-[#df0567]/20 text-[#df0567] border border-[#df0567]/30">
                              {sec.type}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white">{sec.title}</h4>
                          <p className="text-xs text-white/50 line-clamp-2">
                            {JSON.stringify(sec.data).slice(0, 120)}...
                          </p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-end">
                          <button
                            onClick={() => handleAddLiveSection(sec)}
                            disabled={isJustAdded}
                            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              isJustAdded
                                ? 'bg-emerald-500 text-white'
                                : 'bg-[#df0567] hover:bg-[#c4045a] text-white shadow-md shadow-[#df0567]/20'
                            }`}
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Cloned!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Clone This Section</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#14141a] flex items-center justify-between text-xs text-white/50">
          <span>Click any template to append it directly to your page sections.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
