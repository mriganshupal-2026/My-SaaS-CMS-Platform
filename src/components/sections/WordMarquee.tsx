import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

interface WordMarqueeProps {
  data?: {
    line1?: string[];
    line2?: string[];
  };
}

export default function WordMarquee({ data }: WordMarqueeProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const topText = data?.line1?.[0] || 'Bold Vision';
  const bottomText = data?.line1?.[2] || data?.line2?.[0] || 'Infinite Reach';

  // Track scroll progress across the pinned section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Top text: "Young" (white, top-left)
  // Translates upward and fades out as user scrolls
  const topY = useTransform(scrollYProgress, [0, 0.35], ['0%', '-120%']);
  const topOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);

  // Bottom text: "Minds" (white, bottom-right)
  // Translates downward and fades out as user scrolls
  const bottomY = useTransform(scrollYProgress, [0, 0.35], ['0%', '120%']);
  const bottomOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);

  // Middle text: "Pink Vibes" (pink #df0567, centered)
  // Starts small & compact (0.4x) at start, expands to full prominence (1.0x - 1.2x),
  // then scales up to zoom into the letter "i"
  const middleScale = useTransform(
    scrollYProgress,
    [0, 0.18, 0.55, 1.0],
    [0.45, 1.0, 3.6, 3.6]
  );

  // Center on the letter "i" as it zooms in
  const middleX = useTransform(
    scrollYProgress,
    [0.18, 0.55, 1.0],
    ['0%', '-8.5%', '-8.5%']
  );

  // Pivot letter separation (Pink V drifts left, bes drifts right around the letter "i")
  const beforeX = useTransform(scrollYProgress, [0.25, 0.55, 1.0], ['0%', '-22%', '-22%']);
  const afterX = useTransform(scrollYProgress, [0.25, 0.55, 1.0], ['0%', '26%', '26%']);

  // Entire 3-line layout scale as zoom accelerates into the canvas
  const textWrapperScale = useTransform(
    scrollYProgress,
    [0, 0.15, 0.55, 1.0],
    [1, 1.1, 7, 7]
  );

  // Solid dark pink (#df0567) fill overlay as zoom into letter "i" fills the screen
  const solidOverlayOpacity = useTransform(
    scrollYProgress,
    [0.48, 0.58, 1.0],
    [0, 1, 1]
  );

  return (
    <section
      id="pink-vibes"
      ref={containerRef}
      className="relative h-[300vh] w-full bg-[#f9b8d2]"
    >
      {/* Pinned Sticky Viewport: 100vh locked at top: 0, light pink (#f9b8d2) canvas */}
      <div
        data-theme="light"
        className="sticky top-0 h-screen w-full bg-[#f9b8d2] overflow-hidden select-none flex items-center justify-center z-10"
      >
        {/* Full-width 3-row layout replicating text_scroll_layout */}
        <motion.div
          style={{ scale: textWrapperScale }}
          className="w-full h-full max-w-[1700px] mx-auto flex flex-col justify-between py-10 sm:py-14 md:py-18 px-6 sm:px-12 md:px-16 origin-center will-change-transform"
        >
          {/* Row 1: Top-Left "Bold Vision" in white display typography */}
          <motion.div
            style={{ y: topY, opacity: topOpacity }}
            className="self-start will-change-transform"
          >
            <h2 className="font-headline text-6xl sm:text-7xl md:text-8xl lg:text-[9vw] leading-[0.8] tracking-tight uppercase text-white font-bold block drop-shadow-sm">
              {topText}
            </h2>
          </motion.div>

          {/* Row 2: Center "Viral Muse" in pink #df0567 */}
          <div className="self-center flex items-center justify-center relative z-20 my-auto">
            <motion.div
              style={{
                scale: middleScale,
                x: middleX,
              }}
              className="flex items-center justify-center origin-center will-change-transform"
            >
              <h2 className="font-headline text-6xl sm:text-7xl md:text-8xl lg:text-[10vw] leading-[0.8] tracking-tight uppercase text-[#df0567] font-bold whitespace-nowrap block text-center drop-shadow-sm flex items-center">
                <motion.span style={{ x: beforeX }} className="inline-block">
                  V
                </motion.span>
                <span className="inline-block relative">
                  i
                  {/* Expanding stem fill inside 'i' ensuring solid coverage during zoom */}
                  <motion.span
                    style={{ opacity: solidOverlayOpacity }}
                    className="absolute -inset-2 bg-[#df0567] rounded-none pointer-events-none"
                  />
                </span>
                <motion.span style={{ x: afterX }} className="inline-block">
                  ral Muse
                </motion.span>
              </h2>
            </motion.div>
          </div>

          {/* Row 3: Bottom-Right "Infinite Reach" in white display typography */}
          <motion.div
            style={{ y: bottomY, opacity: bottomOpacity }}
            className="self-end will-change-transform"
          >
            <h2 className="font-headline text-6xl sm:text-7xl md:text-8xl lg:text-[9vw] leading-[0.8] tracking-tight uppercase text-white font-bold block drop-shadow-sm">
              {bottomText}
            </h2>
          </motion.div>
        </motion.div>

        {/* Solid #df0567 overlay: once letter 'i' fills the screen, it holds locked & sticky */}
        <motion.div
          style={{ opacity: solidOverlayOpacity }}
          className="absolute inset-0 bg-[#df0567] pointer-events-none z-30 will-change-transform"
        />
      </div>
    </section>
  );
}
