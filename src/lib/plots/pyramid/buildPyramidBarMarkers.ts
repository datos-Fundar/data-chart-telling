import { resolveAccessor } from '$lib/plots/utils/accessors';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { isGapValue, resolveGapAreaStyle } from '$lib/plots/utils/gaps';
import type { Series } from '$lib/types/plots/data/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { BarMarkerConfig } from '$lib/types/markers/common';
import type { DiscreteGapFill } from '$lib/plots/utils/gaps';

const GAP_KINDS = ['start', 'middle', 'end'] as const;

/** A gap-fill row tagged with its resolved signed value as a plain field — see the note on `taggedData` below. */
type GapFillRow<TData> = TData & { __gapValue: number };

/**
 * Every `'bar'` marker for one PyramidPlot render — reuses `BarMarkerConfig`
 * directly, always horizontal (category on y, signed magnitude on x) and
 * with no insets. Emits no `role: 'hitArea'` markers, since PyramidPlot's
 * hover matches nearest points rather than hit-testing category bands. A
 * row whose value is missing and *not* filled by a `styles.gaps` zone is
 * skipped entirely; a filled one gets one additional, distinctly-styled
 * marker per zone kind, at its interpolated value.
 */
export function buildPyramidBarMarkers<TData extends Record<string, unknown>, S extends Series<TData>>(args: {
  groupedSeries: VisualGroup<S, BarSegmentStyle>[];
  valueFor: (series: S, d: TData) => number;
  /** Signs an already-resolved magnitude (e.g. a gap-fill's interpolated value, which has no row of its own to read via `valueFor`). */
  signFor: (series: S, magnitude: number) => number;
  colorFor: (series: S) => string;
  disabledFillFor: (seriesName: string) => { fill?: string; fillOpacity?: number } | undefined;
  gapFillMaps: Map<string, Map<TData, DiscreteGapFill<BarSegmentStyle>>>;
}): BarMarkerConfig[] {
  const { groupedSeries, valueFor, signFor, colorFor, disabledFillFor, gapFillMaps } = args;
  const gapDefaults = getConfiguration().pyramid.gap;

  const markers: BarMarkerConfig[] = [];
  for (const group of groupedSeries) {
    const getCategory = resolveAccessor(group.series.x);
    const getMagnitude = resolveAccessor(group.series.y);
    const defaultColor = colorFor(group.series);
    const disabledFill = disabledFillFor(group.series.name);

    for (const seg of group.visualSegments) {
      const realData = seg.data.filter((d) => !isGapValue(getMagnitude(d)));
      if (realData.length === 0) continue;
      markers.push({
        type: 'bar',
        role: 'segment',
        isHorizontal: true,
        data: realData,
        y: getCategory,
        x1: 0,
        x2: (d: TData) => valueFor(group.series, d),
        style: {
          fill: disabledFill?.fill ?? seg.style.fill ?? defaultColor,
          fillOpacity: disabledFill?.fillOpacity ?? seg.style.fillOpacity ?? 1,
        },
      });
    }

    const fillMap = gapFillMaps.get(group.series.name) ?? new Map<TData, DiscreteGapFill<BarSegmentStyle>>();
    for (const kind of GAP_KINDS) {
      const filledRows = group.series.data.filter((d) => fillMap.get(d)?.kind === kind);
      if (filledRows.length === 0) continue;
      const base = resolveGapAreaStyle(fillMap.get(filledRows[0])!.style, defaultColor, gapDefaults);
      // svelteplot shallow-clones each row before invoking a mark's own
      // geometry accessors, so a `fillMap.get(d)` lookup inside `x2` would
      // see a clone, not the original key — tag the resolved value onto the
      // row as a plain field instead, which survives that clone.
      const taggedData: GapFillRow<TData>[] = filledRows.map((d) => ({
        ...d,
        __gapValue: signFor(group.series, Math.abs(fillMap.get(d)!.value)),
      }));
      markers.push({
        type: 'bar',
        role: 'segment',
        isHorizontal: true,
        data: taggedData,
        y: getCategory,
        x1: 0,
        x2: (d: TData) => (d as GapFillRow<TData>).__gapValue,
        style: {
          ...base,
          fill: disabledFill?.fill ?? base.fill,
          fillOpacity: disabledFill?.fillOpacity ?? base.fillOpacity,
        },
      });
    }
  }
  return markers;
}
