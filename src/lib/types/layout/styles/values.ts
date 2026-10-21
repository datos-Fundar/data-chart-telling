import type { ValueAnchor } from '$lib/types/plots/constants';
import type { FontStyle, StrokeStyle } from '$lib/types/plots/styling';

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
 * on a heatmap. The high-level `anchor` sets sensible defaults for placement;
 * `fontStyle` (`dx`, `dy`, `textAnchor`, `lineAnchor`, `lineHeight`, `rotate`,
 * `class`, `textClass`, `fill`, …) overrides those defaults field-by-field when
 * provided - mirrors {@link DeltaConfig}'s `fontStyle`/`strokeStyle` split, so
 * label text and connector-line styling never mix into one flat bag of props.
 */
export type ValuesStyle = {
	/** Whether the labels are drawn. Off by default, except on a heatmap. */
	show?: boolean;
	/** Where each label sits on its mark - see {@link ValueAnchor}. */
	anchor?: ValueAnchor;
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
	/** A label's text, from its row's own value (a histogram bin's count) and its series - and, on the plots that label one row each, that row, for the other fields of the data. */
	format?: (value: number, seriesName: string, row?: Record<string, unknown>) => string;
	/** Hovering a label dims every other series, like toggling them off in the legend. */
	hoverIsolate?: boolean;
	fontStyle?: FontStyle;
	/** The connectors a line or area plot routes back from labels that had to move apart. */
	strokeStyle?: StrokeStyle;
};
