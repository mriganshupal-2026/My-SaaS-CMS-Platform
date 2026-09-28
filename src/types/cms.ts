export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'VIEWER' | 'CUSTOM';

export interface UserPermissions {
  canManagePages?: boolean;
  canManageArticles?: boolean;
  canManageMedia?: boolean;
  canManageInquiries?: boolean;
  canManageNavigation?: boolean;
  canManageSettings?: boolean;
  canManageUsers?: boolean;
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  permissions?: UserPermissions;
  isActive: boolean;
  lastLoginAt?: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  createdAt: string;
  updatedAt: string;
}

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface SeoMetadata {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: string;
  noIndex?: boolean;
}

export type SectionType =
  | 'hero'
  | 'stats'
  | 'services'
  | 'word_marquee'
  | 'partners'
  | 'testimonials'
  | 'workflow'
  | 'closing'
  | 'rich_text'
  | 'cta_banner';

export interface BaseSection {
  id: string;
  type: SectionType;
  title: string;
  isEnabled: boolean;
  orderIndex: number;
}

export interface HeroSectionData extends BaseSection {
  type: 'hero';
  data: {
    scriptText: string;
    mainHeadline: string;
    subscriptText: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
    videoUrl: string;
    posterUrl: string;
    ambientTitle: string;
  };
}

export interface StatsSectionData extends BaseSection {
  type: 'stats';
  data: {
    stat1Value: string;
    stat1Label: string;
    stat1Desc: string;
    stat2Value: string;
    stat2Label: string;
    stat2Desc: string;
    stat3Value: string;
    stat3Label: string;
    stat3Desc: string;
  };
}

export interface ServiceItem {
  id: string;
  num: string;
  title: string;
  desc: string;
  tags: string[];
  metric: string;
  metricLabel: string;
}

export interface ServicesSectionData extends BaseSection {
  type: 'services';
  data: {
    eyebrow: string;
    heading: string;
    items: ServiceItem[];
  };
}

export interface WordMarqueeSectionData extends BaseSection {
  type: 'word_marquee';
  data: {
    line1: string[];
    line2: string[];
  };
}

export interface PartnerItem {
  id: string;
  name: string;
  logo: string;
  alt: string;
  url?: string;
}

export interface PartnersSectionData extends BaseSection {
  type: 'partners';
  data: {
    eyebrow: string;
    list: PartnerItem[];
  };
}

export interface TestimonialItem {
  id: string;
  company: string;
  quote: string;
  name: string;
  role: string;
  location: string;
  avatar?: string;
}

export interface TestimonialsSectionData extends BaseSection {
  type: 'testimonials';
  data: {
    eyebrow: string;
    heading: string;
    items: TestimonialItem[];
  };
}

export interface WorkflowStep {
  n: string;
  title: string;
  copy: string;
}

export interface WorkflowSectionData extends BaseSection {
  type: 'workflow';
  data: {
    eyebrow: string;
    steps: WorkflowStep[];
  };
}

export interface ClosingSectionData extends BaseSection {
  type: 'closing';
  data: {
    line1: string;
    line2: string;
    line3: string;
    backgroundImage: string;
  };
}

export interface RichTextSectionData extends BaseSection {
  type: 'rich_text';
  data: {
    heading?: string;
    content: string;
    alignment?: 'left' | 'center';
  };
}

export interface CtaBannerSectionData extends BaseSection {
  type: 'cta_banner';
  data: {
    eyebrow?: string;
    heading: string;
    description?: string;
    buttonText: string;
    buttonLink: string;
  };
}

export type PageSection =
  | HeroSectionData
  | StatsSectionData
  | ServicesSectionData
  | WordMarqueeSectionData
  | PartnersSectionData
  | TestimonialsSectionData
  | WorkflowSectionData
  | ClosingSectionData
  | RichTextSectionData
  | CtaBannerSectionData;

