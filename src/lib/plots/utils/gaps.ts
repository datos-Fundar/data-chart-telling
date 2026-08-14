import { resolveAccessor } from './accessors';
import { resolveEasing } from '$lib/utils/interpolate';
import type { Series } from '$lib/types/plots/data/common';
import type { GapZonesConfig, GapZoneConfig } from '$lib/types/plots/gaps';

const DEFAULT_KEY = 'default';

/**
 * Resolves one series' zone config out of `LinePlot`'s full `gaps` prop: a
 * named entry (keyed by the series' own `name`) applies only to that
 * series; `'default'` fills in whichever zone the named entry itself leaves
 * unset. Unlike `segments`' own specific/default resolution (which
 * concatenates two rule lists), this merges at zone granularity — there's
 * no list to concatenate, just three independent slots.
 */
export function resolveGapsForSeries<TStyle>(
  gaps: Record<string, GapZonesConfig<TStyle>>,
  seriesName: string,
): GapZonesConfig<TStyle> {
  const specific = gaps[seriesName];
  const defaults = gaps[DEFAULT_KEY];
  if (!specific) return defaults ?? {};
  if (!defaults) return specific;
  return {
    start: specific.start ?? defaults.start,
    middle: specific.middle ?? defaults.middle,
    end: specific.end ?? defaults.end,
  };
}

/** A point sampled along a gap-fill bridge, already resolved to plot data-space numbers. */
export type GapPoint = { x: number; y: number };

export type GapRun<TStyle> = {
  kind: 'start' | 'middle' | 'end';
  zone: GapZoneConfig<TStyle>;
  points: GapPoint[];
};

const BRIDGE_STEPS = 24;

/** A row counts as a gap when its resolved value is `null`, `undefined`, or `NaN`. */
export function isGapValue(v: unknown): boolean {
  return v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v));
}

/** Samples `BRIDGE_STEPS + 1` points between two endpoints, x moving linearly and y eased by the zone's `interpolate`. */
function buildBridge(from: GapPoint, to: GapPoint, zone: GapZoneConfig<unknown>): GapPoint[] {
  const ease = resolveEasing(zone.interpolate);
  const points: GapPoint[] = [];
  for (let i = 0; i <= BRIDGE_STEPS; i++) {
    const t = i / BRIDGE_STEPS;
    points.push({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * ease(t) });
  }
  return points;
}

/**
 * Detects a series' missing-data runs (see {@link GapZonesConfig}'s doc
 * comment for what counts as missing) and, for every run whose zone is
 * configured, builds the eased bridge points that visually fill it. Rows
 * are sorted by `x` first, so an out-of-order series is handled the same as
 * a sorted one. A series with no valid (non-missing) rows at all produces
 * no runs — there's nothing to bridge from or to.
 */
export function resolveGapRuns<T extends Record<string, unknown>, TStyle>(
  series: Series<T>,
  gaps: GapZonesConfig<TStyle>,
): GapRun<TStyle>[] {
  if (!gaps.start && !gaps.middle && !gaps.end) return [];

  const xFn = resolveAccessor(series.x);
  const yFn = resolveAccessor(series.y);
  const sorted = [...series.data].sort((a, b) => Number(xFn(a)) - Number(xFn(b)));
  const pt = (row: T): GapPoint => ({ x: Number(xFn(row)), y: Number(yFn(row)) });
  const validIdx = sorted.reduce<number[]>((acc, row, idx) => {
    if (!isGapValue(yFn(row))) acc.push(idx);
    return acc;
  }, []);
  if (validIdx.length === 0) return [];

  const runs: GapRun<TStyle>[] = [];

  const firstValid = validIdx[0];
  if (firstValid > 0 && gaps.start) {
    const to = pt(sorted[firstValid]);
    const from: GapPoint = { x: Number(gaps.start.x), y: gaps.start.y != null ? Number(gaps.start.y) : to.y };
    runs.push({ kind: 'start', zone: gaps.start, points: buildBridge(from, to, gaps.start) });
  }

  if (gaps.middle) {
    for (let k = 0; k < validIdx.length - 1; k++) {
      const a = validIdx[k];
      const b = validIdx[k + 1];
      if (b - a > 1) {
        runs.push({
          kind: 'middle',
          zone: gaps.middle,
          points: buildBridge(pt(sorted[a]), pt(sorted[b]), gaps.middle),
        });
      }
    }
  }

  const lastValid = validIdx[validIdx.length - 1];
  if (lastValid < sorted.length - 1 && gaps.end) {
    const from = pt(sorted[lastValid]);
    const to: GapPoint = { x: Number(gaps.end.x), y: gaps.end.y != null ? Number(gaps.end.y) : from.y };
    runs.push({ kind: 'end', zone: gaps.end, points: buildBridge(from, to, gaps.end) });
  }

  return runs;
}
