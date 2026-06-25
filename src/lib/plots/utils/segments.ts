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

  type DataPoint = S['data'][number];

  // For each data point, find the first matching segment index (-1 = unmatched).
  const matchIdx = series.data.map((d) => {
    const xVal = getX(d) as AxisValue;
    const yVal = getY(d) as AxisValue;
    return segs.findIndex((seg) => {
      const areas = seg.areas;
      if (!areas || areas.length === 0) return true;
      return areas.some((area) => areaMatchesXY(xVal, yVal, area));
    });
  });

  // Group consecutive data points into runs by their matched segment index.
  // Each run becomes its own visual segment (mark), preventing Observable Plot
  // from drawing lines across non-contiguous areas of the same Segment.
  type Run = { data: DataPoint[]; segIdx: number };
  const runs: Run[] = [];
  for (let i = 0; i < series.data.length; i++) {
    const idx = matchIdx[i];
    const last = runs[runs.length - 1];
    if (last && last.segIdx === idx) {
      last.data.push(series.data[i]);
    } else {
      runs.push({ data: [series.data[i]], segIdx: idx });
    }
  }

  const defaultVisual: VisualSegment<DataPoint, TStyle>[] = [];
  const connectors: VisualSegment<DataPoint, TStyle>[] = [];
  const userVisual: VisualSegment<DataPoint, TStyle>[] = [];

  for (let r = 0; r < runs.length; r++) {
    const run = runs[r];
    if (run.segIdx === -1) {
      // Unmatched run: insert bridge points so the line connects to adjacent
      // user segments without a gap.
      const bridged: DataPoint[] = [];
      if (r > 0) bridged.push(runs[r - 1].data[runs[r - 1].data.length - 1]);
      bridged.push(...run.data);
      if (r < runs.length - 1) bridged.push(runs[r + 1].data[0]);
      defaultVisual.push({ data: bridged, style: {} as TStyle });
    } else {
      userVisual.push({ data: run.data, style: segs[run.segIdx].style ?? ({} as TStyle) });
      // When the next run is also a user segment (no unmatched data between them),
      // insert a line-only connector so the lines join without a gap. Using a
      // separate mark (rather than appending a bridge point to the current run)
      // avoids rendering an extra dot at the shared boundary point.
      const nextRun = runs[r + 1];
      if (nextRun && nextRun.segIdx !== -1) {
        connectors.push({
          data: [run.data[run.data.length - 1], nextRun.data[0]],
          style: {} as TStyle,
        });
      }
    }
  }

  if (defaultVisual.length === 0 && connectors.length === 0) return userVisual;

  // Defaults and connectors render first so user segments paint on top at
  // their endpoints, ensuring the correct dot style at boundary points.
  return [...defaultVisual, ...connectors, ...userVisual];
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
