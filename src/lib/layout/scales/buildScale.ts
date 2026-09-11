import { SvelteSet } from 'svelte/reactivity';
import type { AxisValue, AxisScale } from '$lib/types/layout/scales';

/** One representative row per unique axis value (first occurrence in `rows`). */
function uniqueRows<TData>(rows: TData[], getAxisValue: (d: TData) => AxisValue): TData[] {
  const seen = new SvelteSet<AxisValue>();
  const out: TData[] = [];
  for (const row of rows) {
    const v = getAxisValue(row);
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(row);
  }
  return out;
}

/** svelteplot's `sort` option only does a fixed ascending sort; a custom `scale.sort` comparator is resolved into an explicit `domain` instead, which svelteplot honors as-is. */
function sortedScale<TData>(scale: AxisScale<TData> | undefined, rows: TData[], getAxisValue: (d: TData) => AxisValue): AxisScale<TData> | undefined {
  const sort = scale?.sort;
  if (!sort || scale?.domain) return scale;
  const reps = uniqueRows(rows, getAxisValue);
  if (reps.length === 0 || !reps.every((r) => typeof getAxisValue(r) === 'string')) return scale;
  const domain = [...reps].sort(sort).map(getAxisValue);
  return { ...scale, domain };
}

/** Scale types {@link buildScale}'s default `nice` only applies to — every other type has its own tick semantics (or isn't numeric at all). */
const CONTINUOUS_NUMERIC_TYPES = new Set(['auto', 'linear', 'pow', 'sqrt', 'log', 'symlog']);

/**
 * Whether this axis's own values are plainly numeric — required before
 * defaulting `nice: true`. Not just an optimization: svelteplot's own type
 * *inference* treats a `nice` option as a hint to resolve the scale as
 * `'linear'` (see its `autoScales.js`), so setting it on a scale whose real
 * values are strings (a bar/pyramid's category axis) would force a linear
 * scale onto categorical data and break the mark entirely.
 */
function isNumericAxis<TData>(rows: TData[], getAxisValue: (d: TData) => AxisValue): boolean {
  let numericSeen = 0;
  for (const row of rows) {
    const v = getAxisValue(row);
    if (v == null) continue;
    if (typeof v !== 'number') return false;
    if (++numericSeen >= 2) return true;
  }
  return numericSeen > 0;
}

/**
 * Resolves an author-facing {@link AxisScale} into what svelteplot's
 * `<Plot x>`/`<Plot y>` accepts — strips `grid`/`seriesLayout`/
 * `seriesPadding`/a vertical `label`, since `ScalesLayout` renders those
 * itself. Also defaults `nice: true` whenever the caller hasn't pinned a
 * `domain`/`ticks`/`nice`/non-numeric `type` of their own and the axis's own
 * values are plainly numeric ({@link isNumericAxis}), so an unpinned
 * continuous axis rounds its domain outward to whole tick steps instead of
 * stopping exactly at the data's own min/max.
 *
 * Deliberately *not* our own `[min, max]` padding: svelteplot computes the
 * real domain from every mark's own channels — e.g. a bar's implicit zero
 * baseline, or a stacked series' cumulative total — not just this axis's raw
 * per-row values, which is all this function has to work with. `nice`'s
 * domain-widening runs *after* that real domain is resolved, inside
 * svelteplot itself, so it stays correct for every plot kind for free — at
 * the cost of only widening up to the nearest round tick step, which can
 * still land exactly on the data's own min/max rather than strictly beyond
 * it (e.g. a value of exactly `52` needs no widening to reach the nice tick
 * `52`). Recomputing the domain ourselves to close that gap would need each
 * axis's true rendered extent (baseline/stack included), which only the
 * calling plot kind knows — not attempted here.
 */
export function buildScale<TData>(scale: AxisScale<TData> | undefined, rows: TData[], getAxisValue: (d: TData) => AxisValue): AxisScale<TData> | undefined {
  const sorted = sortedScale(scale, rows, getAxisValue);
  const wantsNice =
    scale?.domain == null &&
    scale?.ticks == null &&
    scale?.nice == null &&
    (scale?.type == null || CONTINUOUS_NUMERIC_TYPES.has(scale.type)) &&
    isNumericAxis(rows, getAxisValue);
  if (!sorted && !wantsNice) return sorted;
  const out = { ...sorted };
  delete out.grid;
  delete out.seriesLayout;
  delete out.seriesPadding;
  if (scale?.labelOrientation === 'vertical') delete out.label;
  if (wantsNice) out.nice = true;
  return out;
}
