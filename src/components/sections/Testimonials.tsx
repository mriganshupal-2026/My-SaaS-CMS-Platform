import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { Star } from 'lucide-react';
import { content } from '../../lib/content';

// Precise handcrafted scatter offsets matching Screenshot 1
// Converges to a single solid baseline line matching Screenshot 2
const SCATTER_LETTERS = [
  // Word 1: NOTHING
  { char: 'N', x: -35, y: 15 },
  { char: 'O', x: -20, y: -65 },
  { char: 'T', x: -10, y: -55 },
  { char: 'H', x: 10, y: 55 },
  { char: 'I', x: 5, y: 35 },
  { char: 'N', x: 20, y: 65 },
  { char: 'G', x: 45, y: 15 },
  // Space
  { char: ' ', x: 0, y: 0 },
  // Word 2: BUT
  { char: 'B', x: 65, y: 70 },
  { char: 'U', x: 95, y: 20 },
  { char: 'T', x: 125, y: 65 },
  // Space
  { char: ' ', x: 0, y: 0 },
  // Word 3: THE
  { char: 'T', x: 155, y: -20 },
  { char: 'H', x: 180, y: 75 },
  { char: 'E', x: 205, y: -5 },
  // Space
  { char: ' ', x: 0, y: 0 },
  // Word 4: TRUTH
  { char: 'T', x: 220, y: 60 },
  { char: 'R', x: 240, y: 60 },
  { char: 'U', x: 265, y: -65 },
  { char: 'T', x: 285, y: -75 },
  { char: 'H', x: 310, y: 20 },
];

interface TestimonialsProps {
  data?: {
    eyebrow?: string;
    heading?: string;
    items?: Array<{
      id?: string;
      company: string;
      quote: string;
      name: string;
      role: string;
      location?: string;
    }>;
  };
}

export default function Testimonials({ data }: TestimonialsProps = {}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  const items = data?.items && data.items.length > 0 ? data.items : content.testimonials.items;

  // Track overall scroll progress for the horizontal cards section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Kinetic letters converge to straight line during early scroll
  const kineticProgress = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  // Dynamically calculate horizontal distance to scroll through all cards to the last one
  useEffect(() => {
    const calculateDistance = () => {
      if (trackRef.current) {
        const totalWidth = trackRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;
        const distance = Math.max(0, totalWidth - viewportWidth + 80);
        setScrollDistance(distance);
      }
    };

    calculateDistance();
    window.addEventListener('resize', calculateDistance);
    return () => window.removeEventListener('resize', calculateDistance);
  }, []);

  // Horizontal pan from card 1 to the last card
  const xPan = useTransform(
    scrollYProgress,
    [0.12, 0.95],
    [0, -scrollDistance]
  );

  return (
    <section
      id="references"
      data-theme="light"
      className="relative w-full bg-white text-[#0A0A0A] select-none pt-16 sm:pt-24 lg:pt-32"
    >
      {/* 1. Normal Flow Full-Width "REFERENZEN" Title (Not Sticky) */}
      <div className="w-full overflow-hidden text-center px-0 mb-12 sm:mb-16 lg:mb-20 py-2 sm:py-4">
        <h2
          id="references-headline"
          className="font-headline text-[18.2vw] sm:text-[19vw] md:text-[19.8vw] leading-[0.9] sm:leading-[0.88] tracking-[0.01em] uppercase text-[#1C1C1C] font-bold block whitespace-nowrap select-none drop-shadow-xs pb-2 sm:pb-3"
        >
          REFERENZEN
        </h2>
      </div>

      {/* 2. Scroll Track for Sticky "NOTHING BUT THE TRUTH" + Horizontal Testimonial Cards */}
      <div ref={sectionRef} className="relative h-[280vh] w-full">
        <div className="sticky top-0 h-screen w-full bg-white overflow-hidden flex flex-col justify-center py-6 sm:py-10 z-10">
          {/* Kinetic Heading "NOTHING BUT THE TRUTH" */}
          <div className="w-full flex justify-center items-center mb-8 sm:mb-12 lg:mb-16 overflow-visible">
            <div className="flex items-center justify-center flex-nowrap whitespace-nowrap">
              {SCATTER_LETTERS.map((item, idx) => {
                if (item.char === ' ') {
                  return (
                    <span
                      key={`space-${idx}`}
                      className="inline-block w-2.5 sm:w-4 md:w-6 lg:w-7 shrink-0"
                    />
                  );
                }
                return (
                  <KineticLetter
                    key={`letter-${idx}`}
                    char={item.char}
                    xOffset={item.x}
                    yOffset={item.y}
                    progress={kineticProgress}
                  />
                );
              })}
            </div>
          </div>

          {/* Horizontal Testimonials Strip matching reference screenshots */}
          <div className="w-full border-t border-b border-black/20 overflow-hidden py-0">
            <motion.div
              ref={trackRef}
              style={{ x: xPan }}
              className="flex items-stretch w-max will-change-transform"
            >
              {items.map((item, idx) => (
                <div
                  key={item.company + idx}
                  className={`w-[320px] sm:w-[420px] md:w-[480px] lg:w-[520px] min-h-[380px] sm:min-h-[420px] md:min-h-[460px] p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between shrink-0 bg-white border-r border-black/20 ${
                    idx === 0 ? 'border-l border-black/20 ml-6 sm:ml-12 md:ml-16' : ''
                  } ${
                    idx === items.length - 1 ? 'mr-12 sm:mr-24 md:mr-36' : ''
                  }`}
                >
                  {/* Top of card: Title & 5 Stars */}
                  <div>
                    <h3 className="font-sans text-xl sm:text-2xl md:text-[26px] font-normal tracking-tight text-[#1A1A1A] leading-tight">
                      {item.company}
                    </h3>

                    {/* 5 solid pink stars in #df0567 */}
                    <div className="flex items-center gap-1 text-[#df0567] mt-2.5 mb-5 sm:mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={15} className="fill-[#df0567] text-[#df0567]" />
                      ))}
                    </div>

                    {/* Quote content */}
                    <p className="font-sans text-sm sm:text-[15px] md:text-base text-[#3A3A3A] leading-[1.65] font-normal">
                      {item.quote}
                    </p>
                  </div>

                  {/* Bottom of card: Author, Role, and Location */}
                  <div className="mt-8 pt-4 border-t border-black/5">
                    <div className="font-sans font-semibold text-sm sm:text-base text-[#1A1A1A]">
                      {item.name}
                    </div>
                    <div className="font-sans text-xs sm:text-sm text-[#666666] mt-0.5">
                      {item.role} {item.location ? `· ${item.location}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface KineticLetterProps {
  key?: string;
  char: string;
  yOffset: number;
  xOffset: number;
  progress: MotionValue<number>;
}

// Letter component that smoothly transforms from Screenshot 1 (scattered) to Screenshot 2 (straight baseline)
function KineticLetter({
  char,
  yOffset,
  xOffset,
  progress,
}: KineticLetterProps) {
  const y = useTransform(progress, [0, 0.9], [yOffset, 0]);
  const x = useTransform(progress, [0, 0.9], [xOffset, 0]);
  const opacity = useTransform(progress, [0, 0.2], [0.9, 1]);

  return (
    <motion.span
      style={{ y, x, opacity }}
      className="font-sans font-medium text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl uppercase tracking-tight text-[#1A1A1A] inline-block will-change-transform select-none"
    >
      {char}
    </motion.span>
  );
}
