import type { ValueAnchor } from '$lib/types/plots/constants';
import type { FontStyle, StrokeStyle, AreaStyle } from '$lib/types/plots/styling';
import type { GeoFeature } from '$lib/types/plots/data/geo';
import type { GapsConfig } from '$lib/types/plots/gaps';
import type { ColorScaleConfig } from '$lib/types/layout/scales';

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
/**
 * Which of a group's rows get a value label: its first or last, or the one
 * with the lowest or highest value (read on the plot's value axis). The group
 * is each plot's own: a series for a line or an area, a category for the
 * plots that join several series' dots.
 */
export type ValueSelect = 'first' | 'last' | 'min' | 'max';

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

/**
 * Decorative border around the plot's own content box - svelteplot's
 * `Frame` mark, purely cosmetic (drawn from the box geometry, never from
 * data). `true` enables it with svelteplot's own defaults; an object
 * enables it and overrides its look field-by-field. Insets pull the frame
 * in from the content box's own edges, in pixels.
 */
export type FrameStyle = AreaStyle & {
	inset?: number;
	insetTop?: number;
	insetRight?: number;
	insetBottom?: number;
	insetLeft?: number;
};

/** Author-facing `styles.frame` prop - see {@link FrameStyle}. */
export type FrameProp = boolean | FrameStyle;

/**
 * The fields every plot kind's own `styles` shape shares - the common parent
 * of {@link AxisBasedStylesConfig} and {@link GeoStylesConfig}.
 */
export type BasePlotStylesConfig = {
	/** Decorative border around the plot's content box - see {@link FrameStyle}. Available on every plot kind. */
	frame?: FrameProp;
};

/**
 * Top-level rendering style overrides shared by the non-geo plot kinds.
 * Passed as the `styles` prop. Each plot reads only the fields it cares
 * about.
 */
export type AxisBasedStylesConfig = BasePlotStylesConfig & {
	values?: ValuesStyle;
};

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

/**
 * `AxisBasedStylesConfig` extended with `gaps` - the interpolated
 * missing-data bridge fill available to plot kinds with an inherent
 * category/sequence ordering (`LinePlot`, `BarPlot`, `PyramidPlot`).
 * Resolved per series like `segments`, at zone granularity - see
 * {@link GapsConfig}.
 */
export type GapsAwarePlotStylesConfig<TSegmentStyle extends object> = AxisBasedStylesConfig & {
	gaps?: GapsConfig<TSegmentStyle>;
};

export type GeoTileLayerConfig = {
	/** XYZ tile URL template, e.g. `'https://tile.openstreetmap.org/{z}/{x}/{y}.png'`. */
	url: string;
	attribution?: string;
	opacity?: number;
	minZoom?: number;
	maxZoom?: number;
	/** Tile edge length in pixels. Defaults to `256`. */
	tileSize?: number;
};

/**
 * `styles` prop for GeoPlot - the geo analog of `AxisBasedStylesConfig`,
 * sharing only {@link BasePlotStylesConfig}'s common ground with it. Unlike
 * the other plot kinds, GeoPlot's styling needs (base map, choropleth ramp,
 * tile background, click handling) are unlike anything x/y plots need, so
 * this is its own type rather than a reuse of `AxisBasedStylesConfig`.
 */
export type GeoStylesConfig<TProps extends Record<string, unknown> = Record<string, unknown>> =
	BasePlotStylesConfig & {
		/** Base map fill, used when a feature isn't styled by `segments` or the choropleth ramp. */
		fill?: string;
		fillOpacity?: number;
		stroke?: string;
		strokeWidth?: number;
		/** Raster XYZ tile basemap under the vector geometry. Mercator-family projections only. */
		tileLayer?: GeoTileLayerConfig;
		/** Fired when a base-map feature is clicked. */
		onFeatureClick?: (feature: GeoFeature<TProps>, event: Event) => void;
	};

/**
 * `GeoTileLayerConfig`, plus `features` - never author-facing (the public
 * `styles.tileLayer` shape, {@link GeoTileLayerConfig}, doesn't declare it).
 * `GeoPlot` tacks it onto its own internal copy of `styles` so `StylesLayout`
 * can compute the tile layer's auto-fit bounds without needing raw geometry
 * threaded through as a separate prop.
 */
type GeoTileLayerConfigWithFeatures = GeoTileLayerConfig & {
	features?: { geometry: GeoJSON.Geometry }[];
};

/**
 * The minimal slice of a plot kind's own `styles` prop `StylesLayout` reads -
 * every concrete `styles` type ({@link AxisBasedStylesConfig},
 * {@link GeoStylesConfig}) structurally satisfies this whether or not it
 * declares `tileLayer` at all (a missing optional field type-checks fine).
 */
export type StylesLayoutConfig = {
	tileLayer?: GeoTileLayerConfigWithFeatures;
	frame?: FrameProp;
	[key: string]: unknown;
};
