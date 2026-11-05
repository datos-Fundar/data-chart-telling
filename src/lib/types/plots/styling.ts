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

/** Text/label styling for any text mark - a marker's label, an annotation, a value label. */
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

/** Stroke styling for any line-ish mark - a line, a rule, a marker's connector. */
export type StrokeStyle = {
	stroke?: string;
	strokeWidth?: number;
	strokeOpacity?: number;
	strokeDasharray?: string | LineStyle;
	strokeLinecap?: LineCap;
	strokeLinejoin?: LineJoin;
};

/**
 * Dot styling for any point mark - a line's endpoint dots, a marker's dot.
 * Carries its own `dotStroke*` fields rather than nesting a {@link StrokeStyle},
 * because a dot's outline is a distinct style from the stroke of the line (or
 * other mark) it sits next to - e.g. a `LineSegmentStyle` styles its
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

/** Styling for a 2D area mark - a bar segment, a heatmap cell, a geo feature highlight. */
export type AreaStyle = {
	fill?: string;
	fillOpacity?: number;
	stroke?: string;
	strokeWidth?: number;
	strokeOpacity?: number;
	strokeDasharray?: string | LineStyle;
	borderRadius?: number;
};

/** How far a shape is pulled in from its edges, in pixels (a bar's, as a fraction of its band): `inset` on all sides, or each side's own. */
export type InsetStyle = {
	inset?: number;
	insetTop?: number;
	insetRight?: number;
	insetBottom?: number;
	insetLeft?: number;
};

/** How far a shape with a direction (an arrow) is pulled in from its ends, in pixels: `inset` at both, or `insetStart` and `insetEnd` each. */
export type DirectedInsetStyle = { inset?: number; insetStart?: number; insetEnd?: number };

/**
 * A style as a value, or as a function of the row a shape draws - a different value for each one.
 * A number can also be the name of a field of the rows; so can a color, when the rows have a field
 * of that name.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RowValue<T> = T | (T extends number ? string : never) | ((row: any) => T);

/** A style whose every field can be a function of the row ({@link RowValue}). */
export type PerRow<TStyle> = { [K in keyof TStyle]?: RowValue<NonNullable<TStyle[K]>> };
