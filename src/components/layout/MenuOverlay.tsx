import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Instagram, Phone, ArrowUpRight } from 'lucide-react';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import SocialIconButton from '../ui/SocialIconButton';
import { publicApi } from '../../lib/cms-client';
import type { LanguageCode } from '../../types';
import type { NavigationItem } from '../../types/cms';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInquiry: () => void;
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
}

const DEFAULT_MENU_ITEMS: NavigationItem[] = [
  { id: '1', label: 'Services', url: '#services', orderIndex: 0, isActive: true },
  { id: '2', label: 'Partners', url: '#partners', orderIndex: 1, isActive: true },
  { id: '3', label: 'Reviews', url: '#testimonials', orderIndex: 2, isActive: true },
  { id: '4', label: 'Workflow', url: '#workflow', orderIndex: 3, isActive: true },
  { id: '5', label: 'Editorial', url: '/blog', orderIndex: 4, isActive: true },
];

export default function MenuOverlay({
  isOpen,
  onClose,
  onOpenInquiry,
  currentLang,
  onSelectLang,
}: MenuOverlayProps) {
  const [navItems, setNavItems] = useState<NavigationItem[]>(DEFAULT_MENU_ITEMS);

  useEffect(() => {
    const fetchNav = () => {
      publicApi
        .getNavigation()
        .then((items) => {
          if (items && items.length > 0) {
            setNavItems(items.filter((item) => item.isActive));
          }
        })
        .catch((err) => {
          console.error('Failed to load navigation items:', err);
        });
    };

    if (isOpen) {
      fetchNav();
    }

    const handleNavUpdate = () => fetchNav();
    window.addEventListener('cms-navigation-updated', handleNavUpdate);
    window.addEventListener('cms-page-saved', handleNavUpdate);

    return () => {
      window.removeEventListener('cms-navigation-updated', handleNavUpdate);
      window.removeEventListener('cms-page-saved', handleNavUpdate);
    };
  }, [isOpen]);

  const handleLinkClick = (e: React.MouseEvent, item: NavigationItem) => {
    if (item.target === '_blank' || item.url.startsWith('http://') || item.url.startsWith('https://')) {
      onClose();
      return;
    }
    e.preventDefault();
    onClose();

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
    onClose();
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="fullscreen-menu-overlay"
          initial={{ opacity: 0, y: '-100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '-100%' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 bg-[#df0567] text-white flex flex-col justify-between p-6 sm:p-12 overflow-y-auto"
        >
          {/* Top Bar inside Menu */}
          <div className="flex items-center justify-between max-w-[1600px] mx-auto w-full">
            <a
              href="/"
              onClick={handleLogoClick}
              className="flex flex-col select-none cursor-pointer group"
            >
              <span className="font-headline text-3xl sm:text-4xl tracking-tight leading-none text-white group-hover:scale-[1.02] transition-transform">
                ViralMuse
              </span>
              <span className="text-[10px] tracking-wider uppercase font-medium text-white/80 -mt-1">
                social media agency
              </span>
            </a>

            <div className="flex items-center gap-3">
              {/* WhatsApp Quick Action in Header */}
              <a
                href="https://wa.me/491512345678"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Contact"
                className="h-10 w-10 sm:h-11 sm:w-11 bg-white text-[#df0567] rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-all duration-200"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>

              {/* Close Button */}
              <button
                type="button"
                id="menu-close-btn"
                onClick={onClose}
                aria-label="Close menu"
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-full border border-white/60 bg-white/10 hover:bg-white hover:text-[#df0567] flex items-center justify-center transition-colors duration-200 cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Centered Large Navigation Links & Language Switcher Block */}
          <div className="my-auto py-8 sm:py-12 flex flex-col items-center justify-center gap-5 sm:gap-8 text-center">
            {/* Language Selection Segment in Menu */}
            <div className="flex items-center gap-2 p-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/20 mb-2">
              {(['DE', 'EN', 'IT'] as LanguageCode[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onSelectLang(lang)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wider transition-all duration-200 cursor-pointer ${
                    currentLang === lang
                      ? 'bg-white text-[#df0567] shadow-md scale-105'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Navigation Links */}
            {navItems.map((item, idx) => (
              <motion.a
                key={item.id || item.label}
                href={item.url}
                target={item.target || '_self'}
                onClick={(e) => handleLinkClick(e, item)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + idx * 0.06, duration: 0.35 }}
                className="group inline-flex items-center gap-2 font-headline text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wider uppercase hover:scale-105 transition-transform duration-200 text-white hover:text-white/80 cursor-pointer"
              >
                <span>{item.label}</span>
                {item.url.startsWith('/p/') && (
                  <ArrowUpRight className="w-5 h-5 sm:w-7 sm:h-7 opacity-50 group-hover:opacity-100 transition-opacity" />
                )}
              </motion.a>
            ))}

            {/* Actions: Inquiry & WhatsApp buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 sm:mt-6">
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.35 }}
                onClick={() => {
                  onClose();
                  onOpenInquiry();
                }}
                className="px-7 py-3 rounded-full bg-white text-[#df0567] font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-white/95 hover:scale-[1.02] active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                {currentLang === 'IT' ? '→ INIZIA ORA' : '→ GET STARTED'}
              </motion.button>

              <motion.a
                href="https://wa.me/491512345678"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.35 }}
                className="px-6 py-3 rounded-full border border-white/80 text-white font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-white hover:text-[#df0567] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Phone size={14} className="fill-current" />
                <span>WhatsApp</span>
              </motion.a>
            </div>
          </div>

          {/* Footer of Menu Overlay */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-[1600px] mx-auto w-full pt-6 border-t border-white/20 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <SocialIconButton
                theme="dark"
                size="sm"
                label="Instagram"
                href="https://instagram.com"
                icon={<Instagram size={14} />}
              />
              <SocialIconButton
                theme="dark"
                size="sm"
                label="WhatsApp"
                href="https://wa.me/491512345678"
                icon={<Phone size={14} className="fill-current" />}
              />
              <LanguageSwitcher
                currentLang={currentLang}
                onSelectLang={onSelectLang}
                theme="dark"
                dropUp
              />
            </div>

            <div className="text-white/80">
              © {new Date().getFullYear()} ViralMuse Social Media Agency. All rights reserved.
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
