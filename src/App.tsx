import { useState, useEffect } from 'react';
import SmoothScrollProvider from './components/layout/SmoothScrollProvider';
import LoadingScreen from './components/layout/LoadingScreen';
import Navbar from './components/layout/Navbar';
import MenuOverlay from './components/layout/MenuOverlay';
import ProjectInquiryModal from './components/layout/ProjectInquiryModal';
import CookieBanner from './components/layout/CookieBanner';
import Footer from './components/layout/Footer';

import HeroScroll from './components/sections/HeroScroll';
import StatsCounter from './components/sections/StatsCounter';
import ServicesSticky from './components/sections/ServicesSticky';
import WordMarquee from './components/sections/WordMarquee';
import PartnersMarquee from './components/sections/PartnersMarquee';
import Testimonials from './components/sections/Testimonials';
import Workflow from './components/sections/Workflow';
import PlaneMorph from './components/sections/PlaneMorph';

import { useSectionTheme } from './hooks/useSectionTheme';
import type { LanguageCode } from './types';
import type { User, Page } from './types/cms';

// CMS Admin Components
import CmsLayout from './components/cms/CmsLayout';
import CmsLogin from './components/cms/CmsLogin';
import CmsDashboard from './components/cms/CmsDashboard';
import CmsPagesList from './components/cms/CmsPagesList';
import CmsPageEditor from './components/cms/CmsPageEditor';
import CmsArticlesList from './components/cms/CmsArticlesList';
import CmsArticleEditor from './components/cms/CmsArticleEditor';
import CmsMediaLibrary from './components/cms/CmsMediaLibrary';
import CmsNavigationManager from './components/cms/CmsNavigationManager';
import CmsFooterManager from './components/cms/CmsFooterManager';
import CmsInquiryFormManager from './components/cms/CmsInquiryFormManager';
import CmsSeoManager from './components/cms/CmsSeoManager';
import CmsInquiriesList from './components/cms/CmsInquiriesList';
import CmsUsersManager from './components/cms/CmsUsersManager';
import CmsSettingsManager from './components/cms/CmsSettingsManager';
import CmsRedirectsManager from './components/cms/CmsRedirectsManager';
import CmsActivityLog from './components/cms/CmsActivityLog';
import CmsBoilerplateGuide from './components/cms/CmsBoilerplateGuide';

// Public Dynamic Components
import BlogList from './components/public/BlogList';
import ArticleDetail from './components/public/ArticleDetail';
import DynamicPage from './components/public/DynamicPage';

import { cmsAuthApi, publicApi } from './lib/cms-client';
import { updatePageSeo } from './lib/seo';

