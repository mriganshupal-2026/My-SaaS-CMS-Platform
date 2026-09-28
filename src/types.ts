export type SectionTheme = 'light' | 'dark';

export type LanguageCode = 'EN' | 'DE' | 'IT';

export interface ServiceItem {
  id: string;
  title: string;
  copy: string;
  bg: string;
  theme: SectionTheme;
  textColor: string;
  eyebrowColor: string;
  buttonVariant: 'white' | 'brand';
  mediaType: 'image' | 'video';
  mediaSrc: string;
  badge: string;
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export interface TestimonialItem {
  company: string;
  quote: string;
  name: string;
  role: string;
  location?: string;
}

export interface WorkflowStep {
  n: string;
  title: string;
  copy: string;
}

export interface ProjectInquiryData {
  services: string[];
  name?: string;
  email?: string;
  company?: string;
  details?: string;
}

export interface CookiePreferences {
  necessary: boolean;
  marketing: boolean;
  personalization: boolean;
  analytics: boolean;
}
