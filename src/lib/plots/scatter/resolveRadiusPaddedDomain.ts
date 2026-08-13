/**
 * Extends a `[min, max]` data domain so the largest rendered dot radius
 * doesn't get clipped by the plot's own frame — svelteplot's own `'auto'`
 * margin only measures axis chrome (tick labels), never mark geometry, so a
 * point sitting at the domain edge with a non-trivial radius otherwise
 * overflows past the frame. `innerSizePx` is an estimate (the real pixel
 * range isn't known until the scale itself is built from this domain), so
 * this errs generous rather than exact.
 */
export function resolveRadiusPaddedDomain(
  values: number[],
  maxRadiusPx: number,
  innerSizePx: number,
): [number, number] | undefined {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0 || innerSizePx <= 0 || maxRadiusPx <= 0) return undefined;
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  if (min === max) {
    // A degenerate single-value domain has no data-per-pixel ratio to pad by — fall back to a fixed unit either side.
    return [min - 1, max + 1];
  }
  const dataPerPixel = (max - min) / innerSizePx;
  const pad = maxRadiusPx * dataPerPixel;
  return [min - pad, max + pad];
}
