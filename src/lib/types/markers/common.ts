import type { AxisValue } from '$lib/types/layout/scales';
import type {
	RegressionStatisticOptions,
	BollingerStatisticOptions
} from '$lib/types/layout/statistics';
import type { FontStyle, StrokeStyle, DotStyle, AreaStyle } from '$lib/types/plots/styling';
import type { HoverStrategy, HoverDisplayPoint } from '$lib/types/layout/tooltip';
import type { BaseMarkersConfig, CommonMarkerConfig } from './base';

export type { DotMarkerConfig, TextMarkerConfig, CommonMarkerConfig } from './base';

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
 * Orientation is automatic: `RegressionX` when `x` is the measured axis and
 * `y` a categorical/temporal one, `RegressionY` otherwise.
 */
export type RegressionMarkerConfig = {
	type: 'regression';
	data?: Record<string, unknown>[];
} & RegressionStatisticOptions &
	CommonMarkerConfig;

/**
 * A moving-average band (svelteplot's `BollingerX`/`BollingerY`) — `n`/`k`
 * are the same options as a `type: 'bollinger'` entry in
 * `statistics`/`.statistics` (see `BollingerStatisticOptions`'s own doc
 * comment); this marker is what such an entry resolves to under the hood,
 * also directly hand-authorable. Orientation is automatic: `BollingerX` when
 * `x` is the measured axis and `y` a categorical/temporal one, `BollingerY`
 * otherwise.
 */
export type BollingerMarkerConfig = {
	type: 'bollinger';
	data?: Record<string, unknown>[];
} & BollingerStatisticOptions &
	CommonMarkerConfig;

/** Curve interpolation for an `'area'`/`'difference'` marker — same names as svelteplot's own `CurveName`. */
export type MarkerCurveName =
	| 'basis'
	| 'basis-closed'
	| 'basis-open'
	| 'bundle'
	| 'bump-x'
	| 'bump-y'
	| 'cardinal'
	| 'cardinal-closed'
	| 'cardinal-open'
	| 'catmull-rom'
	| 'catmull-rom-closed'
	| 'catmull-rom-open'
	| 'linear'
	| 'linear-closed'
	| 'monotone-x'
	| 'monotone-y'
	| 'natural'
	| 'step'
	| 'step-after'
	| 'step-before';

/**
 * A filled area under a curve, or a band between two curves (svelteplot's
 * `AreaX`/`AreaY`) — orientation is automatic: `AreaX` (implicit stacking
 * along `x`) when `x` is the measured axis and `y` a categorical/temporal
 * one, `AreaY` (stacking along `y`) otherwise. Set
 * only `x`/`y` for a simple area-under-curve; set `x1`/`x2` (horizontal) or
 * `y1`/`y2` (vertical) instead for a band between two curves — see
 * svelteplot's own `AreaX`/`AreaY` for the exact channel semantics.
 * `grouping` splits rows into separate areas (one per group) — same name
 * and semantics as a plot's own top-level `grouping` (forwarded to
 * svelteplot's own `z` channel internally). `data` is optional — omit it
 * to reuse the host plot's own top-level rows.
 */
export type AreaMarkerConfig = {
	type: 'area';
	data?: Record<string, unknown>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	grouping?: string | ((d: any) => unknown);
	curve?: MarkerCurveName;
	tension?: number;
	styles?: AreaStyle;
} & CommonMarkerConfig;

/**
 * Two-dimensional kernel density estimation, drawn as filled/stroked contour
 * bands (svelteplot's `Density`) — the 2D counterpart to a `density`/`densityX`/
 * `densityY` entry in `statistics` (which produce a 1D curve instead). No
 * `isHorizontal`: the estimate is symmetric in x/y, so there's no orientation
 * to pick between. `styles.fill`/`styles.stroke` accept an ordinary CSS color
 * *or* the literal string `'density'`, which maps each band's estimated
 * density through the plot's own color scale (svelteplot's own keyword,
 * passed through as-is — not resolved via `scales.color`). `grouping`
 * computes a separate estimate per group — same name and semantics as a
 * plot's own top-level `grouping` (forwarded to svelteplot's own `z`
 * channel internally). `data` is optional — omit it to reuse the host
 * plot's own top-level rows.
 */
