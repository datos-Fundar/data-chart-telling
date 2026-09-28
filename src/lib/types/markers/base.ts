import type { AxisValue, ChannelScalesConfig } from '$lib/types/layout/scales';
import type { DotStyle, FontStyle } from '$lib/types/plots/styling';

/**
 * Fields shared by every "common" marker kind (`dot`, `text`, `line`, `bar`,
 * `cell`, `rect`): position (`x`/`y`/`x1`/`x2`/`y1`/`y2`) and per-marker
 * color/opacity ramps (`color`/`opacity`/`scales`). Not used by `rule`/
 * `hover`/`component`.
 */
export type ChannelMarkerStyle = {
	/** Position accessor — field key or function, bound to the plot's shared x/y scale. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	x?: string | ((d: any) => AxisValue);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	y?: string | ((d: any) => AxisValue);
	/** Interval-position override for `bar`/`rect` — field key, literal number, or function. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	x1?: string | number | ((d: any) => AxisValue);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	x2?: string | number | ((d: any) => AxisValue);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	y1?: string | number | ((d: any) => AxisValue);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	y2?: string | number | ((d: any) => AxisValue);
	/** Continuous value driving a per-mark color ramp — configure the ramp itself via `scales.color`. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	color?: string | ((d: any) => unknown);
	/** Continuous or categorical value driving a per-mark opacity ramp — configure it via `scales.opacity`. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	opacity?: string | ((d: any) => unknown);
	/** Per-marker channel-ramp overrides, same shape as a plot's own `scales` prop. */
	scales?: ChannelScalesConfig;
};

/**
 * A set of point marks (svelteplot's `Dot`) — usable on any plot kind, axis-based or geo.
 * `data` is optional — omit it to reuse the host plot's own top-level rows.
 */
export type DotMarkerConfig = {
	type: 'dot';
	data?: Record<string, unknown>[];
	/** Per-row radius, or a constant — overrides `styles.dotRadius`. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	r?: number | string | ((d: any) => number);
	/** Per-row fill, overriding `styles.dotFill` — ignored when `color` is set. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fill?: (d: any) => string;
	/** Categorical value driving a per-row shape — configure the mapping via `scales.symbol`. Overrides `styles.dotSymbol`. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	symbol?: string | ((d: any) => unknown);
	styles?: DotStyle;
} & ChannelMarkerStyle;

/**
 * A text label per row (svelteplot's `Text`) — usable on any plot kind, axis-based or geo.
 * `data` is optional — omit it to reuse the host plot's own top-level rows.
 */
export type TextMarkerConfig = {
	type: 'text';
	data?: Record<string, unknown>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	text: string | ((d: any) => string);
	styles?: FontStyle;
} & ChannelMarkerStyle;

/** Every marker kind usable on any plot, axis-based or geo. */
export type BaseMarkersConfig = DotMarkerConfig | TextMarkerConfig;
