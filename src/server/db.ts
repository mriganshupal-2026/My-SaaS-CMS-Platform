import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import type {
  User,
  UserRole,
  UserPermissions,
  Page,
  Article,
  MediaItem,
  NavigationItem,
  SiteSettings,
  FooterSettings,
  InquiryFormSettings,
  ProjectInquiry,
  RedirectRule,
  ActivityLog,
  PageSection,
} from '../types/cms';
import { content } from '../lib/content';
import { isSupabaseConfigured, saveDbToSupabase, fetchDbFromSupabase, fetchDbFromSupabaseSync } from './supabaseClient';

export interface DatabaseSchema {
  users: User[];
  pages: Page[];
  articles: Article[];
  media: MediaItem[];
  navigation: NavigationItem[];
  settings: SiteSettings;
  inquiries: ProjectInquiry[];
  redirects: RedirectRule[];
  activityLogs: ActivityLog[];
}

function getDbFilePath(): string {
  // Always try /tmp in serverless, Vercel, or production Lambda
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.VERCEL_ENV) ||
    Boolean(process.env.LAMBDA_TASK_ROOT);

  if (isServerless) {
    const tmpDir = path.resolve('/tmp', 'viralmuse-data');
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch (_) {}
    return path.join(tmpDir, 'viralmuse-db.json');
  }

  try {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return path.join(dataDir, 'viralmuse-db.json');
  } catch (_) {
    const tmpDir = path.resolve('/tmp', 'viralmuse-data');
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch (_) {}
    return path.join(tmpDir, 'viralmuse-db.json');
  }
}

const DB_FILE = getDbFilePath();

// In-Memory Cache for rapid sub-millisecond response times
let cachedDb: DatabaseSchema | null = null;
let lastDbFileMtime = 0;

export function reloadDbFromDisk(): DatabaseSchema {
  cachedDb = null;
  lastDbFileMtime = 0;
  return getDb();
}

// Initialize state from Supabase if configured
if (isSupabaseConfigured) {
  fetchDbFromSupabase().then((supabaseData) => {
    if (supabaseData && typeof supabaseData === 'object' && supabaseData.users && (supabaseData.pages?.length > 0 || supabaseData.articles?.length > 0)) {
      cachedDb = supabaseData;
      console.log('[Supabase DB] Successfully loaded state from Supabase on startup.');
      // Also save to local file as cache backup
      try {
        const dir = path.dirname(DB_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DB_FILE, JSON.stringify(supabaseData, null, 2), 'utf-8');
      } catch (_) {}
    } else {
      // Supabase is empty or uninitialized. Check if we have local data to push to Supabase.
      let localData: DatabaseSchema | null = null;
      try {
        if (fs.existsSync(DB_FILE)) {
          const raw = fs.readFileSync(DB_FILE, 'utf-8');
          localData = JSON.parse(raw);
        }
      } catch (_) {}

      const dataToPush = (localData && localData.users && localData.pages) ? localData : getInitialSeedData();
      saveDbToSupabase(dataToPush).then((success) => {
        if (success) {
          cachedDb = dataToPush;
          console.log('[Supabase DB] Pushed local database state to Supabase successfully.');
        }
      });
    }
  }).catch((err) => {
    console.warn('[Supabase Startup Fetch Warning]:', err);
  });
}