export type DensityMarkerConfig = {
	type: 'density';
	data?: Record<string, unknown>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	weight?: string | ((d: any) => number);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	grouping?: string | ((d: any) => unknown);
	/** Gaussian kernel bandwidth in pixels — svelteplot defaults to 20. */
	bandwidth?: number;
	/** Contour level count, or an explicit list of density thresholds. */
	thresholds?: number | number[];
	styles?: AreaStyle;
} & Pick<CommonMarkerConfig, 'series' | 'x' | 'y'>;

/**
 * A box plot summarizing a distribution's quartiles/median/outliers
 * (svelteplot's `BoxX`/`BoxY`) — orientation is automatic: `BoxX` when `x`
 * is the measured axis and `y` a categorical one, `BoxY` otherwise. `x`/`y`
 * map straight onto the plot's own axes either way — `x` is the category
 * channel in the vertical case and the summarized value in the horizontal one.
 *
 * `bar`/`rule`/`dot`/`tickMedian`/`tickMinMax` are the only styling surface —
 * there is deliberately no shared `styles` object here (unlike every other
 * marker in this package): each option is forwarded straight through as
 * svelteplot's own same-named per-sub-mark option, since a composite mark
 * like this one needs independent per-sub-mark control (e.g. styling the
 * median tick differently from the min/max ticks) that a single shared style
 * object can't express.
 *
 * `tickMedian`/`tickMinMax` are both considered *enabled* when left unset —
 * this package's own default, not svelteplot's own (which defaults
 * `tickMinMax` off). `true`/unset shows a tick at this package's own default
 * styling; `false` hides it; an options object styles just that tick,
 * merged on top of (and overriding) the default styling. The default styling
 * itself: `tickMedian`'s `stroke` is whichever of white/black contrasts more
 * (WCAG) against the bar's own effective fill (`bar.fill`, or this package's
 * own default fill when unset — see `bar` below); `tickMinMax`'s `stroke`
 * instead *matches* that same fill, so the whisker caps blend into the box's
 * own outline the way a traditional box plot's do, and only the median
 * stands out.
 *
 * `data` is optional — omit it to reuse the host plot's own top-level rows.
 */
export type BoxMarkerConfig = {
	type: 'box';
	data?: Record<string, unknown>[];
	sort?: 'min' | 'max' | 'median' | 'p25' | 'p75' | '-min' | '-max' | '-median' | '-p25' | '-p75';
	/**
	 * Options passed to the inter-quartile-range bar mark, e.g.
	 * `{ fill, stroke, insetLeft, insetRight }` (insets in pixels —
	 * svelteplot's own unit, not a band-width fraction). `fill` also doubles
	 * as the color `tickMedian`/`tickMinMax` default their own `stroke`
	 * against/to — when left unset, this package defaults it to the theme's
	 * own `cfg.palette[0]`, both rendered and used for that computation
	 * (rather than svelteplot's own ambiguous `currentColor` default, which
	 * can't be resolved to a real color at this layer).
	 */
	bar?: Record<string, unknown>;
	/** Options passed to the min/max range rule mark. */
	rule?: Record<string, unknown>;
	/** Options passed to the outlier dot marks, e.g. `{ fill: true }` to color outliers by the plot's own color scale. */
	dot?: Record<string, unknown>;
	/** Shows/styles the median tick — see this type's own doc comment for the default styling. */
	tickMedian?: boolean | Record<string, unknown>;
	/** Shows/styles the min/max whisker-cap ticks — see this type's own doc comment for the default styling. */
	tickMinMax?: boolean | Record<string, unknown>;
} & Pick<CommonMarkerConfig, 'series' | 'x' | 'y'>;

/**
 * The convex hull around a cluster of points (svelteplot's `Hull`) — no
 * orientation to pick between, a hull is symmetric in x/y. `grouping` draws
 * one hull per group instead of a single hull over every point — same name
 * and semantics as a plot's own top-level `grouping` (forwarded to
 * svelteplot's own `z` channel internally). `color` resolves through this
 * package's own `cfg.palette` (via `resolveChannelFill`, same as every
 * other marker's `color`) and drives both `fill` and `stroke` by default —
 * unlike most markers, a hull's outline is as much its identity as its
 * fill, so both follow the same per-group color unless `styles.fill`/
 * `styles.stroke` override them. `data` is optional — omit it to reuse the
 * host plot's own top-level rows.
 */
