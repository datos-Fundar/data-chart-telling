import { interpolateRgb } from 'd3-interpolate';
import { isBrowser } from '$lib/stores/device';

export function resolveCssColor(color: string): string {
  if (!isBrowser) return color;
  if (!color.startsWith('var(')) return color;
  const varName = color.slice(4, -1).trim();
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || color;
}

export function normalize(
  v: number,
  min: number,
  max: number
): number {
  if (v == null) return 0;
  const denom = max - min || 1;
  return Math.max(0, Math.min(1, (v - min) / denom));
}

/** Cycles through a discrete palette by series index — the default colour for an unstyled series. */
export function paletteColor(index: number, palette: string[]): string {
  if (palette.length === 0) return 'currentColor';
  return palette[index % palette.length];
}

function parseRgb(color: string): [number, number, number] | null {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (hex) {
    const digits = hex[1].length === 3 ? hex[1].split('').map((c) => c + c).join('') : hex[1];
    const num = parseInt(digits, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  const rgb = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i.exec(color);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];

  // Named colors, hsl(), and any other CSS color syntax: resolved to
  // `rgb(...)` via the browser's computed style, then reparsed.
  if (!isBrowser) return null;
  const el = document.createElement('div');
  el.style.color = color;
  document.body.appendChild(el);
  const computed = getComputedStyle(el).color;
  document.body.removeChild(el);
  if (!computed || computed === color) return null;
  return parseRgb(computed);
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/** WCAG contrast ratio between two colors, from 1 (no contrast) to 21 (black on white). */
export function contrastRatio(colorA: string, colorB: string): number {
  const a = parseRgb(resolveCssColor(colorA));
  const b = parseRgb(resolveCssColor(colorB));
  if (!a || !b) return 1;
  const lA = relativeLuminance(a);
  const lB = relativeLuminance(b);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * The `candidates` entry with the highest WCAG contrast ratio against
 * `background`. Defaults to plain white/black; pass a grayscale or other
 * palette to widen the choice. Falls back to the first candidate when
 * `background` can't be parsed.
 */
export function contrastTextColor(
  background: string,
  candidates: string[] = ['#ffffff', '#000000']
): string {
  if (candidates.length === 0) return '#000000';
  let best = candidates[0];
  let bestRatio = -Infinity;
  for (const candidate of candidates) {
    const ratio = contrastRatio(background, candidate);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = candidate;
    }
  }
  return best;
}

export function makeColorScale(
  min: number,
  max: number,
  colorMin: string,
  colorMax: string
): (v: number) => string {
  const resolvedMin = resolveCssColor(colorMin);
  const resolvedMax = resolveCssColor(colorMax);

  let interpolator: (t: number) => string;

  try {
    interpolator = interpolateRgb(resolvedMin, resolvedMax);
  } catch {
    return () => '#ccc';
  }

  return (v: number) => {
    if (v == null) return '#ccc';
    const t = normalize(v, min, max);
    return interpolator(t);
  };
}
