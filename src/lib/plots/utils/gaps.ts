import { seriesIdOf } from '$lib/utils/grouping';
import { resolveAccessor } from './accessors';
import { Interpolation } from '$lib/utils/Interpolation';
import type { Series } from '$lib/types/plots/data/common';
import type {
  DiscreteGapFill,
  GapPoint,
  GapZonesConfig,
  GapZoneConfig
} from '$lib/types/plots/gaps';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { AxisChannelName } from '$lib/types/layout/mapping';

const DEFAULT_KEY = 'default';

/**
 * Resolves one series' zone config out of `LinePlot`'s full `gaps` prop: a
 * named entry (keyed by the series' own `name`) applies only to that
 * series; `'default'` fills in whichever zone the named entry itself leaves
 * unset. Unlike `segments`' own specific/default resolution (which
 * concatenates two rule lists), this merges at zone granularity - there's
 * no list to concatenate, just three independent slots.
 */
export function resolveGapsForSeries<TStyle>(
  gaps: Record<string, GapZonesConfig<TStyle>> = {},
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
  const ease = Interpolation.buildEasing(zone.interpolate);
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
 * no runs - there's nothing to bridge from or to.
 */
export function resolveGapRuns<T extends Record<string, unknown>, TStyle>(
  series: Series<T>,
  gaps: GapZonesConfig<TStyle>,
): GapRun<TStyle>[] {
  if ((!gaps.start && !gaps.middle && !gaps.end) || series.x === undefined || series.y === undefined) return [];

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

/**
 * Bar/pyramid analog of `resolveGapRuns`: a category axis has no continuous
 * bridge to sample, so this returns one interpolated value per *individual*
 * gap row instead. Runs are detected by `series.data`'s own array order
 * (not a numeric `x` sort like `resolveGapRuns` - a category axis is often
 * nominal, so there's no meaningful numeric ordering to sort by). Keyed by
 * row object reference rather than category, since a series' `y` accessor
 * may be an arbitrary function - there's no general way to write the
 * interpolated value back onto a row, so callers look it up here instead.
 */
export function resolveDiscreteGapFills<T extends Record<string, unknown>, TStyle>(
  series: Series<T>,
  gaps: GapZonesConfig<TStyle>,
  valueAxis: AxisChannelName = 'y',
): Map<T, DiscreteGapFill<TStyle>> {
  const result = new Map<T, DiscreteGapFill<TStyle>>();
  const accessor = series[valueAxis];
  if ((!gaps.start && !gaps.middle && !gaps.end) || accessor === undefined) return result;

  const yFn = resolveAccessor(accessor);
  const rows = series.data;
  const valueAt = (i: number) => Number(yFn(rows[i]));
  const validIdx = rows.reduce<number[]>((acc, row, i) => {
    if (!isGapValue(yFn(row))) acc.push(i);
    return acc;
  }, []);
  if (validIdx.length === 0) return result;

  function fillRun(indices: number[], from: number, to: number, zone: GapZoneConfig<TStyle>, kind: DiscreteGapFill<TStyle>['kind']) {
    const ease = Interpolation.buildEasing(zone.interpolate);
    const span = indices.length + 1;
    indices.forEach((idx, i) => {
      const t = (i + 1) / span;
      result.set(rows[idx], { value: from + (to - from) * ease(t), kind, style: zone.style });
    });
  }

  const firstValid = validIdx[0];
  if (firstValid > 0 && gaps.start) {
    const to = valueAt(firstValid);
    const from = gaps.start.y != null ? Number(gaps.start.y) : to;
    fillRun(Array.from({ length: firstValid }, (_, i) => i), from, to, gaps.start, 'start');
  }

  if (gaps.middle) {
    for (let k = 0; k < validIdx.length - 1; k++) {
      const a = validIdx[k];
      const b = validIdx[k + 1];
      if (b - a > 1) {
        fillRun(Array.from({ length: b - a - 1 }, (_, i) => a + 1 + i), valueAt(a), valueAt(b), gaps.middle, 'middle');
      }
    }
  }

  const lastValid = validIdx[validIdx.length - 1];
  if (lastValid < rows.length - 1 && gaps.end) {
    const from = valueAt(lastValid);
    const to = gaps.end.y != null ? Number(gaps.end.y) : from;
    fillRun(Array.from({ length: rows.length - 1 - lastValid }, (_, i) => lastValid + 1 + i), from, to, gaps.end, 'end');
  }

  return result;
}

/** Field-by-field style fallback for a discrete gap-fill marker - mirrors how `buildGapMarkers.ts` merges a line gap zone's style under `cfg.line.gap`. */
export function resolveGapAreaStyle(zoneStyle: AreaStyle | undefined, defaultColor: string, gapDefaults: AreaStyle): AreaStyle {
  return {
    fill: zoneStyle?.fill ?? gapDefaults.fill ?? defaultColor,
    fillOpacity: zoneStyle?.fillOpacity ?? gapDefaults.fillOpacity ?? 1,
    stroke: zoneStyle?.stroke ?? gapDefaults.stroke,
    strokeWidth: zoneStyle?.strokeWidth ?? gapDefaults.strokeWidth,
    strokeOpacity: zoneStyle?.strokeOpacity ?? gapDefaults.strokeOpacity,
    strokeDasharray: zoneStyle?.strokeDasharray ?? gapDefaults.strokeDasharray,
    borderRadius: zoneStyle?.borderRadius ?? gapDefaults.borderRadius,
  };
}

/**
 * Each series' gap fills, keyed by series id - the interpolated value a
 * `styles.gaps` zone gives each missing row along `valueAxis`, resolved per series like `segments`.
 */
export function buildGapFillMaps<TData extends Record<string, unknown>, TStyle>(
  seriesList: Series<TData>[],
  gaps: Record<string, GapZonesConfig<TStyle>> | undefined,
  valueAxis: AxisChannelName = 'y',
): Map<string, Map<TData, DiscreteGapFill<TStyle>>> {
  return new Map(
    seriesList.map((s) => [seriesIdOf(s), resolveDiscreteGapFills(s, resolveGapsForSeries(gaps, s.name), valueAxis)]),
  );
}
