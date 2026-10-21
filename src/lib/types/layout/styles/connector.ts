import type { FontStyle } from '$lib/types/plots/styling';
import type { ColorScaleConfig } from '$lib/types/layout/scales';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles/base';

/** What a connector styles and labels itself from: where it runs, and what its dots say about the category. */
export type ConnectorRange = {
	category: unknown;
	/** The lowest value of the category, or the baseline when that is lower. */
	from: number;
	/** The highest value of the category, or the baseline when that is higher. */
	to: number;
	/** How long the connector is: `to - from`. */
	length: number;
	/** The value of the `to` series minus that of the `from` series (see {@link ConnectorStyle}), `undefined` when either has none here. With a baseline, the value minus the baseline. */
	difference: number | undefined;
	/** The stretch between the `from` series' dot and the `to` series' - lowest value first - `undefined` when either has none. */
	span: [number, number] | undefined;
	/** The series of the category's only dot - `undefined` when it has several. */
	series: string | undefined;
};

/**
 * How connectors are colored: one color; a color scale over what each one
 * measures (`'difference'`, which a diverging `scheme` with `pivot: 0` splits
 * into rising and falling; or `'length'`); the sign of its difference
 * (`'sign'`); or a function of the connector.
 */
export type ConnectorColor =
	| string
	| ({ by: 'difference' | 'length' } & ColorScaleConfig)
	| { by: 'sign'; positive?: string; negative?: string; zero?: string }
	| ((range: ConnectorRange) => string);

/** The text written on each connector. */
export type ConnectorLabel = {
	/** What it says: the connector's `'difference'` (signed) or `'length'`, or a function of the connector. Defaults to `'difference'`. */
	text?: 'difference' | 'length' | ((range: ConnectorRange) => string);
	/** A number as text, for `text: 'difference'` and `'length'`. Defaults to the bare number, signed for a difference. */
	format?: (value: number, range: ConnectorRange) => string;
	/** `'outside'` writes it beside the connector - above it, or to the right of a vertical one - and `'middle'` on it, along its length, for a connector thick enough to hold it. Defaults to `'outside'`. */
	anchor?: 'outside' | 'middle';
	/** The text's style. */
	fontStyle?: FontStyle;
};

/**
 * `styles.connector` of the Cleveland family: the connector each category
 * draws between its dots, and the label on it.
 */
export type ConnectorStyle = {
	/**
	 * Where a difference starts: a series by its name, `'first'` or `'last'` for that series, or
	 * `'min'` or `'max'` for the category's lowest or highest dot. Defaults to `'first'`. The
	 * stretch between `from` and `to` is what `color`, `opacity` and the label are for; the rest
	 * of the connector is `outside`.
	 */
	from?: string;
	/** Where a difference ends - the same options as `from`. Defaults to `'last'`. With `from: 'min'` and `to: 'max'`, the stretch is the whole connector. */
	to?: string;
	/** The connector's thickness in px; `'dots'` makes it as thick as the dots are wide, a band. Or a function of the connector. */
	width?: number | 'dots' | ((range: ConnectorRange) => number);
	/** The connector's color - see {@link ConnectorColor}. A segment's own `stroke` wins on a lone dot's stem. */
	color?: ConnectorColor;
	/** The connector's opacity (0-1), or a function of the connector. */
	opacity?: number | ((range: ConnectorRange) => number);
	/**
	 * How the part of a connector outside the stretch between `from` and `to` looks - the dots of
	 * the other series lie there: a color, or `{ color, opacity }`. Defaults to the neutral
	 * connector color at a lower opacity. The stretch between the two keeps `color` and `opacity`.
	 */
	outside?: string | { color?: string; opacity?: number };
	/**
	 * Draws the stretch between `from` and `to` as an arrow pointing at the `to` dot - the way
	 * the value moved - instead of a line. `true` takes the configuration's head, or give its
	 * `headLength` (px) and `headAngle` (degrees). An arrow is as thick as `width` says, else
	 * the configuration's `connector.arrow.width`: thinner than a band.
	 */
	arrow?: boolean | { headLength?: number; headAngle?: number };
	/** Caps - a short tick across the connector - at each end of it: `true`, or `{ length }` in px (the configuration's `connector.capLength`). Defaults to the plot's own: on for a forest plot, off for the rest. */
	caps?: boolean | { length?: number };
	/** A label on each connector, centered on the stretch between `from` and `to`: `true` for the difference with its defaults, or its options. */
	label?: boolean | ConnectorLabel;
};

/**
 * `AxisBasedStylesConfig` extended with `connector` - the line each category
 * draws between its dots, on the plots that join them (`ClevelandPlot`,
 * `DumbbellPlot`, `LollipopPlot`) - see {@link ConnectorStyle}.
 */
export type ConnectorBasedStylesConfig = AxisBasedStylesConfig & {
	connector?: ConnectorStyle;
};
