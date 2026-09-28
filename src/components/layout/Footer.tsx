import React, { useState, useEffect } from 'react';
import { Instagram, ArrowUpRight, Linkedin, Youtube } from 'lucide-react';
import SocialIconButton from '../ui/SocialIconButton';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { content } from '../../lib/content';
import { publicApi } from '../../lib/cms-client';
import type { LanguageCode } from '../../types';
import type { NavigationItem, SiteSettings, FooterSettings } from '../../types/cms';

interface FooterProps {
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
}

const DEFAULT_FOOTER_NAV: NavigationItem[] = [
  { id: 'nav_1', label: 'Services', url: '#services', orderIndex: 0, isActive: true },
  { id: 'nav_2', label: 'Partners', url: '#partners', orderIndex: 1, isActive: true },
  { id: 'nav_3', label: 'Reviews', url: '#testimonials', orderIndex: 2, isActive: true },
  { id: 'nav_4', label: 'Blueprint', url: '#blueprint', orderIndex: 3, isActive: true },
  { id: 'nav_5', label: 'Editorial', url: '/blog', orderIndex: 4, isActive: true },
];

export default function Footer({ currentLang, onSelectLang }: FooterProps) {
  const [navItems, setNavItems] = useState<NavigationItem[]>(DEFAULT_FOOTER_NAV);
  const [footerSettings, setFooterSettings] = useState<FooterSettings | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = () => {
      publicApi
        .getNavigation()
        .then((items) => {
          if (isMounted && items && items.length > 0) {
            setNavItems(items.filter((i) => i.isActive));
          }
        })
        .catch(() => {});

      publicApi
        .getSettings()
        .then((settings: SiteSettings) => {
          if (isMounted && settings?.footer) {
            setFooterSettings(settings.footer);
          }
        })
        .catch(() => {});
    };

    fetchAllData();

    // Listen for CMS navigation and settings update events
    const handleNavChange = () => fetchAllData();
    const handleSettingsChange = (e: any) => {
      if (e?.detail?.footer) {
        setFooterSettings(e.detail.footer);
      } else {
        fetchAllData();
      }
    };

    window.addEventListener('cms-navigation-updated', handleNavChange);
    window.addEventListener('cms-settings-updated', handleSettingsChange);
    window.addEventListener('cms-page-saved', handleNavChange);

    return () => {
      isMounted = false;
      window.removeEventListener('cms-navigation-updated', handleNavChange);
      window.removeEventListener('cms-settings-updated', handleSettingsChange);
      window.removeEventListener('cms-page-saved', handleNavChange);
    };
  }, []);

  const handleNavClick = (e: React.MouseEvent, item: NavigationItem | { url: string; target?: string }) => {
    if (item.target === '_blank' || item.url.startsWith('http://') || item.url.startsWith('https://')) {
      return;
    }
    e.preventDefault();

    if (item.url.startsWith('#')) {
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/' + item.url);
        window.dispatchEvent(new PopStateEvent('popstate'));
        setTimeout(() => {
          const el = document.querySelector(item.url);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.querySelector(item.url);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.history.pushState({}, '', item.url);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Resolved dynamic values
  const headline = footerSettings?.headline?.trim() || content.footer.headline;
  const email = footerSettings?.email?.trim() || content.footer.email;
  const logoTitle = footerSettings?.logoTitle?.trim() || 'ViralMuse';
  const logoSubtitle = footerSettings?.logoSubtitle?.trim() || 'social media agency';
  const showNavStrip = footerSettings?.showNavigation !== false;
  const navTitle = footerSettings?.navigationTitle?.trim() || 'Global Navigation & Pages';
  const credits = footerSettings?.credits?.trim() || content.footer.credits;
  const showLangSwitch = footerSettings?.showLanguageSwitcher !== false;
  const bgColor = footerSettings?.backgroundColor || '#df0567';

  // Resolved social links
  const instagramUrl = footerSettings?.social?.instagram || 'https://instagram.com';
  const tiktokUrl = footerSettings?.social?.tiktok || 'https://tiktok.com';
  const whatsappUrl = footerSettings?.social?.whatsapp || 'https://wa.me/491512345678';
  const linkedinUrl = footerSettings?.social?.linkedin;
  const youtubeUrl = footerSettings?.social?.youtube;
  const twitterUrl = footerSettings?.social?.twitter;

  // Resolved legal links
  const legalLinks = footerSettings?.links && footerSettings.links.length > 0
    ? footerSettings.links
    : content.footer.links;

  return (
    <footer
      id="contact"
      data-theme="dark"
      style={{ backgroundColor: bgColor }}
      className="relative text-white pt-24 pb-12 overflow-hidden select-none transition-colors duration-300"
    >
      {/* Giant Full-Width Headline: LET'S WORK TOGETHER (Edge-to-Edge) */}
      <div className="w-full overflow-hidden text-center mb-12 sm:mb-16 px-0 py-2 sm:py-3">
        <h2 className="font-headline text-[13.2vw] sm:text-[13.8vw] md:text-[14.2vw] lg:text-[14.5vw] leading-[0.92] tracking-[0.01em] uppercase text-white font-bold block whitespace-nowrap select-none drop-shadow-xs pb-2 sm:pb-3">
          {headline}
        </h2>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 flex flex-col items-center text-center">
        {/* Centered Email */}
        {email && (
          <a
            href={`mailto:${email}`}
            id="footer-email-link"
            className="text-lg sm:text-2xl md:text-3xl font-normal tracking-wide text-white/95 hover:text-white underline underline-offset-8 transition-colors mb-12 inline-block cursor-pointer"
          >
            {email}
          </a>
        )}

        {/* Global Navigation Pages Strip */}
        {showNavStrip && navItems.length > 0 && (
          <div className="w-full max-w-5xl mb-14 sm:mb-18 px-4">
            <div className="text-[11px] uppercase font-bold tracking-widest text-white/60 mb-4 font-mono">
              {navTitle}
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-8">
              {navItems.map((item) => (
                <a
                  key={item.id || item.url}
                  href={item.url}
                  target={item.target || '_self'}
                  onClick={(e) => handleNavClick(e, item)}
                  className="group inline-flex items-center gap-1.5 text-sm sm:text-base md:text-lg font-bold uppercase tracking-wider text-white hover:text-white/80 transition-colors cursor-pointer"
                >
                  <span>{item.label}</span>
                  {item.url.startsWith('/p/') && (
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  )}
                </a>
              ))}
            </nav>
          </div>
        )}

        {/* Large Social Icons matching reference screenshot with center expanding ripple hover */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-10 mb-14 sm:mb-20">
          {instagramUrl && (
            <SocialIconButton
              id="footer-social-instagram"
              size="2xl"
              theme="dark"
              label="Instagram"
              href={instagramUrl}
              icon={<Instagram className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 stroke-[1.75]" />}
            />
          )}

          {/* TikTok Icon */}
          {tiktokUrl && (
            <SocialIconButton
              id="footer-social-tiktok"
              size="2xl"
              theme="dark"
              label="TikTok"
              href={tiktokUrl}
              icon={
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-.88-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.86-4.5V8.84a8.18 8.18 0 0 0 4.77 1.52V6.9a4.85 4.85 0 0 1-1-.21z" />
                </svg>
              }
            />
          )}

          {/* WhatsApp Icon */}
          {whatsappUrl && (
            <SocialIconButton
              id="footer-social-whatsapp"
              size="2xl"
              theme="dark"
              label="WhatsApp"
              href={whatsappUrl}
              icon={
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              }
            />
          )}

          {/* LinkedIn Icon */}
          {linkedinUrl && (
            <SocialIconButton
              id="footer-social-linkedin"
              size="2xl"
              theme="dark"
              label="LinkedIn"
              href={linkedinUrl}
              icon={<Linkedin className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10" />}
            />
          )}

          {/* YouTube Icon */}
          {youtubeUrl && (
            <SocialIconButton
              id="footer-social-youtube"
              size="2xl"
              theme="dark"
              label="YouTube"
              href={youtubeUrl}
              icon={<Youtube className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11" />}
            />
          )}

          {/* Twitter / X Icon */}
          {twitterUrl && (
            <SocialIconButton
              id="footer-social-twitter"
              size="2xl"
              theme="dark"
              label="X"
              href={twitterUrl}
              icon={
                <svg className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              }
            />
          )}
        </div>

        {/* Large Logo matching reference screenshot */}
        <a
          href="/"
          onClick={handleLogoClick}
          className="flex flex-col items-center mb-16 sm:mb-24 text-center cursor-pointer group"
        >
          <span className="font-headline text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-none text-white block select-none group-hover:scale-[1.02] transition-transform duration-200">
            {logoTitle}
          </span>
          <span className="font-sans text-base sm:text-xl md:text-2xl tracking-[0.04em] text-white lowercase leading-tight font-normal mt-1 sm:mt-2 block select-none group-hover:scale-[1.02] transition-transform duration-200">
            {logoSubtitle}
          </span>
        </a>

        {/* Sub-footer Bar */}
        <div className="w-full pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-6 text-xs sm:text-sm text-white/80">
          {/* Left: Legal Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
            {legalLinks.map((link: any, idx: number) => (
              <a
                key={link.id || link.label || idx}
                href={link.href || link.url || '#'}
                target={link.target || '_self'}
                onClick={(e) => handleNavClick(e, { url: link.href || link.url || '#', target: link.target })}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Center: Language Switcher */}
          {showLangSwitch && (
            <div className="flex items-center gap-2">
              <LanguageSwitcher
                currentLang={currentLang}
                onSelectLang={onSelectLang}
                theme="dark"
                dropUp
              />
            </div>
          )}

          {/* Right: Credits */}
          <div>{credits}</div>
        </div>
      </div>
    </footer>
  );
}

