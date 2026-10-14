import type { EdgeBox } from '$lib/types/layout/box';
import type { ValueLabels } from '$lib/layout/styles/ValueLabels';
import type { ValueAnchor } from '$lib/types/plots/constants';

/** A plot kind's own defaults for its value labels, under the author's `styles.values`. */
export type ValueLabelsOptions<TState> = {
	/** Whether the labels draw when `styles.values.show` is unset. Defaults to `false`. */
	show?: boolean;
	/** Where a label sits when `styles.values.anchor` is unset. Defaults to `'outside'`. */
	anchor?: ValueAnchor;
	/** A label's text when `styles.values.format` is unset. Defaults to the bare value. */
	format?: (value: number, seriesName: string) => string;
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
