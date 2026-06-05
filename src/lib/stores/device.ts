import { derived, readable } from 'svelte/store';
import type { Viewport } from '$lib/types/viewport';

const isBrowser = typeof window !== 'undefined';

const viewport = readable<Viewport>(
  { width: 0, height: 0 },
  (set) => {
    if (!isBrowser) return;

    let raf = 0;
    let lastWidth = -1;
    let lastHeight = -1;

    const flush = () => {
      raf = 0;
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;
      set({ width, height });
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(flush);
    };

    flush();

    window.addEventListener('resize', schedule);

    return () => {
      window.removeEventListener('resize', schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }
);

export const isMobile = derived(
  viewport,
  ($viewport) => $viewport.width < 768
);

export const isTablet = derived(
  viewport,
  ($viewport) => (
    $viewport.width >= 768 &&
    $viewport.width < 1024
  )
);

export const isLaptop = derived(
  viewport,
  ($viewport) => (
    $viewport.width >= 1024 &&
    $viewport.width < 1280
  )
);

export const isDesktop = derived(
  viewport,
  ($viewport) => $viewport.width >= 1280
);

export const viewportWidth = derived(
  viewport,
  ($viewport) => $viewport.width
);

export const viewportHeight = derived(
  viewport,
  ($viewport) => $viewport.height
);
