import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { AxisValue } from '$lib/types/plots/axis';
import type { Series, Accessor } from '$lib/types/plots/data/common';

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

/**
 * Adapts flat rows into the `Series[]` shape the plot expects.
 * When `z` is given, one series is produced per group (series `name` = group
 * value), which is exactly how the plot's `segments` map is keyed — so the
 * caller styles each group by its `z` value.
 */
export function buildSeries<TRow extends Record<string, unknown>>(
  data: TRow[],
  x: Accessor<TRow, AxisValue>,
  y: Accessor<TRow, AxisValue>,
  z: Accessor<TRow, unknown> | undefined,
  defaultName = 'series',
): Series<TRow>[] {
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