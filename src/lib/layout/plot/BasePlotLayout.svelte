<script
	lang="ts"
	generics="TData extends Record<string, unknown>, TSeries extends Record<string, unknown> = TData"
>
	import type { ComponentProps, Snippet } from 'svelte';
	import { Plot, Pointer, setPlotDefaults } from 'svelteplot';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { AUTO_MARGIN_ESTIMATE, numericMargin } from '$lib/layout/plot/margins';
	import { buildScale } from '$lib/layout/scales/buildScale';
	import ScalesLayout from '$lib/layout/scales/ScalesLayout.svelte';
	import GeometryLayout from '$lib/layout/geometry/GeometryLayout.svelte';
	import CoordinatesLayout from '$lib/layout/coordinates/CoordinatesLayout.svelte';
	import StylesLayout from '$lib/layout/styles/StylesLayout.svelte';
	import TooltipLayout from '$lib/layout/tooltip/TooltipLayout.svelte';
	import type { PlotHover } from '$lib/layout/tooltip/createPlotHover.svelte';
	import type {
		AxisValue,
		AxisBasedScalesConfig,
		ChannelScalesConfig
	} from '$lib/types/layout/scales';
	import type { CoordinatesConfig } from '$lib/types/layout/coordinates';
	import type { StylesLayoutConfig } from '$lib/types/layout/styles';
	import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';
	import type { HoverPoint } from '$lib/types/layout/tooltip';
	import type { MarginConfig, HoverConfig } from '$lib/types/plots/props';
	import type { MarkerConfig } from '$lib/types/markers/all';
	import type { Series } from '$lib/types/plots/data/common';
	import type { GeoFeature } from '$lib/types/plots/data/geo';

	type SveltePlotProps = ComponentProps<typeof Plot>;

	/**
	 * Shared chrome around every plot kind's svelteplot markup: the
	 * pointer-event wrapper, the hover/tooltip state machine, and the floating
	 * tooltip. `StylesLayout`/`ScalesLayout`/`GeometryLayout` render as
	 * siblings inside `CoordinatesLayout` (which owns svelteplot's own
	 * `<Plot>`) — `ScalesLayout` only when `scales` is passed, `GeometryLayout`
	 * renders nothing extra when `markers` is empty/unset. `children` renders
	 * last, after `GeometryLayout`, so it draws on top without needing to be
	 * its child. Every plot kind supplies its own `<Plot x y projection>`
	 * scale config, either directly via `x`/`y` or by leaving them unset so
	 * this component derives them from `scales`.
	 */
	let {
		width,
		height,
		data,
		getX,
		getY,
		hover,
		x = undefined,
		y = undefined,
		length = undefined,
		scales = undefined,
		channelScales = undefined,
		coordinates = undefined,
		margins,
		marginEstimate = AUTO_MARGIN_ESTIMATE,
		marginRemountKey = undefined,
		xTickRotate = undefined,
		styles = undefined,
		markers = undefined,
		seriesData = undefined,
		scopedGroups = undefined,
		geoAllFeatures = undefined,
		containerEl = $bindable(undefined),
		hoverController,
		children
	}: {
		width: number;
		height: number;
		/** Flat rows fed to svelteplot's `<Pointer>` for nearest-point matching, and to `CoordinatesLayout` for a `domain: 'data'` projection auto-fit. */
		data: TData[];
		getX: (d: TData) => AxisValue;
		getY: (d: TData) => AxisValue;
		/** Every hover/tooltip prop this component's own hover machinery reads — see {@link HoverConfig}. */
		hover: HoverConfig<TData>;
		/** Explicit `<Plot x>` override — bypasses `scales`-derived resolution (e.g. GeoPlot's fixed lon/lat domain). */
		x?: SveltePlotProps['x'];
		/** Explicit `<Plot y>` override — see `x`. */
		y?: SveltePlotProps['y'];
		/** Explicit `<Plot length>` override — `GeoPlot` only, its `scales.length` resolved by the caller (no `AxisBasedScalesConfig.length` — see `GeoScalesConfig`'s own doc comment). */
		length?: SveltePlotProps['length'];
		/** Scale config `x`/`y`/`r` are derived from when not given directly. */
		scales?: AxisBasedScalesConfig<TData>;
		/**
		 * This plot kind's own `color`/`grouping` channel config — the fallback
		 * a `GeometryLayout` marker's own `scales` inherits when it sets none of
		 * its own. Distinct from `scales` above: `GeoPlot` has no axis ticks to
		 * derive (never passes `scales`) but still has its own channel ramp for
		 * markers to inherit.
		 */
		channelScales?: ChannelScalesConfig;
		/** This plot kind's coordinate system config — `GeoPlot` only (a projection + pan/zoom). */
		coordinates?: CoordinatesConfig;
		/** Partial margin override — merged on top of the theme. */
		margins?: MarginConfig;
		/** Numeric fallback for a margin side that resolved to `'auto'` — see `numericMargin`'s doc comment. */
		marginEstimate?: Record<'top' | 'right' | 'bottom' | 'left', number>;
		/**
		 * Forces svelteplot's own `<Plot>` to fully unmount/remount (via
		 * `{#key}`) instead of reacting to a live `margins` change. Needed by a
		 * caller whose `margins` grows *after* mount (line's own
		 * `createLabelMarginTracker`) — a post-mount margin update otherwise
		 * fights svelteplot's own auto-margin sizing into an infinite resize
		 * loop. Leave unset for a static `margins` prop (every other kind).
		 */
		marginRemountKey?: string | number;
		/** Boosts the bottom margin for a rotated x tick label — axis-having plot kinds only. */
		xTickRotate?: number;
		/** This plot kind's own `styles` prop, forwarded to the Styles layer. */
		styles?: StylesLayoutConfig;
		/**
		 * This plot kind's own markers array. Accepts a plain array, or a
		 * builder function for a plot kind whose own marker construction needs
		 * `setHoverMatch`/`clearHoverMatch`, only available once this
		 * component's own hover controller is set up.
		 */
		markers?:
			| MarkerConfig[]
			| ((hover: {
					setHoverMatch: (rows: TData[]) => void;
					clearHoverMatch: () => void;
			  }) => MarkerConfig[]);
		/** All resolved series, forwarded to `GeometryLayout` — axis-based kinds only. Independently generic over `TSeries` (defaults to `TData`). */
		seriesData?: Series<TSeries>[];
		/** Per-series `GeometryLayout` groups — axis-based kinds only, same `TSeries` as `seriesData`. */
		scopedGroups?: ScopedMarkerGroup<TSeries>[];
		/** `GeoPlot`'s own untouched, tagged features, forwarded to `GeometryLayout` — `inset` marker only. */
		geoAllFeatures?: (GeoFeature<Record<string, unknown>> & { __id: string })[];
		/** The wrapper div's own element — bind for a nested layout that needs it for its own gesture handling (e.g. `CoordinatesLayout`'s zoom/rotate). */
		containerEl?: HTMLDivElement;
		/** Every plot kind creates its own via `createPlotHover` and passes it here — this component never creates one itself. */
		hoverController: PlotHover<TData>;
		/**
		 * Renders on top of every marker. `matchedPoints` carries the source
		 * `row` alongside the display fields; `activePoint` is the one under
		 * the cursor; `numericMargins` lets it align with the content box;
		 * `setHoverMatch`/`clearHoverMatch` drive the match directly instead of
		 * svelteplot's distance-based `<Pointer>` (see `hover.pointMatching`).
		 * Optional — a kind whose every mark is a `markers` entry needs nothing here.
		 */
		children?: Snippet<
			[
				{
					matchedPoints: HoverPoint<TData>[];
					activePoint: HoverPoint<TData> | null;
					impliesCrosshairX: boolean;
					impliesCrosshairY: boolean;
					numericMargins: { top: number; right: number; bottom: number; left: number };
					setHoverMatch: (rows: TData[]) => void;
					clearHoverMatch: () => void;
				}
			]
		>;
	} = $props();

	const cfg = $derived(getConfiguration());
	setPlotDefaults({
		numberFormat: { useGrouping: 'min2', compactDisplay: cfg.axis.compactDisplay }
	});

	/**
	 * Margins passed straight to `<Plot margin={…}>`. Each side defaults to
	 * `'auto'` (from the theme), which lets svelteplot size it to whatever it
	 * actually renders there — tick labels, an axis title, rotated ticks —
	 * rather than a fixed guess that either clips content or wastes space.
	 * `margins`/`cfg.margins` can still pin a side to an exact number.
	 */
	const computedMargins = $derived.by(() => {
		const base = { ...cfg.margins, ...margins };
		// Auto margins already measure the real (rotated) label bounding box, so
		// this manual boost is only needed when the caller pinned bottom to a
		// fixed number, which bypasses that measurement.
		if (!xTickRotate || typeof base.bottom !== 'number') return base;
		const rad = (Math.abs(xTickRotate) * Math.PI) / 180;
		return {
			...base,
			bottom: base.bottom + Math.ceil(Math.sin(rad) * 20)
		};
	});

	const numericMargins = $derived({
		top: numericMargin('top', computedMargins.top, marginEstimate),
		right: numericMargin('right', computedMargins.right, marginEstimate),
		bottom: numericMargin('bottom', computedMargins.bottom, marginEstimate),
		left: numericMargin('left', computedMargins.left, marginEstimate)
	});

	// Cast to svelteplot's own (narrower, axis-specific) scale option type:
	// buildScale has already stripped the fields that don't exist there
	// (grid, the vertical label config, BarPlot's series-layout knobs).
	const resolvedX = $derived(
		x !== undefined ? x : (buildScale(scales?.x, data, getX) as SveltePlotProps['x'])
	);
	const resolvedY = $derived(
		y !== undefined ? y : (buildScale(scales?.y, data, getY) as SveltePlotProps['y'])
	);
	/** Threaded straight into svelteplot's own `r` scale option — see `RScaleConfig`'s own doc comment for why this isn't independently resolved like `color`. */
	const resolvedR = $derived(scales?.r as SveltePlotProps['r']);

	/** Only ever meaningful for `GeoPlot`. `none` while any interactive gesture (`zoom`/`pan`/`rotate`) is on. */
	const touchAction = $derived(
		(coordinates?.zoom !== false && coordinates?.zoom != null) ||
			coordinates?.pan ||
			coordinates?.rotate
			? 'none'
			: undefined
	);

	// ── Hover / tooltip ───────────────────────────────────────────────────────
	const hoverStore = $derived(hoverController.hoverStore);
	const ctrl = $derived(hoverController.ctrl);

	/** Declared intent, defaulted — see {@link HoverConfig.pointMatching}. */
	const pointMatchingStrategy = $derived(hover.pointMatching ?? 'nearest');

	/**
	 * Which axes svelteplot's `<Pointer>` should search along, derived from
	 * the active strategy. `undefined` for an axis collapses every point to
	 * the same coordinate on that axis, excluding it from the match entirely.
	 */
	const pointerMatchX = $derived(hoverStore.strategy === 'y' ? undefined : getX);
	const pointerMatchY = $derived(hoverStore.strategy === 'x' ? undefined : getY);

	function onMove(e: PointerEvent) {
		if (hover.exclude?.(e)) {
			ctrl.onLeave();
			return;
		}
		ctrl.onMove(e);
	}

	const resolvedMarkers = $derived(
		typeof markers === 'function'
			? markers({ setHoverMatch: ctrl.onPointer, clearHoverMatch: ctrl.onLeave })
			: markers
	);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="dct-plot"
	bind:this={containerEl}
	style:color={cfg.axis.color}
	style:touch-action={touchAction}
	onpointermove={hover.active ? onMove : undefined}
	onpointerleave={hover.active ? ctrl.onLeave : undefined}
