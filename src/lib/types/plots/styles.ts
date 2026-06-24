import type { AxisValue, Series } from '$lib/types/plots/common';

/**
 * Unified positional anchor for value labels across all plot kinds.
 *
 * - `'outside'` — beyond the tip of the mark (above a vertical bar, to the
 *   far end of a horizontal bar or line). This is the only value with no
 *   direct svelteplot equivalent; the plot computes dx/dy internally.
 * - `'start'` — at the tip of the mark, just inside (top of a bar, far end
 *   of a pyramid bar from zero, right of a line's last point).
 * - `'middle'` — centred on the mark.
 * - `'end'` — at the baseline/zero end of the mark.
 */
export type ValueAnchor = 'outside' | 'start' | 'middle' | 'end';

/**
 * Controls if and how value labels are rendered on a plot. The high-level
 * `anchor` sets sensible defaults for placement; the low-level svelteplot
 * Text-mark fields (`dx`, `dy`, `textAnchor`, `lineAnchor`, `lineHeight`,
 * `rotate`, `class`, `textClass`) override those defaults when provided.
 */
export type ValuesStyle = {
  show?: boolean;
  anchor?: ValueAnchor;
  /** Called with the numeric value and the series name. Return a string to render. */
  format?: (value: number, seriesName: string) => string;
  dx?: number;
  dy?: number;
  textAnchor?: 'start' | 'end' | 'middle';
  lineAnchor?: 'top' | 'bottom' | 'middle';
  lineHeight?: number;
  rotate?: number;
  class?: string;
  textClass?: string;
};

/**
 * Color overrides for plots that derive their palette from data.
 * Each plot uses only the fields relevant to its kind; unused fields are
 * silently ignored.
 *
 * - `min` / `max` — sequential colour ramp endpoints (heatmap).
 * - `left` / `right` — diverging bar sides (pyramid).
 */
export type ColorsStyle = {
  min?: string;
  max?: string;
  left?: string;
  right?: string;
};

/**
 * Top-level rendering style overrides shared by all plot kinds. Passed as the
 * `styles` prop. Each plot reads only the fields it cares about.
 */
export type PlotStyles = {
  values?: ValuesStyle;
  colors?: ColorsStyle;
};

export type SymbolType = 'circle' | 'square' | 'triangle' | 'line';
export type LineStyle = 'solid' | 'dashed' | 'dotted' | 'dashdot';
export type LineCap = 'butt' | 'round' | 'square';
export type LineJoin = 'arcs' | 'bevel' | 'miter' | 'miter-clip' | 'round';

/** Stroke styling for any line-ish mark — a line, a rule, a marker's connector. */
export type StrokeStyle = {
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeDasharray?: string | LineStyle;
  strokeLinecap?: LineCap;
  strokeLinejoin?: LineJoin;
};

/**
 * Dot styling for any point mark — a line's endpoint dots, a marker's dot.
 * Carries its own `dotStroke*` fields rather than nesting a {@link StrokeStyle},
 * because a dot's outline is a distinct style from the stroke of the line (or
 * other mark) it sits next to — e.g. a {@link LineSegmentStyle} styles its
 * line's stroke and its dots' outline independently.
 */
export type DotStyle = {
  dotRadius?: number;
  dotFill?: string;
  dotFillOpacity?: number;
  dotSymbol?: SymbolType;
  dotStroke?: string;
  dotStrokeWidth?: number;
  dotStrokeOpacity?: number;
  dotStrokeDasharray?: string | LineStyle;
};

/** Text/label styling for any text mark — a marker's label, an annotation. */
export type FontStyle = {
  fill?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAnchor?: 'start' | 'middle' | 'end';
  lineAnchor?: 'top' | 'middle' | 'bottom';
  stroke?: string;
  strokeWidth?: number;
  paintOrder?: string;
  dx?: number;
  dy?: number;
};

/** Per-segment styling for a line: its stroke and/or its endpoint dots. */
export type LineSegmentStyle = {
  stroke?: StrokeStyle;
  dots?: DotStyle;
};

/** Per-segment styling for a bar: its fill. */
export type BarSegmentStyle = {
  fill?: string;
  fillOpacity?: number;
};

/**
 * A styled interval on the x axis, keyed by series name in a {@link SegmentsMap}.
 * Works for any mark — `TStyle` is the per-mark style shape (e.g.
 * {@link LineSegmentStyle} or {@link BarSegmentStyle}).
 */
export type RangeSegment<TStyle> = {
  from?: AxisValue;
  to?: AxisValue;
  style?: TStyle;
};

/** Per-series list of styled x-axis intervals. */
export type SegmentsMap<TStyle = LineSegmentStyle> = Record<string, RangeSegment<TStyle>[]>;

/** One contiguous, styled slice of a series' data — ready to draw as its own mark. */
export type VisualSegment<T extends Record<string, unknown>, TStyle = LineSegmentStyle> = {
  data: T[];
  style: TStyle;
};

/**
 * A series split into its styled visual segments. `S` is the full series
 * type Series<T> — its row type is read off `S['data']`
 * rather than taken as a separate parameter, since TypeScript can't reliably
 * infer a type parameter that only appears inside another parameter's
 * constraint.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VisualGroup<S extends Series<any>, TStyle = LineSegmentStyle> = {
  series: S;
  visualSegments: VisualSegment<S['data'][number], TStyle>[];
};
