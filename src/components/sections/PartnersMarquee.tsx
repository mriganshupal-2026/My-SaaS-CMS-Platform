import { content } from '../../lib/content';
import type { LanguageCode } from '../../types';
import { GenericPartnerLogos } from './PartnerLogos';

interface PartnersMarqueeProps {
  currentLang?: LanguageCode;
  data?: {
    eyebrow?: string;
    heading?: string;
    list?: Array<{
      id: string;
      name: string;
      logo?: string;
      alt?: string;
    }>;
  };
}

export default function PartnersMarquee({ currentLang, data }: PartnersMarqueeProps) {
  const partners = data?.list && data.list.length > 0 ? data.list : content.partners.list;

  // Title strictly set to "OUR PARTNERS" matching brand display typography, or CMS heading
  const defaultTitle = currentLang === 'IT' ? 'I NOSTRI PARTNER' : 'OUR PARTNERS';
  const title = data?.heading || defaultTitle;

  return (
    <section
      id="partners"
      data-theme="dark"
      className="relative w-full bg-[#df0567] text-white pt-20 sm:pt-28 lg:pt-36 pb-24 sm:pb-32 lg:pb-44 overflow-hidden select-none"
    >
      {/* 1. Header Display Title ("OUR PARTNERS") matching Screenshot */}
      <div className="w-full px-0 mb-10 sm:mb-14 lg:mb-18 py-2 sm:py-4 flex items-center justify-center text-center overflow-hidden">
        <h2
          id="partners-headline"
          className="font-headline text-[18.2vw] sm:text-[19vw] md:text-[19.8vw] leading-[0.9] sm:leading-[0.88] tracking-[0.01em] uppercase text-white font-bold block whitespace-nowrap drop-shadow-xs pb-2 sm:pb-3"
        >
          {title}
        </h2>
      </div>

      {/* 2. Grid Container with 15 Partners */}
      {/* Full-width 5-column grid on desktop, 3 on tablet, 2 on mobile with crisp 1px hairline borders */}
      <div className="w-full border-t border-b border-[#eb4d96]">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 w-full">
          {partners.map((partner, index) => {
            // Precise hairline border calculations for clean 1px dividers on every viewport
            // Desktop (5 columns, 3 rows):
            const isLastInRowLg = (index + 1) % 5 === 0;
            const isLastRowLg = index >= 10;

            // Tablet (3 columns, 5 rows):
            const isLastInRowMd = (index + 1) % 3 === 0;
            const isLastRowMd = index >= 12;

            // Mobile (2 columns):
            const isLastInRowSm = (index + 1) % 2 === 0;
            const isLastRowSm = index >= 14;

            const LogoComponent = GenericPartnerLogos[partner.id];

            return (
              <div
                key={partner.id}
                id={`partner-cell-${partner.id}`}
                className={`relative aspect-square flex items-center justify-center p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:bg-white/[0.08] group cursor-pointer border-[#eb4d96] ${
                  isLastInRowSm ? 'border-r-0' : 'border-r'
                } ${isLastRowSm ? 'border-b-0' : 'border-b'} ${
                  isLastInRowMd ? 'md:border-r-0' : 'md:border-r'
                } ${isLastRowMd ? 'md:border-b-0' : 'md:border-b'} ${
                  isLastInRowLg ? 'lg:border-r-0' : 'lg:border-r'
                } ${isLastRowLg ? 'lg:border-b-0' : 'lg:border-b'}`}
              >
                {/* Centered Logo Wrap */}
                <div className="relative w-[75%] sm:w-[70%] max-w-[220px] h-[55px] sm:h-[65px] flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-110">
                  {LogoComponent ? (
                    <LogoComponent className="w-full h-full text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.15)]" />
                  ) : (
                    <img
                      src={partner.logo}
                      alt={partner.alt || partner.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain filter brightness-200 select-none pointer-events-none"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