export type HullMarkerConfig = {
	type: 'hull';
	data?: Record<string, unknown>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	grouping?: string | ((d: any) => unknown);
	styles?: AreaStyle;
} & Pick<CommonMarkerConfig, 'series' | 'x' | 'y' | 'color' | 'scales'>;

/**
 * Shaded area between two series, colored by which one is on top at each
 * point (svelteplot's `DifferenceY`) — e.g. actual vs. target, revenue vs.
 * cost. Unlike `area`/`box`, there is no `isHorizontal` here: svelteplot
 * ships only `DifferenceY`, no `DifferenceX` counterpart, so this always
 * renders vertically (a shared `x` position with two compared `y1`/`y2`
 * series) — a deliberate gap, not an oversight, per this package's
 * zero-own-computation rule for wrapper markers. `data` is required
 * (svelteplot's own `DifferenceY` requires it, unlike most other markers
 * here) — omit it to reuse the host plot's own top-level rows.
 */
export type DifferenceMarkerConfig = {
	type: 'difference';
	data?: Record<string, unknown>[];
	positiveFill?: string;
	positiveFillOpacity?: number;
	negativeFill?: string;
	negativeFillOpacity?: number;
	curve?: MarkerCurveName;
	tension?: number;
} & Pick<CommonMarkerConfig, 'series' | 'x' | 'x1' | 'x2' | 'y' | 'y1' | 'y2'>;

/**
 * A point-to-point arrow (svelteplot's `Arrow`) — direct annotation between
 * two coordinates, unlike `GeoVectorMarkerConfig`'s `vector` (a point plus a
 * length/rotation, geo-only). No `isHorizontal`: direction is already fully
 * described by `x1`/`y1` → `x2`/`y2`. `data` is optional — omit it to reuse
 * the host plot's own top-level rows.
 */
export type ArrowMarkerConfig = {
	type: 'arrow';
	data?: Record<string, unknown>[];
	/** Bend angle in degrees (0 = straight line); `true` is shorthand for 22.5°. */
	bend?: number | true;
	headAngle?: number;
	headLength?: number;
	inset?: number;
	insetStart?: number;
	insetEnd?: number;
	sweep?: 1 | 0 | -1 | '+x' | '-x' | '+y' | '-y';
	styles?: StrokeStyle;
} & Pick<CommonMarkerConfig, 'series' | 'x1' | 'y1' | 'x2' | 'y2'>;

/** Live selection rectangle of a `'brush'` marker — same shape as svelteplot's own `Brush` state. */
export type BrushSelection = {
	x1?: number | Date;
	x2?: number | Date;
	y1?: number | Date;
	y2?: number | Date;
	enabled: boolean;
};

/**
 * An interactive drag-to-select rectangle (svelteplot's `Brush`). The marker
 * owns the live selection state; `brush` only seeds the initial selection, and
 * `onbrushstart`/`onbrush`/`onbrushend` report changes (each receives the pointer
 * event, whose `brush` field carries the current {@link BrushSelection}).
 * `limitDimension` restricts brushing to one axis (`'x'` = a horizontal
 * range, `'y'` = a vertical one). Draws in screen space over the whole plot, so
 * it has no `data`/`x`/`y` channels.
 */
export type BrushMarkerConfig = {
	type: 'brush';
	/** Initial selection. */
	brush?: BrushSelection;
	limitDimension?: false | 'x' | 'y';
	/** Whether the selection may move/resize outside the scale domain. */
	constrainToDomain?: boolean;
	/** Size in pixels of the invisible drag area around the selection's edges. */
	resizeHandleSize?: number;
	onbrushstart?: (event: MouseEvent & { brush: BrushSelection }) => void;
	onbrush?: (event: MouseEvent & { brush: BrushSelection }) => void;
	onbrushend?: (event: MouseEvent & { brush: BrushSelection }) => void;
	styles?: StrokeStyle;
} & Pick<CommonMarkerConfig, 'series'>;

