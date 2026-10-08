<script lang="ts" generics="TRow extends Record<string, unknown>, TScales extends object">
	import PlotContainer from '$lib/layout/shell/PlotContainer.svelte';
	import TimelineLayout from '$lib/layout/timeline/TimelineLayout.svelte';
	import FacetLayout from '$lib/layout/facet/FacetLayout.svelte';
	import FacetGridLayout from '$lib/layout/facet/FacetGridLayout.svelte';
	import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
	import HoverScope from '$lib/layout/tooltip/HoverScope.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { getHover, provideHover } from '$lib/layout/tooltip/hover.svelte';
	import { getHoverScope } from '$lib/layout/tooltip/hoverScope';
	import { getSharedTimeline } from '$lib/layout/composer/context';
	import {
		getLegendInteraction,
		provideLegendInteraction
	} from '$lib/layout/legend/interaction.svelte';
	import { resolveHoverStrategy, resolveHoverSync } from '$lib/layout/tooltip/utils';
	import { resolveTimelineInterpolation } from '$lib/utils/interpolate';
	import { buildFacetCellScales, buildSharedAxisScale } from '$lib/layout/shell/facetScales';
	import { isFacetWrap } from '$lib/layout/facet/config';
	import { hasPlotChrome, mergeScales } from '$lib/layout/shell/shell';
	import { buildSliceFilter } from '$lib/layout/shell/slice';
	import type { SlicePlace } from '$lib/layout/shell/slice';
	import type { PlotChrome, TooltipConfig } from '$lib/types/plots/props';
	import type { PlotCellSnippet, PlotPresentation } from '$lib/types/plots/presentation';
	import type { FacetCellContext, FacetConfig } from '$lib/types/layout/facet';
	import type { TimelineConfig, TimeValue } from '$lib/types/layout/timeline';

	/**
	 * Everything a plot kind draws around its core: chrome, timeline and facet
	 * around a `cell` snippet that renders the core for one slice. Hover and
	 * legend stores are shared with an enclosing composer; a plot with its own
	 * `legend` gets its own legend store. Rendered through {@link PlotShell}.
	 */
	let {
		width,
		height,
		title,
		subtitle,
		caption,
		header,
		footer,
		legend,
		order,
		data,
		timeline,
		facet,
		tooltip,
		markers = [],
		presentation,
		cell
	}: PlotChrome & {
		width: number;
		height: number;
		data: TRow[] | undefined;
		timeline?: TimelineConfig<TRow>;
		facet?: FacetConfig<TRow>;
		tooltip?: TooltipConfig<TRow>;
		markers?: { type: string }[];
		presentation: PlotPresentation<TRow, TScales>;
		cell: PlotCellSnippet<TRow, TScales>;
	} = $props();

	const cfg = $derived(getConfiguration());

	const inheritedHover = getHover();
	const ownHover = inheritedHover ? null : provideHover();
	$effect(() => {
		if (!ownHover) return;
		ownHover.strategy = resolveHoverStrategy(
			tooltip?.strategy,
			markers,
			presentation.hoverStrategy
		);
		ownHover.sync = resolveHoverSync(tooltip?.sync, markers);
	});

	// Read once at setup: a plot that draws its own legend scopes its toggles to itself.
	// svelte-ignore state_referenced_locally
	if (legend?.length || !getLegendInteraction()) provideLegendInteraction();

	const sharedTimeline = getSharedTimeline();
	const parentScope = getHoverScope();
	const scopeOf = (facetValue: string) => {
		const parent = parentScope();
		return parent ? `${parent}/${facetValue}` : facetValue;
	};

	$effect(() => {
		if (!data && (timeline || facet)) {
			console.warn(
				'Plot: `timeline` and `facet` slice flat `data` rows - they are ignored with pre-built `series`.'
			);
		}
	});

	const sliced = $derived(data != null && (timeline != null || facet != null));
	const sliceScales = $derived(sliced && data ? presentation.sliceScales?.(data) : undefined);
	// A timeline alone keeps every step on the axes all its rows span; with a facet, the facet's scales already do.
	const timelineScales = $derived.by(() => {
		if (!timeline || facet || !data || timeline.scales === 'free') return undefined;
		const values = presentation.facetAxisValues?.(data);
		if (!values) return undefined;
		const x = buildSharedAxisScale([values], 'x');
		const y = buildSharedAxisScale([values], 'y');
		return { ...(x ? { x } : {}), ...(y ? { y } : {}) } as TScales;
	});

	const timelineFilterMode = $derived(timeline?.filterMode ?? presentation.timeline?.filterMode);
	const keepFor = (place: SlicePlace) =>
		buildSliceFilter({ timeline, filterMode: timelineFilterMode, facet, place });

	const wrapFacet = $derived(facet && isFacetWrap(facet) ? facet : undefined);
	const gridFacet = $derived(facet && !isFacetWrap(facet) ? facet : undefined);
	const cellScales = $derived(
		facet && data ? buildFacetCellScales(facet, data, presentation.facetAxisValues) : undefined
	);

	$effect(() => {
		if (gridFacet && gridFacet.rows === undefined && gridFacet.cols === undefined) {
			console.warn('Plot: `facet` needs `by`, or `rows` and/or `cols`.');
		}
	});

	const timelineInterpolation = $derived.by(() => {
		if (!timeline) return undefined;
		const defaults = presentation.timeline?.interpolation;
		if (defaults) return resolveTimelineInterpolation(timeline.interpolate, defaults);
		return typeof timeline.interpolate === 'object' ? timeline.interpolate : undefined;
	});
