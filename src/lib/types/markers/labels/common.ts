import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
import type { TextMarkerConfig } from '$lib/types/markers/basic/text';
import type { BoxLabelConfig, BoxShape } from '$lib/types/markers/labels/box';
import type { PointLabelConfig, PointShape } from '$lib/types/markers/labels/point';
import type { PathLabelConfig, PathShape } from '$lib/types/markers/labels/path';

export type LabelLayout = 'box' | 'path' | 'point';

export type LabelBaseConfig<TContext extends PlotRowContext = AnyRowContext> = Omit<
	TextMarkerConfig<TContext>,
	'type' | 'data' | 'x' | 'y' | 'frameAnchor' | 'origin'
>;

export type MarkerLabelConfig<TContext extends PlotRowContext = AnyRowContext> =
	| BoxLabelConfig<TContext>
	| PathLabelConfig<string, string, TContext>
	| PointLabelConfig<TContext>;

// A label of any plot's context: a function of one context is no function of another.
export type MarkerLabels<TLabel extends MarkerLabelConfig<never> = MarkerLabelConfig> =
	| TLabel
	| TLabel[];

/** The layout a label takes by default, and the geometry the kind gives each layout it supports. */
export type MarkerLabelTraits = {
	default: LabelLayout;
	box?: BoxShape;
	path?: PathShape;
	point?: PointShape;
};
