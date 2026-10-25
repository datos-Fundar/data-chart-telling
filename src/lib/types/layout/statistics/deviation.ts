import type { AreaStyle, FontStyle, StrokeStyle } from '$lib/types/plots/styling';

/** The value a `deviation` statistic centers on. */
export type DeviationEstimator = 'mean' | 'median' | 'midrange';

/** How far the band reaches from the estimator, before `k` scales it. */
export type DeviationSpread = 'stdev' | 'mad';

/** A label written against the plot's edge, beside the line it names. */
export type DeviationLabel = {
	/** The text. Defaults to the estimator's name for the rule (`'MEAN'`) and the spread's for the band (`'STDEV'`). */
	text?: string;
	/** `dx`/`dy` here add to the default gap between the label and its line. */
	styles?: FontStyle;
};

/** A band label's place: which edge it names and which side of that edge it sits on. */
export type DeviationBandLabel = DeviationLabel & {
	/** The edge it names. Defaults to `'upper'`. */
	edge?: 'lower' | 'upper';
	/** Whether it sits inside the band or outside it. Defaults to `'inside'`. */
	position?: 'inside' | 'outside';
};

/**
 * Options for `type: 'deviation'` - an estimator of the source's values along
 * the plot's value axis, drawn as a rule, and the band `k` spreads wide on
 * each side of it.
 */
export type DeviationStatisticOptions = {
	/** The value the rule sits at. Defaults to `'mean'`. */
	estimator?: DeviationEstimator;
	/** The spread the band measures. `'stdev'` is the sample standard deviation, `'mad'` the median absolute deviation scaled to match it. Defaults to `'stdev'`. */
	spread?: DeviationSpread;
	/** The band's half-width, a multiple of the spread. Defaults to 1. */
	k?: number;
	/** The estimator's rule; `false` omits it. `label` names it - `true` takes the defaults. */
	rule?: false | (StrokeStyle & { label?: DeviationLabel | true });
	/** The band around the rule; `false` omits it. `label` names one of its edges - `true` takes the defaults. */
	band?: false | (AreaStyle & { label?: DeviationBandLabel | true });
};