export interface Page {
  id: string;
  title: string;
  slug: string;
  isHomepage: boolean;
  status: ContentStatus;
  sections: PageSection[];
  seo: SeoMetadata;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  category: string;
  tags: string[];
  status: ContentStatus;
  seo: SeoMetadata;
  readingTime?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  target?: '_self' | '_blank';
  orderIndex: number;
  isActive: boolean;
  parentId?: string;
}

export interface FooterLinkItem {
  id?: string;
  label: string;
  href: string;
  target?: '_self' | '_blank';
}

export interface FooterSocialSettings {
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
}

export interface FooterSettings {
  headline?: string;
  email?: string;
  logoTitle?: string;
  logoSubtitle?: string;
  showNavigation?: boolean;
  navigationTitle?: string;
  social?: FooterSocialSettings;
  links?: FooterLinkItem[];
  credits?: string;
  backgroundColor?: string;
  showLanguageSwitcher?: boolean;
}

export interface InquiryFormSettings {
  badge?: string;
  headline?: string;
  description?: string;
  backgroundColor?: string;
  fieldBackgroundColor?: string;
  fieldBorderColor?: string;
  fieldFocusBorderColor?: string;
  fieldBorderWidth?: string;
  fieldBorderStyle?: string;
  fieldTextColor?: string;
  fieldPlaceholderColor?: string;
  fieldLabelColor?: string;
  fieldBorderRadius?: string;
  dividerBorderColor?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  checkboxBorderColor?: string;
  checkboxActiveBorderColor?: string;
  checkboxActiveBgColor?: string;
  checkboxCheckColor?: string;
  checkboxBorderRadius?: string;
  serviceCardBackgroundColor?: string;
  serviceCardBorderColor?: string;
  serviceCardActiveBackgroundColor?: string;
  serviceCardActiveBorderColor?: string;
  serviceCardActiveTextColor?: string;
  budgetPillBgColor?: string;
  budgetPillBorderColor?: string;
  budgetPillTextColor?: string;
  budgetPillActiveBgColor?: string;
  budgetPillActiveBorderColor?: string;
  budgetPillActiveTextColor?: string;
  servicesTitle?: string;
  showServices?: boolean;
  services?: string[];
  nameLabel?: string;
  namePlaceholder?: string;
  companyLabel?: string;
  companyPlaceholder?: string;
  showCompany?: boolean;
  emailLabel?: string;
  emailPlaceholder?: string;
  phoneLabel?: string;
  phonePlaceholder?: string;
  showPhone?: boolean;
  budgetLabel?: string;
  showBudget?: boolean;
  budgetOptions?: string[];
  messageLabel?: string;
  messagePlaceholder?: string;
  submitButtonText?: string;
  submittingText?: string;
  successBadge?: string;
  successTitle?: string;
  successMessage?: string;
  successButtonText?: string;
  responsePromiseText?: string;
  contactEmail?: string;
}

export interface SiteSettings {
  siteUrl?: string;
  siteName?: string;
  tagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  resendApiKey?: string;
  emailSender?: string;
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
    whatsapp?: string;
    linkedin?: string;
    youtube?: string;
    twitter?: string;
  };
  general?: {
    siteName?: string;
    siteDescription?: string;
    siteUrl?: string;
    logoUrl?: string;
    faviconUrl?: string;
    contactEmail?: string;
    phone?: string;
    address?: string;
  };
  social?: {
    instagram?: string;
    tiktok?: string;
    whatsapp?: string;
    linkedin?: string;
    youtube?: string;
    twitter?: string;
  };
  footer?: FooterSettings;
  inquiryForm?: InquiryFormSettings;
  seoDefaults: SeoMetadata;
}

export interface ProjectInquiry {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  service: string;
  budget?: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'ARCHIVED';
  createdAt: string;
}

export interface RedirectRule {
  id: string;
  source: string;
  destination: string;
  sourcePath?: string;
  targetPath?: string;
  statusCode: number;
  isActive: boolean;
  createdAt?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  userName?: string;
  action: string;
  entityType: 'page' | 'article' | 'media' | 'navigation' | 'settings' | 'inquiry' | 'auth';
  entityId?: string;
  details?: string;
  createdAt: string;
}
