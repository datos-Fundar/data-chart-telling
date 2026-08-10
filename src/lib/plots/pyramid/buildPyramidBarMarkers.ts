import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { Series } from '$lib/types/plots/data/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { BarMarkerConfig } from '$lib/types/markers/common';

/**
 * Every `'bar'` marker for one PyramidPlot render — reuses `BarMarkerConfig`
 * directly, always horizontal (category on y, signed magnitude on x) and
 * with no insets. Emits no `role: 'hitArea'` markers, since PyramidPlot's
 * hover matches nearest points rather than hit-testing category bands.
 */
export function buildPyramidBarMarkers<TData extends Record<string, unknown>, S extends Series<TData>>(args: {
  groupedSeries: VisualGroup<S, BarSegmentStyle>[];
  valueFor: (series: S, d: TData) => number;
  colorFor: (series: S) => string;
  disabledFillFor: (seriesName: string) => { fill?: string; fillOpacity?: number } | undefined;
}): BarMarkerConfig[] {
  const { groupedSeries, valueFor, colorFor, disabledFillFor } = args;

  const markers: BarMarkerConfig[] = [];
  for (const group of groupedSeries) {
    const getCategory = resolveAccessor(group.series.x);
    const defaultColor = colorFor(group.series);
    const disabledFill = disabledFillFor(group.series.name);
    for (const seg of group.visualSegments) {
      markers.push({
        type: 'bar',
        role: 'segment',
        isHorizontal: true,
        data: seg.data,
        y: getCategory,
        x1: 0,
        x2: (d: TData) => valueFor(group.series, d),
        style: {
          fill: disabledFill?.fill ?? seg.style.fill ?? defaultColor,
          fillOpacity: disabledFill?.fillOpacity ?? seg.style.fillOpacity ?? 1,
        },
      });
    }
  }
  return markers;
}