</script>

{#snippet facetCell(place: FacetCellContext<TRow>, time: TimeValue | undefined)}
	<HoverScope id={scopeOf(place.facetValue)}>
		{@render cell({
			data: place.data,
			width: place.width,
			height: place.height,
			margins: place.margins,
			tooltip,
			scales: mergeScales(sliceScales, cellScales?.(place) as TScales | undefined),
			keep: keepFor({ time, facet: place })
		})}
	</HoverScope>
{/snippet}

{#snippet facetBody(rows: TRow[] | undefined, w: number, h: number, time: TimeValue | undefined)}
	{#if wrapFacet && rows}
		<FacetLayout
			data={rows}
			by={wrapFacet.by}
			columns={wrapFacet.columns}
			values={wrapFacet.values}
			gap={wrapFacet.gap}
			mode={wrapFacet.mode}
			visible={wrapFacet.visible}
			pageSize={wrapFacet.pageSize}
			navLayout={wrapFacet.navLayout}
			formatIndicator={wrapFacet.formatIndicator}
			indicator={wrapFacet.indicator}
			navButton={wrapFacet.navButton}
			marginsForFacet={wrapFacet.marginsForFacet}
			align={wrapFacet.axes === 'outer'}
			width={w}
			height={h}
		>
			{#snippet cell(place)}
				{@render facetCell(place, time)}
			{/snippet}
		</FacetLayout>
	{:else if gridFacet && rows}
		<FacetGridLayout
			data={rows}
			rows={gridFacet.rows}
			cols={gridFacet.cols}
			rowValues={gridFacet.rowValues}
			colValues={gridFacet.colValues}
			gap={gridFacet.gap}
			marginsForFacet={gridFacet.marginsForFacet}
			align={gridFacet.axes === 'outer'}
			width={w}
			height={h}
		>
			{#snippet cell(place)}
				{@render facetCell(place, time)}
			{/snippet}
		</FacetGridLayout>
	{:else}
		{@render cell({
			data: rows,
			width: w,
			height: h,
			tooltip,
			scales: mergeScales(sliceScales, timelineScales),
			keep: keepFor({ time })
		})}
	{/if}
{/snippet}

{#snippet body({ width: w, height: h }: { width: number; height: number })}
	{#if timeline && data}
		<TimelineLayout
			{data}
			accessor={timeline.accessor}
			progress={sharedTimeline ? sharedTimeline.progress() : (timeline.progress ?? 0)}
			values={sharedTimeline?.values() ?? timeline.values}
			orientation={timeline.orientation}
			show={sharedTimeline ? false : timeline.show}
			thickness={timeline.thickness ?? cfg.timeline.thickness}
			filterMode={timelineFilterMode}
			interpolate={timelineInterpolation}
			width={w}
			height={h}
		>
			{#snippet child({ data: stepRows, width: tw, height: th, selectedValue })}
				{@render facetBody(stepRows, tw, th, selectedValue)}
			{/snippet}
		</TimelineLayout>
	{:else}
		{@render facetBody(data, w, h, undefined)}
	{/if}
{/snippet}

{#snippet legendSnippet()}
	{#if legend && legend.length > 0}
		<LegendLayout sections={legend} />
	{/if}
{/snippet}

{#if hasPlotChrome({ title, subtitle, caption, header, footer, legend })}
	<PlotContainer
		{width}
		{height}
		{title}
		{subtitle}
		{caption}
		{header}
		{footer}
		{order}
		legend={legend?.length ? legendSnippet : undefined}
		plot={body}
	/>
{:else}
	{@render body({ width, height })}
{/if}