>
	<CoordinatesLayout
		{width}
		{height}
		margin={computedMargins}
		x={resolvedX}
		y={resolvedY}
		r={resolvedR}
		{length}
		{coordinates}
		locale={cfg.axis.locale}
		{data}
		{containerEl}
		remountKey={marginRemountKey}
	>
		<StylesLayout {styles} {width} {height} {numericMargins} />
		{#if scales !== undefined}
			<ScalesLayout {data} {getX} {getY} {width} {height} {numericMargins} {scales} />
		{/if}
		<GeometryLayout
			markers={resolvedMarkers}
			seriesData={seriesData ?? []}
			scopedGroups={scopedGroups ?? []}
			{channelScales}
			{ctrl}
			{width}
			{height}
			{numericMargins}
			{data}
			{geoAllFeatures}
			tooltipAnchorX={hover.tooltip?.anchorX}
			tooltipAnchorY={hover.tooltip?.anchorY}
		/>
		{@render children?.({
			matchedPoints: ctrl.points,
			activePoint: ctrl.activePoint,
			impliesCrosshairX: ctrl.impliesCrosshairX,
			impliesCrosshairY: ctrl.impliesCrosshairY,
			numericMargins,
			setHoverMatch: ctrl.onPointer,
			clearHoverMatch: ctrl.onLeave
		})}

		{#if hover.active && pointMatchingStrategy === 'nearest'}
			<Pointer
				{data}
				x={pointerMatchX}
				y={pointerMatchY}
				maxDistance={400}
				onupdate={ctrl.onPointer}
			/>
		{/if}
	</CoordinatesLayout>

	{#if hover.tooltip}
		<TooltipLayout
			visible={ctrl.showTooltip && ctrl.tooltipPosition != null}
			x={ctrl.tooltipPosition?.x ?? 0}
			y={ctrl.tooltipPosition?.y ?? 0}
			bounds={{ width, height }}
			rows={ctrl.matchedRows.map((p) => p.row)}
			format={hover.tooltip.format}
			content={hover.tooltip.content}
			anchorX={hover.tooltip.anchorX}
			anchorY={hover.tooltip.anchorY}
		/>
	{/if}
</div>

<style>
	.dct-plot {
		position: relative;
		line-height: 0;
	}
</style>