/**
 * Shared shape of the four Delaunay/Voronoi markers (svelteplot's
 * `DelaunayLink`, `DelaunayMesh`, `Voronoi`, `VoronoiMesh`). `grouping` computes a
 * separate diagram per group — same name and semantics as a plot's own
 * top-level `grouping` (forwarded to svelteplot's own `z` channel internally).
 * `color` resolves through this package's own `cfg.palette` into `stroke`
 * unless `styles.stroke` is set; `fill` stays svelteplot's own default (`none`)
 * unless `styles.fill` is set. `data` is optional — omit it to reuse the host
 * plot's own top-level rows.
 */
type TessellationMarkerConfig<TType extends string> = {
	type: TType;
	data?: Record<string, unknown>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	grouping?: string | ((d: any) => unknown);
	styles?: AreaStyle;
} & Pick<CommonMarkerConfig, 'series' | 'x' | 'y' | 'color' | 'scales'>;

/** One line per Delaunay triangulation edge (svelteplot's `DelaunayLink`). */
export type DelaunayLinkMarkerConfig = TessellationMarkerConfig<'delaunayLink'>;
/** The whole Delaunay triangulation drawn as one mesh path (svelteplot's `DelaunayMesh`). */
export type DelaunayMeshMarkerConfig = TessellationMarkerConfig<'delaunayMesh'>;
/** One polygon per point, its Voronoi cell (svelteplot's `Voronoi`). */
export type VoronoiMarkerConfig = TessellationMarkerConfig<'voronoi'>;
/** The whole Voronoi diagram drawn as one mesh path (svelteplot's `VoronoiMesh`). */
export type VoronoiMeshMarkerConfig = TessellationMarkerConfig<'voronoiMesh'>;

/**
 * An image per row, centered on `x`/`y` (svelteplot's `Image`). `src` is a
 * field key or per-row function returning a URL (or a literal URL applied to
 * every row); `width`/`height` are pixels (default 20) and `r` a per-row
 * circular clip radius that overrides both. `data` is optional — omit it to
 * reuse the host plot's own top-level rows.
 */
