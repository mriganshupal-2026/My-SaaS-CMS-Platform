import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { useImagePreloader } from '../../hooks/useImagePreloader';
import { content } from '../../lib/content';

const TOTAL_FRAMES = 40;

interface PlaneMorphProps {
  data?: {
    line1?: string;
    line2?: string;
    line3?: string;
    backgroundImage?: string;
  };
}

export default function PlaneMorph({ data }: PlaneMorphProps = {}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastFrameDrawn = useRef<number>(-1);

  const line1 = data?.line1 || content.closing[0];
  const line2 = data?.line2 || content.closing[1];
  const line3 = data?.line3 || content.closing[2];
  const backgroundImage = data?.backgroundImage || '/images/go-iconic-hero.jpg';

  // Preload sequence-2 frames
  const { images, isReady } = useImagePreloader({
    folder: '/sequence-2',
    count: TOTAL_FRAMES,
    extension: 'jpg',
    pad: 4,
  });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Staggered opacity & scale for the 3 phrases: "AND" -> "Go Iconic" -> "Then"
  const op1 = useTransform(scrollYProgress, [0.05, 0.25, 0.45], [0, 1, 0.4]);
  const scale1 = useTransform(scrollYProgress, [0.05, 0.25], [0.9, 1]);

  const op2 = useTransform(scrollYProgress, [0.3, 0.55, 0.75], [0, 1, 0.4]);
  const scale2 = useTransform(scrollYProgress, [0.3, 0.55], [0.9, 1]);

  const op3 = useTransform(scrollYProgress, [0.6, 0.85, 0.98], [0, 1, 1]);
  const scale3 = useTransform(scrollYProgress, [0.6, 0.85], [0.9, 1]);

  // Subtle cinematic zoom for background image
  const imgZoom = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const imgBrightness = useTransform(scrollYProgress, [0, 0.7, 1], [0.95, 0.85, 0.7]);

  // Soft transition bleed to dark pink footer background towards bottom
  const bgTransition = useTransform(
    scrollYProgress,
    [0.75, 0.98],
    ['rgba(223, 5, 103, 0)', 'rgba(223, 5, 103, 1)']
  );

  const renderFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;
    let renderW = width;
    let renderH = height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      renderW = width;
      renderH = width / imgRatio;
      offsetY = (height - renderH) / 2;
    } else {
      renderH = height;
      renderW = height * imgRatio;
      offsetX = (width - renderW) / 2;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);

    // Subtle, luminous light pink wash
    ctx.fillStyle = 'rgba(249, 184, 210, 0.15)';
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  };

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (!isReady || images.length === 0) return;
    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.floor(progress * TOTAL_FRAMES))
    );
    if (frameIndex !== lastFrameDrawn.current) {
      lastFrameDrawn.current = frameIndex;
      requestAnimationFrame(() => renderFrame(frameIndex));
    }
  });

  useEffect(() => {
    if (isReady && images.length > 0) {
      renderFrame(0);
    }
  }, [isReady]);

  return (
    <section
      id="closing-statement"
      ref={sectionRef}
      data-theme="light"
      className="relative h-[300vh] bg-[#f9b8d2]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background Image Layer */}
        <motion.img
          src={backgroundImage}
          alt="Luxury architectural villa and alpine sunset"
          style={{ scale: imgZoom }}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Scrollytelling Canvas Layer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-cover will-change-transform opacity-60 mix-blend-overlay"
          style={{ transform: 'translateZ(0)' }}
        />

        {/* Soft Light Pink Atmospheric Overlay for Clear Image Visibility */}
        <div className="absolute inset-0 bg-[#f9b8d2]/20 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#df0567]/35 via-transparent to-black/15 pointer-events-none z-10" />

        {/* Dynamic color transition bleed to dark pink footer */}
        <motion.div
          style={{ backgroundColor: bgTransition }}
          className="absolute inset-0 pointer-events-none z-10"
        />

        {/* Giant Stacked Kinetic Headlines */}
        <div className="relative z-20 w-full max-w-[1700px] mx-auto px-6 sm:px-12 flex flex-col items-center justify-center text-center space-y-4 select-none">
          {/* Line 1 */}
          <motion.div style={{ opacity: op1, scale: scale1 }} className="will-change-transform">
            <h2 className="font-headline text-[15vw] sm:text-[13vw] leading-[0.85] tracking-tight uppercase text-[#df0567] drop-shadow-[0_2px_18px_rgba(255,255,255,0.7)]">
              {line1}
            </h2>
          </motion.div>

          {/* Line 2 */}
          <motion.div style={{ opacity: op2, scale: scale2 }} className="will-change-transform">
            <h2 className="font-headline text-[15vw] sm:text-[13vw] leading-[0.85] tracking-tight uppercase text-white font-black drop-shadow-[0_4px_24px_rgba(223,5,103,0.7)]">
              {line2}
            </h2>
          </motion.div>

          {/* Line 3 */}
          <motion.div style={{ opacity: op3, scale: scale3 }} className="will-change-transform">
            <h2 className="font-headline text-[15vw] sm:text-[13vw] leading-[0.85] tracking-tight uppercase text-[#df0567] drop-shadow-[0_2px_18px_rgba(255,255,255,0.7)]">
              {line3}
            </h2>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
