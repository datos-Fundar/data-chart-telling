import { resolveAccessor } from '$lib/plots/utils';
import type {
  LineSeries,
  SegmentsMap,
  VisualGroup,
  VisualSegment,
} from '$lib/types/plots/lines';

/**
 * Warns about structural problems in the `segments` prop.
 * Record keys are unique by definition, so only per-series range rules apply:
 *   - At most one range may omit `from` (open start).
 *   - At most one range may omit `to` (open end).
 */
export function validateSegments(segments: SegmentsMap): void {
  for (const [series, ranges] of Object.entries(segments)) {
    const openStarts = ranges.filter(r => r.from === undefined).length;
    const openEnds   = ranges.filter(r => r.to   === undefined).length;

    if (openStarts > 1) {
      console.warn(
        `[LinePlot] Series "${series}": ${openStarts} ranges have no 'from'. ` +
        `Only one may start from the beginning of the data.`
      );
    }
    if (openEnds > 1) {
      console.warn(
        `[LinePlot] Series "${series}": ${openEnds} ranges have no 'to'. ` +
        `Only one may extend to the end of the data.`
      );
    }
  }
}

function resolveSeriesSegments<T extends Record<string, unknown>>(
  series: LineSeries<T>,
  segments: SegmentsMap,
): VisualSegment<T>[] {
  const ranges = segments[series.name];

  if (!ranges || ranges.length === 0) {
    return [{ data: series.data, style: {} }];
  }

  const getX = resolveAccessor(series.x);

  return ranges.map(seg => ({
    data: series.data.filter(d => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const x = getX(d) as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (seg.from === undefined || x >= (seg.from as any)) &&
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             (seg.to   === undefined || x <= (seg.to   as any));
    }),
    style: seg.style ?? {},
  }));
}

/**
 * Builds the full list of visual groups — one per series — ready to render.
 */
export function buildGroupedSeries<T extends Record<string, unknown>>(
  seriesList: LineSeries<T>[],
  segments: SegmentsMap,
): VisualGroup<T>[] {
  return seriesList.map(s => ({
    series: s,
    visualSegments: resolveSeriesSegments(s, segments),
  }));
}
