// d3-array-compatible "nice" tick step/generation, reimplemented locally to
// avoid depending on internals svelteplot itself pulls in (not one of our
// declared dependencies) — see https://d3js.org/d3-array/ticks.

/** Step between "nice" (1/2/5×10ⁿ) tick values for an approximate `count` over `[start, stop]`. */
export function tickStep(start: number, stop: number, count: number): number {
  const e10 = Math.sqrt(50);
  const e5 = Math.sqrt(10);
  const e2 = Math.sqrt(2);
  const step0 = Math.abs(stop - start) / Math.max(0, count);
  let step1 = 10 ** Math.floor(Math.log10(step0));
  const error = step0 / step1;
  if (error >= e10) step1 *= 10;
  else if (error >= e5) step1 *= 5;
  else if (error >= e2) step1 *= 2;
  return step1;
}

/** Multiples of `step` covering `[start, stop]`, inclusive of either endpoint when it lands exactly on one. */
export function ticksInRange(start: number, stop: number, step: number): number[] {
  if (!(step > 0) || !Number.isFinite(step)) return [];
  const lo = Math.ceil(start / step);
  const hi = Math.floor(stop / step);
  const out: number[] = [];
  for (let i = lo; i <= hi; i++) out.push(i * step);
  return out;
}

/** Ticks-per-axis heuristic — used by `ScalesLayout` to pick a target count from an axis's actual pixel span. */
export function naturalTickCount(span: number, spacing: number, min: number): number {
  return Math.max(min, Math.round(span / spacing));
}
