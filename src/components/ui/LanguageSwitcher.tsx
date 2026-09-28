import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { LanguageCode } from '../../types';
import { cn } from '../../lib/utils';

interface LanguageSwitcherProps {
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  theme?: 'light' | 'dark';
  variant?: 'navbar' | 'default';
  className?: string;
  dropUp?: boolean;
}

const LANGUAGES: { code: LanguageCode; label: string; full: string }[] = [
  { code: 'DE', label: 'DE', full: 'Deutsch' },
  { code: 'EN', label: 'EN', full: 'English' },
  { code: 'IT', label: 'IT', full: 'Italiano' },
];

export default function LanguageSwitcher({
  currentLang,
  onSelectLang,
  theme = 'dark',
  variant = 'default',
  className = '',
  dropUp = false,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerStyles =
    variant === 'navbar'
      ? 'bg-white text-[#df0567] hover:bg-white/95 shadow-md px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold tracking-wider rounded-full flex items-center gap-1.5 transition-all active:scale-95'
      : cn(
          'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold tracking-wider rounded-full border transition-all duration-200 cursor-pointer',
          theme === 'dark'
            ? 'text-white/90 hover:text-white border-white/40 hover:border-white'
            : 'text-[#df0567] hover:text-[#c4045a] border-[#df0567]/40 hover:border-[#df0567]'
        );

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left select-none', className)}>
      <button
        type="button"
        id="language-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        className={triggerStyles}
        aria-expanded={isOpen}
      >
        <span>{currentLang}</span>
        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className={cn('transition-transform duration-200 text-[#df0567]', isOpen && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: dropUp ? 6 : -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropUp ? 6 : -6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 min-w-[110px] rounded-xl shadow-2xl py-1.5 backdrop-blur-md border border-white/20',
              dropUp ? 'bottom-full mb-2 left-0' : 'top-full mt-2 left-0',
              theme === 'dark'
                ? 'bg-[#181818]/95 text-white'
                : 'bg-white/95 text-[#0A0A0A]'
            )}
          >
            {LANGUAGES.map((lang) => {
              const active = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    onSelectLang(lang.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full px-3 py-1.5 text-xs flex items-center justify-between text-left transition-colors cursor-pointer',
                    active
                      ? 'bg-[#df0567] text-white font-semibold'
                      : theme === 'dark'
                      ? 'hover:bg-white/10 text-white/90'
                      : 'hover:bg-[#df0567]/10 text-[#0A0A0A]'
                  )}
                >
                  <span>{lang.full}</span>
                  {active && <Check size={12} className="shrink-0 ml-2" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
