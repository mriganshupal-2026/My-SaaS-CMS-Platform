export interface MetaTagOptions {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
}

export const CANONICAL_BASE_URL = 'https://viral-agency-cinematic-social-influencer-agency.ai.studio';

export function updatePageSeo(options: MetaTagOptions = {}) {
  if (typeof document === 'undefined') return;

  const defaultTitle = 'ViralMuse — Social Media Agency';
  const title = options.title
    ? (options.title.includes('ViralMuse') ? options.title : `${options.title} — ViralMuse`)
    : defaultTitle;
  document.title = title;

  const defaultDesc =
    'Premier luxury hospitality and travel social media, 4K cinematic production & influencer architecture agency.';
  const description = options.description || defaultDesc;

  let canonical = options.canonicalUrl || CANONICAL_BASE_URL;
  if (!canonical.startsWith('http')) {
    canonical = `${CANONICAL_BASE_URL}${canonical.startsWith('/') ? '' : '/'}${canonical}`;
  }

  let ogImage = options.ogImage || `${CANONICAL_BASE_URL}/og-image.jpg`;
  if (!ogImage.startsWith('http')) {
    ogImage = `${CANONICAL_BASE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
  }

  const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('name', 'description', description);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', canonical);
  setMeta('property', 'og:image', ogImage);
  setMeta('property', 'og:image:secure_url', ogImage);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', ogImage);

  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonical);
}
