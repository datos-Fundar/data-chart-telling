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

/**
 * Resolves an author-facing {@link AxisScale} into what svelteplot's
 * `<Plot x>`/`<Plot y>` accepts — strips `grid`/`seriesLayout`/
 * `seriesPadding`/a vertical `label`, since `ScalesLayout` renders those
 * itself.
 */
export function buildScale<TData>(scale: AxisScale<TData> | undefined, rows: TData[], getAxisValue: (d: TData) => AxisValue): AxisScale<TData> | undefined {
  const sorted = sortedScale(scale, rows, getAxisValue);
  if (!sorted) return sorted;
  const out = { ...sorted };
  delete out.grid;
  delete out.seriesLayout;
  delete out.seriesPadding;
  if (scale?.labelOrientation === 'vertical') delete out.label;
  return out;
}
