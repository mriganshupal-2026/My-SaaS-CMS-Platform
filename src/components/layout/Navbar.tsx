import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import type { LanguageCode, SectionTheme } from '../../types';

interface NavbarProps {
  theme?: SectionTheme;
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  onOpenInquiry: () => void;
  onOpenMenu: () => void;
}

export default function Navbar({
  currentLang,
  onSelectLang,
  onOpenInquiry,
  onOpenMenu,
}: NavbarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLogoVisible, setIsLogoVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show navbar and logo near the top of the page
      if (currentScrollY < 60) {
        setIsVisible(true);
        setIsLogoVisible(true);
      } else if (currentScrollY > lastScrollY.current + 8) {
        // Scrolling down -> hide navbar and logo
        setIsVisible(false);
        setIsLogoVisible(false);
      } else if (currentScrollY < lastScrollY.current - 8) {
        // Scrolling up -> show navbar, but hide the logo
        setIsVisible(true);
        setIsLogoVisible(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <header
      id="main-navbar"
      className={`fixed top-4 inset-x-4 sm:top-6 sm:inset-x-6 lg:top-7 z-40 pointer-events-none select-none transition-all duration-300 ease-in-out ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-28 opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative max-w-[1700px] mx-auto flex items-center justify-between min-h-11 sm:min-h-12">
        {/* ======================================================== */}
        {/* MOBILE & TABLET VIEW (< lg): Left Logo + Right Circular Hamburger */}
        {/* ======================================================== */}
        <div className="lg:hidden flex items-center justify-between w-full pointer-events-auto">
          {/* Mobile/Tablet Logo on the left */}
          <a
            href="/"
            onClick={handleLogoClick}
            id="nav-logo-mobile"
            className={`flex flex-col items-start select-none group cursor-pointer transition-all duration-300 ease-in-out ${
              isLogoVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
            }`}
          >
            <span className="font-headline text-3xl sm:text-4xl md:text-5xl text-[#df0567] tracking-tight uppercase leading-[0.82] font-black drop-shadow-sm">
              ViralMuse
            </span>
            <span className="font-script text-xs sm:text-sm md:text-base text-[#df0567] font-bold tracking-tight lowercase leading-none mt-0.5 sm:mt-1">
              social media agency
            </span>
          </a>

          {/* Mobile/Tablet Circular Menu Button with Pink Two-Line Hamburger */}
          <button
            id="nav-mobile-menu-btn"
            type="button"
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-white hover:bg-white/95 text-[#df0567] rounded-full shadow-lg flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="w-4 sm:w-5 h-[2px] bg-[#df0567] rounded-full" />
            <span className="w-4 sm:w-5 h-[2px] bg-[#df0567] rounded-full" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP VIEW (lg+): Left Cluster, Center Logo, Right Pill */}
        {/* ======================================================== */}
        {/* Left cluster: [→ PROJECT INQUIRY] (WhatsApp) [DE ⌄] */}
        <div className="hidden lg:flex items-center gap-2 sm:gap-2.5 pointer-events-auto z-10">
          {/* Project Inquiry Pill */}
          <button
            id="nav-project-inquiry-btn"
            type="button"
            onClick={onOpenInquiry}
            className="h-10 sm:h-11 px-4 sm:px-6 bg-white hover:bg-white/95 text-[#df0567] rounded-full shadow-lg flex items-center gap-2 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <ArrowRight size={15} strokeWidth={2.5} className="text-[#df0567] shrink-0" />
            <span>
              {currentLang === 'IT' ? 'INIZIA ORA' : 'GET STARTED'}
            </span>
          </button>

          {/* WhatsApp Circular Button */}
          <a
            id="nav-whatsapp-btn"
            href="https://wa.me/491512345678"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Contact"
            className="h-10 w-10 sm:h-11 sm:w-11 bg-white hover:bg-white/95 text-[#df0567] rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            <svg
              className="w-4 h-4 sm:w-[18px] sm:h-[18px] fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </a>

          {/* Language Switcher Pill */}
          <LanguageSwitcher
            currentLang={currentLang}
            onSelectLang={onSelectLang}
            variant="navbar"
          />
        </div>

        {/* Center Logo: Strictly centered on desktop */}
        <a
          href="/"
          onClick={handleLogoClick}
          id="nav-logo"
          className={`hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center select-none group cursor-pointer px-2 z-20 text-center mt-2 sm:mt-3 pt-1 transition-all duration-300 ease-in-out ${
            isLogoVisible ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <span className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#df0567] tracking-tight uppercase leading-[0.82] font-black group-hover:scale-105 transition-transform duration-200 drop-shadow-sm">
            ViralMuse
          </span>
          <span className="font-script text-sm sm:text-lg md:text-xl lg:text-2xl text-[#df0567] font-bold tracking-tight lowercase leading-none mt-0.5 sm:mt-1 group-hover:scale-105 transition-transform duration-200">
            social media agency
          </span>
        </a>

        {/* Right Action: [→ MENU] on desktop */}
        <div className="hidden lg:flex items-center gap-2 pointer-events-auto z-10">
          <button
            id="nav-menu-btn"
            type="button"
            onClick={onOpenMenu}
            className="h-10 sm:h-11 px-5 sm:px-6 bg-white hover:bg-white/95 text-[#df0567] rounded-full shadow-lg flex items-center gap-2 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <ArrowRight size={15} strokeWidth={2.5} className="text-[#df0567] shrink-0" />
            <span>MENU</span>
          </button>
        </div>
      </div>
    </header>
  );
}
