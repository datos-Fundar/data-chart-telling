import type { AxisBasedStylesConfig } from '$lib/types/layout/styles/base';

/** Curve interpolation for a line, area, difference or trail - svelteplot's own `CurveName`. */
export type CurveName =
	| 'basis'
	| 'basis-closed'
	| 'basis-open'
	| 'bundle'
	| 'bump-x'
	| 'bump-y'
	| 'cardinal'
	| 'cardinal-closed'
	| 'cardinal-open'
	| 'catmull-rom'
	| 'catmull-rom-closed'
	| 'catmull-rom-open'
	| 'linear'
	| 'linear-closed'
	| 'monotone-x'
	| 'monotone-y'
	| 'natural'
	| 'step'
	| 'step-after'
	| 'step-before';

/**
 * `styles` of the plots that draw lines: the shared axis-based fields, plus the
 * curve of every line. A segment's own `curve` wins over it.
 */
export type CurveAwarePlotStylesConfig = AxisBasedStylesConfig & {
	/** How every line joins its points. Defaults to `'linear'`. */
	curve?: CurveName;
};