export type ImageMarkerConfig = {
	type: 'image';
	data?: Record<string, unknown>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	src: string | ((d: any) => string);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	r?: number | string | ((d: any) => number);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	width?: number | ((d: any) => number);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	height?: number | ((d: any) => number);
	/** Hover title per row. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	title?: string | ((d: any) => string);
	preserveAspectRatio?: string;
	opacity?: number;
} & Pick<CommonMarkerConfig, 'series' | 'x' | 'y'>;

/**
 * A raster image of a field over a rectangle, drawn to a canvas (svelteplot's
 * `Raster`) — a heatmap with continuous interpolation. Three modes, picked by
 * what is set: `x`/`y`/`fill` over scattered points (interpolated per
 * `interpolate`), a dense row-major grid (`width`+`height`, no `x`/`y`), or
 * `fill` as an `(x, y) => value` sampler with no `data`. `x1`/`x2`/`y1`/`y2`
 * bound the rectangle in data coordinates. `fill` values go through
 * svelteplot's own color scale, forwarded as-is (same as `density`'s
 * `'density'` keyword) — configure it via the plot's `scales.color`. `data` is
 * optional — omit it to reuse the host plot's own top-level rows.
 */
export type RasterMarkerConfig = {
	type: 'raster';
	data?: Record<string, unknown>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fill?: string | ((d: any) => unknown) | ((x: number, y: number) => unknown);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	fillOpacity?: number | string | ((d: any) => number) | ((x: number, y: number) => number);
	/** Explicit pixel-grid size (required for a dense grid); overrides `pixelSize`. */
	width?: number;
	height?: number;
	/** Screen pixels per raster pixel (default 1). */
	pixelSize?: number;
	/** Gaussian blur radius in grid pixels. */
	blur?: number;
	interpolate?: 'none' | 'nearest' | 'barycentric' | 'random-walk';
	imageRendering?: string;
	/** Bounds of the raster rectangle, in data coordinates (numbers only). */
	x1?: number;
	x2?: number;
	y1?: number;
	y2?: number;
} & Pick<CommonMarkerConfig, 'series' | 'x' | 'y'>;

/**
 * A short tick per row along one axis (svelteplot's `TickX`/`TickY`) —
 * orientation is automatic: `TickX` (a vertical tick at `x`) when `x` is the
 * measured axis and `y` a categorical one, `TickY` otherwise. The category
 * channel is optional (omitted, the tick spans the full extent of the
 * plot). `tickLength` applies on a non-band scale (default 10px). `color`
 * resolves through this package's own `cfg.palette` into `stroke`. `data` is
 * optional — omit it to reuse the host plot's own top-level rows.
 */
export type TickMarkerConfig = {
	type: 'tick';
	data?: Record<string, unknown>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	tickLength?: number | ((d: any) => number);
	styles?: StrokeStyle;
} & Pick<CommonMarkerConfig, 'series' | 'x' | 'y' | 'color' | 'scales'>;

/**
 * A variable-width ribbon following a path (svelteplot's `Trail`), its
 * thickness per row given by `r` (a field key or function, scaled by
 * svelteplot's own `r` scale) — e.g. a value encoded in the width of a
 * trajectory. `grouping` draws one trail per group. `color` resolves
 * through this package's own `cfg.palette` into `fill` unless
 * `styles.fill` is set. `data` is optional — omit it to reuse the host plot's
 * own top-level rows.
 */
export type TrailMarkerConfig = {
	type: 'trail';
	data?: Record<string, unknown>[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	r?: string | ((d: any) => number);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	grouping?: string | ((d: any) => unknown);
	curve?: MarkerCurveName;
	tension?: number;
	cap?: 'butt' | 'round';
	/** Segments sampled per curve span, or `'auto'`. */
	resolution?: number | 'auto';
	/** A trail is filled only — svelteplot's `Trail` has no stroke. */
	styles?: Pick<AreaStyle, 'fill' | 'fillOpacity'>;
} & Pick<CommonMarkerConfig, 'series' | 'x' | 'y' | 'color' | 'scales'>;

/**
 * A waffle chart bar — the bar's value shown as a grid of unit squares
 * (svelteplot's `WaffleX`/`WaffleY`). Orientation is automatic like `bar`:
 * `WaffleX` when `x` is the measured axis and `y` a band one, `WaffleY` otherwise;
 * the category axis must be a band scale. `x1`/`x2` (or `y1`/`y2`) give the
 * bar's extent instead of a single `x`/`y`. `unit` is the quantity per square
 * (default 1), `multiple` squares per row, `gap` the pixel spacing, `round`
 * avoids partial squares. Cells are square only when `multiple` matches the
 * plot's pixels per unit (left unset, svelteplot picks the closest fit, so
 * prefer that and adjust `unit` instead); an explicit `multiple` that doesn't
 * match stretches the cells along the value axis. `unit` currently has no
 * effect on the horizontal (`WaffleX`) form — svelteplot 0.14.2 drops it. `color` resolves through `cfg.palette` into `fill`
 * unless `styles.fill` is set. `data` is optional — omit it to reuse the host
 * plot's own top-level rows.
 */
export type WaffleMarkerConfig = {
	type: 'waffle';
	data?: Record<string, unknown>[];
	unit?: number;
	multiple?: number;
	gap?: number;
	round?: boolean;
	styles?: AreaStyle;
} & Pick<CommonMarkerConfig, 'series' | 'x' | 'y' | 'x1' | 'x2' | 'y1' | 'y2' | 'color' | 'scales'>;

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
} & Pick<CommonMarkerConfig, 'series' | 'x1' | 'x2' | 'y1' | 'y2'>;

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
	/** Style of the crosshair rules (`ruleX`/`ruleY`). */
	rule?: StrokeStyle;
	/** Style of the highlight area (`areaX`/`areaY`). */
	area?: AreaStyle;
	/** Style of the dot on the hovered point. */
	dot?: DotStyle;
	/** Style of the hover labels (`showLabels`). */
	text?: FontStyle;
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
	| AreaMarkerConfig
	| DensityMarkerConfig
	| BoxMarkerConfig
	| HullMarkerConfig
	| DifferenceMarkerConfig
	| ArrowMarkerConfig
	| BrushMarkerConfig
	| DelaunayLinkMarkerConfig
	| DelaunayMeshMarkerConfig
	| VoronoiMarkerConfig
	| VoronoiMeshMarkerConfig
	| ImageMarkerConfig
	| RasterMarkerConfig
	| TickMarkerConfig
	| TrailMarkerConfig
	| WaffleMarkerConfig
	| RuleMarkerConfig
	| HoverMarkerConfig
	| CustomComponentMarkerConfig;
