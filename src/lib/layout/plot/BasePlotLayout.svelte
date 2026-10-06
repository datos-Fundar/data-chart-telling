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
	import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import type { AxisValue } from '$lib/types/layout/mapping';
	import type { CoordinatesConfig, GeoScalesConfig } from '$lib/types/layout/coordinates';
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
	 * `<Plot>`) — `ScalesLayout` only when `scales` is passed and this isn't
	 * `GeoPlot` (see its own doc comment below), `GeometryLayout` renders
	 * nothing extra when `markers` is empty/unset. `children` renders last,
	 * after `GeometryLayout`, so it draws on top without needing to be its
	 * child. `<Plot x y>` is always derived from `scales.x`/`scales.y` —
	 * `GeoPlot`'s own fixed lon/lat frame rides in through `scales` too (see
	 * `scales`'s own doc comment), rather than as separate override props.
	 */
	let {
		width,
		height,
		data,
		getX,
		getY,
		hover,
		scales = undefined,
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
		/**
		 * `<Plot x y>` is always derived from `scales.x`/`scales.y` — and
		 * `<Plot r>`/`<Plot length>` from `scales.r`/`scales.length` — plus the
		 * fallback a `GeometryLayout` marker's own `scales` inherits when it
		 * sets none of its own (every plot kind passes one value for both —
		 * there's no case where a marker should inherit a different channel
		 * ramp than the plot's own). `GeoPlot`'s own fixed lon/lat frame is
		 * just `scales.x`/`scales.y` set to its lon/lat domain, same as any
		 * other plot kind pinning an axis — `x`/`y` need no special-casing
		 * here. Intersected with `GeoScalesConfig` so its own `length`
		 * (`GeoPlot`'s `vector` magnitude scale) can ride along the same prop
		 * too, without adding that Geo-only field to the author-facing
		 * `AxisBasedScalesConfig` itself (no axis-based plot kind has a
		 * `vector` marker) — and without hand-copying `GeoScalesConfig`'s own
		 * shape here, so a future Geo-only field is picked up for free.
		 */
		scales?: AxisBasedScalesConfig<TData> & GeoScalesConfig;
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
	// `GeoPlot`'s own fixed lon/lat frame is just a pinned `domain` here —
	// `buildScale` passes a pinned `domain` through unchanged (its `nice`
	// default only kicks in when `domain` is unset), so no special-casing
	// is needed for it.
	const resolvedX = $derived(buildScale(scales?.x, data, getX) as SveltePlotProps['x']);
	const resolvedY = $derived(buildScale(scales?.y, data, getY) as SveltePlotProps['y']);
	/** Threaded straight into svelteplot's own `r` scale option — see `RScaleConfig`'s own doc comment for why this isn't independently resolved like `color`. */
	const resolvedR = $derived(scales?.r as SveltePlotProps['r']);
	/** Threaded straight into svelteplot's own `length` scale option — see `LengthScaleConfig`'s own doc comment. `GeoPlot`-only in practice (see `scales`'s own doc comment), same mechanism as `r`. */
	const resolvedLength = $derived(scales?.length as SveltePlotProps['length']);

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
		length={resolvedLength}
		{coordinates}
		locale={cfg.axis.locale}
		{data}
		{containerEl}
		remountKey={marginRemountKey}
	>
		<StylesLayout {styles} {width} {height} {numericMargins} />
		<!--
			`coordinates` is `GeoPlot`-only (see its own doc comment) — a map has
			no x/y axis ticks to draw regardless of what `scales` carries, even
			though `GeoPlot` now passes one (its fixed lon/lat frame plus
			`length`), same as every axis-based kind.
		-->
		{#if scales !== undefined && coordinates === undefined}
			<ScalesLayout {data} {getX} {getY} {width} {height} {numericMargins} {scales} />
		{/if}
		<GeometryLayout
			markers={resolvedMarkers}
			seriesData={seriesData ?? []}
			scopedGroups={scopedGroups ?? []}
			channelScales={scales}
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
