import type { AxisValue, ChannelScalesConfig } from '$lib/types/layout/scales';
import type { DotStyle, FontStyle } from '$lib/types/plots/styling';

/**
 * The per-marker color-ramp override every marker kind can opt into: a
 * `color` accessor plus the `scales` ramp that resolves it, mirroring a
 * plot's own `color`/`scales.color`. Intersect a marker config with this
 * instead of redeclaring the two fields on every kind.
 */
export type ChannelMarkerStyle = {
	/** Continuous value driving a per-mark color ramp — configure the ramp itself via `scales.color`. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	color?: string | ((d: any) => unknown);
	/** Per-marker channel-ramp overrides, same shape as a plot's own `scales` prop. */
	scales?: ChannelScalesConfig;
};

/**
 * A set of point marks (svelteplot's `Dot`) — usable on any plot kind, axis-based or geo.
 *
 * `x`/`y`/`r`/`color` accept a field key or an accessor function, like `Series.x`/`y`.
 * `GeometryLayout` resolves the shorthand before it reaches `DotMarker.svelte`, which only
 * ever sees functions.
 */
export type DotMarkerConfig = {
	type: 'dot';
	data: Record<string, unknown>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	x: string | ((d: any) => AxisValue);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	y: string | ((d: any) => AxisValue);
	/** Per-row radius, or a constant — overrides `styles.dotRadius`. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	r?: number | string | ((d: any) => number);
	/** Per-row fill, overriding `styles.dotFill` — ignored when `color` is set. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fill?: (d: any) => string;
	styles?: DotStyle;
} & ChannelMarkerStyle;

/**
 * A text label per row (svelteplot's `Text`) — usable on any plot kind, axis-based or geo.
 *
 * `x`/`y` accept the same field-key-or-function shorthand as `DotMarkerConfig`. `text` is a
 * constant or a per-row accessor.
 */
export type TextMarkerConfig = {
	type: 'text';
	data: Record<string, unknown>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	x: string | ((d: any) => AxisValue);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	y: string | ((d: any) => AxisValue);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	text: string | ((d: any) => string);
	styles?: FontStyle;
};

/**
 * Every marker kind usable on any plot, axis-based or geo. `AxisBasedMarkersConfig`
 * (`types/markers/common.ts`) and `GeoMarkersConfig` (`types/markers/geo.ts`) both extend
 * this, so `MarkerConfig` (`types/markers/all.ts`) can union the two without a shape collision.
 */
export type BaseMarkersConfig = DotMarkerConfig | TextMarkerConfig;
