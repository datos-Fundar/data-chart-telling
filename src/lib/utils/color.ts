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
