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

/**
 * Widens `[lo, hi]` outward to the nearest `count`-ish "nice" step —
 * equivalent to d3's own `scale.nice(count)`, except a value within
 * `epsilonFraction × step` of a step boundary is treated as already sitting
 * on it, rather than needing a full extra step to clear it.
 *
 * Exists because plain `Math.ceil`/`Math.floor` (what `nice()` uses
 * internally, both here and in d3) has zero tolerance: a value meant to be
 * exactly `100` that comes out `100.00000000000001` after summing several
 * independently-rounded parts (a common shape for "these categories add up
 * to a whole" data, e.g. percentages of a total) still fails `hi <= step*N`
 * and gets rounded up a full step further than the data actually warrants
 * (`100` → `110`, not just a hair past `100`). `epsilonFraction` defaults to
 * 1% of the step — small enough to only catch rounding/summation noise, not
 * data that's genuinely meaningfully past the boundary.
 */
export function niceDomain(lo: number, hi: number, count = 5, epsilonFraction = 0.01): [number, number] {
  if (!(hi > lo)) return [lo, hi];
  const step = tickStep(lo, hi, count);
  const eps = step * epsilonFraction;
  const niceLo = Math.floor((lo + eps) / step) * step;
  const niceHi = Math.ceil((hi - eps) / step) * step;
  return [niceLo, niceHi];
}
