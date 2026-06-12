import { resolveAccessor } from '$lib/plots/utils';
import type { LineSeries, SegmentsMap, DeltaConfig, DeltaTarget } from '$lib/types/plots/lines';
import type { XValue } from '$lib/types/plots/common';

export type ResolvedEndpoint = { value: number; strokeColor: string };

export type ResolvedDelta = {
  cfg: DeltaConfig;
  at: number;
  from: ResolvedEndpoint;
  to: ResolvedEndpoint;
  diff: number;
  mid: number;
};

/**
 * Sorts `data` by `sortBy`, then finds the first adjacent pair where `scanBy`
 * brackets `target` and linearly interpolates `measureBy` at that crossing.
 *
 * X delta usage: sortBy=getX, scanBy=getX, measureBy=getY  → Y at given X
 * Y delta usage: sortBy=getX, scanBy=getY, measureBy=getX  → X at given Y (first crossing)
 */
function interpolate<T extends Record<string, unknown>>(
  data: T[],
  sortBy: (d: T) => number,
  scanBy: (d: T) => number,
  measureBy: (d: T) => number,
  target: number,
): number | null {
  const sorted = [...data].sort((a, b) => sortBy(a) - sortBy(b));
  for (let i = 0; i < sorted.length; i++) {
    if (scanBy(sorted[i]) === target) return measureBy(sorted[i]);
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    const s0 = scanBy(sorted[i]);
    const s1 = scanBy(sorted[i + 1]);
    if ((s0 <= target && target <= s1) || (s1 <= target && target <= s0)) {
      const t = (target - s0) / (s1 - s0);
      return measureBy(sorted[i]) + t * (measureBy(sorted[i + 1]) - measureBy(sorted[i]));
    }
  }
  return null;
}

function colorAtX<T extends Record<string, unknown>>(
  s: LineSeries<T>,
  segments: SegmentsMap,
  atX: XValue,
  fallback: string,
): string {
  const range = (segments[s.name] ?? []).find(r =>
    (r.from === undefined || atX >= r.from) &&
    (r.to   === undefined || atX <= r.to)
  );
  return range?.style?.stroke?.stroke ?? fallback;
}

function resolveXDeltaEndpoint<T extends Record<string, unknown>>(
  allSeries: LineSeries<T>[],
  segments: SegmentsMap,
  target: DeltaTarget,
  atX: number,
  fallback: string,
): ResolvedEndpoint | null {
  if (target.type === 'axis') return { value: target.value ?? 0, strokeColor: fallback };
  const s = allSeries.find(s => s.name === target.series);
  if (!s) return null;
  const getX = (d: T) => Number(resolveAccessor(s.x)(d));
  const getY = (d: T) => Number(resolveAccessor(s.y)(d));
  const value = interpolate(s.data, getX, getX, getY, atX);
  if (value === null) return null;
  return { value, strokeColor: colorAtX(s, segments, atX, fallback) };
}

function resolveYDeltaEndpoint<T extends Record<string, unknown>>(
  allSeries: LineSeries<T>[],
  segments: SegmentsMap,
  target: DeltaTarget,
  atY: number,
  fallback: string,
): ResolvedEndpoint | null {
  if (target.type === 'axis') return { value: target.value ?? 0, strokeColor: fallback };
  const s = allSeries.find(s => s.name === target.series);
  if (!s) return null;
  const getX = (d: T) => Number(resolveAccessor(s.x)(d));
  const getY = (d: T) => Number(resolveAccessor(s.y)(d));
  const xVal = interpolate(s.data, getX, getY, getX, atY);
  if (xVal === null) return null;
  return { value: xVal, strokeColor: colorAtX(s, segments, xVal, fallback) };
}

function buildDelta(cfg: DeltaConfig, from: ResolvedEndpoint, to: ResolvedEndpoint): ResolvedDelta {
  const diff = Math.abs(from.value - to.value);
  const mid = (from.value + to.value) / 2;
  return { cfg, at: Number(cfg.at), from, to, diff, mid };
}

export function resolveXDeltas<T extends Record<string, unknown>>(
  allSeries: LineSeries<T>[],
  segments: SegmentsMap,
  configs: DeltaConfig[],
): ResolvedDelta[] {
  return configs.flatMap(cfg => {
    const fallback = cfg.stroke?.stroke ?? 'currentColor';
    const atX = Number(cfg.at);
    const from = resolveXDeltaEndpoint(allSeries, segments, cfg.from, atX, fallback);
    const to = cfg.to
      ? resolveXDeltaEndpoint(allSeries, segments, cfg.to, atX, fallback)
      : { value: 0, strokeColor: fallback };
    if (!from || !to) return [];
    return [buildDelta(cfg, from, to)];
  });
}

export function resolveYDeltas<T extends Record<string, unknown>>(
  allSeries: LineSeries<T>[],
  segments: SegmentsMap,
  configs: DeltaConfig[],
): ResolvedDelta[] {
  return configs.flatMap(cfg => {
    const fallback = cfg.stroke?.stroke ?? 'currentColor';
    const atY = Number(cfg.at);
    const from = resolveYDeltaEndpoint(allSeries, segments, cfg.from, atY, fallback);
    const to = cfg.to
      ? resolveYDeltaEndpoint(allSeries, segments, cfg.to, atY, fallback)
      : { value: 0, strokeColor: fallback };
    if (!from || !to) return [];
    return [buildDelta(cfg, from, to)];
  });
}
