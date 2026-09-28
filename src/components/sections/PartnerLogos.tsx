import React from 'react';

export interface GenericPartnerLogoProps {
  id: string;
  className?: string;
}

export const GenericPartnerLogos: Record<string, React.FC<{ className?: string }>> = {
  lumina: ({ className = 'w-full h-full' }) => (
    <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M26 12L30 25L43 29L30 33L26 46L22 33L9 29L22 25L26 12Z"
        fill="white"
      />
      <circle cx="26" cy="29" r="3" fill="#df0567" />
      <text
        x="62"
        y="35"
        fill="white"
        fontFamily="Inter, Montserrat, sans-serif"
        fontWeight="900"
        fontSize="22"
        letterSpacing="0.22em"
      >
        LUMINA
      </text>
      <text
        x="63"
        y="50"
        fill="white"
        opacity="0.85"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="8"
        letterSpacing="0.35em"
      >
        HOTELS &amp; RESORTS
      </text>
    </svg>
  ),

  aura: ({ className = 'w-full h-full' }) => (
    <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M20 46C20 31.64 31.64 20 46 20C60.36 20 72 31.64 72 46H62C62 37.16 54.84 30 46 30C37.16 30 30 37.16 30 46H20Z"
        fill="white"
      />
      <circle cx="46" cy="46" r="6" fill="white" />
      <text
        x="90"
        y="37"
        fill="white"
        fontFamily="Inter, Montserrat, sans-serif"
        fontWeight="900"
        fontSize="24"
        letterSpacing="0.25em"
      >
        AURA
      </text>
      <text
        x="91"
        y="51"
        fill="white"
        opacity="0.85"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="8"
        letterSpacing="0.32em"
      >
        ALPINE RETREATS
      </text>
    </svg>
  ),

  solstice: ({ className = 'w-full h-full' }) => (
    <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="34" cy="35" r="22" stroke="white" strokeWidth="4" />
      <path
        d="M18 45L28 27L38 45H18Z"
        fill="white"
      />
      <path
        d="M33 45L42 31L51 45H33Z"
        fill="white"
        opacity="0.9"
      />
      <text
        x="72"
        y="36"
        fill="white"
        fontFamily="Inter, Montserrat, sans-serif"
        fontWeight="800"
        fontSize="21"
        letterSpacing="0.18em"
      >
        SOLSTICE
      </text>
      <text
        x="73"
        y="50"
        fill="white"
        opacity="0.85"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="8"
        letterSpacing="0.3em"
      >
        SANCTUARY &amp; SPA
      </text>
    </svg>
  ),

  vanguard: ({ className = 'w-full h-full' }) => (
    <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M14 18H50L32 52L14 18Z"
        stroke="white"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M24 23H40L32 40L24 23Z"
        fill="white"
      />
      <text
        x="66"
        y="36"
        fill="white"
        fontFamily="Inter, Montserrat, sans-serif"
        fontWeight="900"
        fontSize="21"
        letterSpacing="0.16em"
      >
        VANGUARD
      </text>
      <text
        x="67"
        y="50"
        fill="white"
        opacity="0.85"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="8"
        letterSpacing="0.3em"
      >
        HOTELS &amp; RESIDENCES
      </text>
    </svg>
  ),

  atelier: ({ className = 'w-full h-full' }) => (
    <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <text
        x="120"
        y="34"
        textAnchor="middle"
        fill="white"
        fontFamily="Playfair Display, Georgia, serif"
        fontWeight="900"
        fontSize="23"
        letterSpacing="0.22em"
      >
        ATELIER NOIR
      </text>
      <line x1="45" y1="43" x2="195" y2="43" stroke="white" strokeWidth="1.5" />
      <text
        x="120"
        y="54"
        textAnchor="middle"
        fill="white"
        opacity="0.85"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="8.5"
        letterSpacing="0.4em"
      >
        PARIS · MILANO · ZÜRICH
      </text>
    </svg>
  ),

  chroma: ({ className = 'w-full h-full' }) => (
    <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="34" cy="35" r="20" stroke="white" strokeWidth="4" />
      <path d="M26 21L42 27M47 29L41 47M41 49L25 43M21 41L27 23" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="34" cy="35" r="5" fill="white" />
      <text
        x="70"
        y="37"
        fill="white"
        fontFamily="Inter, Montserrat, sans-serif"
        fontWeight="900"
        fontSize="22"
        letterSpacing="0.2em"
      >
        CHROMA
      </text>
      <text
        x="71"
        y="51"
        fill="white"
        opacity="0.85"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="8.5"
        letterSpacing="0.32em"
      >
        CREATIVE STUDIOS
      </text>
    </svg>
  ),

  valepeak: ({ className = 'w-full h-full' }) => (
    <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M12 46L28 18L44 46H12Z"
        stroke="white"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M34 46L46 26L58 46H34Z"
        fill="white"
      />
      <text
        x="72"
        y="35"
        fill="white"
        fontFamily="Playfair Display, Georgia, serif"
        fontWeight="800"
        fontSize="19"
        letterSpacing="0.12em"
      >
        VALE &amp; PEAK
      </text>
      <text
        x="73"
        y="49"
        fill="white"
        opacity="0.85"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="8"
        letterSpacing="0.32em"
      >
        LUXURY MOUNTAIN LODGES
      </text>
    </svg>
  ),

  kairos: ({ className = 'w-full h-full' }) => (
    <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="18" y="19" width="32" height="32" rx="4" stroke="white" strokeWidth="3.5" transform="rotate(45 34 35)" />
      <circle cx="34" cy="35" r="5" fill="white" />
      <text
        x="70"
        y="36"
        fill="white"
        fontFamily="Inter, Montserrat, sans-serif"
        fontWeight="900"
        fontSize="21"
        letterSpacing="0.22em"
      >
        KAIROS
      </text>
      <text
        x="71"
        y="50"
        fill="white"
        opacity="0.85"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="8"
        letterSpacing="0.34em"
      >
        PRIVATE MEMBERS CLUB
      </text>
    </svg>
  ),

  mirage: ({ className = 'w-full h-full' }) => (
    <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M16 48C16 32.536 28.536 20 44 20C59.464 20 72 32.536 72 48"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="44" cy="35" r="7" fill="white" />
      <text
        x="88"
        y="36"
        fill="white"
        fontFamily="Inter, Montserrat, sans-serif"
        fontWeight="900"
        fontSize="22"
        letterSpacing="0.24em"
      >
        MIRAGE
      </text>
      <text
        x="89"
        y="50"
        fill="white"
        opacity="0.85"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="8"
        letterSpacing="0.35em"
      >
        OASIS RESORT &amp; SPA
      </text>
    </svg>
  ),

  horizon: ({ className = 'w-full h-full' }) => (
    <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="32" cy="35" r="21" stroke="white" strokeWidth="4" />
      <line x1="8" y1="35" x2="56" y2="35" stroke="white" strokeWidth="4" />
      <text
        x="70"
        y="36"
        fill="white"
        fontFamily="Inter, Montserrat, sans-serif"
        fontWeight="900"
        fontSize="21"
        letterSpacing="0.18em"
      >
        HORIZON
      </text>
      <text
        x="71"
        y="50"
        fill="white"
        opacity="0.85"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="8.5"
        letterSpacing="0.32em"
      >
        HOTEL COLLECTION
      </text>
    </svg>
  ),

  neobotanica: ({ className = 'w-full h-full' }) => (
    <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M20 45C20 28 35 15 48 15C48 32 33 45 20 45Z"
        fill="white"
      />
      <path
        d="M48 15C48 32 33 45 20 45C37 45 50 30 50 15H48Z"
        fill="#df0567"
        opacity="0.3"
      />
      <circle cx="28" cy="42" r="3" fill="white" />
      <text
        x="64"
        y="34"
        fill="white"
        fontFamily="Inter, Montserrat, sans-serif"
        fontWeight="800"
        fontSize="17"
        letterSpacing="0.16em"
      >
        NEO BOTANICA
      </text>
      <text
        x="65"
        y="48"
        fill="white"
        opacity="0.85"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="8"
        letterSpacing="0.3em"
      >
        WELLNESS DESTINATIONS
      </text>
    </svg>
  ),

  celeste: ({ className = 'w-full h-full' }) => (
    <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M30 14L34 29L49 33L34 37L30 52L26 37L11 33L26 29L30 14Z"
        fill="white"
      />
      <text
        x="66"
        y="35"
        fill="white"
        fontFamily="Playfair Display, Georgia, serif"
        fontWeight="900"
        fontSize="21"
        letterSpacing="0.22em"
      >
        CELESTE
      </text>
      <text
        x="67"
        y="49"
        fill="white"
        opacity="0.85"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="8"
        letterSpacing="0.32em"
      >
        HAUTE HOSPITALITY
      </text>
    </svg>
  ),

  orbit: ({ className = 'w-full h-full' }) => (
    <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <ellipse cx="32" cy="35" rx="22" ry="10" stroke="white" strokeWidth="3.5" transform="rotate(-25 32 35)" />
      <circle cx="32" cy="35" r="9" fill="white" />
      <text
        x="68"
        y="37"
        fill="white"
        fontFamily="Inter, Montserrat, sans-serif"
        fontWeight="900"
        fontSize="23"
        letterSpacing="0.22em"
      >
        ORBIT
      </text>
      <text
        x="69"
        y="51"
        fill="white"
        opacity="0.85"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="8"
        letterSpacing="0.35em"
      >
        CREATOR NETWORK
      </text>
    </svg>
  ),

  silverhorn: ({ className = 'w-full h-full' }) => (
    <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M18 20C24 28 28 38 32 48C36 38 40 28 46 20C40 24 36 30 32 36C28 30 24 24 18 20Z"
        fill="white"
      />
      <circle cx="32" cy="18" r="4" fill="white" />
      <text
        x="64"
        y="35"
        fill="white"
        fontFamily="Inter, Montserrat, sans-serif"
        fontWeight="900"
        fontSize="19"
        letterSpacing="0.18em"
      >
        SILVERHORN
      </text>
      <text
        x="65"
        y="49"
        fill="white"
        opacity="0.85"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="8"
        letterSpacing="0.32em"
      >
        ALPINE RESORT &amp; SPA
      </text>
    </svg>
  ),

  prism: ({ className = 'w-full h-full' }) => (
    <svg viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M32 16L50 48H14L32 16Z"
        stroke="white"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M32 16V48" stroke="white" strokeWidth="3" />
      <path d="M32 16L41 48" stroke="white" strokeWidth="2" opacity="0.6" />
      <text
        x="66"
        y="36"
        fill="white"
        fontFamily="Inter, Montserrat, sans-serif"
        fontWeight="900"
        fontSize="22"
        letterSpacing="0.2em"
      >
        PRISM
      </text>
      <text
        x="67"
        y="50"
        fill="white"
        opacity="0.85"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="8.5"
        letterSpacing="0.35em"
      >
        LUXURY COLLECTIVE
      </text>
    </svg>
  ),
};
