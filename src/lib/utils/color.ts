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

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function linearToSrgb8(c: number): number {
  const s = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return clamp01(s) * 255;
}

/**
 * Parses `oklch(L C H)` directly instead of round-tripping through the
 * browser's computed style: Chromium/Firefox serialize computed oklch()
 * values back as oklch() (not rgb()), so the generic browser-fallback
 * below sees an unchanged string on the second pass and its
 * infinite-loop guard mistakes that for a parse failure.
 */
function parseOklch(color: string): [number, number, number] | null {
  const match = /^oklch\(\s*([\d.]+)(%)?\s+([\d.]+)\s+([\d.]+)/i.exec(color.trim());
  if (!match) return null;
  const L = match[2] ? Number(match[1]) / 100 : Number(match[1]);
  const C = Number(match[3]);
  const H = (Number(match[4]) * Math.PI) / 180;
  const a = C * Math.cos(H);
  const b = C * Math.sin(H);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return [linearToSrgb8(r), linearToSrgb8(g), linearToSrgb8(bl)];
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

  const oklch = parseOklch(color);
  if (oklch) return oklch;

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
