import { useRef, useState, useEffect, type RefObject } from 'react';
import type { LanguageCode } from '../../types';

interface ServicesStickyProps {
  currentLang?: LanguageCode;
  onOpenInquiry: (serviceName?: string) => void;
  data?: {
    eyebrow?: string;
    heading?: string;
    items?: Array<{
      id?: string;
      title?: string;
      desc?: string;
      badge?: string;
      metric?: string;
      metricLabel?: string;
      image?: string;
    }>;
  };
}

// Hook to calculate right-to-left image reveal based on viewport scroll
function useCardImageReveal(cardRef: RefObject<HTMLDivElement | null>, isFirstCard = false) {
  const [clipPath, setClipPath] = useState(isFirstCard ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 0% 65%)');

  useEffect(() => {
    const handleScroll = () => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;

      if (isFirstCard) {
        // Card 1 starts slightly narrow when first entering, reaches 100% full-width quickly
        if (rect.top > windowH * 0.4) {
          setClipPath('inset(0% 0% 0% 55%)');
        } else {
          const progress = Math.min(Math.max((windowH * 0.4 - rect.top) / (windowH * 0.3), 0), 1);
          setClipPath(`inset(0% 0% 0% ${55 * (1 - progress)}%)`);
        }
      } else {
        // Card 2 & 3: starts narrow (65%) at the bottom, reaches 100% full width when in middle of the page
        const start = windowH;
        const end = windowH * 0.45; // middle of the page

        if (rect.top >= start) {
          setClipPath('inset(0% 0% 0% 65%)');
        } else if (rect.top <= end) {
          // Reached middle of page -> 100% full width of column
          setClipPath('inset(0% 0% 0% 0%)');
        } else {
          const progress = (start - rect.top) / (start - end);
          setClipPath(`inset(0% 0% 0% ${65 * (1 - progress)}%)`);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [cardRef, isFirstCard]);

  return clipPath;
}

export default function ServicesSticky({
  currentLang = 'DE',
  onOpenInquiry,
  data,
}: ServicesStickyProps) {
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  const card1Clip = useCardImageReveal(card1Ref, true);
  const card2Clip = useCardImageReveal(card2Ref, false);
  const card3Clip = useCardImageReveal(card3Ref, false);

  const buttonText =
    currentLang === 'IT'
      ? 'INIZIA ORA'
      : 'GET STARTED';

  // Section title: Display "OUR SERVICES" matching brand typography and design, or CMS heading
  const defaultServicesTitle =
    currentLang === 'IT'
      ? 'I NOSTRI SERVIZI'
      : 'OUR SERVICES';

  const servicesTitle = data?.heading || defaultServicesTitle;

  const item1 = data?.items?.[0];
  const item2 = data?.items?.[1];
  const item3 = data?.items?.[2];

  const title1 = item1?.title || 'Cinematic\nProduction';
  const desc1 = item1?.desc || 'Photos, reels, drone videos, image campaigns & tailored model casting.';

  const title2 = item2?.title || 'Influencer\nArchitecture';
  const desc2 = item2?.desc || 'Curating elite tastemakers across lifestyle, hospitality, and culinary culture.';

  const title3 = item3?.title || 'Growth &\nSocial Strategy';
  const desc3 = item3?.desc || 'We engineer tailor-made growth strategies, spot cultural trends and elevate your brand\'s digital presence.';

  return (
    <section id="services" className="relative w-full select-none bg-[#df0567]">
      {/* ========================================================= */}
      {/* DEDICATED FULL-WIDTH "OUR SERVICES" SECTION HEADER       */}
      {/* ========================================================= */}
      <div className="w-full bg-[#df0567] pt-16 sm:pt-24 lg:pt-32 pb-10 sm:pb-14 lg:pb-16 px-0 py-2 sm:py-4 text-center overflow-hidden">
        <h2
          id="services-headline"
          className="font-headline text-[18.2vw] sm:text-[19vw] md:text-[19.8vw] leading-[0.9] sm:leading-[0.88] tracking-[0.01em] uppercase text-white font-bold block whitespace-nowrap drop-shadow-xs pb-2 sm:pb-3"
        >
          {servicesTitle}
        </h2>
      </div>

      {/* ========================================================= */}
      {/* CARD 1: CINEMATIC PRODUCTION (Pink Background, White Text) */}
      {/* ========================================================= */}
      <div
        ref={card1Ref}
        data-theme="dark"
        className="sticky top-0 h-screen w-full z-10 bg-[#df0567] text-white flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 overflow-hidden"
      >
        <div className="max-w-[1700px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
          {/* Left Column: Title, Button, Description */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h3 className="font-sans font-bold text-5xl sm:text-6xl md:text-7xl lg:text-[5.5vw] tracking-tight leading-[0.95] text-white whitespace-pre-line">
              {title1}
            </h3>

            <div className="mt-6 sm:mt-8">
              <button
                type="button"
                onClick={() => onOpenInquiry(title1.replace('\n', ' '))}
                className="h-11 sm:h-12 px-6 sm:px-8 bg-white hover:bg-white/95 text-[#df0567] rounded-full shadow-md flex items-center gap-2.5 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <span className="text-base font-bold leading-none">→</span>
                <span>{buttonText}</span>
              </button>
            </div>

            <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl lg:text-2xl font-normal leading-snug text-white max-w-lg">
              {desc1}
            </p>
          </div>

          {/* Right Column: Image expanding Right to Left (Full width of column in middle) */}
          <div className="lg:col-span-7 w-full flex justify-end items-center">
            <div
              style={{ clipPath: card1Clip }}
              className="w-full aspect-[16/10] max-h-[65vh] sm:max-h-[70vh] overflow-hidden rounded-none shadow-2xl bg-black/20 transition-[clip-path] duration-150 ease-out will-change-transform"
            >
              <img
                src={item1?.image || '/images/service-cinematic-production.jpg'}
                alt="Cinematic Production - Film Set & Editorial Photoshoot"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/service-tennis.jpg';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CARD 2: INFLUENCER ARCHITECTURE (Light Pink, Deep Pink) */}
      {/* ========================================================= */}
      <div
        ref={card2Ref}
        data-theme="light"
        className="sticky top-0 h-screen w-full z-20 bg-[#f9b8d2] text-[#df0567] shadow-[0_-25px_60px_rgba(0,0,0,0.22)] flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 overflow-hidden"
      >
        <div className="max-w-[1700px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
          {/* Left Column: Title, White Button, Description */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h3 className="font-sans font-bold text-5xl sm:text-6xl md:text-7xl lg:text-[5.5vw] tracking-tight leading-[0.95] text-[#df0567] whitespace-pre-line">
              {title2}
            </h3>

            <div className="mt-6 sm:mt-8">
              {/* White pill button with pink text */}
              <button
                type="button"
                onClick={() => onOpenInquiry(title2.replace('\n', ' '))}
                className="h-11 sm:h-12 px-6 sm:px-8 bg-white hover:bg-white/95 text-[#df0567] rounded-full shadow-md flex items-center gap-2.5 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <span className="text-base font-bold leading-none">→</span>
                <span>{buttonText}</span>
              </button>
            </div>

            <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl lg:text-2xl font-normal leading-snug text-[#df0567] max-w-lg">
              {desc2}
            </p>
          </div>

          {/* Right Column: Image expanding Right to Left (Full width of column in middle) */}
          <div className="lg:col-span-7 w-full flex justify-end items-center">
            <div
              style={{ clipPath: card2Clip }}
              className="w-full aspect-[16/10] max-h-[65vh] sm:max-h-[70vh] overflow-hidden rounded-none shadow-2xl bg-black/10 transition-[clip-path] duration-150 ease-out will-change-transform"
            >
              <img
                src={item2?.image || '/images/service-influencer-architecture.jpg'}
                alt="Influencer Architecture - Luxury Creators & Tastemakers"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/service-influencer-marketing.jpg';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CARD 3: GROWTH & SOCIAL STRATEGY (Pure White, Deep Pink)  */}
      {/* ========================================================= */}
      <div
        ref={card3Ref}
        data-theme="light"
        className="sticky top-0 h-screen w-full z-30 bg-white text-[#df0567] shadow-[0_-25px_60px_rgba(0,0,0,0.22)] flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 overflow-hidden"
      >
        <div className="max-w-[1700px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
          {/* Left Column: Title, White Button with border/shadow, Description */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h3 className="font-sans font-bold text-5xl sm:text-6xl md:text-7xl lg:text-[5.5vw] tracking-tight leading-[0.95] text-[#df0567] whitespace-pre-line">
              {title3}
            </h3>

            <div className="mt-6 sm:mt-8">
              {/* White pill button with subtle border/shadow */}
              <button
                type="button"
                onClick={() => onOpenInquiry(title3.replace('\n', ' '))}
                className="h-11 sm:h-12 px-6 sm:px-8 bg-white hover:bg-white/95 text-[#df0567] border border-[#df0567]/20 rounded-full shadow-sm flex items-center gap-2.5 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <span className="text-base font-bold leading-none">→</span>
                <span>{buttonText}</span>
              </button>
            </div>

            <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl lg:text-2xl font-normal leading-snug text-[#df0567] max-w-lg">
              {desc3}
            </p>
          </div>

          {/* Right Column: Image expanding Right to Left (Full width of column in middle) */}
          <div className="lg:col-span-7 w-full flex justify-end items-center">
            <div
              style={{ clipPath: card3Clip }}
              className="w-full aspect-[16/10] max-h-[65vh] sm:max-h-[70vh] overflow-hidden rounded-none shadow-2xl bg-black/5 transition-[clip-path] duration-150 ease-out will-change-transform"
            >
              <img
                src={item3?.image || '/images/service-social-strategy.jpg'}
                alt="Growth & Social Strategy - Creative Campaign Moodboard & Direction"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/service-social-media-marketing.jpg';
                }}
              />
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