// Initialize default seed data
function getInitialSeedData(): DatabaseSchema {
  const now = new Date().toISOString();
  const defaultAdminPassword = process.env.CMS_ADMIN_PASSWORD || 'viralmuse2026!';
  
  let passwordHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // fallback hash
  try {
    const salt = bcrypt.genSaltSync(10);
    passwordHash = bcrypt.hashSync(defaultAdminPassword, salt);
  } catch (err) {
    console.error('Bcrypt hash generation error, using fallback:', err);
  }

  const initialUser: User = {
    id: 'usr_admin_01',
    username: process.env.CMS_ADMIN_USERNAME || 'admin',
    email: process.env.CMS_ADMIN_EMAIL || 'admin@viralmuse.agency',
    passwordHash,
    role: 'SUPER_ADMIN',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  // Convert existing hardcoded content into structured CMS sections
  const homepageSections: PageSection[] = [
    {
      id: 'sec_hero',
      type: 'hero',
      title: 'Hero Scrollytelling Video',
      isEnabled: true,
      orderIndex: 0,
      data: {
        scriptText: content.hero.eyebrow,
        mainHeadline: content.hero.headline,
        subscriptText: content.hero.sub,
        ctaPrimaryText: content.nav.inquiry,
        ctaPrimaryLink: '#inquiry',
        ctaSecondaryText: content.nav.menu,
        ctaSecondaryLink: '#services',
        videoUrl: 'https://assets.cdn.filesafe.space/xSjwuaSnNYIVMgIONcb2/media/6ab3b5d98bf21de2ae3b42b0.mp4',
        posterUrl: '/images/hero-fallback.jpg',
        ambientTitle: 'ViralMuse',
      },
    },
    {
      id: 'sec_stats',
      type: 'stats',
      title: 'Kinetic Stats Counter',
      isEnabled: true,
      orderIndex: 1,
      data: {
        stat1Value: `${content.stats[0].value}${content.stats[0].suffix}`,
        stat1Label: content.stats[0].label,
        stat1Desc: 'Organic impressions generated across social channels.',
        stat2Value: `${content.stats[1].value}${content.stats[1].suffix}`,
        stat2Label: content.stats[1].label,
        stat2Desc: 'Curated creators & tastemakers in travel and lifestyle.',
        stat3Value: `${content.stats[2].value}${content.stats[2].suffix}`,
        stat3Label: content.stats[2].label,
        stat3Desc: 'Visionary brands & resorts scaled globally.',
      },
    },
    {
      id: 'sec_services',
      type: 'services',
      title: 'Sticky Luxury Services',
      isEnabled: true,
      orderIndex: 2,
      data: {
        eyebrow: content.services.eyebrow,
        heading: 'Strategic Velocity & Visual Allure',
        items: content.services.items.map((srv, idx) => ({
          id: srv.id,
          num: `0${idx + 1}`,
          title: srv.title,
          desc: srv.copy,
          tags: srv.badge ? [srv.badge] : [],
          metric: idx === 0 ? '+280%' : idx === 1 ? '12M+' : '3.4x',
          metricLabel: idx === 0 ? 'Avg. Organic Engagement' : idx === 1 ? 'Monthly Creator Impressions' : 'Follower Velocity Rate',
        })),
      },
    },
    {
      id: 'sec_marquee',
      type: 'word_marquee',
      title: 'Typographic Marquee Band',
      isEnabled: true,
      orderIndex: 3,
      data: {
        line1: [...content.wordMarquee],
        line2: ['Bold Vision', 'Viral Impact', 'Infinite Reach', 'Cinematic Precision'],
      },
    },
    {
      id: 'sec_partners',
      type: 'partners',
      title: 'Partners & Client Brand Grid',
      isEnabled: true,
      orderIndex: 4,
      data: {
        eyebrow: content.partners.eyebrow,
        list: content.partners.list.map((p) => ({
          id: p.id,
          name: p.name,
          logo: p.logo,
          alt: p.alt,
        })),
      },
    },
    {
      id: 'sec_testimonials',
      type: 'testimonials',
      title: 'Client Endorsements & Reviews',
      isEnabled: true,
      orderIndex: 5,
      data: {
        eyebrow: content.testimonials.eyebrow,
        heading: content.testimonials.heading,
        items: content.testimonials.items.map((t, idx) => ({
          id: `test_${idx + 1}`,
          company: t.company,
          quote: t.quote,
          name: t.name,
          role: t.role,
          location: t.location,
        })),
      },
    },
    {
      id: 'sec_workflow',
      type: 'workflow',
      title: '4-Step Strategic Blueprint',
      isEnabled: true,
      orderIndex: 6,
      data: {
        eyebrow: content.workflow.eyebrow,
        steps: content.workflow.steps.map((s) => ({
          n: s.n,
          title: s.title,
          copy: s.copy,
        })),
      },
    },
    {
      id: 'sec_closing',
      type: 'closing',
      title: 'Kinetic Finale & Morph Statement',
      isEnabled: true,
      orderIndex: 7,
      data: {
        line1: content.closing[0],
        line2: content.closing[1],
        line3: content.closing[2],
        backgroundImage: '/images/go-iconic-hero.jpg',
      },
    },
  ];

  const homepage: Page = {
    id: 'pg_home_01',
    title: 'ViralMuse — Luxury Social Media Agency',
    slug: 'home',
    isHomepage: true,
    status: 'PUBLISHED',
    sections: homepageSections,
    seo: {
      title: 'ViralMuse — Social Media Agency | Luxury & Hospitality Production',
      description:
        'Cinematic scroll-driven social media agency for luxury hospitality, alpine resorts, and lifestyle brands. 4K Reels, drone cinema, and high-impact influencer campaigns.',
      ogTitle: 'ViralMuse — Social Media Agency',
      ogDescription:
        'Premier luxury hospitality and travel social media, 4K cinematic production & influencer architecture agency.',
      ogImage: '/og-image.jpg',
      twitterCard: 'summary_large_image',
      twitterTitle: 'ViralMuse — Social Media Agency',
      twitterDescription:
        'Premier luxury hospitality and travel social media, 4K cinematic production & influencer architecture agency.',
      twitterImage: '/og-image.jpg',
    },
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  const initialArticles: Article[] = [
    {
      id: 'art_01',
      title: 'The 4K Formula: How Luxury Resorts Turn TikTok Views Into Direct Suite Bookings',
      slug: 'the-4k-formula-luxury-resorts-tiktok',
      excerpt:
        'Why generic drone pan videos fail to convert, and how narrative pacing and audio hooks generated 12M+ organic impressions for Alpine wellness retreats.',
      content: `
        <h2>The Shift in Luxury Hospitality Marketing</h2>
        <p>For decades, five-star resorts and alpine sanctuaries relied exclusively on glossy print brochures and static photography. In 2026, the modern affluent traveler books based on feeling. They want to experience the morning mist rising from a heated panoramic infinity pool, hear the crisp crackle of cedar fireplace embers, and witness genuine creator moments.</p>
        
        <h2>Hook Within 1.5 Seconds</h2>
        <p>Short-form algorithms on Instagram Reels and TikTok reward visceral immersion. At ViralMuse, our 4K cinematic production units capture ultra-high-definition texture — the pour of rare vintage champagne, 120fps snow cascades, and architectural minimalism.</p>
        
        <blockquote>"Content that looks like a commercial gets skipped. Content that feels like a dream vacation gets shared and booked."</blockquote>
        
        <h2>Direct ROI vs. Vanity Metrics</h2>
        <p>By synchronizing influencer activations with dedicated UTM reservation links and private concierge landing pages, our clients consistently achieve average 34% bumps in direct non-OTA bookings.</p>
      `,
      featuredImage: '/images/go-iconic-hero.jpg',
      author: 'ViralMuse Editorial Team',
      category: 'Hospitality Strategy',
      tags: ['Luxury Travel', 'TikTok Strategy', 'ROI Conversion', 'Cinematography'],
      status: 'PUBLISHED',
      readingTime: '4 min read',
      seo: {
        title: 'The 4K Formula: Luxury Resorts & TikTok Conversion | ViralMuse',
        description:
          'How narrative pacing and short-form video hooks generate millions of impressions and high-intent bookings for luxury hotels.',
        ogImage: '/images/go-iconic-hero.jpg',
      },
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'art_02',
      title: 'Why Influencer Matchmaking Matters More Than Follower Count',
      slug: 'influencer-matchmaking-luxury-hospitality',
      excerpt:
        'Micro-creators with curated aesthetics and loyal ultra-high-net-worth audiences consistently outperform generic celebrity accounts.',
      content: `
        <h2>Quality of Audience Over Scale</h2>
        <p>A creator with 80,000 discerning architecture and travel connoisseurs will drive significantly more qualified inquiries than a mainstream account with 2 million passive followers.</p>
        
        <p>Our proprietary Creator Architecture protocol vets authentic engagement ratios, audience geographic affluence, and aesthetic compatibility before a single camera is turned on.</p>
      `,
      featuredImage: '/images/hero-fallback.jpg',
      author: 'Sophie Laurent',
      category: 'Creator Architecture',
      tags: ['Influencer Marketing', 'Creator Economy', 'Audience Vetting'],
      status: 'PUBLISHED',
      readingTime: '3 min read',
      seo: {
        title: 'Influencer Matchmaking for Luxury Brands | ViralMuse',
        description:
          'Discover why curated creator alignment drives authentic prestige and conversion in luxury social media marketing.',
        ogImage: '/images/hero-fallback.jpg',
      },
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ];

  const initialNavigation: NavigationItem[] = [
    { id: 'nav_1', label: 'Services', url: '#services', orderIndex: 0, isActive: true },
    { id: 'nav_2', label: 'Partners', url: '#partners', orderIndex: 1, isActive: true },
    { id: 'nav_3', label: 'Reviews', url: '#testimonials', orderIndex: 2, isActive: true },
    { id: 'nav_4', label: 'Blueprint', url: '#blueprint', orderIndex: 3, isActive: true },
    { id: 'nav_5', label: 'Editorial', url: '/blog', orderIndex: 4, isActive: true },
    { id: 'nav_6', label: 'Start Project', url: '#inquiry', orderIndex: 5, isActive: true },
  ];

  const initialSettings: SiteSettings = {
    siteUrl: 'https://viral-agency-cinematic-social-influencer-agency.ai.studio',
    resendApiKey: 're_Gz8wAkUr_GAHBqVzJtaqNXGVe3tTMgE9x',
    emailSender: 'ViralMuse <onboarding@resend.dev>',
    general: {
      siteName: 'ViralMuse',
      siteUrl: 'https://viral-agency-cinematic-social-influencer-agency.ai.studio',
      siteDescription:
        'Premier luxury hospitality and travel social media, 4K cinematic production & influencer architecture agency.',
      logoUrl: '/favicon.svg',
      faviconUrl: '/favicon.svg',
      contactEmail: 'hello@viralmuse.agency',
      phone: '+39 02 9475 2830',
      address: 'Via Montenapoleone 8, 20121 Milano, Italy',
    },
    social: {
      instagram: 'https://instagram.com/viralmuse',
      tiktok: 'https://tiktok.com/@viralmuse',
      linkedin: 'https://linkedin.com/company/viralmuse',
      youtube: 'https://youtube.com/@viralmuse',
      twitter: 'https://x.com/viralmuse',
    },
    footer: {
      headline: "Let's Shape Culture",
      email: 'hello@viralmuse.agency',
      links: [
        { label: 'Imprint', href: '#' },
        { label: 'Privacy Policy', href: '#' },
        { label: 'Cookie Settings', href: '#' },
      ],
      credits: 'Designed & Engineered by ViralMuse Agency',
    },
    inquiryForm: {
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
      successTitle: 'That Worked!',
      successMessage: 'Thank you for reaching out. We have received your inquiry and our creative team will be in touch within 24 hours.',
      successButtonText: 'Done',
      responsePromiseText: 'Direct priority response within 24h',
      contactEmail: 'hello@viralmuse.agency',
    },
    seoDefaults: {
      title: 'ViralMuse — Social Media Agency',
      description:
        'Premier luxury hospitality and travel social media, 4K cinematic production & influencer architecture agency.',
      ogImage: '/og-image.jpg',
      twitterCard: 'summary_large_image',
    },
  };

  const initialMedia: MediaItem[] = [
    {
      id: 'med_01',
      filename: 'go-iconic-hero.jpg',
      originalName: 'go-iconic-hero.jpg',
      url: '/images/go-iconic-hero.jpg',
      mimeType: 'image/jpeg',
      size: 420000,
      width: 1920,
      height: 1080,
      altText: 'Luxury architectural alpine villa with infinity pool at dusk',
      caption: 'Closing statement background hero',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med_02',
      filename: 'hero-fallback.jpg',
      originalName: 'hero-fallback.jpg',
      url: '/images/hero-fallback.jpg',
      mimeType: 'image/jpeg',
      size: 380000,
      width: 1920,
      height: 1080,
      altText: 'Mountain resort dusk view with cinematic glow',
      caption: 'Hero scrollytelling background poster',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'med_03',
      filename: 'og-image.jpg',
      originalName: 'og-image.jpg',
      url: '/og-image.jpg',
      mimeType: 'image/jpeg',
      size: 512000,
      width: 1200,
      height: 630,
      altText: 'ViralMuse Social Share Card',
      caption: 'OpenGraph 1200x630 banner',
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    users: [initialUser],
    pages: [homepage],
    articles: initialArticles,
    media: initialMedia,
    navigation: initialNavigation,
    settings: initialSettings,
    inquiries: [],
    redirects: [],
    activityLogs: [
      {
        id: 'act_01',
        userId: 'usr_admin_01',
        username: 'admin',
        userName: 'admin',
        action: 'INITIAL_SEED',
        entityType: 'settings',
        details: 'Initial database bootstrap and migration completed.',
        createdAt: now,
      },
    ],
  };
}

function syncHomepage(db: DatabaseSchema) {
  const defaultHeroVideo = 'https://assets.cdn.filesafe.space/xSjwuaSnNYIVMgIONcb2/media/6ab3b5d98bf21de2ae3b42b0.mp4';
  if (!db.pages) db.pages = [];
  const existingHomepage = db.pages.find((p) => p.isHomepage);
  if (!existingHomepage) {
    const initial = getInitialSeedData();
    const seedHomepage = initial.pages.find((p) => p.isHomepage);
    if (seedHomepage) {
      db.pages.unshift(seedHomepage);
    }
  } else if (!existingHomepage.sections || existingHomepage.sections.length === 0) {
    // Only populate sections if the existing homepage is completely missing sections
    const initial = getInitialSeedData();
    const seedHomepage = initial.pages.find((p) => p.isHomepage);
    if (seedHomepage && seedHomepage.sections) {
      existingHomepage.sections = seedHomepage.sections;
    }
  } else {
    // Check if hero section video is missing or set to placeholder
    const heroSec = existingHomepage.sections.find((s) => s.type === 'hero');
    if (heroSec && heroSec.data) {
      const data = heroSec.data as Record<string, any>;
      if (!data.videoUrl || data.videoUrl.includes('Generated video') || data.videoUrl === '/videos/hero.mp4') {
        data.videoUrl = defaultHeroVideo;
      }
    }
  }
}

function syncSettings(db: DatabaseSchema) {
  const canonicalDomain = 'https://viral-agency-cinematic-social-influencer-agency.ai.studio';
  if (!db.settings) {
    db.settings = getInitialSeedData().settings;
  }

  // Clean any nested settings keys recursively
  let current = db.settings as any;
  while (current && current.settings && typeof current.settings === 'object') {
    if (current.settings.footer) {
      current.footer = { ...current.footer, ...current.settings.footer };
    }
    if (current.settings.general) {
      current.general = { ...current.general, ...current.settings.general };
    }
    if (current.settings.social) {
      current.social = { ...current.social, ...current.settings.social };
    }
    delete current.settings;
  }
  delete (db.settings as any).settings;

  if (!db.settings.siteUrl || db.settings.siteUrl.includes('viralmuse.agency')) {
    db.settings.siteUrl = canonicalDomain;
  }
  if (!db.settings.general) {
    db.settings.general = getInitialSeedData().settings.general!;
  }
  if (!db.settings.general.siteUrl || db.settings.general.siteUrl.includes('viralmuse.agency')) {
    db.settings.general.siteUrl = canonicalDomain;
  }
  if (!db.settings.footer) {
    db.settings.footer = getInitialSeedData().settings.footer;
  }
  if (!db.settings.resendApiKey) {
    db.settings.resendApiKey = 're_Gz8wAkUr_GAHBqVzJtaqNXGVe3tTMgE9x';
  }
  if (!db.settings.emailSender) {
    db.settings.emailSender = 'ViralMuse <onboarding@resend.dev>';
  }

  if (!db.settings.inquiryForm) {
    db.settings.inquiryForm = getInitialSeedData().settings.inquiryForm;
  } else {
    db.settings.inquiryForm = {
      ...getInitialSeedData().settings.inquiryForm,
      ...db.settings.inquiryForm,
    };
  }
}

function syncNavigation(db: DatabaseSchema) {
  if (!db.navigation) {
    db.navigation = getInitialSeedData().navigation;
  }

  // Ensure all custom created pages (non-homepage) are registered in global navigation
  if (db.pages && Array.isArray(db.pages)) {
    db.pages.forEach((page) => {
      if (page.isHomepage || page.slug === 'home') return;

      const pageUrl = `/p/${page.slug}`;
      const pageLabel = page.title.replace(/^ViralMuse\s*[—–-]\s*/i, '').trim() || page.title;
      const navId = `nav_pg_${page.id}`;

      const existingIndex = db.navigation.findIndex(
        (n) => n.id === navId || n.id === page.id || n.url === pageUrl || n.url === `/p/${page.slug}`
      );

      if (existingIndex >= 0) {
        db.navigation[existingIndex] = {
          ...db.navigation[existingIndex],
          label: pageLabel,
          url: pageUrl,
        };
      } else {
        const maxOrder = db.navigation.reduce((max, it) => Math.max(max, it.orderIndex ?? 0), 0);
        db.navigation.push({
          id: navId,
          label: pageLabel,
          url: pageUrl,
          orderIndex: maxOrder + 1,
          isActive: true,
          target: '_self',
        });
      }
    });
  }
}

/**
 * Load database from disk into memory
 */
export function getDb(): DatabaseSchema {
  // Check if file on disk was modified externally (e.g. by LiveSync or external tool)
  try {
    if (fs.existsSync(DB_FILE)) {
      const stats = fs.statSync(DB_FILE);
      if (cachedDb && stats.mtimeMs > lastDbFileMtime + 50) {
        cachedDb = null;
      }
    }
  } catch (_) {}

  if (cachedDb) {
    syncHomepage(cachedDb);
    syncSettings(cachedDb);
    syncNavigation(cachedDb);
    return cachedDb;
  }

  // If Supabase is configured, try synchronous fetch on cold start / cache miss
  if (isSupabaseConfigured) {
    const remoteData = fetchDbFromSupabaseSync();
    if (remoteData && typeof remoteData === 'object' && remoteData.users && (remoteData.pages?.length > 0 || remoteData.articles?.length > 0)) {
      cachedDb = remoteData;
      syncHomepage(cachedDb);
      syncSettings(cachedDb);
      syncNavigation(cachedDb);
      try {
        const dir = path.dirname(DB_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DB_FILE, JSON.stringify(cachedDb, null, 2), 'utf-8');
        lastDbFileMtime = fs.statSync(DB_FILE).mtimeMs;
      } catch (_) {}
      return cachedDb;
    }
  }

  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialSeedData();
      saveDb(initial);
      cachedDb = initial;
      return cachedDb;
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    cachedDb = parsed;
    try {
      lastDbFileMtime = fs.statSync(DB_FILE).mtimeMs;
    } catch (_) {}
    syncHomepage(cachedDb);
    syncSettings(cachedDb);
    syncNavigation(cachedDb);
    return cachedDb;
  } catch (err) {
    console.error('Error reading database file, using fallback seed:', err);
    const initial = getInitialSeedData();
    cachedDb = initial;
    return cachedDb;
  }
}

/**
 * Save database atomically to disk and invalidate cache
 */
export function saveDb(data: DatabaseSchema): void {
  // Always update in-memory state immediately
  cachedDb = data;

  const tempFile = `${DB_FILE}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 6)}`;
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    try {
      lastDbFileMtime = fs.statSync(DB_FILE).mtimeMs;
    } catch (_) {}
  } catch (err) {
    console.warn('[ViralMuse DB] Filesystem persistence notice (running in memory):', err);
    if (fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch (_) {}
    }
  }

  // Also sync to Supabase if configured
  if (isSupabaseConfigured) {
    saveDbToSupabase(data).catch((err) => {
      console.warn('[Supabase Background Sync Error]:', err);
    });
  }
}

/**
 * Log an administrative activity
 */
export function logActivity(
  userId: string,
  userName: string,
  action: string,
  entityType: ActivityLog['entityType'],
  entityId?: string,
  details?: string
): void {
  const db = getDb();
  const newLog: ActivityLog = {
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    userId,
    username: userName,
    userName,
    action,
    entityType,
    entityId,
    details,
    createdAt: new Date().toISOString(),
  };

  // Keep last 250 activity entries
  db.activityLogs = [newLog, ...db.activityLogs.slice(0, 249)];
  saveDb(db);
}

// -------------------------------------------------------------
// Database Query Helpers
// -------------------------------------------------------------

export const dbQueries = {
  // Users
  getUserByUsernameOrEmail(identifier: string): User | undefined {
    const db = getDb();
    const idLower = identifier.toLowerCase().trim();
    return db.users.find(
      (u) =>
        u.isActive &&
        (u.username.toLowerCase() === idLower || u.email.toLowerCase() === idLower)
    );
  },

  getUserById(id: string): User | undefined {
    const db = getDb();
    return db.users.find((u) => u.id === id);
  },

  updateUserLastLogin(id: string): void {
    const db = getDb();
    const user = db.users.find((u) => u.id === id);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      user.updatedAt = new Date().toISOString();
      saveDb(db);
    }
  },

  updateUserPassword(id: string, newPasswordHash: string): boolean {
    const db = getDb();
    const user = db.users.find((u) => u.id === id);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    user.updatedAt = new Date().toISOString();
    saveDb(db);
    return true;
  },

  // Pages
  getPages(statusFilter?: string): Page[] {
    const db = getDb();
    if (!statusFilter) return db.pages;
    return db.pages.filter((p) => p.status === statusFilter);
  },

  getPageById(id: string): Page | undefined {
    const db = getDb();
    return db.pages.find(
      (p) => p.id === id || (p.isHomepage && (id === 'page_home' || id === 'home' || id === 'pg_home_01'))
    );
  },

  getPublishedHomepage(): Page | undefined {
    const db = getDb();
    return db.pages.find((p) => p.isHomepage && p.status === 'PUBLISHED') || db.pages.find((p) => p.isHomepage) || db.pages[0];
  },

  getPublishedPageBySlug(slug: string): Page | undefined {
    const db = getDb();
    const cleanSlug = slug.toLowerCase().trim();
    return db.pages.find((p) => p.slug.toLowerCase() === cleanSlug && p.status === 'PUBLISHED');
  },

  savePage(pageData: Partial<Page> & { title: string; slug: string }): Page {
    const db = getDb();
    const now = new Date().toISOString();

    let targetPage: Page;

    if (pageData.id) {
      const idx = db.pages.findIndex(
        (p) => p.id === pageData.id || (p.isHomepage && (pageData.id === 'page_home' || pageData.id === 'home' || pageData.id === 'pg_home_01'))
      );
      if (idx >= 0) {
        const existing = db.pages[idx];
        const updated: Page = {
          ...existing,
          ...pageData,
          id: existing.id, // Preserve actual ID
          updatedAt: now,
        };
        if (pageData.status === 'PUBLISHED' && !existing.publishedAt) {
          updated.publishedAt = now;
        }
        db.pages[idx] = updated;
        targetPage = updated;
      } else {
        targetPage = {
          id: pageData.id,
          title: pageData.title,
          slug: pageData.slug.toLowerCase().trim(),
          isHomepage: pageData.isHomepage || false,
          status: pageData.status || 'DRAFT',
          sections: pageData.sections || [],
          seo: pageData.seo || {},
          publishedAt: pageData.status === 'PUBLISHED' ? now : undefined,
          createdAt: now,
          updatedAt: now,
        };
        db.pages.push(targetPage);
      }
    } else {
      // Create New Page
      targetPage = {
        id: `pg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: pageData.title,
        slug: pageData.slug.toLowerCase().trim(),
        isHomepage: pageData.isHomepage || false,
        status: pageData.status || 'DRAFT',
        sections: pageData.sections || [],
        seo: pageData.seo || {},
        publishedAt: pageData.status === 'PUBLISHED' ? now : undefined,
        createdAt: now,
        updatedAt: now,
      };
      db.pages.push(targetPage);
    }

    // Automatically sync this page to global navigation (if not homepage)
    if (!targetPage.isHomepage && targetPage.slug !== 'home') {
      if (!db.navigation) db.navigation = [];
      const pageUrl = `/p/${targetPage.slug}`;
      const pageLabel = targetPage.title.replace(/^ViralMuse\s*[—–-]\s*/i, '').trim() || targetPage.title;
      const navId = `nav_pg_${targetPage.id}`;

      const existingNavIdx = db.navigation.findIndex(
        (n) => n.id === navId || n.id === targetPage.id || n.url === pageUrl || (pageData.id && n.id.includes(pageData.id))
      );

      if (existingNavIdx >= 0) {
        db.navigation[existingNavIdx].label = pageLabel;
        db.navigation[existingNavIdx].url = pageUrl;
        if (targetPage.status === 'PUBLISHED') {
          db.navigation[existingNavIdx].isActive = true;
        }
      } else {
        const maxOrder = db.navigation.reduce((max, it) => Math.max(max, it.orderIndex ?? 0), 0);
        db.navigation.push({
          id: navId,
          label: pageLabel,
          url: pageUrl,
          orderIndex: maxOrder + 1,
          isActive: true,
          target: '_self',
        });
      }
    }

    saveDb(db);
    return targetPage;
  },

  deletePage(id: string): boolean {
    const db = getDb();
    const idx = db.pages.findIndex((p) => p.id === id);
    if (idx >= 0) {
      // Protect homepage from deletion
      if (db.pages[idx].isHomepage) {
        return false;
      }
      const pageToDelete = db.pages[idx];
      db.pages.splice(idx, 1);

      // Also remove from global navigation if present
      if (db.navigation && Array.isArray(db.navigation)) {
        db.navigation = db.navigation.filter(
          (n) => n.id !== `nav_pg_${pageToDelete.id}` && n.id !== pageToDelete.id && n.url !== `/p/${pageToDelete.slug}`
        );
      }

      saveDb(db);
      return true;
    }
    return false;
  },

  duplicatePage(id: string): Page | null {
    const db = getDb();
    const source = db.pages.find((p) => p.id === id);
    if (!source) return null;

    const now = new Date().toISOString();
    const duplicate: Page = {
      ...JSON.parse(JSON.stringify(source)),
      id: `pg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: `${source.title} (Copy)`,
      slug: `${source.slug}-copy-${Date.now().toString(36).substr(-4)}`,
      isHomepage: false,
      status: 'DRAFT',
      publishedAt: undefined,
      createdAt: now,
      updatedAt: now,
    };

    db.pages.push(duplicate);
    saveDb(db);
    return duplicate;
  },

  // Articles
  getArticles(statusFilter?: string): Article[] {
    const db = getDb();
    if (!statusFilter) return db.articles;
    return db.articles.filter((a) => a.status === statusFilter);
  },

  getPublishedArticles(): Article[] {
    const db = getDb();
    return db.articles
      .filter((a) => a.status === 'PUBLISHED')
      .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
  },

  getArticleById(id: string): Article | undefined {
    const db = getDb();
    return db.articles.find((a) => a.id === id);
  },

  getPublishedArticleBySlug(slug: string): Article | undefined {
    const db = getDb();
    const cleanSlug = slug.toLowerCase().trim();
    return db.articles.find((a) => a.slug.toLowerCase() === cleanSlug && a.status === 'PUBLISHED');
  },

  saveArticle(articleData: Partial<Article> & { title: string; slug: string }): Article {
    const db = getDb();
    const now = new Date().toISOString();

    if (articleData.id) {
      const idx = db.articles.findIndex((a) => a.id === articleData.id);
      if (idx >= 0) {
        const existing = db.articles[idx];
        const updated: Article = {
          ...existing,
          ...articleData,
          updatedAt: now,
        };
        if (articleData.status === 'PUBLISHED' && !existing.publishedAt) {
          updated.publishedAt = now;
        }
        db.articles[idx] = updated;
        saveDb(db);
        return updated;
      }
    }

    // Create New Article
    const newArticle: Article = {
      id: `art_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: articleData.title,
      slug: articleData.slug.toLowerCase().trim(),
      excerpt: articleData.excerpt || '',
      content: articleData.content || '',
      featuredImage: articleData.featuredImage || '/og-image.jpg',
      author: articleData.author || 'ViralMuse Team',
      category: articleData.category || 'General',
      tags: articleData.tags || [],
      status: articleData.status || 'DRAFT',
      seo: articleData.seo || {},
      readingTime: articleData.readingTime || '3 min read',
      publishedAt: articleData.status === 'PUBLISHED' ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };

    db.articles.push(newArticle);
    saveDb(db);
    return newArticle;
  },

  deleteArticle(id: string): boolean {
    const db = getDb();
    const idx = db.articles.findIndex((a) => a.id === id);
    if (idx >= 0) {
      db.articles.splice(idx, 1);
      saveDb(db);
      return true;
    }
    return false;
  },

  // Media
  getMedia(): MediaItem[] {
    const db = getDb();
    return [...db.media].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addMedia(mediaItem: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>): MediaItem {
    const db = getDb();
    const now = new Date().toISOString();
    const newItem: MediaItem = {
      ...mediaItem,
      id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: now,
      updatedAt: now,
    };
    db.media.push(newItem);
    saveDb(db);
    return newItem;
  },

  updateMedia(id: string, updates: Partial<Pick<MediaItem, 'altText' | 'caption'>>): MediaItem | null {
    const db = getDb();
    const item = db.media.find((m) => m.id === id);
    if (!item) return null;
    if (updates.altText !== undefined) item.altText = updates.altText;
    if (updates.caption !== undefined) item.caption = updates.caption;
    item.updatedAt = new Date().toISOString();
    saveDb(db);
    return item;
  },

  deleteMedia(id: string): boolean {
    const db = getDb();
    const idx = db.media.findIndex((m) => m.id === id);
    if (idx >= 0) {
      const item = db.media[idx];
      // If stored in public uploads, remove file
      if (item.url.startsWith('/uploads/')) {
        const filePath = path.resolve(process.cwd(), 'public', item.url.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (_) {}
        }
      }
      db.media.splice(idx, 1);
      saveDb(db);
      return true;
    }
    return false;
  },

  // Navigation
  getNavigation(): NavigationItem[] {
    const db = getDb();
    return [...db.navigation].sort((a, b) => a.orderIndex - b.orderIndex);
  },

  saveNavigation(items: NavigationItem[]): NavigationItem[] {
    const db = getDb();
    db.navigation = items;
    saveDb(db);
    return db.navigation;
  },

  // Settings
  getSettings(): SiteSettings {
    const db = getDb();
    return db.settings;
  },

  saveSettings(newSettings: any): SiteSettings {
    const db = getDb();
    
    const incoming: Partial<SiteSettings> =
      newSettings && typeof newSettings === 'object' && newSettings.settings
        ? newSettings.settings
        : newSettings || {};

    delete (db.settings as any).settings;
    delete (incoming as any).settings;

    let currentFooter: FooterSettings = db.settings.footer || {};
    if (incoming.footer) {
      currentFooter = {
        ...currentFooter,
        ...incoming.footer,
        links: Array.isArray(incoming.footer.links) ? [...incoming.footer.links] : (currentFooter.links || []),
        social: incoming.footer.social ? { ...(currentFooter.social || {}), ...incoming.footer.social } : currentFooter.social,
      };
    }

    let currentInquiryForm: InquiryFormSettings = db.settings.inquiryForm || {};
    if (incoming.inquiryForm) {
      currentInquiryForm = {
        ...currentInquiryForm,
        ...incoming.inquiryForm,
        services: Array.isArray(incoming.inquiryForm.services) ? [...incoming.inquiryForm.services] : (currentInquiryForm.services || []),
        budgetOptions: Array.isArray(incoming.inquiryForm.budgetOptions) ? [...incoming.inquiryForm.budgetOptions] : (currentInquiryForm.budgetOptions || []),
      };
    }

    db.settings = {
      ...db.settings,
      ...incoming,
      general: { ...(db.settings.general || {}), ...(incoming.general || {}) },
      social: { ...(db.settings.social || {}), ...(incoming.social || {}) },
      footer: currentFooter,
      inquiryForm: currentInquiryForm,
      seoDefaults: { ...(db.settings.seoDefaults || {}), ...(incoming.seoDefaults || {}) },
    };
    delete (db.settings as any).settings;
    saveDb(db);
    return db.settings;
  },

  // Inquiries
  getInquiries(): ProjectInquiry[] {
    const db = getDb();
    return [...db.inquiries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  addInquiry(inquiry: Omit<ProjectInquiry, 'id' | 'createdAt' | 'status'>): ProjectInquiry {
    const db = getDb();
    const newInquiry: ProjectInquiry = {
      ...inquiry,
      id: `inq_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };
    db.inquiries.push(newInquiry);
    saveDb(db);
    return newInquiry;
  },

  updateInquiryStatus(id: string, status: ProjectInquiry['status']): boolean {
    const db = getDb();
    const inq = db.inquiries.find((i) => i.id === id);
    if (!inq) return false;
    inq.status = status;
    saveDb(db);
    return true;
  },

  // Redirects
  getRedirects(): RedirectRule[] {
    const db = getDb();
    return db.redirects;
  },

  saveRedirects(redirects: RedirectRule[]): RedirectRule[] {
    const db = getDb();
    db.redirects = redirects;
    saveDb(db);
    return db.redirects;
  },

  // Users & Permissions Management
  getUsers(): User[] {
    const db = getDb();
    return db.users.map((u) => {
      const { passwordHash, ...rest } = u;
      return rest as User;
    });
  },

  addUser(userData: { username: string; email: string; role: UserRole; isActive: boolean; permissions?: UserPermissions }, rawPassword?: string): User {
    const db = getDb();
    const now = new Date().toISOString();
    const passwordToHash = rawPassword || 'viralmuse2026!';
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(passwordToHash, salt);

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      username: userData.username,
      email: userData.email,
      passwordHash,
      role: userData.role || 'EDITOR',
      permissions: userData.permissions || {
        canManagePages: true,
        canManageArticles: true,
        canManageMedia: true,
        canManageInquiries: true,
        canManageNavigation: false,
        canManageSettings: false,
        canManageUsers: false,
      },
      isActive: userData.isActive !== false,
      createdAt: now,
      updatedAt: now,
    };

    db.users.push(newUser);
    saveDb(db);
    const { passwordHash: _, ...rest } = newUser;
    return rest as User;
  },

  updateUser(id: string, updates: Partial<User>, rawPassword?: string): User | null {
    const db = getDb();
    const user = db.users.find((u) => u.id === id);
    if (!user) return null;

    if (updates.username !== undefined) user.username = updates.username;
    if (updates.email !== undefined) user.email = updates.email;
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.isActive !== undefined) user.isActive = updates.isActive;
    if (updates.permissions !== undefined) user.permissions = updates.permissions;
    if (Object.prototype.hasOwnProperty.call(updates, 'resetToken')) {
      user.resetToken = updates.resetToken;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'resetTokenExpiry')) {
      user.resetTokenExpiry = updates.resetTokenExpiry;
    }

    if (rawPassword && rawPassword.trim()) {
      const salt = bcrypt.genSaltSync(10);
      user.passwordHash = bcrypt.hashSync(rawPassword.trim(), salt);
    }

    user.updatedAt = new Date().toISOString();
    saveDb(db);

    const { passwordHash: _, ...rest } = user;
    return rest as User;
  },

  deleteUser(id: string): boolean {
    const db = getDb();
    const idx = db.users.findIndex((u) => u.id === id);
    if (idx >= 0) {
      const adminCount = db.users.filter((u) => u.role === 'SUPER_ADMIN').length;
      if (db.users[idx].role === 'SUPER_ADMIN' && adminCount <= 1) {
        return false;
      }
      db.users.splice(idx, 1);
      saveDb(db);
      return true;
    }
    return false;
  },

  // Activity Logs
  getActivityLogs(limit = 100): ActivityLog[] {
    const db = getDb();
    return db.activityLogs.slice(0, limit);
  },
};
