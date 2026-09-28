import { useEffect, useRef, useState } from 'react';

interface PreloaderOptions {
  folder: string;
  count: number;
  extension?: string;
  pad?: number;
  lazy?: boolean;
}

export function useImagePreloader({
  folder,
  count,
  extension = 'jpg',
  pad = 4,
  lazy = false,
}: PreloaderOptions) {
  const images = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (lazy) return;

    let cancelled = false;
    let loadedCount = 0;
    const imgs: HTMLImageElement[] = [];

    for (let i = 1; i <= count; i++) {
      const frame = String(i).padStart(pad, '0');
      const img = new Image();
      img.src = `${folder}/frame_${frame}.${extension}`;
      img.onload = () => {
        loadedCount += 1;
        if (!cancelled) {
          setLoaded(loadedCount);
          if (loadedCount >= Math.min(6, count)) {
            setIsReady(true);
          }
        }
      };
      img.onerror = () => {
        loadedCount += 1;
        if (!cancelled && loadedCount >= Math.min(6, count)) {
          setIsReady(true);
        }
      };
      imgs.push(img);
    }
    images.current = imgs;

    return () => {
      cancelled = true;
    };
  }, [folder, count, extension, pad, lazy]);

  return {
    images: images.current,
    loaded,
    isReady: isReady || loaded > 0,
    progress: count > 0 ? loaded / count : 0,
  };
}
