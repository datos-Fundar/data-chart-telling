import type {
  FontWeight,
  FontStyleKeyword,
  TextAnchor,
  LineAnchor,
  LineStyle,
  LineCap,
  LineJoin,
  SymbolType
} from '$lib/types/plots/constants';

/** Text/label styling for any text mark — a marker's label, an annotation, a value label. */
export type FontStyle = {
  fill?: string;
  fontSize?: number;
  fontWeight?: FontWeight;
  fontStyle?: FontStyleKeyword;
  textAnchor?: TextAnchor;
  lineAnchor?: LineAnchor;
  lineHeight?: number;
  rotate?: number;
  stroke?: string;
  strokeWidth?: number;
  paintOrder?: string;
  dx?: number;
  dy?: number;
  class?: string;
  textClass?: string;
};

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
 * other mark) it sits next to — e.g. a `LineSegmentStyle` styles its
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
