import type { PageSection, SectionType } from '../types/cms';

export interface SectionTemplateMeta {
  id: string;
  name: string;
  type: SectionType;
  category: 'Hero & Intro' | 'Services & Work' | 'Social Proof' | 'Process' | 'Branding & Visuals' | 'Call to Action' | 'Content';
  description: string;
  badge: string;
  iconName: string;
  highlights: string[];
  generateSection: (index: number) => PageSection;
}

export interface PageStarterTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  recommendedSlug: string;
  sectionTypes: SectionType[];
  generateSections: () => PageSection[];
}

// --------------------------------------------------------------------------
// 1. SECTION TEMPLATES DERIVED DIRECTLY FROM THE HOMEPAGE
// --------------------------------------------------------------------------

export const HOMEPAGE_SECTION_TEMPLATES: SectionTemplateMeta[] = [
  {
    id: 'tpl_hero',
    name: 'Hero Scrollytelling Video',
    type: 'hero',
    category: 'Hero & Intro',
    description: 'Cinematic drone loop background with bold script typography, ambient agency title, high-impact headline, and dual Call-to-Action buttons.',
    badge: 'Homepage Hero',
    iconName: 'Video',
    highlights: ['4K Video Background', 'Dual CTA Buttons', 'Ambient Title Overlay', 'Mobile Optimized'],
    generateSection: (index: number): PageSection => ({
      id: `sec_hero_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'hero',
      title: 'Hero Scrollytelling Video',
      isEnabled: true,
      orderIndex: index,
      data: {
        scriptText: "Let's Go Viral",
        mainHeadline: 'Command Attention',
        subscriptText: 'Next-gen creators & luxury social media production.',
        ctaPrimaryText: 'Project Inquiry',
        ctaPrimaryLink: '#inquiry',
        ctaSecondaryText: 'Explore Work',
        ctaSecondaryLink: '#services',
        videoUrl: 'https://assets.cdn.filesafe.space/xSjwuaSnNYIVMgIONcb2/media/6ab3b5d98bf21de2ae3b42b0.mp4',
        posterUrl: '/images/hero-fallback.jpg',
        ambientTitle: 'ViralMuse',
      },
    }),
  },

  {
    id: 'tpl_stats',
    name: 'Kinetic Stats Counter',
    type: 'stats',
    category: 'Social Proof',
    description: 'Three interactive numeric milestones with spring-animated counters, glowing accents, and high-credibility descriptive copy.',
    badge: 'Homepage Stats',
    iconName: 'BarChart3',
    highlights: ['3 Kinetic Counters', 'Spring Physics Animation', 'Custom Suffixes (+, M, x)', 'Dark Luxury Theme'],
    generateSection: (index: number): PageSection => ({
      id: `sec_stats_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'stats',
      title: 'Kinetic Stats Counter',
      isEnabled: true,
      orderIndex: index,
      data: {
        stat1Value: '15+',
        stat1Label: 'In-House Specialists',
        stat1Desc: 'Organic impressions generated across social channels.',
        stat2Value: '400+',
        stat2Label: 'Influencer Network',
        stat2Desc: 'Curated creators & tastemakers in travel and lifestyle.',
        stat3Value: '150+',
        stat3Label: 'Satisfied Clients',
        stat3Desc: 'Visionary brands & resorts scaled globally.',
      },
    }),
  },

  {
    id: 'tpl_services',
    name: 'Sticky Luxury Services Cards',
    type: 'services',
    category: 'Services & Work',
    description: 'Sticky viewport stacked luxury cards with diagonal swipe reveal, service deliverables tags, numbered indices, and performance growth KPIs.',
    badge: 'Homepage Services',
    iconName: 'Briefcase',
    highlights: ['3 Sticky Stacked Cards', 'Performance Metrics Badges', 'Deliverables Tags', 'Instant Inquiry Trigger'],
    generateSection: (index: number): PageSection => ({
      id: `sec_services_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'services',
      title: 'Sticky Luxury Services',
      isEnabled: true,
      orderIndex: index,
      data: {
        eyebrow: 'Core Capabilities',
        heading: 'Strategic Velocity & Visual Allure',
        items: [
          {
            id: 'srv_1',
            num: '01',
            title: 'High-Impact Content Creation & Direction',
            desc: 'Cinematic 4K reels, lifestyle photography, and aerial drone visuals engineered specifically for high-velocity social algorithmic distribution.',
            tags: ['4K Production', 'Drone Cinematography', 'Editorial Grading', 'Sound Design'],
            metric: '+280%',
            metricLabel: 'Avg. Organic Engagement',
          },
          {
            id: 'srv_2',
            num: '02',
            title: 'Influencer Marketing & Creator Activations',
            desc: 'Curated roster of 400+ vetted luxury travel, hospitality, and lifestyle tastemakers. End-to-end contract negotiation, on-site hosting, and tracking.',
            tags: ['400+ Creator Network', 'Contract Negotiation', 'On-Site Coordination', 'ROI Analytics'],
            metric: '12M+',
            metricLabel: 'Monthly Creator Impressions',
          },
          {
            id: 'srv_3',
            num: '03',
            title: 'Social Media Management & Algorithm Growth',
            desc: 'Full-service channel management across Instagram and TikTok. Trend forecasting, community moderation, daily publishing, and algorithm-driven scheduling.',
            tags: ['Full Management', 'Daily Posting', 'Community Care', 'Weekly Reports'],
            metric: '3.4x',
            metricLabel: 'Follower Velocity Rate',
          },
        ],
      },
    }),
  },

  {
    id: 'tpl_word_marquee',
    name: 'Typographic Word Marquee',
    type: 'word_marquee',
    category: 'Branding & Visuals',
    description: 'Dual-line dynamic typography marquee band (Young / Pink Vibes / Minds) with scroll-driven opposing lateral translations.',
    badge: 'Homepage Marquee',
    iconName: 'Type',
    highlights: ['Dual-Direction Motion', 'Oversized Typography', 'Neon Pink Contrast', 'Scroll-Bound Physics'],
    generateSection: (index: number): PageSection => ({
      id: `sec_marquee_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'word_marquee',
      title: 'Typographic Marquee Band',
      isEnabled: true,
      orderIndex: index,
      data: {
        line1: ['Young', 'Pink Vibes', 'Minds', 'Bold Impact', 'Luxury Orbit'],
        line2: ['Bold Vision', 'Viral Impact', 'Infinite Reach', 'Cinematic Precision'],
      },
    }),
  },

  {
    id: 'tpl_partners',
    name: 'Partners & Client Brand Grid',
    type: 'partners',
    category: 'Social Proof',
    description: 'Five-column luxury brand grid showcasing 15 partner logos with hairline grid borders, high-end hover states, and tier categorization.',
    badge: 'Homepage Partners',
    iconName: 'Users2',
    highlights: ['15 Luxury Brand Logos', 'Hairline Grid Borders', 'SVGs + High-DPI Logos', 'Editorial Eyebrow'],
    generateSection: (index: number): PageSection => ({
      id: `sec_partners_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'partners',
      title: 'Partners & Client Brand Grid',
      isEnabled: true,
      orderIndex: index,
      data: {
        eyebrow: 'Trusted By Visionaries',
        list: [
          { id: 'lumina', name: 'LUMINA', logo: '/images/partners/generic-lumina.svg', alt: 'Lumina Hotels & Resorts' },
          { id: 'aura', name: 'AURA', logo: '/images/partners/generic-aura.svg', alt: 'Aura Alpine Retreats' },
          { id: 'solstice', name: 'SOLSTICE', logo: '/images/partners/generic-solstice.svg', alt: 'Solstice Sanctuary & Spa' },
          { id: 'vanguard', name: 'VANGUARD', logo: '/images/partners/generic-vanguard.svg', alt: 'Vanguard Hotels & Residences' },
          { id: 'atelier', name: 'ATELIER NOIR', logo: '/images/partners/generic-atelier.svg', alt: 'Atelier Noir Paris Milano' },
          { id: 'chroma', name: 'CHROMA', logo: '/images/partners/generic-chroma.svg', alt: 'Chroma Creative Studios' },
          { id: 'valepeak', name: 'VALE & PEAK', logo: '/images/partners/generic-valepeak.svg', alt: 'Vale & Peak Luxury Mountain Lodges' },
          { id: 'kairos', name: 'KAIROS', logo: '/images/partners/generic-kairos.svg', alt: 'Kairos Private Members Club' },
          { id: 'mirage', name: 'MIRAGE', logo: '/images/partners/generic-mirage.svg', alt: 'Mirage Oasis Resort & Spa' },
          { id: 'horizon', name: 'HORIZON', logo: '/images/partners/generic-horizon.svg', alt: 'Horizon Hotel Collection' },
          { id: 'neobotanica', name: 'NEO BOTANICA', logo: '/images/partners/generic-neobotanica.svg', alt: 'Neo Botanica Wellness Destinations' },
          { id: 'celeste', name: 'CELESTE', logo: '/images/partners/generic-celeste.svg', alt: 'Celeste Haute Hospitality' },
          { id: 'orbit', name: 'ORBIT', logo: '/images/partners/generic-orbit.svg', alt: 'Orbit Creator Network' },
          { id: 'silverhorn', name: 'SILVERHORN', logo: '/images/partners/generic-silverhorn.svg', alt: 'Silverhorn Alpine Resort & Spa' },
          { id: 'prism', name: 'PRISM', logo: '/images/partners/generic-prism.svg', alt: 'Prism Luxury Collective' },
        ],
      },
    }),
  },

  {
    id: 'tpl_testimonials',
    name: 'Client Endorsements & Reviews',
    type: 'testimonials',
    category: 'Social Proof',
    description: 'Kinetic letter-scatter header converging smoothly on scroll with 6 horizontal executive endorsement cards with metrics, titles, and locations.',
    badge: 'Homepage Reviews',
    iconName: 'MessageSquareQuote',
    highlights: ['Letter-Scatter Animation', '6 Verified Client Reviews', 'Executive Roles & Cities', 'Conversion Accents'],
    generateSection: (index: number): PageSection => ({
      id: `sec_testimonials_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'testimonials',
      title: 'Client Endorsements & Reviews',
      isEnabled: true,
      orderIndex: index,
      data: {
        eyebrow: 'Client Endorsements',
        heading: 'Real Velocity. Real Impact.',
        items: [
          {
            id: 'test_1',
            company: 'Lumina Grand Hotel & Spa',
            quote: 'Partnering with ViralMuse transformed our digital footprint into our highest-converting reservation channel. Their cinematic 4K production and creator curation delivered over 12M impressions and a 34% surge in direct suite bookings within one season.',
            name: 'Alexander Wright',
            role: 'Chief Executive Officer',
            location: 'Geneva, Switzerland',
          },
          {
            id: 'test_2',
            company: 'Aura Alpine Retreat',
            quote: 'ViralMuse captured the serene essence of our mountain retreat with breathtaking drone cinematography and editorial reels. Their creative energy is infectious, and the booking momentum they generated is measurable on our bottom line.',
            name: 'Sophia Laurent',
            role: 'Co-Founder & General Manager',
            location: 'Courchevel, France',
          },
          {
            id: 'test_3',
            company: 'Maison & Co. Luxury Retail',
            quote: 'ViralMuse is by far the most agile and trend-defining agency we have ever engaged. They don’t just follow social algorithms — they set the visual benchmark for what modern luxury hospitality and boutique retail should look like.',
            name: 'Julian Vance',
            role: 'Global Head of Brand Marketing',
            location: 'Milan, Italy',
          },
          {
            id: 'test_4',
            company: 'Summit Peak Ski & Wellness Resort',
            quote: 'From high-altitude winter activations to viral snow reels that trended internationally across TikTok and Instagram, ViralMuse elevated our mountain resort onto the global stage with world-class production.',
            name: 'Marcus Hayes',
            role: 'Executive Resort Director',
            location: 'Innsbruck, Austria',
          },
          {
            id: 'test_5',
            company: 'Solstice Sanctuary Nature Resort',
            quote: 'The team’s professionalism, aesthetic sensibility, and tier-one influencer network delivered immediate prestige and high-intent engagement for our wellness destination. An indispensable creative growth partner.',
            name: 'Elena Rossi',
            role: 'Managing Director',
            location: 'Lake Como, Italy',
          },
          {
            id: 'test_6',
            company: 'Vanguard Lifestyle Collection',
            quote: 'ViralMuse turned our panoramic boutique spa and signature suites into viral sensations. Their organic strategy generated millions of targeted impressions while preserving our brand’s exclusive luxury allure.',
            name: 'Oliver Chen',
            role: 'Director of Brand Experience',
            location: 'London, United Kingdom',
          },
        ],
      },
    }),
  },

  {
    id: 'tpl_workflow',
    name: '4-Step Strategic Blueprint',
    type: 'workflow',
    category: 'Process',
    description: 'Numbered four-stage strategic delivery framework outlining discovery, creative concept, agile production, and continuous optimization.',
    badge: 'Homepage Workflow',
    iconName: 'GitMerge',
    highlights: ['Numbered 01–04 Phases', 'Deliverable Breakdown', 'Timeline Clarification', 'Clear Client Roadmap'],
    generateSection: (index: number): PageSection => ({
      id: `sec_workflow_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'workflow',
      title: '4-Step Strategic Blueprint',
      isEnabled: true,
      orderIndex: index,
      data: {
        eyebrow: 'Our Blueprint',
        steps: [
          {
            n: '01',
            title: 'Discovery & Vision Mapping',
            copy: 'We unpack your brand DNA, aesthetic benchmarks, key audiences, and ambitious growth targets.',
          },
          {
            n: '02',
            title: 'Creative Concept & Strategy',
            copy: 'We build an actionable content blueprint — visual direction, narrative angles, and creator synergy.',
          },
          {
            n: '03',
            title: 'Production & Seamless Rollout',
            copy: 'Every asset is captured with editorial precision and published at optimal cultural velocity.',
          },
          {
            n: '04',
            title: 'Scaling & Continuous Optimization',
            copy: 'We measure engagement dynamics, audience retention, and conversion metrics to compound your momentum.',
          },
        ],
      },
    }),
  },

  {
    id: 'tpl_closing',
    name: 'Kinetic Finale & Morph Statement',
    type: 'closing',
    category: 'Branding & Visuals',
    description: 'High-voltage finale section with large-scale cinematic typography (AND / GO ICONIC / THEN) and dark atmospheric background photography.',
    badge: 'Homepage Finale',
    iconName: 'Flame',
    highlights: ['Cinematic Finale Punch', 'Oversized Type Stack', 'Atmospheric Background', 'Pre-Footer Climax'],
    generateSection: (index: number): PageSection => ({
      id: `sec_closing_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'closing',
      title: 'Kinetic Finale & Morph Statement',
      isEnabled: true,
      orderIndex: index,
      data: {
        line1: 'And',
        line2: 'Go Iconic',
        line3: 'Then',
        backgroundImage: '/images/go-iconic-hero.jpg',
      },
    }),
  },

  // --------------------------------------------------------------------------
  // EDITORIAL & CALL TO ACTION TEMPLATES
  // --------------------------------------------------------------------------
  {
    id: 'tpl_rich_text',
    name: 'Rich Editorial Content Block',
    type: 'rich_text',
    category: 'Content',
    description: 'Clean typographic editorial layout for case study narratives, brand philosophies, and detailed service descriptions.',
    badge: 'Editorial Block',
    iconName: 'FileText',
    highlights: ['Formatted HTML Typography', 'Custom Section Headings', 'Left / Center Alignment', 'Prose Styling'],
    generateSection: (index: number): PageSection => ({
      id: `sec_rt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'rich_text',
      title: 'Rich Editorial Content',
      isEnabled: true,
      orderIndex: index,
      data: {
        heading: 'Crafting Iconic Visual Footprints',
        content: `
          <p class="text-lg leading-relaxed mb-4">
            We partner exclusively with visionary luxury hotels, Michelin-starred culinary destinations, and haute couture retail concepts who refuse to accept ordinary social presence.
          </p>
          <p class="text-base leading-relaxed text-white/70">
            Our multi-disciplinary team brings together former Hollywood cinematographers, viral social strategists, and world-class creator managers to build bespoke campaigns that dominate international algorithms.
          </p>
        `,
        alignment: 'center',
      },
    }),
  },

  {
    id: 'tpl_cta_banner',
    name: 'High-Impact Call to Action Banner',
    type: 'cta_banner',
    category: 'Call to Action',
    description: 'Prominent conversion banner with neon pink gradient glow, customizable eyebrow tag, compelling copy, and direct inquiry link.',
    badge: 'Lead Generation',
    iconName: 'Megaphone',
    highlights: ['Neon Gradient Card', 'Inquiry Modal Integration', 'Conversion Copy', 'Custom Button Action'],
    generateSection: (index: number): PageSection => ({
      id: `sec_cta_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: 'cta_banner',
      title: 'Call to Action Banner',
      isEnabled: true,
      orderIndex: index,
      data: {
        eyebrow: 'Ready To Scale',
        heading: 'Elevate Your Digital Prestige',
        description: 'Schedule a private consultation with our creative directors to audit your social footprint and map your next breakout campaign.',
        buttonText: 'Book Strategy Call',
        buttonLink: '#inquiry',
      },
    }),
  },
];

