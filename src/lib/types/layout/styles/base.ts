import type { FrameProp } from '$lib/types/layout/styles/frame';
import type { ValuesStyle } from '$lib/types/layout/styles/values';
import type { StrokeStyle, DotStyle, AreaStyle } from '$lib/types/plots/styling';

/**
 * The fields every plot kind's own `styles` shape shares - the common parent
 * of {@link AxisBasedStylesConfig} and {@link GeoStylesConfig}.
 */
export type BasePlotStylesConfig = {
	/** Decorative border around the plot's content box - see {@link FrameStyle}. Available on every plot kind. */
	frame?: FrameProp;
};

/** A style as it is for every series, or a function of the series' name - `undefined` leaves that series as it is. */
export type PerSeries<TStyle> = TStyle | ((series: string) => TStyle | undefined);

/**
 * The basic styles any plot's marks are made of, as the style every series is
 * drawn with, before its `segments` restyle a stretch of it. Each takes a style
 * as it is, or a function of the series' name, to set one series or two apart.
 * A plot uses the ones its own marks are made of and ignores the rest, so one
 * `styles` can be shared between plots: `stroke` and `dot` style a line plot's
 * lines and dots, `area` a bar's. What a segment sets wins over them, field by
 * field; whatever a legend turned off wins over both.
 */
export type BasicStylesConfig = {
	/** The line of every series: its width, opacity, dashes... The color comes from the `color` scale unless set here. */
	stroke?: PerSeries<StrokeStyle>;
	/** The dots of every series. Unset, a series has none but those a segment gives it. */
	dot?: PerSeries<DotStyle>;
	/** The area of every series - a bar, a band: its fill, opacity, outline... */
	area?: PerSeries<AreaStyle>;
};

/** The basic styles a plot kind's segment style is made of: nested in it under their own names (a line's `{ stroke, dot }`), or the style itself (an area's `AreaStyle`). */
export type BasicStylesShape =
	| { nested: (keyof BasicStylesConfig)[] }
	| { flat: keyof BasicStylesConfig };

/**
 * Top-level rendering style overrides shared by the non-geo plot kinds.
 * Passed as the `styles` prop. Each plot reads only the fields it cares
 * about.
 */
export type AxisBasedStylesConfig = BasePlotStylesConfig &
	BasicStylesConfig & {
		values?: ValuesStyle;
	};
