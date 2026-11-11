import type { PlotRowContext } from '$lib/types/layout/context';
import type { EdgeBox } from '$lib/types/layout/box';
import type { ValueLabels } from '$lib/layout/styles/ValueLabels';
import type { LabelLayout } from '$lib/types/markers/labels/common';

/** A plot kind's own defaults for its value labels, under the author's `styles.values`. */
export type ValueLabelsOptions<TState> = {
	/** Whether the labels draw when `styles.values.show` is unset. Defaults to `false`. */
	show?: boolean;
	/** The layout the labels take when `styles.values.layout` is unset. Defaults to `'point'`. */
	layout?: LabelLayout | ((state: TState) => LabelLayout);
	/** The kind's own options for each layout it takes, under the author's: a bar's `path` at its `tip`, say. */
	/**
	 * On a kind whose rows have several values, the parts it can label: each one's own placement, over the layout's,
	 * and those it labels when `styles.values.parts` is unset.
	 */
	parts?: {
		placements:
			| Record<string, Record<string, unknown>>
			| ((state: TState) => Record<string, Record<string, unknown>>);
		default: string[];
	};
	layouts?:
		| Partial<Record<LabelLayout, Record<string, unknown>>>
		| ((state: TState) => Partial<Record<LabelLayout, Record<string, unknown>>>);
	/** A label's text when `styles.values.format` is unset. Defaults to the bare value. `number` writes a value as the plot's `styles.values` display fields (`decimals`, `prefix`, `suffix`, `signDisplay`) ask, and `context` is what the plot knows of the labelled row. */
	format?: (value: number, number: (value: number) => string, context: PlotRowContext) => string;
	/** `format`, chosen off the plot's state: a curve named when there are several, its peak's position when alone. */
	formatFor?: (
		state: TState
	) => (value: number, number: (value: number) => string, context: PlotRowContext) => string;
	/**
	 * Where the labels are expected to sit, from the whole data: boxes around
	 * the points they label, on the plot edges those points can reach (see
	 * {@link ValueLabels.edgeBox}). The plot's margins keep their room, so the
	 * labels fit from the first render; without it they still grow to fit,
	 * once measured.
	 */
	reach?: (labels: ValueLabels, state: TState) => EdgeBox[];
};

/** What differs between plots in the shared "styles" stage. */
export type StylesStageOptions<TState> = {
	values?: ValueLabelsOptions<TState>;
};
