import { useEffect, useRef, useState } from 'react';

/**
 * Mierzy rozmiar elementu DOM i aktualizuje go przy zmianie (ResizeObserver).
 * Zwraca ref do podpięcia oraz aktualne { width, height }.
 */
export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, ...size };
}
