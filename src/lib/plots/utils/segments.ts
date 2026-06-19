import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { Series } from '$lib/types/plots/common';
import type {
  LineSegmentStyle,
  SegmentsMap,
  VisualGroup,
  VisualSegment,
} from '$lib/types/plots/styles';

/**
 * Warns about structural problems in the `segments` prop.
 * Record keys are unique by definition, so only per-series range rules apply:
 *   - At most one range may omit `from` (open start).
 *   - At most one range may omit `to` (open end).
 */
export function validateSegments<TStyle>(segments: SegmentsMap<TStyle>): void {
  for (const [series, ranges] of Object.entries(segments)) {
    const openStarts = ranges.filter(r => r.from === undefined).length;
    const openEnds   = ranges.filter(r => r.to   === undefined).length;

    if (openStarts > 1) {
      console.warn(
        `Series "${series}": ${openStarts} ranges have no 'from'. ` +
        `Only one may start from the beginning of the data.`
      );
    }
    if (openEnds > 1) {
      console.warn(
        `Series "${series}": ${openEnds} ranges have no 'to'. ` +
        `Only one may extend to the end of the data.`
      );
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveSeriesSegments<S extends Series<any>, TStyle>(
  series: S,
  segments: SegmentsMap<TStyle>,
): VisualSegment<S['data'][number], TStyle>[] {
  const ranges = segments[series.name];

  if (!ranges || ranges.length === 0) {
    return [{ data: series.data, style: {} as TStyle }];
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
    style: seg.style ?? ({} as TStyle),
  }));
}

/**
 * Builds the full list of visual groups — one per series — ready to render.
 * Works for any mark with a {@link Series}-shaped list: a line splits each
 * group into separately-styled `<Line>` calls, a bar into separately-styled
 * `<BarY>` calls, etc.
 */
export function buildGroupedSeries<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  S extends Series<any>,
  TStyle = LineSegmentStyle,
>(
  seriesList: S[],
  segments: SegmentsMap<TStyle>,
): VisualGroup<S, TStyle>[] {
  return seriesList.map(s => ({
    series: s,
    visualSegments: resolveSeriesSegments<S, TStyle>(s, segments),
  }));
}
