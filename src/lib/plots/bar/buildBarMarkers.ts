import { resolveAccessor } from '$lib/plots/utils/accessors';
import { paletteColor } from '$lib/utils/color';
import type { AxisValue } from '$lib/types/plots/axis';
import type { Series } from '$lib/types/plots/data/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { HoverPoint } from '$lib/types/layout/tooltip';
import type { BarMarkerConfig } from '$lib/types/markers/common';
import type { BarLayout } from './layout.svelte';

/**
 * Every `'bar'` marker for one BarPlot render: one `role: 'segment'` marker
 * per series (`'stacked'`) or per visual segment (`'grouped'`/`'overlap'`) —
 * a straight port of what `BarSegments.svelte` used to render directly —
 * plus one `role: 'hitArea'` marker per category, ported from
 * `HoverHitAreas.svelte`'s `byCategory` grouping. Both come out of this one
 * call so a chart can never get segment markers without their hit areas.
 *
 * Geometry for `'hitArea'` markers is left unresolved (just `category` +
 * `data`) — turning that into pixels needs svelteplot's live scale via
 * `usePlot()`, which is only available where the marker actually renders
 * (inside `GeometryLayout`), not here.
 */
export function buildBarMarkers<TData extends Record<string, unknown>>(args: {
  groupedSeries: VisualGroup<Series<TData>, BarSegmentStyle>[];
  barLayout: BarLayout<TData>;
  isHorizontal: boolean;
  hoverPoints: HoverPoint<TData>[];
  palette: string[];
  disabledFillFor: (seriesName: string) => { fill?: string; fillOpacity?: number } | undefined;
  active: boolean;
  setHoverMatch: (rows: TData[]) => void;
  clearHoverMatch: () => void;
}): BarMarkerConfig[] {
  const { groupedSeries, barLayout, isHorizontal, hoverPoints, palette, disabledFillFor, active, setHoverMatch, clearHoverMatch } = args;

  const segmentMarkers: BarMarkerConfig[] = [];
  groupedSeries.forEach((group, seriesIndex) => {
    const xFn = resolveAccessor(group.series.x);
    const yFn = resolveAccessor(group.series.y);
    const defaultColor = paletteColor(seriesIndex, palette);
    const disabledFill = disabledFillFor(group.series.name);

    if (barLayout.layout === 'stacked') {
      const stackedBaselineFn = (d: TData) => barLayout.stackedBaseline(xFn(d), seriesIndex);
      const stackedTopFn = (d: TData) => barLayout.stackedBaseline(xFn(d), seriesIndex) + Number(yFn(d));
      const marker: BarMarkerConfig = {
        type: 'bar',
        role: 'segment',
        isHorizontal,
        data: group.series.data,
        style: {
          fill: disabledFill?.fill ?? defaultColor,
          fillOpacity: disabledFill?.fillOpacity ?? 1,
        },
      };
      if (isHorizontal) {
        marker.y = xFn;
        marker.x1 = stackedBaselineFn;
        marker.x2 = stackedTopFn;
      } else {
        marker.x = xFn;
        marker.y1 = stackedBaselineFn;
        marker.y2 = stackedTopFn;
      }
      segmentMarkers.push(marker);
      return;
    }

    for (const seg of group.visualSegments) {
      const marker: BarMarkerConfig = {
        type: 'bar',
        role: 'segment',
        isHorizontal,
        data: seg.data,
        style: {
          fill: disabledFill?.fill ?? seg.style.fill ?? defaultColor,
          fillOpacity: disabledFill?.fillOpacity ?? seg.style.fillOpacity ?? 1,
        },
      };
      if (isHorizontal) {
        marker.y = xFn;
        marker.x1 = barLayout.valueBaseline;
        marker.x2 = yFn;
      } else {
        marker.x = xFn;
        marker.y1 = barLayout.valueBaseline;
        marker.y2 = yFn;
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
      segmentMarkers.push(marker);
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
