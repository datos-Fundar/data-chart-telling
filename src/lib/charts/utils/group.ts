import { resolveAccessor } from '$lib/plots/utils';
import type { Accessor } from '$lib/types/charts/common';
import type { LineSeries } from '$lib/types/plots/lines';
import type { BarSeries } from '$lib/types/plots/bars';
import type { XValue, YValue } from '$lib/types/plots/common';

/**
 * Splits rows into ordered groups keyed by the stringified accessor value.
 * Insertion order of first appearance is preserved, which keeps colours stable
 * across re-renders without forcing the caller to pre-sort.
 */
export function groupBy<TRow extends Record<string, unknown>>(
  data: TRow[],
  by: Accessor<TRow, unknown>,
): Map<string, TRow[]> {
  const get = resolveAccessor<TRow>(by);
  const groups = new Map<string, TRow[]>();
  for (const row of data) {
    const key = String(get(row));
    const bucket = groups.get(key);
    if (bucket) bucket.push(row);
    else groups.set(key, [row]);
  }
  return groups;
}

/** Distinct accessor values in first-seen order. */
export function uniqueValues<TRow extends Record<string, unknown>>(
  data: TRow[],
  by: Accessor<TRow, unknown>,
): string[] {
  return [...groupBy(data, by).keys()];
}

/**
 * Adapts flat rows into the `LineSeries[]` shape the line plot expects.
 * When `z` is given, one series is produced per group (series `name` = group
 * value), which is exactly how the line plot's `segments` map is keyed — so the
 * caller styles each group by its `z` value.
 */
export function buildLineSeries<TRow extends Record<string, unknown>>(
  data: TRow[],
  x: Accessor<TRow, XValue>,
  y: Accessor<TRow, YValue>,
  z: Accessor<TRow, unknown> | undefined,
  defaultName = 'series',
): LineSeries<TRow>[] {
  if (z === undefined) {
    return [{ name: defaultName, x, y, data }];
  }
  return [...groupBy(data, z).entries()].map(([name, rows]) => ({
    name,
    x,
    y,
    data: rows,
  }));
}

/**
 * Adapts flat rows into `BarSeries[]`. Grouping by `z` yields one fill-coloured
 * series per group; `colorFor` resolves each group's fill.
 */
export function buildBarSeries<TRow extends Record<string, unknown>>(
  data: TRow[],
  x: Accessor<TRow, XValue>,
  y: Accessor<TRow, YValue>,
  z: Accessor<TRow, unknown> | undefined,
  colorFor: (name: string, index: number) => string,
  defaultName = 'series',
): BarSeries<TRow>[] {
  if (z === undefined) {
    return [{ name: defaultName, x, y, data, fill: colorFor(defaultName, 0) }];
  }
  return [...groupBy(data, z).entries()].map(([name, rows], i) => ({
    name,
    x,
    y,
    data: rows,
    fill: colorFor(name, i),
  }));
}
