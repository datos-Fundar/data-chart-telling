import { resolveAccessor } from '$lib/plots/utils/accessors';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { isGapValue, resolveGapAreaStyle } from '$lib/plots/utils/gaps';
import type { AxisValue } from '$lib/types/layout/scales';
import type { Series } from '$lib/types/plots/data/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { HoverPoint } from '$lib/types/layout/tooltip';
import type { BarMarkerConfig } from '$lib/types/markers/common';
import type { BarLayout } from './layout.svelte';
import type { DiscreteGapFill } from '$lib/plots/utils/gaps';

const GAP_KINDS = ['start', 'middle', 'end'] as const;

/** A gap-fill row tagged with its resolved value as a plain field — see the note on `taggedData` below. */
type GapFillRow<TData> = TData & { __gapValue: number };

/**
 * Every `'bar'` marker for one BarPlot render: one `role: 'segment'` marker
 * per series (stacked) or per visual segment (grouped/overlap), one
 * additional `role: 'segment'` marker per series per gap zone kind for any
 * row `styles.gaps` fills (distinctly styled, drawn at its interpolated
 * value — see `resolveDiscreteGapFills`), plus one `role: 'hitArea'` marker
 * per category, so a chart never gets segment markers without their hit
 * areas. A row whose value is missing and *not* filled by a gap zone is
 * skipped entirely — no bar drawn, rather than the broken zero/`NaN`
 * geometry a raw missing value would otherwise produce.
 *
 * `'hitArea'` geometry is left unresolved (just `category` + `data`) —
 * resolving it to pixels needs svelteplot's live scale, only available
 * where the marker actually renders.
 */
export function buildBarMarkers<TData extends Record<string, unknown>>(args: {
  groupedSeries: VisualGroup<Series<TData>, BarSegmentStyle>[];
  barLayout: BarLayout<TData>;
  isHorizontal: boolean;
  hoverPoints: HoverPoint<TData>[];
  colorFor: (seriesName: string) => string;
  disabledFillFor: (seriesName: string) => { fill?: string; fillOpacity?: number } | undefined;
  active: boolean;
  setHoverMatch: (rows: TData[]) => void;
  clearHoverMatch: () => void;
  gapFillMaps: Map<string, Map<TData, DiscreteGapFill<BarSegmentStyle>>>;
}): BarMarkerConfig[] {
  const { groupedSeries, barLayout, isHorizontal, hoverPoints, colorFor, disabledFillFor, active, setHoverMatch, clearHoverMatch, gapFillMaps } = args;
  const gapDefaults = getConfiguration().bar.gap;

  const segmentMarkers: BarMarkerConfig[] = [];
  groupedSeries.forEach((group, seriesIndex) => {
    const xFn = resolveAccessor(group.series.x);
    const yFn = resolveAccessor(group.series.y);
    const defaultColor = colorFor(group.series.name);
    const disabledFill = disabledFillFor(group.series.name);

    // Places one series' bar(s) — real or gap-fill — using whichever
    // layout mode (stacked baseline, or flat baseline + grouped insets) is
    // active, so a gap-fill bar always lands in exactly the same slot a
    // real bar for that row would.
    function makeMarker(data: TData[], valueFn: (d: TData) => number, style: BarSegmentStyle): BarMarkerConfig | null {
      if (data.length === 0) return null;
      const marker: BarMarkerConfig = { type: 'bar', role: 'segment', isHorizontal, data, style };
      if (barLayout.layout === 'stacked') {
        const baselineFn = (d: TData) => barLayout.stackedBaseline(xFn(d), seriesIndex);
        const topFn = (d: TData) => baselineFn(d) + valueFn(d);
        if (isHorizontal) {
          marker.y = xFn;
          marker.x1 = baselineFn;
          marker.x2 = topFn;
        } else {
          marker.x = xFn;
          marker.y1 = baselineFn;
          marker.y2 = topFn;
        }
      } else {
        if (isHorizontal) {
          marker.y = xFn;
          marker.x1 = barLayout.valueBaseline;
          marker.x2 = valueFn;
        } else {
          marker.x = xFn;
          marker.y1 = barLayout.valueBaseline;
          marker.y2 = valueFn;
        }
        if (barLayout.layout === 'grouped') {
          if (isHorizontal) {
            marker.insetTop = seriesIndex * barLayout.seriesStep + barLayout.seriesGap / 2;
            marker.insetBottom = (barLayout.seriesCount - 1 - seriesIndex) * barLayout.seriesStep + barLayout.seriesGap / 2;
          } else {
            marker.insetLeft = seriesIndex * barLayout.seriesStep + barLayout.seriesGap / 2;
            marker.insetRight = (barLayout.seriesCount - 1 - seriesIndex) * barLayout.seriesStep + barLayout.seriesGap / 2;
          }
        }
      }
      return marker;
    }

    // Mirrors the pre-existing behavior for both branches: a series-scoped
    // `segments` catch-all style (e.g. an explicit `fill`) wins over the
    // index-derived `defaultColor`.
    for (const seg of group.visualSegments) {
      const realData = seg.data.filter((d) => !isGapValue(yFn(d)));
      const style: BarSegmentStyle = {
        fill: disabledFill?.fill ?? seg.style.fill ?? defaultColor,
        fillOpacity: disabledFill?.fillOpacity ?? seg.style.fillOpacity ?? 1,
      };
      const valueFn = barLayout.layout === 'stacked' ? (d: TData) => Number(yFn(d)) : yFn;
      const marker = makeMarker(realData, valueFn, style);
      if (marker) segmentMarkers.push(marker);
    }

    const fillMap = gapFillMaps.get(group.series.name) ?? new Map<TData, DiscreteGapFill<BarSegmentStyle>>();
    for (const kind of GAP_KINDS) {
      const filledRows = group.series.data.filter((d) => fillMap.get(d)?.kind === kind);
      if (filledRows.length === 0) continue;
      const base = resolveGapAreaStyle(fillMap.get(filledRows[0])!.style, defaultColor, gapDefaults);
      const gapStyle: BarSegmentStyle = {
        ...base,
        fill: disabledFill?.fill ?? base.fill,
        fillOpacity: disabledFill?.fillOpacity ?? base.fillOpacity,
      };
      // svelteplot shallow-clones each row before invoking a mark's own
      // geometry accessors (same reason PyramidPlot's `flat` tags rows
      // instead of relying on identity) — a `fillMap.get(d)` lookup inside
      // `valueFn` would see a clone, not the original key. Tagging the
      // resolved value onto the row as a plain field survives that clone.
      const taggedData: GapFillRow<TData>[] = filledRows.map((d) => ({ ...d, __gapValue: fillMap.get(d)!.value }));
      const marker = makeMarker(taggedData, (d) => (d as GapFillRow<TData>).__gapValue, gapStyle);
      if (marker) segmentMarkers.push(marker);
    }
  });

  const byCategory = new Map<AxisValue, HoverPoint<TData>[]>();
  for (const p of hoverPoints) {
    const key = isHorizontal ? p.y : p.x;
    const list = byCategory.get(key);
    if (list) list.push(p);
    else byCategory.set(key, [p]);
  }
  const hitAreaMarkers: BarMarkerConfig[] = [...byCategory.entries()].map(([category, points]) => ({
    type: 'bar',
    role: 'hitArea',
    isHorizontal,
    category,
    data: points.map((p) => p.row),
    onpointerenter: active ? () => setHoverMatch(points.map((p) => p.row)) : undefined,
    onpointerleave: active ? clearHoverMatch : undefined,
  }));

  return [...segmentMarkers, ...hitAreaMarkers];
}
