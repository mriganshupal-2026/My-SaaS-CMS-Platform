import { useEffect, useState } from 'react';
import type { SectionTheme } from '../types';

export function useSectionTheme() {
  const [theme, setTheme] = useState<SectionTheme>('dark');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll<HTMLElement>('[data-theme]');
      const navCheckY = 48; // near top navbar position
      let activeTheme: SectionTheme = 'dark';

      sections.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= navCheckY && rect.bottom > navCheckY) {
          const t = el.getAttribute('data-theme') as SectionTheme;
          if (t === 'light' || t === 'dark') {
            activeTheme = t;
          }
        }
      });

      setTheme(activeTheme);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const t = entry.target.getAttribute('data-theme') as SectionTheme;
            if (t === 'light' || t === 'dark') {
              setTheme(t);
            }
          }
        });
      },
      { rootMargin: '-60px 0px -75% 0px', threshold: 0 }
    );

    const sections = document.querySelectorAll<HTMLElement>('[data-theme]');
    sections.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return theme;
}
