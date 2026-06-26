import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { AxisValue, Series } from '$lib/types/plots/common';
import type {
  Area,
  Segment,
  Segments,
  LineSegmentStyle,
  VisualGroup,
  VisualSegment,
} from '$lib/types/plots/styles';

const DEFAULT_KEY = 'default';

/**
 * Returns the flat {@link Segment} list for one series.
 * Series-specific segments are added before `'default'` segments so that
 * series-specific catch-alls win over default catch-alls on tie-breaks.
 */
export function resolveSegmentsForSeries<TStyle>(
  segments: Segments<TStyle>,
  seriesName: string,
): Segment<TStyle>[] {
  const specific = segments[seriesName] ?? [];
  const defaults = segments[DEFAULT_KEY] ?? [];
  return [...specific, ...defaults];
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
 * Warns about obvious configuration mistakes: multiple catch-all segments
 * (no `areas`) in the same series list. Since catch-alls are evaluated last
 * and in order, only the first one can ever match; later ones are dead code.
 */
export function validateSegments<TStyle>(segments: Segments<TStyle>): void {
  const check = (label: string, segs: Segment<TStyle>[]) => {
    const catchAlls = segs.filter((s) => !s.areas || s.areas.length === 0).length;
    if (catchAlls > 1) {
      console.warn(
        `segments ${label}: ${catchAlls} entries have no areas — ` +
          `only the first catch-all's style will be used.`,
      );
    }
  };
  for (const [key, segs] of Object.entries(segments)) {
    check(key === DEFAULT_KEY ? '(default)' : `"${key}"`, segs);
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

  // Evaluate area-specific segments before catch-alls (no areas), preserving
  // relative order within each group. This lets a catch-all placed first in
  // the list act as a fallback baseline rather than matching everything.
  const evalOrder = segs
    .map((seg, i) => ({ seg, i }))
    .sort((a, b) => {
      const aSpecific = a.seg.areas != null && a.seg.areas.length > 0;
      const bSpecific = b.seg.areas != null && b.seg.areas.length > 0;
      if (aSpecific === bSpecific) return a.i - b.i;
      return aSpecific ? -1 : 1;
    });

  // For each data point, find the first matching segment index (-1 = unmatched).
  const matchIdx = series.data.map((d) => {
    const xVal = getX(d) as AxisValue;
    const yVal = getY(d) as AxisValue;
    const found = evalOrder.find(({ seg }) => {
      const areas = seg.areas;
      if (!areas || areas.length === 0) return true;
      return areas.some((area) => areaMatchesXY(xVal, yVal, area));
    });
    return found !== undefined ? found.i : -1;
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

  // Connector lines need to match the catch-all's stroke so they don't reveal
  // the default palette color when the user has set a baseline via catch-all.
  // Dots are excluded to avoid duplicate marks at the shared boundary points.
  const catchAll = segs.find((s) => !s.areas || s.areas.length === 0);
  const connectorStyle: TStyle = (() => {
    if (!catchAll?.style) return {} as TStyle;
    const { dots: _, ...rest } = catchAll.style as Record<string, unknown>;
    return rest as TStyle;
  })();

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
      const seg = segs[run.segIdx];
      const segStyle = seg.style ?? ({} as TStyle);
      // Area-specific segments merge the catch-all as a baseline: catch-all
      // keys fill in whatever the area segment omits; the area wins on conflict.
      const isAreaSpecific = seg.areas != null && seg.areas.length > 0;
      const resolvedStyle: TStyle =
        isAreaSpecific && catchAll?.style
          ? { ...(catchAll.style as object), ...(segStyle as object) } as TStyle
          : segStyle;
      userVisual.push({ data: run.data, style: resolvedStyle });
      // When the next run is also a user segment (no unmatched data between them),
      // insert a line-only connector so the lines join without a gap. Using a
      // separate mark (rather than appending a bridge point to the current run)
      // avoids rendering an extra dot at the shared boundary point.
      const nextRun = runs[r + 1];
      if (nextRun && nextRun.segIdx !== -1) {
        connectors.push({
          data: [run.data[run.data.length - 1], nextRun.data[0]],
          style: connectorStyle,
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
 * Each group's `visualSegments` is derived by resolving the flat segment list
 * for that series from all groups in `segments`.
 */
export function buildGroupedSeries<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  S extends Series<any>,
  TStyle = LineSegmentStyle,
>(seriesList: S[], segments: Segments<TStyle>): VisualGroup<S, TStyle>[] {
  return seriesList.map((s) => ({
    series: s,
    visualSegments: resolveSeriesSegments<S, TStyle>(
      s,
      resolveSegmentsForSeries(segments, s.name),
    ),
  }));
}