export default function App() {
  const currentTheme = useSectionTheme();
  const [currentLang, setCurrentLang] = useState<LanguageCode>('EN');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<string | undefined>();

  // Routing State
  const [pathname, setPathname] = useState<string>(() => window.location.pathname);

  // Dynamic Homepage CMS State (synced with database and real-time events)
  const [homepageData, setHomepageData] = useState<Page | null>(null);

  // CMS Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [cmsSection, setCmsSection] = useState<string>('dashboard');
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>();
  const [selectedArticleId, setSelectedArticleId] = useState<string | undefined>();

  // Fetch Homepage data from CMS database on mount and upon route changes
  useEffect(() => {
    let isMounted = true;
    const fetchHomepage = async () => {
      try {
        const page = await publicApi.getHomepage();
        if (isMounted && page) {
          setHomepageData(page);
        }
      } catch (err) {
        console.warn('Could not load dynamic homepage from CMS, using default copy:', err);
      }
    };

    fetchHomepage();

    // In preview/dev mode, check if the canonical live site has newer CMS updates
    publicApi.pullSyncFromLive().then((res) => {
      if (isMounted && res?.updated) {
        fetchHomepage();
      }
    }).catch(() => {});

    // Listen for real-time CMS saves in preview without needing a manual full-page reload
    const handlePageSaved = (e: Event) => {
      const customEvent = e as CustomEvent<Page>;
      if (
        customEvent.detail &&
        (customEvent.detail.isHomepage ||
          customEvent.detail.slug === 'home' ||
          customEvent.detail.id === 'pg_home_01' ||
          customEvent.detail.id === 'page_home')
      ) {
        setHomepageData(customEvent.detail);
      } else {
        fetchHomepage();
      }
    };

    window.addEventListener('cms-page-saved', handlePageSaved);
    return () => {
      isMounted = false;
      window.removeEventListener('cms-page-saved', handlePageSaved);
    };
  }, [pathname]);

  // Update SEO and OpenGraph metadata when routing between top-level views
  useEffect(() => {
    if (pathname === '/') {
      updatePageSeo({
        title: homepageData?.seo?.title || homepageData?.title || 'ViralMuse — Social Media Agency',
        description: homepageData?.seo?.description,
        canonicalUrl: '/',
        ogImage: homepageData?.seo?.ogImage || '/og-image.jpg',
      });
    } else if (pathname === '/blog') {
      updatePageSeo({
        title: 'Editorial & Strategic Intelligence',
        description:
          'Explore deep insights, algorithm breakdowns, and 4K production frameworks by the ViralMuse creative direction team.',
        canonicalUrl: '/blog',
        ogImage: '/og-image.jpg',
      });
    } else if (pathname.startsWith('/cms')) {
      document.title = 'ViralMuse — CMS Command Center';
    }
  }, [pathname, homepageData]);

  // Listen to browser popstate for back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check CMS authentication on boot
  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await cmsAuthApi.getMe();
        setCurrentUser(user);
      } catch (_) {
        setCurrentUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  const navigateTo = (newPath: string) => {
    window.history.pushState({}, '', newPath);
    setPathname(newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenInquiry = (serviceName?: string) => {
    setPreselectedService(serviceName);
    setIsInquiryOpen(true);
  };

  const handleLogout = async () => {
    try {
      await cmsAuthApi.logout();
    } catch (_) {}
    setCurrentUser(null);
    navigateTo('/cms-login');
  };

  // --------------------------------------------------------------------------
  // ROUTE 1: CMS Login (/cms-login)
  // --------------------------------------------------------------------------
  if (pathname === '/cms-login') {
    if (currentUser) {
      // Already authenticated, redirect to /cms
      navigateTo('/cms');
      return null;
    }
    return (
      <CmsLogin
        onSuccess={(user) => {
          setCurrentUser(user);
          navigateTo('/cms');
        }}
      />
    );
  }

  // --------------------------------------------------------------------------
  // ROUTE 2: CMS Admin Dashboard (/cms or /cms/*)
  // --------------------------------------------------------------------------
  if (pathname.startsWith('/cms')) {
    if (isCheckingAuth) {
      return (
        <div className="min-h-screen bg-[#0d0d10] text-white flex items-center justify-center font-mono text-sm">
          Authenticating CMS session...
        </div>
      );
    }

    if (!currentUser) {
      return (
        <CmsLogin
          onSuccess={(user) => {
            setCurrentUser(user);
          }}
        />
      );
    }

    return (
      <CmsLayout
        user={currentUser}
        currentSection={cmsSection}
        onNavigate={(section) => {
          setCmsSection(section);
          if (section === 'pages-new') {
            setSelectedPageId(undefined);
          }
          if (section === 'articles-new') {
            setSelectedArticleId(undefined);
          }
        }}
        onLogout={handleLogout}
      >
        {cmsSection === 'dashboard' && (
          <CmsDashboard
            onNavigate={(sec) => {
              if (sec === 'pages-home') {
                // Open homepage editor with actual page ID
                setSelectedPageId('pg_home_01');
                setCmsSection('page-edit');
              } else if (sec === 'pages-new') {
                setSelectedPageId(undefined);
                setCmsSection('page-edit');
              } else if (sec === 'articles-new') {
                setSelectedArticleId(undefined);
                setCmsSection('article-edit');
              } else {
                setCmsSection(sec);
              }
            }}
          />
        )}

        {cmsSection === 'pages' && (
          <CmsPagesList
            onEditPage={(id) => {
              setSelectedPageId(id);
              setCmsSection('page-edit');
            }}
            onCreatePage={() => {
              setSelectedPageId(undefined);
              setCmsSection('page-edit');
            }}
          />
        )}

        {cmsSection === 'page-edit' && (
          <CmsPageEditor
            pageId={selectedPageId}
            onBack={() => setCmsSection('pages')}
            onSaved={() => {}}
          />
        )}

        {cmsSection === 'articles' && (
          <CmsArticlesList
            onEditArticle={(id) => {
              setSelectedArticleId(id);
              setCmsSection('article-edit');
            }}
            onCreateArticle={() => {
              setSelectedArticleId(undefined);
              setCmsSection('article-edit');
            }}
          />
        )}

        {cmsSection === 'article-edit' && (
          <CmsArticleEditor
            articleId={selectedArticleId}
            onBack={() => setCmsSection('articles')}
            onSaved={() => {}}
          />
        )}

        {cmsSection === 'media' && <CmsMediaLibrary />}

        {cmsSection === 'navigation' && <CmsNavigationManager />}

        {cmsSection === 'footer' && <CmsFooterManager />}

        {cmsSection === 'inquiry-form' && <CmsInquiryFormManager />}

        {cmsSection === 'seo' && <CmsSeoManager />}

        {cmsSection === 'inquiries' && (
          <CmsInquiriesList onNavigate={(sec) => setCmsSection(sec)} />
        )}

        {cmsSection === 'users' && <CmsUsersManager />}

        {cmsSection === 'settings' && <CmsSettingsManager />}

        {cmsSection === 'redirects' && <CmsRedirectsManager />}

        {cmsSection === 'activity' && <CmsActivityLog />}

        {cmsSection === 'boilerplate' && <CmsBoilerplateGuide />}
      </CmsLayout>
    );
  }

  // --------------------------------------------------------------------------
  // ROUTE 3: Public Editorial Blog (/blog or /blog/:slug)
  // --------------------------------------------------------------------------
  if (pathname.startsWith('/blog')) {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const slug = parts[1];
      return (
        <ArticleDetail
          slug={slug}
          onBackToBlog={() => navigateTo('/blog')}
          onOpenInquiry={() => handleOpenInquiry()}
        />
      );
    }
    return (
      <BlogList
        onSelectArticle={(slug) => navigateTo(`/blog/${slug}`)}
        onGoHome={() => navigateTo('/')}
      />
    );
  }

  // --------------------------------------------------------------------------
  // ROUTE 4: Public Dynamic CMS Pages (/p/:slug)
  // --------------------------------------------------------------------------
  if (pathname.startsWith('/p/')) {
    const slug = pathname.replace('/p/', '');
    return (
      <DynamicPage
        slug={slug}
        onGoHome={() => navigateTo('/')}
        onOpenInquiry={() => handleOpenInquiry()}
      />
    );
  }

  // --------------------------------------------------------------------------
  // ROUTE 5: Public Primary Scrollytelling Homepage
  // --------------------------------------------------------------------------
  return (
    <SmoothScrollProvider>
      <div className="relative min-h-screen w-full bg-[#fdf2f7] text-[#0A0A0A] antialiased selection:bg-[#df0567] selection:text-white">
        {/* Fullscreen Initial Loading Screen with slide-up curtain */}
        <LoadingScreen />

        {/* Dynamic Theme-Aware Fixed Navbar */}
        <Navbar
          theme={currentTheme}
          currentLang={currentLang}
          onSelectLang={setCurrentLang}
          onOpenInquiry={() => handleOpenInquiry()}
          onOpenMenu={() => setIsMenuOpen(true)}
        />

        {/* Fullscreen Overlay Menu */}
        <MenuOverlay
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onOpenInquiry={() => handleOpenInquiry()}
          currentLang={currentLang}
          onSelectLang={setCurrentLang}
        />

        {/* Project Inquiry Slide-out Drawer */}
        <ProjectInquiryModal
          isOpen={isInquiryOpen}
          onClose={() => setIsInquiryOpen(false)}
          preselectedService={preselectedService}
        />

        {/* Persistent Cookie Banner */}
        <CookieBanner />

        {/* Main Content Sections (In Exact Blueprint Sequence, Powered by Persistent CMS Data) */}
        {(() => {
          const getSecData = (type: string) =>
            homepageData?.sections?.find((s) => s.type === type && s.isEnabled !== false)?.data as any;

          const heroData = getSecData('hero');
          const statsData = getSecData('stats');
          const servicesData = getSecData('services');
          const marqueeData = getSecData('word_marquee');
          const partnersData = getSecData('partners');
          const testimonialsData = getSecData('testimonials');
          const workflowData = getSecData('workflow');
          const closingData = getSecData('closing');

          return (
            <main id="main-content" className="relative w-full">
              {/* 1. Hero Drone Video + "LET'S GO VIRAL" */}
              <HeroScroll currentLang={currentLang} onOpenInquiry={() => handleOpenInquiry()} data={heroData} />

              {/* 2. Stats Section (15+ In-House Experts / 400+ Influencers / 150+ Satisfied Clients) */}
              <StatsCounter data={statsData} />

              {/* 3. Services Stacked/Sticky Section (Content Creation, Influencer Marketing, Social Media) */}
              <ServicesSticky currentLang={currentLang} onOpenInquiry={handleOpenInquiry} data={servicesData} />

              {/* 4. Typographic Word Marquee (Young / Pink Vibes / Minds with scroll-driven lateral translations) */}
              <WordMarquee data={marqueeData} />

              {/* 5. Partners Grid (15 Partner Logos in 5-col grid with hairline dividers) */}
              <PartnersMarquee currentLang={currentLang} data={partnersData} />

              {/* 6. References / Testimonials (Kinetic letter-scatter converging into baseline + horizontal cards) */}
              <Testimonials data={testimonialsData} />

              {/* 7. Workflow (4-step numbered accordion-style process) */}
              <Workflow data={workflowData} />

              {/* 8. Morph Finale (sequence-2 canvas scrollytelling + "AND" / "We Go Viral" / "Then") */}
              <PlaneMorph data={closingData} />

              {/* 9. Footer CTA ("LET'S WORK TOGETHER" + social icons + legal credits) */}
              <Footer currentLang={currentLang} onSelectLang={setCurrentLang} />
            </main>
          );
        })()}
      </div>
    </SmoothScrollProvider>
  );
}
