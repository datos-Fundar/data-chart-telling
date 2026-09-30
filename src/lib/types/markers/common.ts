import type { AxisValue } from '$lib/types/layout/scales';
import type {
	RegressionStatisticOptions,
	BollingerStatisticOptions
} from '$lib/types/layout/statistics';
import type { FontStyle, StrokeStyle, DotStyle, AreaStyle } from '$lib/types/plots/styling';
import type { HoverStrategy, HoverDisplayPoint } from '$lib/types/layout/tooltip';
import type { BaseMarkersConfig, CommonMarkerConfig } from './base';

export type { DotMarkerConfig, CommonMarkerConfig } from './base';

/**
 * A single line-segment stroke. Endpoint dots are a separate `'dot'` marker rather than a field here.
 * `x`/`y` (from `CommonMarkerConfig`) accept a field key or an accessor function.
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
} & CommonMarkerConfig;

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
 * Author-facing: `x`/`x1`/`x2`/`y1`/`y2`/`y` (from `CommonMarkerConfig`)
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
} & CommonMarkerConfig;

/**
 * A single heatmap cell mark. `x`/`y` (from `CommonMarkerConfig`) accept a field key or an
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
} & CommonMarkerConfig;

/**
 * A single arbitrary rectangle (svelteplot's `Rect`) — author-facing from
 * the start, unlike `BarMarkerConfig` (which `BarPlot`'s own build phases
 * construct internally and only later gained author-facing `x1`/`x2`/`y1`/`y2`).
 * `x`/`y` (from `CommonMarkerConfig`) are shorthand for `x1`+`x2`/`y1`+`y2`
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
} & CommonMarkerConfig;

/**
 * A fitted regression curve (svelteplot's `RegressionX`/`RegressionY`) —
 * `regressionType`/`order`/`base`/`span`/`confidence` are the same fit
 * options as a `type: 'regression'` entry in `statistics`/`.statistics` (see
 * `RegressionStatisticOptions`'s own doc comment); this marker is what such
 * an entry resolves to under the hood, also directly hand-authorable.
 * `isHorizontal` swaps the dependent variable from `y` to `x` (`RegressionX`
 * instead of `RegressionY`), same convention as `BarMarkerConfig`.
 */
export type RegressionMarkerConfig = {
	type: 'regression';
	data?: Record<string, unknown>[];
	isHorizontal?: boolean;
} & RegressionStatisticOptions &
	CommonMarkerConfig;

/**
 * A moving-average band (svelteplot's `BollingerX`/`BollingerY`) — `n`/`k`
 * are the same options as a `type: 'bollinger'` entry in
 * `statistics`/`.statistics` (see `BollingerStatisticOptions`'s own doc
 * comment); this marker is what such an entry resolves to under the hood,
 * also directly hand-authorable. `isHorizontal` swaps the dependent variable
 * from `y` to `x` (`BollingerX` instead of `BollingerY`), same convention as
 * `BarMarkerConfig`.
 */
export type BollingerMarkerConfig = {
	type: 'bollinger';
	data?: Record<string, unknown>[];
	isHorizontal?: boolean;
} & BollingerStatisticOptions &
	CommonMarkerConfig;

/**
 * A single vertical (`axis: 'x'`) or horizontal (`axis: 'y'`) reference line
 * — or, with `data`, one line per row (svelteplot's own `RuleX`/`RuleY` are
 * both data/channel marks, unlike a plain single-threshold line). `value` is
 * the position along the rule's own axis: a literal `AxisValue` when `data`
 * is omitted (the common single-line case — deliberately *not* falling back
 * to the plot's own top-level rows the way every other "common" marker's
 * `data` does, since a literal `value` isn't a field key), or a
 * field-key-or-function accessor per row when `data` is given. `x1`/`x2`
 * (`axis: 'y'`) or `y1`/`y2` (`axis: 'x'`) bound the line's own extent on the
 * opposite axis — omitted, it spans the full plot, svelteplot's own default;
 * reused straight from `CommonMarkerConfig` (same shape every other
 * "common" marker's own `x1`/`x2`/`y1`/`y2` has) rather than `x`/`y` (whose
 * meaning here — the rule's own axis position — doesn't match theirs) or
 * `color`/`opacity`/`scales`/`statistics` (a rule stays outside the
 * "common"/statable family, per `CommonMarkerConfig`'s own doc comment).
 * `inset`/`insetTop`/`insetBottom`/`insetLeft`/`insetRight` mirror
 * svelteplot's own inset shorthand, in pixels.
 */
export type RuleMarkerConfig = {
	type: 'rule';
	axis: 'x' | 'y';
	data?: Record<string, unknown>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value: AxisValue | string | ((d: any) => AxisValue);
	inset?: number;
	insetTop?: number;
	insetBottom?: number;
	insetLeft?: number;
	insetRight?: number;
	styles?: StrokeStyle;
} & Pick<CommonMarkerConfig, 'x1' | 'x2' | 'y1' | 'y2'>;

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
	| RegressionMarkerConfig
	| BollingerMarkerConfig
	| RuleMarkerConfig
	| HoverMarkerConfig
	| CustomComponentMarkerConfig;
