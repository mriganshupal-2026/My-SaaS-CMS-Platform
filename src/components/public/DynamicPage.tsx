import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { publicApi } from '../../lib/cms-client';
import { updatePageSeo } from '../../lib/seo';
import type { Page, PageSection } from '../../types/cms';
import type { LanguageCode } from '../../types';

// Homepage Section Components
import HeroScroll from '../sections/HeroScroll';
import StatsCounter from '../sections/StatsCounter';
import ServicesSticky from '../sections/ServicesSticky';
import WordMarquee from '../sections/WordMarquee';
import PartnersMarquee from '../sections/PartnersMarquee';
import Testimonials from '../sections/Testimonials';
import Workflow from '../sections/Workflow';
import PlaneMorph from '../sections/PlaneMorph';

// Layout Components
import SmoothScrollProvider from '../layout/SmoothScrollProvider';
import Navbar from '../layout/Navbar';
import MenuOverlay from '../layout/MenuOverlay';
import ProjectInquiryModal from '../layout/ProjectInquiryModal';
import Footer from '../layout/Footer';

interface DynamicPageProps {
  slug: string;
  onGoHome: () => void;
  onOpenInquiry: (serviceName?: string) => void;
}

export default function DynamicPage({ slug, onGoHome, onOpenInquiry }: DynamicPageProps) {
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState<LanguageCode>('EN');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadPage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const loadPage = async () => {
    setIsLoading(true);
    try {
      const data = await publicApi.getPageBySlug(slug);
      setPage(data);
      if (data) {
        updatePageSeo({
          title: data.seo?.title || data.title,
          description: data.seo?.description,
          canonicalUrl: `/p/${data.slug}`,
          ogImage: data.seo?.ogImage || '/og-image.jpg',
        });
      }
    } catch (err) {
      console.error('Failed to load dynamic page:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInquiry = (serviceName?: string) => {
    setPreselectedService(serviceName);
    setIsInquiryOpen(true);
    onOpenInquiry(serviceName);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center font-mono text-sm space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#df0567] border-t-transparent animate-spin" />
        <span className="text-white/60">Loading luxury page...</span>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-6 text-center space-y-5">
        <span className="text-xs uppercase font-mono tracking-widest text-[#df0567]">404 Not Found</span>
        <h2 className="text-3xl font-black uppercase tracking-tight">Page Not Available</h2>
        <p className="text-sm text-white/60 max-w-md">
          The requested page slug <code className="text-[#df0567]">/p/{slug}</code> is not published or does not exist.
        </p>
        <button
          onClick={onGoHome}
          className="px-6 py-3 rounded-full bg-[#df0567] hover:bg-[#c4045a] text-white text-xs uppercase font-bold tracking-widest transition-all cursor-pointer shadow-lg shadow-[#df0567]/30"
        >
          Return to ViralMuse Home
        </button>
      </div>
    );
  }

  const hasHeroSection = page.sections?.some((s) => s.type === 'hero' && s.isEnabled !== false);

  return (
    <SmoothScrollProvider>
      <div className="relative min-h-screen w-full bg-[#fdf2f7] text-[#0A0A0A] antialiased selection:bg-[#df0567] selection:text-white">
        {/* Global Dynamic Theme-Aware Navbar */}
        <Navbar
          currentLang={currentLang}
          onSelectLang={setCurrentLang}
          onOpenInquiry={() => handleInquiry()}
          onOpenMenu={() => setIsMenuOpen(true)}
        />

        {/* Global Menu Overlay Drawer */}
        <MenuOverlay
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onOpenInquiry={() => handleInquiry()}
          currentLang={currentLang}
          onSelectLang={setCurrentLang}
        />

        {/* Project Inquiry Drawer */}
        <ProjectInquiryModal
          isOpen={isInquiryOpen}
          onClose={() => setIsInquiryOpen(false)}
          preselectedService={preselectedService}
        />

        {/* Subpage Breadcrumb Header if page doesn't have a hero section */}
        {!hasHeroSection && (
          <header className="relative pt-32 sm:pt-40 pb-16 px-6 sm:px-12 bg-[#070709] text-white border-b border-white/10 overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-4">
              <button
                onClick={onGoHome}
                className="group inline-flex items-center space-x-2 text-xs uppercase font-bold tracking-widest text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#df0567] group-hover:-translate-x-1 transition-transform" />
                <span>Back to ViralMuse Home</span>
              </button>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div>
                  <span className="text-xs uppercase font-mono tracking-widest text-[#df0567] block mb-2">
                    VIRALMUSE // CUSTOM PAGE
                  </span>
                  <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white">
                    {page.title}
                  </h1>
                </div>

                <button
                  onClick={() => handleInquiry()}
                  className="px-7 py-3 rounded-full bg-[#df0567] hover:bg-[#c4045a] text-white text-xs uppercase font-bold tracking-widest transition-all shadow-xl shadow-[#df0567]/30 cursor-pointer self-start md:self-auto"
                >
                  Start Project
                </button>
              </div>
            </div>
          </header>
        )}

        {/* Dynamic Sections Stream */}
        <main className="relative w-full">
          {page.sections && page.sections.length > 0 ? (
            page.sections.map((section: PageSection, index: number) => {
              if (section.isEnabled === false) return null;

              switch (section.type) {
                case 'hero':
                  return (
                    <div key={section.id || index} id={section.id}>
                      <HeroScroll
                        currentLang={currentLang}
                        onOpenInquiry={() => handleInquiry()}
                        data={section.data as any}
                      />
                    </div>
                  );

                case 'stats':
                  return (
                    <div key={section.id || index} id={section.id}>
                      <StatsCounter data={section.data as any} />
                    </div>
                  );

                case 'services':
                  return (
                    <div key={section.id || index} id={section.id}>
                      <ServicesSticky
                        currentLang={currentLang}
                        onOpenInquiry={(srv) => handleInquiry(srv)}
                        data={section.data as any}
                      />
                    </div>
                  );

                case 'word_marquee':
                  return (
                    <div key={section.id || index} id={section.id}>
                      <WordMarquee data={section.data as any} />
                    </div>
                  );

                case 'partners':
                  return (
                    <div key={section.id || index} id={section.id}>
                      <PartnersMarquee
                        currentLang={currentLang}
                        data={section.data as any}
                      />
                    </div>
                  );

                case 'testimonials':
                  return (
                    <div key={section.id || index} id={section.id}>
                      <Testimonials data={section.data as any} />
                    </div>
                  );

                case 'workflow':
                  return (
                    <div key={section.id || index} id={section.id}>
                      <Workflow data={section.data as any} />
                    </div>
                  );

                case 'closing':
                  return (
                    <div key={section.id || index} id={section.id}>
                      <PlaneMorph data={section.data as any} />
                    </div>
                  );

                case 'rich_text': {
                  const d = (section.data as any) || {};
                  return (
                    <section
                      key={section.id || index}
                      className="py-20 sm:py-28 px-6 sm:px-12 bg-[#09090c] text-white border-y border-white/10"
                    >
                      <div className="max-w-4xl mx-auto space-y-8">
                        {d.heading && (
                          <h2
                            className={`text-3xl sm:text-5xl font-black uppercase tracking-tight text-white ${
                              d.alignment === 'center' ? 'text-center' : 'text-left'
                            }`}
                          >
                            {d.heading}
                          </h2>
                        )}
                        <div
                          className="prose prose-invert prose-pink max-w-none text-white/80 leading-relaxed font-sans text-base sm:text-lg"
                          dangerouslySetInnerHTML={{ __html: d.content || '' }}
                        />
                      </div>
                    </section>
                  );
                }

                case 'cta_banner': {
                  const d = (section.data as any) || {};
                  return (
                    <section
                      key={section.id || index}
                      className="py-20 sm:py-32 px-6 sm:px-12 bg-gradient-to-br from-[#1d121c] via-[#14141a] to-[#0a0a0d] border-t border-[#df0567]/30 text-center"
                    >
                      <div className="max-w-3xl mx-auto space-y-6">
                        {d.eyebrow && (
                          <span className="text-xs uppercase font-bold tracking-widest text-[#df0567] px-3 py-1 rounded-full bg-[#df0567]/10 border border-[#df0567]/20 inline-block">
                            {d.eyebrow}
                          </span>
                        )}
                        <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                          {d.heading || 'Elevate Your Digital Presence'}
                        </h3>
                        {d.description && (
                          <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
                            {d.description}
                          </p>
                        )}
                        <div className="pt-4">
                          <button
                            onClick={() => handleInquiry()}
                            className="px-8 py-4 rounded-full bg-[#df0567] hover:bg-[#c4045a] text-white text-xs uppercase font-bold tracking-widest transition-all shadow-xl shadow-[#df0567]/35 cursor-pointer inline-flex items-center gap-2 group"
                          >
                            <span>{d.buttonText || 'Book Strategy Call'}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </section>
                  );
                }

                default:
                  return null;
              }
            })
          ) : (
            <div className="py-32 px-6 text-center text-white/40">
              <p>This page has no active sections configured yet.</p>
            </div>
          )}

          {/* Standard Luxury Footer */}
          <Footer currentLang={currentLang} onSelectLang={setCurrentLang} />
        </main>
      </div>
    </SmoothScrollProvider>
  );
}
