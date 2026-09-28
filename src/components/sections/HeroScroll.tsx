import { useRef, useEffect } from 'react';
import { content } from '../../lib/content';
import type { LanguageCode } from '../../types';

interface HeroScrollProps {
  currentLang?: LanguageCode;
  onOpenInquiry?: () => void;
  data?: {
    scriptText?: string;
    mainHeadline?: string;
    subscriptText?: string;
    ctaPrimaryText?: string;
    ctaPrimaryLink?: string;
    posterUrl?: string;
    videoUrl?: string;
  };
}

export default function HeroScroll({ currentLang = 'DE', data }: HeroScrollProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reliable Autoplay setup for video in iframe/modern browsers & mobile
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const startPlay = () => {
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay will retry on user interaction
          });
        }
      }
    };

    startPlay();

    // Interaction fallback triggers for strict mobile browsers
    const handleInteraction = () => {
      startPlay();
    };

    window.addEventListener('scroll', handleInteraction, { passive: true, once: true });
    window.addEventListener('click', handleInteraction, { passive: true, once: true });
    window.addEventListener('touchstart', handleInteraction, { passive: true, once: true });
    window.addEventListener('pointerdown', handleInteraction, { passive: true, once: true });

    return () => {
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('pointerdown', handleInteraction);
    };
  }, [data?.videoUrl]);

  // Translate subheadline based on current language or custom CMS subscript
  const defaultSubHeadline =
    currentLang === 'DE'
      ? 'NEXT-GEN CREATOR & SOCIAL MEDIA AGENTUR'
      : currentLang === 'IT'
      ? 'AGENZIA DI CREATOR & SOCIAL MEDIA'
      : 'NEXT-GEN CREATOR & SOCIAL MEDIA AGENCY';

  const headline = data?.mainHeadline || content.hero.headline;
  const subHeadline = data?.subscriptText || defaultSubHeadline;
  const posterUrl = data?.posterUrl || '/images/hero-fallback.jpg';
  const rawVideoUrl = data?.videoUrl?.trim();
  const videoUrl = rawVideoUrl || 'https://assets.cdn.filesafe.space/xSjwuaSnNYIVMgIONcb2/media/6ab3b5d98bf21de2ae3b42b0.mp4';

  return (
    <section
      id="top"
      data-theme="dark"
      style={{ backgroundImage: `url('${posterUrl}')` }}
      className="relative h-screen w-full overflow-hidden bg-black bg-cover bg-center select-none"
    >
      {/* Background Video with multi-source fallback */}
      <video
        ref={videoRef}
        key={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        poster={posterUrl}
        preload="auto"
        onCanPlay={(e) => {
          const v = e.currentTarget;
          v.muted = true;
          v.play().catch(() => {});
        }}
        className="absolute inset-0 h-full w-full object-cover pointer-events-none z-0"
      >
        {videoUrl && (
          <source
            src={videoUrl}
            type={videoUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4'}
          />
        )}
        <source src="/videos/hero.mp4" type="video/mp4" />
        <source src="https://assets.cdn.filesafe.space/xSjwuaSnNYIVMgIONcb2/media/6ab3b5d98bf21de2ae3b42b0.mp4" type="video/mp4" />
        <source src="/videos/hero-loop.mp4" type="video/mp4" />
      </video>

      {/* Subtle bottom gradient for pristine typography contrast without altering video hues */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none z-[1]" />

      {/* Hero Headline Overlay: pinned to bottom-left matching screenshot */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 md:p-16 lg:p-20 pointer-events-none z-10">
        <div className="max-w-[1700px] w-full mx-auto pb-6 sm:pb-12">
          <div className="inline-block text-left select-none">
            <h1 className="font-headline text-[15vw] sm:text-[12vw] md:text-[10vw] lg:text-[8.5vw] leading-[0.85] tracking-tight uppercase text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
              {headline}
            </h1>
            <p className="font-headline text-[5vw] sm:text-[3.8vw] md:text-[3vw] lg:text-[2.4vw] leading-none tracking-normal uppercase text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.85)] mt-2 sm:mt-3">
              {subHeadline}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
