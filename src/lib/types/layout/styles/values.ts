import type { MarkerLabelConfig } from '$lib/types/markers/labels/common';
import type { BoxLabelConfig } from '$lib/types/markers/labels/box';
import type { PointLabelConfig } from '$lib/types/markers/labels/point';
import type {
	AreaEdgeLabelConfig,
	PageEdge,
	PathLabelConfig,
	RimLabelConfig,
	StrokeLabelConfig,
	ValueEdge
} from '$lib/types/markers/labels/path';
import type { FontStyle, StrokeStyle } from '$lib/types/plots/styling';
import type { NumberDisplay } from '$lib/types/layout/numbers';
import type { PlotRowContext } from '$lib/types/layout/context';

/**
 * Which of a group's rows get a value label: its first or last, or the one
 * with the lowest or highest value (read on the plot's value axis). The group
 * is each plot's own: a series for a line or an area, a category for the
 * plots that join several series' dots.
 */
export type ValueSelect = 'first' | 'last' | 'min' | 'max';

/**
 * Controls if and how value labels are rendered on a plot, drawn as a `text`
 * marker over the rows the plot itself draws (after its own `transforms`):
 * one at the end of each series on a line or area plot, one per bar on a bar,
 * pyramid or histogram plot, one per point on a scatter plot and one per cell
 * on a heatmap. `layout` and its options place them as a marker's `label` would (each
 * plot kind takes the layouts its shapes do, with defaults of its own for each);
 * `fontStyle` (`fill`, `fontSize`, `lineHeight`, `rotate`, `class`, …) styles
 * the text, never where it sits - mirrors {@link DeltaConfig}'s
 * `fontStyle`/`strokeStyle` split, so label text and connector-line styling
 * never mix into one flat bag of props.
 */
/** The options of a label that place it, as `styles.values` takes them: its `layout` optional, the kind's by default. */
type LayoutKey = 'anchor' | 'edge' | 'side' | 'offset' | 'gap';
export type ValueLayoutOf<TLabel> = TLabel extends { layout?: infer TLayout }
	? Pick<TLabel, Extract<keyof TLabel, LayoutKey>> & { layout?: TLayout }
	: never;

/** `TStyles` with its `values` taking only the labels of `TLabel`: the layouts a plot kind's shapes write. */
export type WithValues<TStyles, TLabel extends MarkerLabelConfig> = Omit<TStyles, 'values'> & {
	values?: ValuesStyle<TLabel>;
};

export type ValuesStyle<TLabel extends MarkerLabelConfig = MarkerLabelConfig> = ValuesOptions &
	ValueLayoutOf<TLabel>;

/** A value label's text style, without what places it: the layout's options do that. */
export type ValuesFontStyle = Omit<FontStyle, 'textAnchor' | 'lineAnchor' | 'dx' | 'dy'>;

type ValuesOptions = NumberDisplay & {
	/** Whether the labels are drawn. Setting any other option of them turns them on; off by default, except on a heatmap. */
	show?: boolean;
	/**
	 * Which rows of each group are labelled: one selector, or a list of them (a
	 * row picked by any is labelled) - see {@link ValueSelect}. Each plot has its
	 * own default: a line or an area labels its series' last point, the plots
	 * that join dots label them all.
	 */
	select?: ValueSelect | ValueSelect[];
	/** Labels only the rows of these series, by name. Defaults to every series. */
	series?: string | string[];
	/**
	 * The labels' color: `'series'` writes each in its series' color, any other
	 * CSS color writes them all in it. `fontStyle.fill` wins when it is set.
	 */
	color?: 'series' | (string & {});
	/**
	 * A label's text, in place of the value as `decimals`, `prefix`, `suffix` and `signDisplay` write it: from the
	 * value it shows (a histogram bin's count, a tile's share), `number`, which writes a value as those fields ask,
	 * and `context`, what the plot knows of the labelled row - its `series`, `x`, `y`, whatever its kind works out
	 * and, where the label has one, the `row` itself, for the other fields of the data (see {@link PlotRowContext}).
	 */
	format?: (value: number, number: (value: number) => string, context: PlotRowContext) => string;
	/** Hovering a label dims every other series, like toggling them off in the legend. */
	hoverIsolate?: boolean;
	/** The text's look; where it sits is the layout's (`side`, `gap`, `offset`...). */
	fontStyle?: ValuesFontStyle;
	/** The connectors a line or area plot routes back from labels that had to move apart. */
	strokeStyle?: StrokeStyle;
};

/** The labels a plot of bars writes on them: in each, along an edge (its `tip` too) or beside a point of it. */
export type BarValueLabel =
	| BoxLabelConfig
	| PathLabelConfig<PageEdge | ValueEdge>
	| PointLabelConfig;

/** The labels a plot of boxes with no value direction (a heatmap's cells, a histogram's bins) writes on them. */
export type CellValueLabel = BoxLabelConfig | PathLabelConfig<PageEdge> | PointLabelConfig;

/** The labels a plot of lines writes: beside its points, or along its lines. */
export type LineValueLabel = PointLabelConfig | StrokeLabelConfig;

/** The labels a plot of areas writes: beside its points, or along their top or bottom edge. */
export type AreaValueLabel = PointLabelConfig | AreaEdgeLabelConfig;

/** The labels a plot of dots writes: beside them, or around their rim. */
export type DotValueLabel = PointLabelConfig | RimLabelConfig;