// --------------------------------------------------------------------------
// 2. PRE-CONFIGURED FULL PAGE STARTER TEMPLATES
// --------------------------------------------------------------------------

export const PAGE_STARTER_TEMPLATES: PageStarterTemplate[] = [
  {
    id: 'page_tpl_landing',
    name: 'High-Velocity Landing Page',
    description: 'Complete commercial conversion page with Hero Video, Stats, Sticky Services, Testimonials, and High-Impact CTA.',
    badge: '5 Sections',
    recommendedSlug: 'luxury-campaign',
    sectionTypes: ['hero', 'stats', 'services', 'testimonials', 'cta_banner'],
    generateSections: () => {
      const templates = HOMEPAGE_SECTION_TEMPLATES;
      const getTpl = (type: SectionType) => templates.find((t) => t.type === type);
      return [
        getTpl('hero')!.generateSection(0),
        getTpl('stats')!.generateSection(1),
        getTpl('services')!.generateSection(2),
        getTpl('testimonials')!.generateSection(3),
        getTpl('cta_banner')!.generateSection(4),
      ];
    },
  },

  {
    id: 'page_tpl_services_deepdive',
    name: 'Services & Capabilities Deep-Dive',
    description: 'Specialized offering showcase page featuring Hero Video, Sticky Services, 4-Step Blueprint, Reviews, and Finale.',
    badge: '5 Sections',
    recommendedSlug: 'services-overview',
    sectionTypes: ['hero', 'services', 'workflow', 'testimonials', 'closing'],
    generateSections: () => {
      const templates = HOMEPAGE_SECTION_TEMPLATES;
      const getTpl = (type: SectionType) => templates.find((t) => t.type === type);
      return [
        getTpl('hero')!.generateSection(0),
        getTpl('services')!.generateSection(1),
        getTpl('workflow')!.generateSection(2),
        getTpl('testimonials')!.generateSection(3),
        getTpl('closing')!.generateSection(4),
      ];
    },
  },

  {
    id: 'page_tpl_social_proof',
    name: 'Social Proof & Brand Authority',
    description: 'High-credibility page focusing on Verified Client Endorsements, Partner Logos, Kinetic Stats, and CTA.',
    badge: '4 Sections',
    recommendedSlug: 'client-results',
    sectionTypes: ['hero', 'stats', 'partners', 'testimonials', 'cta_banner'],
    generateSections: () => {
      const templates = HOMEPAGE_SECTION_TEMPLATES;
      const getTpl = (type: SectionType) => templates.find((t) => t.type === type);
      return [
        getTpl('hero')!.generateSection(0),
        getTpl('stats')!.generateSection(1),
        getTpl('partners')!.generateSection(2),
        getTpl('testimonials')!.generateSection(3),
        getTpl('cta_banner')!.generateSection(4),
      ];
    },
  },

  {
    id: 'page_tpl_full_homepage_clone',
    name: 'Duplicate Full Homepage Architecture',
    description: 'Instantly imports all 8 sections from the homepage into a brand new standalone page for rapid campaign creation.',
    badge: 'All 8 Homepage Sections',
    recommendedSlug: 'vip-destination',
    sectionTypes: ['hero', 'stats', 'services', 'word_marquee', 'partners', 'testimonials', 'workflow', 'closing'],
    generateSections: () => {
      const types: SectionType[] = [
        'hero',
        'stats',
        'services',
        'word_marquee',
        'partners',
        'testimonials',
        'workflow',
        'closing',
      ];
      return types.map((type, idx) => {
        const tpl = HOMEPAGE_SECTION_TEMPLATES.find((t) => t.type === type);
        return tpl ? tpl.generateSection(idx) : ({} as PageSection);
      });
    },
  },
];

// Helper to clone live sections from an existing page (e.g. current homepage)
export function cloneSectionFromLivePage(sourceSection: PageSection, newIndex: number): PageSection {
  return {
    ...JSON.parse(JSON.stringify(sourceSection)),
    id: `sec_${sourceSection.type}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    orderIndex: newIndex,
    title: sourceSection.title || `${sourceSection.type.toUpperCase()} Section`,
  };
}
