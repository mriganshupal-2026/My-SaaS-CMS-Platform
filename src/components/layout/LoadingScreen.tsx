import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export default function LoadingScreen({
  onComplete,
  minDurationMs = 1800,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Disable scroll while loading screen is active
    document.body.style.overflow = 'hidden';

    const startTime = performance.now();
    let animationFrameId: number;

    const updateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(100, Math.floor((elapsed / minDurationMs) * 100));

      setProgress(rawProgress);

      if (rawProgress < 100) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        setTimeout(() => {
          setIsFinished(true);
          document.body.style.overflow = '';
          onComplete?.();
        }, 300);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.body.style.overflow = '';
    };
  }, [minDurationMs, onComplete]);

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="loader-curtain"
          initial={{ y: 0 }}
          exit={{
            y: '-100%',
            transition: {
              duration: 0.85,
              ease: [0.76, 0, 0.24, 1],
            },
          }}
          className="fixed inset-0 z-[9999] bg-[#df0567] text-white flex flex-col justify-between overflow-hidden select-none"
        >
          {/* Top Bar: Subtitle & Loading Counter */}
          <div className="w-full px-6 sm:px-12 pt-8 sm:pt-10 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-script text-xl sm:text-2xl text-white/90 font-bold lowercase tracking-tight">
                social media agency
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-widest text-white/60 font-semibold mt-1">
                Luxury &amp; Viral Production
              </span>
            </div>

            {/* Percentage counter */}
            <div className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white tabular-nums">
              {progress.toString().padStart(2, '0')}%
            </div>
          </div>

          {/* Center: Luxury Loading Animation / Dynamic Progress Indicator */}
          <div className="w-full px-6 sm:px-12 flex flex-col items-center justify-center my-auto">
            {/* Animated Pulsing Orbit Ring */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-white/20 border-t-white"
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center"
              >
                <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
              </motion.div>
            </div>

            {/* Horizontal Line Progress Bar */}
            <div className="w-full max-w-xs sm:max-w-md h-[2px] bg-white/20 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            <div className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-white/70 font-medium">
              {progress < 40
                ? 'Loading Assets'
                : progress < 85
                ? 'Crafting Experience'
                : 'Ready'}
            </div>
          </div>

          {/* Bottom: Giant Full-Width Edge-to-Edge VIRALMUSE Headline */}
          <div className="w-full overflow-hidden leading-none select-none pointer-events-none pb-0 -mb-1">
            <svg
              viewBox="0 0 1000 170"
              className="w-full h-auto block select-none"
              preserveAspectRatio="none"
              role="img"
              aria-label="VIRALMUSE"
            >
              <text
                x="0"
                y="145"
                textLength="1000"
                lengthAdjust="spacing"
                fill="white"
                className="font-headline font-black uppercase"
                fontSize="180"
                fontWeight="900"
              >
                VIRALMUSE
              </text>
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
