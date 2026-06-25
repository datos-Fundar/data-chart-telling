import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { AxisValue, Series } from '$lib/types/plots/common';
import type {
  Area,
  Segment,
  SegmentsMap,
  SeriesAwareSegmentsMap,
  LineSegmentStyle,
  VisualGroup,
  VisualSegment,
} from '$lib/types/plots/styles';

/** Narrows a {@link SegmentsMap} to its per-series record form. */
export function isSeriesAware<TStyle>(
  segments: SegmentsMap<TStyle>,
): segments is SeriesAwareSegmentsMap<TStyle> {
  return !Array.isArray(segments);
}

/**
 * Returns the {@link Segment} list relevant for one series. If `segments` is
 * the global array form every series gets the same list; if it is the record
 * form only the entry keyed by `seriesName` is used (falling back to `[]`).
 */
export function resolveSegmentsForSeries<TStyle>(
  segments: SegmentsMap<TStyle>,
  seriesName: string,
): Segment<TStyle>[] {
  return Array.isArray(segments) ? segments : (segments[seriesName] ?? []);
}

/** Returns true when `xVal` falls inside any of a segment's x ranges. */
export function matchesSegmentX<TStyle>(xVal: AxisValue, seg: Segment<TStyle>): boolean {
  const areas = seg.areas;
  if (!areas || areas.length === 0) return true;
  return areas.some((area) => areaMatchesX(xVal, area));
}

function areaMatchesX(xVal: AxisValue, area: Area): boolean {
  if (!area.x) return true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (area.x.from === undefined || (xVal as any) >= area.x.from) &&
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         (area.x.to   === undefined || (xVal as any) <= area.x.to);
}

function areaMatchesXY(xVal: AxisValue, yVal: AxisValue, area: Area): boolean {
  if (!areaMatchesX(xVal, area)) return false;
  if (!area.y) return true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (area.y.from === undefined || (yVal as any) >= area.y.from) &&
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         (area.y.to   === undefined || (yVal as any) <= area.y.to);
}

/**
 * For each segment in `segs`, returns the subset of `data` rows whose x value
 * (from `xAccessor`) falls inside any of the segment's x ranges. Rows are
 * not deduplicated across segments — a row that matches multiple segments
 * appears in each resulting array.
 *
 * Used by component and hover markers with the `'segment'` strategy.
 */
export function getDataForSegments<TData, TStyle>(
  data: TData[],
  xAccessor: (d: TData) => AxisValue,
  segs: Segment<TStyle>[],
): TData[][] {
  return segs.map((seg) => {
    const areas = seg.areas;
    if (!areas || areas.length === 0) return data;
    return data.filter((d) => areas.some((area) => areaMatchesX(xAccessor(d), area)));
  });
}

/**
 * Warns about obvious configuration mistakes:
 * - Multiple segments with no `areas` in the same series (they all match
 *   everything; only the last style will be visible).
 */
export function validateSegments<TStyle>(segments: SegmentsMap<TStyle>): void {
  const check = (label: string, segs: Segment<TStyle>[]) => {
    const catchAlls = segs.filter((s) => !s.areas || s.areas.length === 0).length;
    if (catchAlls > 1) {
      console.warn(
        `segments ${label}: ${catchAlls} entries have no areas — ` +
          `they each match every data point; only the last one's style will be visible.`,
      );
    }
  };
  if (Array.isArray(segments)) {
    check('(global)', segments);
  } else {
    for (const [name, segs] of Object.entries(segments)) {
      check(`"${name}"`, segs);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveSeriesSegments<S extends Series<any>, TStyle>(
  series: S,
  segs: Segment<TStyle>[],
): VisualSegment<S['data'][number], TStyle>[] {
  if (!segs.length) {
    return [{ data: series.data, style: {} as TStyle }];
  }

  const getX = resolveAccessor(series.x);
  const getY = resolveAccessor(series.y);

  return segs.map((seg) => {
    const areas = seg.areas;
    const data =
      !areas || areas.length === 0
        ? series.data
        : series.data.filter((d) => {
            const xVal = getX(d) as AxisValue;
            const yVal = getY(d) as AxisValue;
            return areas.some((area) => areaMatchesXY(xVal, yVal, area));
          });
    return { data, style: seg.style ?? ({} as TStyle) };
  });
}

/**
 * Builds the full list of visual groups — one per series — ready to render.
 * Each group's `visualSegments` is derived from the series' entry in
 * `segments` (or the global array when `segments` is in array form).
 */
export function buildGroupedSeries<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  S extends Series<any>,
  TStyle = LineSegmentStyle,
>(seriesList: S[], segments: SegmentsMap<TStyle>): VisualGroup<S, TStyle>[] {
  return seriesList.map((s) => ({
    series: s,
    visualSegments: resolveSeriesSegments<S, TStyle>(
      s,
      resolveSegmentsForSeries(segments, s.name),
    ),
  }));
}
