import { resolveAccessor } from '$lib/plots/utils/accessors';
import { getConfiguration } from '$lib/configuration/config.svelte';
import type { Series } from '$lib/types/plots/data/common';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { StrokeStyle, DotStyle } from '$lib/types/plots/styling';
import type { LineMarkerConfig, DotMarkerConfig } from '$lib/types/markers/common';

/**
 * Every `'line'` (+ `'dot'`, where a segment's style asks for them) marker
 * for one LinePlot render: one `'line'` marker per visual segment, plus a
 * `'dot'` marker right after it when that segment sets `style.dots`.
 */
export function buildLineMarkers<TData extends Record<string, unknown>>(args: {
  groupedSeries: VisualGroup<Series<TData>, LineSegmentStyle>[];
  colorFor: (seriesName: string) => string;
  disabledStrokeFor: (seriesName: string) => StrokeStyle | undefined;
  disabledDotsFor: (seriesName: string) => DotStyle | undefined;
}): (LineMarkerConfig | DotMarkerConfig)[] {
  const { groupedSeries, colorFor, disabledStrokeFor, disabledDotsFor } = args;
  const cfg = getConfiguration();

  const markers: (LineMarkerConfig | DotMarkerConfig)[] = [];
  groupedSeries.forEach((group) => {
    const defaultColor = colorFor(group.series.name);
    const disabledStroke = disabledStrokeFor(group.series.name);
    const disabledDots = disabledDotsFor(group.series.name);
    const xFn = resolveAccessor(group.series.x);
    const yFn = resolveAccessor(group.series.y);

    for (const seg of group.visualSegments) {
      const strokeStyle = seg.style.stroke;
      const dotStyle = seg.style.dots;
      markers.push({
        type: 'line',
        data: seg.data,
        x: xFn,
        y: yFn,
        style: {
          stroke: disabledStroke?.stroke ?? strokeStyle?.stroke ?? defaultColor,
          strokeWidth: disabledStroke?.strokeWidth ?? strokeStyle?.strokeWidth ?? cfg.line.strokeWidth,
          strokeOpacity: disabledStroke?.strokeOpacity ?? strokeStyle?.strokeOpacity ?? 1,
          strokeDasharray: disabledStroke?.strokeDasharray ?? strokeStyle?.strokeDasharray,
          strokeLinejoin: disabledStroke?.strokeLinejoin ?? strokeStyle?.strokeLinejoin,
          strokeLinecap: disabledStroke?.strokeLinecap ?? strokeStyle?.strokeLinecap,
        },
      });

      if (!dotStyle) continue;
      markers.push({
        type: 'dot',
        data: seg.data,
        x: xFn,
        y: yFn,
        style: {
          dotRadius: disabledDots?.dotRadius ?? dotStyle.dotRadius ?? cfg.line.dotRadius,
          dotFill: disabledDots?.dotFill ?? dotStyle.dotFill ?? strokeStyle?.stroke ?? defaultColor,
          dotSymbol: disabledDots?.dotSymbol ?? dotStyle.dotSymbol ?? 'circle',
          dotStroke: disabledDots?.dotStroke ?? dotStyle.dotStroke ?? strokeStyle?.stroke ?? defaultColor,
          dotStrokeWidth: disabledDots?.dotStrokeWidth ?? dotStyle.dotStrokeWidth ?? 1,
          dotFillOpacity: disabledDots?.dotFillOpacity ?? dotStyle.dotFillOpacity ?? strokeStyle?.strokeOpacity ?? 1,
          dotStrokeOpacity: disabledDots?.dotStrokeOpacity ?? dotStyle.dotStrokeOpacity ?? strokeStyle?.strokeOpacity ?? 1,
          dotStrokeDasharray: disabledDots?.dotStrokeDasharray ?? dotStyle.dotStrokeDasharray,
        },
      });
    }
  });

  return markers;
}
