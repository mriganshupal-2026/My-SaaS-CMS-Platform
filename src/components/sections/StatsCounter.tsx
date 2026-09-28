import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { content } from '../../lib/content';

interface StatsCounterProps {
  data?: {
    stat1Value?: string;
    stat1Label?: string;
    stat1Desc?: string;
    stat2Value?: string;
    stat2Label?: string;
    stat2Desc?: string;
    stat3Value?: string;
    stat3Label?: string;
    stat3Desc?: string;
  };
}

function parseStat(rawVal: string | undefined, defaultVal: number, defaultSuffix: string, label: string | undefined, defaultLabel: string) {
  if (!rawVal) {
    return { value: defaultVal, suffix: defaultSuffix, label: label || defaultLabel };
  }
  const clean = String(rawVal).trim();
  const match = clean.match(/^([0-9.,]+)(.*)$/);
  if (match) {
    return { value: match[1], suffix: match[2] || '', label: label || defaultLabel };
  }
  return { value: clean, suffix: '', label: label || defaultLabel };
}

export default function StatsCounter({ data }: StatsCounterProps = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDarkPink, setIsDarkPink] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const statsList = data && (data.stat1Value || data.stat1Label)
    ? [
        parseStat(data.stat1Value, content.stats[0].value, content.stats[0].suffix, data.stat1Label, content.stats[0].label),
        parseStat(data.stat2Value, content.stats[1].value, content.stats[1].suffix, data.stat2Label, content.stats[1].label),
        parseStat(data.stat3Value, content.stats[2].value, content.stats[2].suffix, data.stat3Label, content.stats[2].label),
      ]
    : content.stats;

  // Switch to dark pink background and white text once Our Services starts to scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;

      // When the user starts scrolling down past stats and Our Services enters from below:
      if (rect.bottom <= windowH * 0.92) {
        setIsDarkPink(true);
      } else {
        setIsDarkPink(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-slide vertically every 3.2 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % statsList.length);
    }, 3200);

    return () => clearInterval(interval);
  }, [isPaused, statsList.length]);

  const currentStat = statsList[currentIndex % statsList.length];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % statsList.length);
  };

  return (
    <section
      id="stats"
      ref={containerRef}
      data-theme={isDarkPink ? 'dark' : 'light'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={handleNext}
      className={`relative h-screen w-full overflow-hidden select-none flex items-center justify-center cursor-pointer transition-colors duration-500 ease-out ${
        isDarkPink ? 'bg-[#df0567]' : 'bg-[#f9b8d2]'
      }`}
      title="Click to next stat"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8 text-center will-change-transform"
          >
            {/* Colossal bold condensed number: pink in light mode, pure white in dark pink mode */}
            <div
              className={`font-headline text-[clamp(8.5rem,34vw,28rem)] leading-[0.75] tracking-tight font-bold flex items-center justify-center whitespace-nowrap transition-colors duration-500 ease-out ${
                isDarkPink ? 'text-white' : 'text-[#df0567]'
              }`}
            >
              <span>{currentStat.value}</span>
              <span>{currentStat.suffix}</span>
            </div>

            {/* Centered label below: pink in light mode, pure white in dark pink mode */}
            <p
              className={`mt-4 sm:mt-6 md:mt-8 text-base sm:text-lg md:text-xl lg:text-2xl font-body font-medium tracking-normal text-center transition-colors duration-500 ease-out ${
                isDarkPink ? 'text-white' : 'text-[#df0567]'
              }`}
            >
              {currentStat.label}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
