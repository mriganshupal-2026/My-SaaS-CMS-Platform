export interface PartnerItem {
  id: string;
  name: string;
  logo: string;
  alt: string;
  subtitle?: string;
  badge?: string;
}

export const content = {
  nav: {
    inquiry: 'Get Started',
    menu: 'Menu',
  },
  hero: {
    eyebrow: 'Redefining Digital Presence',
    headline: "COMMAND ATTENTION",
    sub: 'NEXT-GEN CREATOR & SOCIAL MEDIA AGENCY',
  },
  interstitial: 'Make It Iconic',
  stats: [
    { value: 50, suffix: 'M+', label: 'Organic Impressions Generated' },
    { value: 450, suffix: '+', label: 'Curated Creators & Tastemakers' },
    { value: 180, suffix: '+', label: 'Visionary Brands & Resorts Scaled' },
  ],
  services: {
    eyebrow: 'Our Capabilities',
    items: [
      {
        id: 'content-creation',
        title: 'Cinematic Production',
        copy: 'Ultra-crisp 4K reels, drone cinematography, editorial photoshoots, and tailored model casting built to stop thumbs mid-scroll.',
        bg: 'bg-[#df0567]',
        theme: 'dark' as const,
        textColor: 'text-white',
        eyebrowColor: 'text-[#f9b8d2]',
        buttonVariant: 'white' as const,
        mediaType: 'image' as const,
        mediaSrc: '/images/service-cinematic-production.jpg',
        badge: 'Photo & Drone Production',
      },
      {
        id: 'influencer-marketing',
        title: 'Influencer Architecture',
        copy: 'We hand-match your brand with influential creators in luxury travel, food, and lifestyle who turn impressions into booked stays.',
        bg: 'bg-[#f9b8d2]',
        theme: 'light' as const,
        textColor: 'text-[#df0567]',
        eyebrowColor: 'text-[#df0567]/70',
        buttonVariant: 'brand' as const,
        mediaType: 'image' as const,
        mediaSrc: '/images/service-influencer-architecture.jpg',
        badge: 'Creator Roster & Management',
      },
      {
        id: 'social-media-marketing',
        title: 'Growth & Social Strategy',
        copy: 'Full-suite channel direction, cultural trend agility, and conversion-focused storytelling engineered for lasting brand loyalty.',
        bg: 'bg-white',
        theme: 'light' as const,
        textColor: 'text-[#df0567]',
        eyebrowColor: 'text-[#df0567]/70',
        buttonVariant: 'brand' as const,
        mediaType: 'image' as const,
        mediaSrc: '/images/service-social-strategy.jpg',
        badge: 'Strategy & Daily Operations',
      },
    ],
  },
  wordMarquee: ['Bold Vision', 'Viral Impact', 'Infinite Reach'],
  partners: {
    eyebrow: 'Trusted By Visionaries',
    list: [
      {
        id: 'lumina',
        name: 'LUMINA',
        logo: '/images/partners/generic-lumina.svg',
        alt: 'Lumina Hotels & Resorts',
      },
      {
        id: 'aura',
        name: 'AURA',
        logo: '/images/partners/generic-aura.svg',
        alt: 'Aura Alpine Retreats',
      },
      {
        id: 'solstice',
        name: 'SOLSTICE',
        logo: '/images/partners/generic-solstice.svg',
        alt: 'Solstice Sanctuary & Spa',
      },
      {
        id: 'vanguard',
        name: 'VANGUARD',
        logo: '/images/partners/generic-vanguard.svg',
        alt: 'Vanguard Hotels & Residences',
      },
      {
        id: 'atelier',
        name: 'ATELIER NOIR',
        logo: '/images/partners/generic-atelier.svg',
        alt: 'Atelier Noir Paris Milano',
      },
      {
        id: 'chroma',
        name: 'CHROMA',
        logo: '/images/partners/generic-chroma.svg',
        alt: 'Chroma Creative Studios',
      },
      {
        id: 'valepeak',
        name: 'VALE & PEAK',
        logo: '/images/partners/generic-valepeak.svg',
        alt: 'Vale & Peak Luxury Mountain Lodges',
      },
      {
        id: 'kairos',
        name: 'KAIROS',
        logo: '/images/partners/generic-kairos.svg',
        alt: 'Kairos Private Members Club',
      },
      {
        id: 'mirage',
        name: 'MIRAGE',
        logo: '/images/partners/generic-mirage.svg',
        alt: 'Mirage Oasis Resort & Spa',
      },
      {
        id: 'horizon',
        name: 'HORIZON',
        logo: '/images/partners/generic-horizon.svg',
        alt: 'Horizon Hotel Collection',
      },
      {
        id: 'neobotanica',
        name: 'NEO BOTANICA',
        logo: '/images/partners/generic-neobotanica.svg',
        alt: 'Neo Botanica Wellness Destinations',
      },
      {
        id: 'celeste',
        name: 'CELESTE',
        logo: '/images/partners/generic-celeste.svg',
        alt: 'Celeste Haute Hospitality',
      },
      {
        id: 'orbit',
        name: 'ORBIT',
        logo: '/images/partners/generic-orbit.svg',
        alt: 'Orbit Creator Network',
      },
      {
        id: 'silverhorn',
        name: 'SILVERHORN',
        logo: '/images/partners/generic-silverhorn.svg',
        alt: 'Silverhorn Alpine Resort & Spa',
      },
      {
        id: 'prism',
        name: 'PRISM',
        logo: '/images/partners/generic-prism.svg',
        alt: 'Prism Luxury Collective',
      },
    ] as PartnerItem[],
  },
  testimonials: {
    eyebrow: 'Client Endorsements',
    heading: 'Real Velocity. Real Impact.',
    items: [
      {
        company: 'Lumina Grand Hotel & Spa',
        quote:
          'Partnering with ViralMuse transformed our digital footprint into our highest-converting reservation channel. Their cinematic 4K production and creator curation delivered over 12M impressions and a 34% surge in direct suite bookings within one season.',
        name: 'Alexander Wright',
        role: 'Chief Executive Officer',
        location: 'Geneva, Switzerland',
      },
      {
        company: 'Aura Alpine Retreat',
        quote:
          'ViralMuse captured the serene essence of our mountain retreat with breathtaking drone cinematography and editorial reels. Their creative energy is infectious, and the booking momentum they generated is measurable on our bottom line.',
        name: 'Sophia Laurent',
        role: 'Co-Founder & General Manager',
        location: 'Courchevel, France',
      },
      {
        company: 'Maison & Co. Luxury Retail',
        quote:
          'ViralMuse is by far the most agile and trend-defining agency we have ever engaged. They don’t just follow social algorithms — they set the visual benchmark for what modern luxury hospitality and boutique retail should look like.',
        name: 'Julian Vance',
        role: 'Global Head of Brand Marketing',
        location: 'Milan, Italy',
      },
      {
        company: 'Summit Peak Ski & Wellness Resort',
        quote:
          'From high-altitude winter activations to viral snow reels that trended internationally across TikTok and Instagram, ViralMuse elevated our mountain resort onto the global stage with world-class production.',
        name: 'Marcus Hayes',
        role: 'Executive Resort Director',
        location: 'Innsbruck, Austria',
      },
      {
        company: 'Solstice Sanctuary Nature Resort',
        quote:
          'The team’s professionalism, aesthetic sensibility, and tier-one influencer network delivered immediate prestige and high-intent engagement for our wellness destination. An indispensable creative growth partner.',
        name: 'Elena Rossi',
        role: 'Managing Director',
        location: 'Lake Como, Italy',
      },
      {
        company: 'Vanguard Lifestyle Collection',
        quote:
          'ViralMuse turned our panoramic boutique spa and signature suites into viral sensations. Their organic strategy generated millions of targeted impressions while preserving our brand’s exclusive luxury allure.',
        name: 'Oliver Chen',
        role: 'Director of Brand Experience',
        location: 'London, United Kingdom',
      },
    ],
  },
  workflow: {
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
  closing: ['And', 'Go Iconic', 'Then'],
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
} as const;
