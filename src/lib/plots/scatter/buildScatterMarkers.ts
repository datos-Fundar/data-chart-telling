import { resolveAccessor } from '$lib/plots/utils/accessors';
import { getConfiguration } from '$lib/configuration/config.svelte';
import type { Series, Accessor } from '$lib/types/plots/data/common';
import type { ScatterSegmentStyle } from '$lib/types/plots/segments/common';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { DotStyle } from '$lib/types/plots/styling';
import type { DotMarkerConfig } from '$lib/types/markers/common';

/** Every `'dot'` marker for one ScatterPlot render: one per visual segment. */
export function buildScatterMarkers<TData extends Record<string, unknown>>(args: {
  groupedSeries: VisualGroup<Series<TData>, ScatterSegmentStyle>[];
  r?: Accessor<TData, number> | number;
  colorFor: (seriesName: string) => string;
  disabledDotsFor: (seriesName: string) => DotStyle | undefined;
}): DotMarkerConfig[] {
  const { groupedSeries, r, colorFor, disabledDotsFor } = args;
  const cfg = getConfiguration();
  const rFn = r === undefined || typeof r === 'number' ? r : resolveAccessor(r);

  const markers: DotMarkerConfig[] = [];
  groupedSeries.forEach((group) => {
    const defaultColor = colorFor(group.series.name);
    const disabledDots = disabledDotsFor(group.series.name);
    const xFn = resolveAccessor(group.series.x);
    const yFn = resolveAccessor(group.series.y);

    for (const seg of group.visualSegments) {
      const dotStyle = seg.style;
      markers.push({
        type: 'dot',
        data: seg.data,
        x: xFn,
        y: yFn,
        r: rFn,
        style: {
          dotRadius: disabledDots?.dotRadius ?? dotStyle.dotRadius ?? cfg.scatter.dotRadius,
          dotFill: disabledDots?.dotFill ?? dotStyle.dotFill ?? defaultColor,
          dotSymbol: disabledDots?.dotSymbol ?? dotStyle.dotSymbol,
          dotStroke: disabledDots?.dotStroke ?? dotStyle.dotStroke,
          dotStrokeWidth: disabledDots?.dotStrokeWidth ?? dotStyle.dotStrokeWidth,
          dotFillOpacity: disabledDots?.dotFillOpacity ?? dotStyle.dotFillOpacity,
          dotStrokeOpacity: disabledDots?.dotStrokeOpacity ?? dotStyle.dotStrokeOpacity,
          dotStrokeDasharray: disabledDots?.dotStrokeDasharray ?? dotStyle.dotStrokeDasharray,
        },
      });
    }
  });

  return markers;
}
