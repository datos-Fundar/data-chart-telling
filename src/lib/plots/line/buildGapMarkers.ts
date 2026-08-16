import { resolveGapRuns, resolveGapsForSeries } from '$lib/plots/utils/gaps';
import { getConfiguration } from '$lib/configuration/config.svelte';
import type { GapPoint } from '$lib/plots/utils/gaps';
import type { Series } from '$lib/types/plots/data/common';
import type { GapsConfig } from '$lib/types/plots/gaps';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { LineMarkerConfig, DotMarkerConfig } from '$lib/types/markers/common';

const gx = (p: GapPoint) => p.x;
const gy = (p: GapPoint) => p.y;

/**
 * One `'line'` (+ `'dot'`, when its zone sets `style.dots`) marker per
 * detected, configured gap run across every series — the interpolated
 * bridge drawn over a missing-data hole. `gaps` is resolved per series the
 * same way `segments` is (a named entry, falling back to `'default'` at
 * zone granularity — see `resolveGapsForSeries`). Defaults to the series'
 * own colour with `cfg.line.gap`'s stroke/dot styling (dashed and slightly
 * muted out of the box), so a gap-fill reads as estimated rather than real
 * data unless a zone or the global configuration overrides it. Dots (when
 * requested) are drawn only at a run's two endpoints, not along every
 * sampled bridge point.
 */
export function buildGapMarkers<TData extends Record<string, unknown>>(args: {
  seriesList: Series<TData>[];
  gaps: GapsConfig<LineSegmentStyle>;
  colorFor: (seriesIndex: number) => string;
}): (LineMarkerConfig | DotMarkerConfig)[] {
  const { seriesList, gaps, colorFor } = args;
  const cfg = getConfiguration();
  const gapDefaults = cfg.line.gap;
  const markers: (LineMarkerConfig | DotMarkerConfig)[] = [];

  seriesList.forEach((series, seriesIndex) => {
    const zones = resolveGapsForSeries(gaps, series.name);
    const runs = resolveGapRuns(series, zones);
    if (runs.length === 0) return;
    const defaultColor = colorFor(seriesIndex);

    for (const run of runs) {
      const strokeStyle = run.zone.style?.stroke;
      const dotStyle = run.zone.style?.dots;

      markers.push({
        type: 'line',
        data: run.points,
        x: gx,
        y: gy,
        style: {
          stroke: strokeStyle?.stroke ?? defaultColor,
          strokeWidth: strokeStyle?.strokeWidth ?? gapDefaults.stroke.strokeWidth ?? cfg.line.strokeWidth,
          strokeOpacity: strokeStyle?.strokeOpacity ?? gapDefaults.stroke.strokeOpacity,
          strokeDasharray: strokeStyle?.strokeDasharray ?? gapDefaults.stroke.strokeDasharray,
          strokeLinejoin: strokeStyle?.strokeLinejoin ?? gapDefaults.stroke.strokeLinejoin,
          strokeLinecap: strokeStyle?.strokeLinecap ?? gapDefaults.stroke.strokeLinecap,
        },
      });

      if (!dotStyle) continue;
      const dotDefaults = gapDefaults.dots;
      const endpoints = [run.points[0], run.points[run.points.length - 1]];
      markers.push({
        type: 'dot',
        data: endpoints,
        x: gx,
        y: gy,
        style: {
          dotRadius: dotStyle.dotRadius ?? dotDefaults.dotRadius ?? cfg.line.dotRadius,
          dotFill: dotStyle.dotFill ?? strokeStyle?.stroke ?? dotDefaults.dotFill ?? defaultColor,
          dotSymbol: dotStyle.dotSymbol ?? dotDefaults.dotSymbol ?? 'circle',
          dotStroke: dotStyle.dotStroke ?? strokeStyle?.stroke ?? dotDefaults.dotStroke ?? defaultColor,
          dotStrokeWidth: dotStyle.dotStrokeWidth ?? dotDefaults.dotStrokeWidth ?? 1,
          dotFillOpacity: dotStyle.dotFillOpacity ?? dotDefaults.dotFillOpacity ?? 1,
          dotStrokeOpacity: dotStyle.dotStrokeOpacity ?? dotDefaults.dotStrokeOpacity ?? 1,
          dotStrokeDasharray: dotStyle.dotStrokeDasharray ?? dotDefaults.dotStrokeDasharray,
        },
      });
    }
  });

  return markers;
}
