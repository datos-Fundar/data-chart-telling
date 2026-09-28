import type { AxisValue } from '$lib/types/layout/scales';
import type { FontStyle, StrokeStyle, DotStyle, AreaStyle } from '$lib/types/plots/styling';
import type { HoverStrategy, HoverDisplayPoint } from '$lib/types/layout/tooltip';
import type { BaseMarkersConfig, ChannelMarkerStyle } from './base';

export type { DotMarkerConfig, ChannelMarkerStyle } from './base';

/**
 * A single line-segment stroke. Endpoint dots are a separate `'dot'` marker rather than a field here.
 * `x`/`y` (from `ChannelMarkerStyle`) accept a field key or an accessor function.
 *
 * Note: `color` and `scales` are accepted for API consistency but currently unused — a single
 * `<Line>` stroke can't vary per point. Use a `'dot'` marker with its own color/scales
 * for per-point coloring instead. `data` is optional — omit it to reuse the host plot's
 * own top-level rows.
 */
export type LineMarkerConfig = {
	type: 'line';
	data?: Record<string, unknown>[];
	styles?: StrokeStyle;
} & ChannelMarkerStyle;

/**
 * A single bar mark. `role: 'segment'` is a visible bar
 * (`x`/`y`/`x1`/`x2`/`y1`/`y2` map to svelteplot's `<BarX>`/`<BarY>` per
 * `isHorizontal`); `role: 'hitArea'` is an invisible per-category hit region
 * for hover, resolved against the live scale at render time; `role:
 * 'highlight'` is `HoverMarkerConfig`'s `areaX`/`areaY` highlight — a
 * visible, non-interactive rect centered on `category`, spanning the full
 * opposite axis, sized to the category band's own width plus 2px (or a
 * single series' own slice, via `insetTop`/etc.).
 *
 * Author-facing: `x`/`x1`/`x2`/`y1`/`y2`/`y` (from `ChannelMarkerStyle`)
 * accept a field-key-or-accessor shorthand for a hand-authored `role:
 * 'segment'` bar — see `Channels/X1X2Y1Y2` for an example. `role:
 * 'hitArea'`/`'highlight'` stay build-only (`BarPlot`'s own hover machinery
 * constructs these; hand-authoring one has no useful effect). `data` is
 * optional — omit it to reuse the host plot's own top-level rows.
 */
export type BarMarkerConfig = {
	type: 'bar';
	role: 'segment' | 'hitArea' | 'highlight';
	isHorizontal: boolean;
	data?: Record<string, unknown>[];
	insetTop?: number;
	insetBottom?: number;
	insetLeft?: number;
	insetRight?: number;
	styles?: AreaStyle;
	category?: AxisValue;
	onpointerenter?: () => void;
	onpointerleave?: () => void;
} & ChannelMarkerStyle;

/**
 * A single heatmap cell mark. `x`/`y` (from `ChannelMarkerStyle`) accept a field key or an
 * accessor function. `fill` stays a per-row accessor; the rest of the style is constant per
 * call. `data` is optional — omit it to reuse the host plot's own top-level rows.
 */
export type CellMarkerConfig = {
	type: 'cell';
	data?: Record<string, unknown>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fill: (d: any) => string;
	styles?: AreaStyle;
	inset?: number;
} & ChannelMarkerStyle;

/**
 * A single arbitrary rectangle (svelteplot's `Rect`) — author-facing from
 * the start, unlike `BarMarkerConfig` (which `BarPlot`'s own build phases
 * construct internally and only later gained author-facing `x1`/`x2`/`y1`/`y2`).
 * `x`/`y` (from `ChannelMarkerStyle`) are shorthand for `x1`+`x2`/`y1`+`y2`
 * when paired with `interval` (mirrors svelteplot's own `Rect`); set
 * `x1`/`x2`/`y1`/`y2` directly instead for full control over each edge. `data` is optional —
 * omit it to reuse the host plot's own top-level rows.
 */
export type RectMarkerConfig = {
	type: 'rect';
	data?: Record<string, unknown>[];
	/** Converts `x`/`y` into `x1`/`x2` or `y1`/`y2` ranges — see svelteplot's own `Rect` mark. */
	interval?: number | string;
	styles?: AreaStyle;
} & ChannelMarkerStyle;

export type RuleMarkerConfig = {
	type: 'rule';
	axis: 'x' | 'y';
	value: AxisValue;
	styles?: StrokeStyle;
};

/**
 * In-SVG hover highlight (crosshair + dot + label). Omitting `series`
 * applies it to all series; scoping follows the same fields as
 * {@link CustomComponentMarkerConfig}.
 */
export type HoverMarkerConfig = {
	type: 'hover';
	series?: string;
	scope?: 'series' | 'segment';
	strategy?: HoverStrategy;
	sync?: boolean;
	ruleX?: boolean;
	ruleY?: boolean;
	/**
	 * Thickened area in place of a thin crosshair — sized to the hovered
	 * bar/cell's own width, spanning the full opposite axis. Off by default;
	 * meaningful only on a band (categorical) scale, so it renders nothing on
	 * a line/scatter plot's continuous axis.
	 */
	areaX?: boolean;
	areaY?: boolean;
	showLabels?: boolean;
	format?: (point: HoverDisplayPoint) => string;
	ruleStyle?: StrokeStyle;
	areaStyle?: AreaStyle;
	dotStyle?: DotStyle;
	fontStyle?: FontStyle;
};

export type CustomComponentMarkerConfig = {
	type: 'component';
	series?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component: any;
	props?: Record<string, unknown>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data?: any[];
	scope?: 'series' | 'segment';
};

/**
 * Every marker kind any axis-based plot can render: {@link BaseMarkersConfig}
 * plus every axis-based-only kind. `BarPlot`/`HeatmapPlot`/`PyramidPlot` use
 * this directly as their `markers` prop type; `LinePlot`'s own
 * `LineMarkersConfig` (`types/markers/line.ts`) unions it with the line-only
 * `delta` annotation instead.
 */
export type AxisBasedMarkersConfig =
	| BaseMarkersConfig
	| LineMarkerConfig
	| BarMarkerConfig
	| CellMarkerConfig
	| RectMarkerConfig
	| RuleMarkerConfig
	| HoverMarkerConfig
	| CustomComponentMarkerConfig;
