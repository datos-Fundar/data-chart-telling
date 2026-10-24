<script
	lang="ts"
	generics="TData extends Record<string, unknown>, TSeries extends Record<string, unknown> = TData"
>
	import { Margins } from '$lib/layout/margins/Margins';
	import type { AxisScale } from '$lib/types/layout/scales';
	import type { PlotLayoutState } from '$lib/types/layout/plot';
	import { PlotMargins } from '$lib/layout/margins/PlotMargins.svelte';
	import { LegendState } from '$lib/layout/legend/LegendState.svelte';
	import { onDestroy, untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import type { ComponentProps, Snippet } from 'svelte';
	import { Plot, Pointer, setPlotDefaults } from 'svelteplot';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { SveltePlotScale } from '$lib/layout/scales/SveltePlotScale';
	import { TickLabels } from '$lib/layout/scales/TickLabels';
	import ScalesLayout from '$lib/layout/scales/ScalesLayout.svelte';
	import GeometryLayout from '$lib/layout/geometry/GeometryLayout.svelte';
	import CoordinatesLayout from '$lib/layout/coordinates/CoordinatesLayout.svelte';
	import StylesLayout from '$lib/layout/styles/StylesLayout.svelte';
	import Tooltip from '$lib/layout/tooltip/Tooltip.svelte';
	import { PlotHover } from '$lib/layout/hover/PlotHover.svelte';
	import { PlotContext } from '$lib/layout/plot/PlotContext';
	import { TimelineState } from '$lib/layout/timeline/TimelineState.svelte';
	import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import type { AxisValue } from '$lib/types/layout/mapping';
	import type { CoordinatesConfig, GeoScalesConfig } from '$lib/types/layout/coordinates';
	import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';
	import type { HoverPoint } from '$lib/types/layout/hover';
	import type { MarginConfig, HoverConfig } from '$lib/types/plots/props';
	import type { MarkerConfig } from '$lib/types/markers/all';
	import type { Series } from '$lib/types/plots/data/common';
	import type { GeoFeature } from '$lib/types/plots/data/geo';

	type SveltePlotProps = ComponentProps<typeof Plot>;

	/**
	 * Shared frame around every plot kind's svelteplot markup: the svelteplot
	 * `<Plot>` with its styles, axes and markers, the pointer and hover/tooltip
	 * wiring, and the floating tooltip. `children` draws on top of the markers.
	 */
	let {
		width,
		height,
		state,
		coordinates = undefined,
		margins = $bindable(),
		markers = undefined,
		geoAllFeatures = undefined,
		containerEl = $bindable(undefined),
		children
	}: {
		width: number;
		height: number;
		/**
		 * The end of the plot's pipeline: its hover config, the rows it draws and
		 * hovers over (fed to svelteplot's `<Pointer>` and to `CoordinatesLayout`
		 * for a `domain: 'data'` auto-fit) and where each sits, its scales, its
		 * markers, and an axis kind's series and marker groups.
		 */
		state: PlotLayoutState;
		/** This plot kind's coordinate system config - `GeoPlot` only (a projection + pan/zoom). */
		coordinates?: CoordinatesConfig;
		/**
		 * The author's margins, over the theme's. Bindable: it receives the
		 * margins the plot's labels settled on - see {@link PlotMargins}.
		 */
		margins?: MarginConfig;
		/** Markers drawn after the state's own. */
		markers?: MarkerConfig[];
		/** `GeoPlot`'s own untouched, tagged features, forwarded to `GeometryLayout` - `inset` marker only. */
		geoAllFeatures?: (GeoFeature<Record<string, unknown>> & { __id: string })[];
		/** The wrapper div's own element - bind for a nested layout that needs it for its own gesture handling (e.g. `CoordinatesLayout`'s zoom/rotate). */
		containerEl?: HTMLDivElement;
		/**
		 * Draws on top of every marker, given the matched and active hover points,
		 * the numeric margins and the hover-match callbacks.
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

	const data = $derived((state.hoverRows ?? []) as TData[]);
	const getX = $derived(state.hoverPosition!.x as (d: TData) => AxisValue);
	const getY = $derived(state.hoverPosition!.y as (d: TData) => AxisValue);
	const hover = $derived(state.hover as HoverConfig<TData>);
	const scales = $derived(
		state.scales as (AxisBasedScalesConfig<TData> & GeoScalesConfig) | undefined
	);
	const seriesData = $derived(state.resolvedSeries as Series<TSeries>[] | undefined);
	const scopedGroups = $derived(state.scopedGroups as ScopedMarkerGroup<TSeries>[] | undefined);

	// What this plot draws, on its figure's legend - its series, their colors and marks.
	const legend = LegendState.current();
	const legendSource = Symbol('plot');
	const silenced = LegendState.isSilenced();
	$effect(() => {
		if (silenced) return;
		const entries = LegendState.entriesOf(state as never);
		untrack(() => legend?.register(legendSource, entries));
	});
	onDestroy(() => legend?.unregister(legendSource));

	// Created once, not `$derived`: this plot's hover.
	const ctrl = new PlotHover<TData>({
		hover: () => hover,
		getX: () => getX,
		getY: () => getY,
		width: () => width,
		height: () => height
	});

	const cfg = $derived(getConfiguration());
	setPlotDefaults({
		numberFormat: { useGrouping: 'min2', compactDisplay: untrack(() => cfg.axis.compactDisplay) }
	});

	/** What an `'auto'` side reads as: the plot's own estimate, less the room of an axis that is not drawn. */
	const marginEstimate = $derived.by(() => {
		const estimate = state.marginEstimate ?? Margins.AXIS_ESTIMATE;
		const bare = { x: scales?.x?.axisDisplay === 'none', y: scales?.y?.axisDisplay === 'none' };
		return estimate.map((value, side) =>
			(bare.x && side === 'bottom') || (bare.y && side === 'left') ? Math.min(value, 8) : value
		);
	});

	/**
	 * How the labels of the plot's category axes are laid out when they would not fit
	 * side by side, unless the author set a `tickRotate` of their own or turned
	 * `axis.autoRotate` off: the x labels turn (45 degrees, else 90), and either
	 * axis leaves some out when even that is not enough. Judged against the plot's
	 * width and height less the margins an `'auto'` side is estimated at, so it holds
	 * whatever the margins settle on.
	 */
	const tickLayout = $derived.by(() => {
		const bands = state.axes?.bands ?? [];
		if (!cfg.axis.autoRotate || bands.length === 0) return undefined;
		const estimate = marginEstimate;
		const categories = (axis: 'x' | 'y') => {
			const given = scales?.[axis]?.domain;
			if (given) return given.map(String);
			const get = axis === 'x' ? getX : getY;
			return [...new Set(data.map((row) => String(get(row))))].sort();
		};
		const out: {
			x?: ReturnType<typeof TickLabels.layout>;
			y?: { every: number; values: string[] };
		} = {};
		if (bands.includes('x') && scales?.x?.tickRotate === undefined) {
			out.x = TickLabels.layout(
				categories('x'),
				width - estimate.left - estimate.right,
				scales?.x?.paddingInner ?? 0.1,
				cfg.axis.fontSize,
				cfg
			);
		}
		if (bands.includes('y') && scales?.y?.ticks == null) {
			const values = categories('y');
			const every = TickLabels.rows(
				values.length,
				height - estimate.top - estimate.bottom,
				cfg.axis.fontSize
			);
			if (every > 1) out.y = { every, values };
		}
		return out;
	});
	/** `scales` with the rotation the tick layout chose for the x labels. */
	const layoutScales = $derived.by(() => {
		const rotate = tickLayout?.x?.rotate;
		if (!rotate || scales === undefined) return scales;
		return { ...scales, x: { ...scales.x, tickRotate: rotate } };
	});
	/** The category labels a crowded axis still writes: one in every few. */
	const tickValues = $derived.by(() => {
		const out: Partial<Record<'x' | 'y', string[]>> = {};
		const x = tickLayout?.x;
		if (x && x.every > 1) {
			const values =
				scales?.x?.domain?.map(String) ?? [...new Set(data.map((row) => String(getX(row))))].sort();
			out.x = values.filter((_, index) => index % x.every === 0);
		}
		const y = tickLayout?.y;
		if (y) out.y = y.values.filter((_, index) => index % y.every === 0);
		return out;
	});

	// Created once: this plot's margins, grown to fit the labels its markers report.
	const plotMargins = new PlotMargins({
		theme: () => cfg.margins,
		author: () => margins,
		estimate: () => marginEstimate,
		reserve: () => state.valueLabels?.reach ?? [],
		size: () => ({ width, height }),
		resetKey: () => state.resolvedSeries,
		scales: () => layoutScales,
		tickFontSize: () => cfg.axis.fontSize,
		tickWidth: () => ({ x: tickLayout?.x?.width }),
		settle: (settled) => (margins = settled)
	});
	const numericMargins = $derived(plotMargins.numeric);

	// What anything drawn inside this plot reads through `usePlot()`.
	PlotContext.provide<TData>({
		hover: ctrl,
		legend,
		timeline: TimelineState.current(),
		margins: plotMargins,
		scales: () => scales,
		axes: () => state.axes,
		data: () => data,
		size: () => ({ width, height })
	});

	/** The domains `ScalesLayout` widens an axis to, for an edge tick's `'extend'` (see `EdgeTicks`). */
	const edgeDomains = new SvelteMap<'x' | 'y', [number, number]>();

	/** The title svelteplot would infer from rows, for a slice with none (it infers nothing then). */
	function titleOfEmpty(axis: 'x' | 'y', scale: AxisScale<TData> | undefined): string | undefined {
		const field = state.channels?.[axis]?.source;
		if (data.length > 0 || typeof field !== 'string' || scale?.label !== undefined)
			return undefined;
		if (scale?.type === 'time' || scale?.type === 'utc') return undefined;
		// `ScalesLayout` draws a vertical title.
		if (scale?.labelOrientation === 'vertical') return undefined;
		if (axis === 'y') return `${scale?.reverse ? '↓' : '↑'} ${field}`;
		if (state.axes?.isDiscrete('x')) return field;
		return scale?.reverse ? `← ${field}` : `${field} →`;
	}

	// `SveltePlotScale.build` already left only svelteplot's own scale options.
	const resolvedX = $derived.by(() => {
		const built = SveltePlotScale.build(layoutScales?.x, data, getX);
		const domain = edgeDomains.get('x');
		const label = titleOfEmpty('x', layoutScales?.x);
		const out = domain ? { ...built, domain, nice: false } : built;
		return (label ? { ...out, label } : out) as SveltePlotProps['x'];
	});
	const resolvedY = $derived.by(() => {
		const built = SveltePlotScale.build(scales?.y, data, getY);
		const domain = edgeDomains.get('y');
		const label = titleOfEmpty('y', scales?.y);
		const out = domain ? { ...built, domain, nice: false } : built;
		return (label ? { ...out, label } : out) as SveltePlotProps['y'];
	});
	/** Threaded straight into svelteplot's own `r` scale option - see `RScaleConfig`'s own doc comment for why this isn't independently resolved like `color`. */
	const resolvedR = $derived(scales?.r as SveltePlotProps['r']);
	/** Threaded straight into svelteplot's own `length` scale option - see `LengthScaleConfig`'s own doc comment. `GeoPlot`-only in practice (see `scales`'s own doc comment), same mechanism as `r`. */
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

	/** Declared intent, defaulted - see {@link HoverConfig.pointMatching}. */
	const pointMatchingStrategy = $derived(hover.pointMatching ?? 'nearest');

	/** The axes svelteplot's `<Pointer>` matches along, per hover strategy. */
	const pointerMatchX = $derived(ctrl.state.strategy === 'y' ? undefined : getX);
	const pointerMatchY = $derived(ctrl.state.strategy === 'x' ? undefined : getY);

	function onMove(e: PointerEvent) {
		if (hover.exclude?.(e)) {
			ctrl.onLeave();
			return;
		}
		ctrl.onMove(e);
	}

	const resolvedMarkers = $derived([
		...((state.markers ?? []) as MarkerConfig[]),
		...(markers ?? [])
	]);
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
		margin={plotMargins.config}
		x={resolvedX}
		y={resolvedY}
		r={resolvedR}
		length={resolvedLength}
		{coordinates}
		locale={cfg.axis.locale}
		{data}
		{containerEl}
		remountKey={plotMargins.remountKey}
	>
		<StylesLayout styles={state.styles} {width} {height} {numericMargins} />
		<!-- Axes for every kind but GeoPlot. -->
		{#if scales !== undefined && coordinates === undefined}
			<ScalesLayout
				{data}
				{getX}
				{getY}
				{width}
				{height}
				{numericMargins}
				scales={layoutScales}
				{edgeDomains}
				{tickValues}
				{state}
			/>
		{/if}
		<GeometryLayout
			markers={resolvedMarkers}
			seriesData={seriesData ?? []}
			scopedGroups={scopedGroups ?? []}
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
		<Tooltip
			visible={ctrl.showTooltip && ctrl.tooltipPosition != null}
			x={ctrl.tooltipPosition?.x ?? 0}
			y={ctrl.tooltipPosition?.y ?? 0}
			rows={ctrl.matchedRows.map((p) => ({ ...p.row, seriesColor: p.color }))}
			format={hover.tooltip.format}
			sort={hover.tooltip.sort}
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
