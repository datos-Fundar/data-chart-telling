<script
	lang="ts"
	generics="TRow extends Record<string, unknown>, TScales extends object, TCore extends PlotCoreBase"
>
	import type { Component } from 'svelte';
	import Figure from '$lib/layout/figure/Figure.svelte';
	import TimelineLayout from '$lib/layout/timeline/TimelineLayout.svelte';
	import FacetLayout from '$lib/layout/facet/FacetLayout.svelte';
	import HoverScope from '$lib/layout/hover/HoverScope.svelte';
	import PanelRun from '$lib/layout/plot/PanelRun.svelte';
	import GenericCore from '$lib/layout/plot/Core.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { TimelineState } from '$lib/layout/timeline/TimelineState.svelte';
	import { HoverState } from '$lib/layout/hover/HoverState.svelte';
	import { HoverSettings } from '$lib/layout/hover/HoverSettings';
	import { Interpolation } from '$lib/utils/Interpolation';
	import { FacetPhase } from '$lib/phases/facet/FacetPhase';
	import { merge } from '$lib/utils/merge';
	import { Pipeline } from '$lib/phases/Pipeline';
	import { Slice } from '$lib/layout/plot/Slice';
	import type { TooltipProp } from '$lib/types/layout/tooltip';
	import type { MarginConfig, PlotChromeConfig } from '$lib/types/plots/props';
	import type {
		PlotCellContext,
		PlotCellSnippet,
		PlotCoreBase
	} from '$lib/types/layout/plot';
	import type { FacetCellContext, FacetConfig } from '$lib/types/layout/facet';
	import type { TimelineConfig, TimeValue } from '$lib/types/layout/timeline';
	import type { LegendState } from '$lib/layout/legend/LegendState.svelte';
	import type { AxisPlotDefaults, DataRunState, FacetStageState } from '$lib/types/phases';

	/**
	 * Renders a plot's core from its `core` props, inside the plot's
	 * {@link Figure} (its box, stores and chrome): once, or once per slice of
	 * its `timeline` and `facet`. `slice` builds the core's props for one
	 * slice; by default it swaps in the slice's rows, box, margins and shared
	 * scales. The core is the generic one, which runs the kind's pipeline; a
	 * kind with its own rendering (a map) passes its `Core`. The `cell`
	 * snippet draws each slice instead -
	 * anything that takes `{ data, width, height }`. `defaults` builds the
	 * kind's defaults - or its own pipeline - once per plot: the {@link Pipeline}
	 * every core it renders runs, and the plot's hover and timeline defaults. `margins` is
	 * bindable: an unsliced core reports the margin it settled on. The plot's
	 * box is its own `width`/`height` or, drawn straight inside a
	 * `PlotComposer`, a cell (`area`, `inset`).
	 */
	let {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		Core = GenericCore as Component<any, Record<string, never>, 'margins'>,
		core,
		defaults,
		slice,
		cell,
		margins = $bindable(),
		tooltip,
		data,
		width,
		height,
		markers,
		title,
		subtitle,
		caption,
		header,
		footer,
		legend,
		order,
		timeline,
		facet
	}: PlotChromeConfig & {
		// A generic plot core can't be typed against `core`'s own row type.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		Core?: Component<any, Record<string, never>, 'margins'>;
		core?: TCore;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		defaults?: () => AxisPlotDefaults<any, any> | Pipeline<any, any>;
		slice?: (cell: PlotCellContext<TRow, TScales>) => TCore;
		cell?: PlotCellSnippet<TRow, TScales>;
		margins?: MarginConfig;
		tooltip?: TooltipProp<TRow>;
		/** The rows `timeline` and `facet` slice. Defaults to `core.data`. */
		data?: TRow[];
		width?: number;
		height?: number;
		markers?: { type: string }[];
		timeline?: TimelineConfig<TRow>;
		facet?: FacetConfig<TRow>;
	} = $props();

	const cfg = $derived(getConfiguration());
	// The kind's pipeline, built once per plot: every core it renders runs it.
	const pipeline = $derived(defaults ? Pipeline.of(defaults()) : undefined);
	const hoverSettings = $derived(
		new HoverSettings(tooltip, markers ?? core?.markers, pipeline?.hoverStrategy(core ?? {}, cfg) ?? 'x')
	);
	const tooltipConfig = $derived(hoverSettings.tooltip);
	const rows = $derived(data ?? (core?.data as TRow[] | undefined));

	// Inside a composer with a timeline, that one drives every panel; otherwise
	// this plot has one of its own, which its figure draws when it's a player.
	const outerTimeline = TimelineState.current();
	const sharedTimeline = outerTimeline?.enabled ? outerTimeline : null;
	const ownTimeline = sharedTimeline ? null : new TimelineState(() => timeline);
	ownTimeline?.watch();
	const timelineState = sharedTimeline ?? ownTimeline;
	const parentScope = HoverState.scope();
	const scopeOf = (facetValue: string) => {
		const parent = parentScope();
		return parent ? `${parent}/${facetValue}` : facetValue;
	};

	// How the rows divide into slices: timeline steps and facet panels.
	const slicing = $derived(
		new Slice({ rows, timeline, facet, filterMode: pipeline?.filterMode })
	);
	// A boolean, so a timeline step re-slicing the same rows invalidates nothing downstream.
	const sliced = $derived(slicing.sliced);
	$effect(() => {
		for (const problem of slicing.problems) console.warn(`Plot: ${problem}`);
	});

	// With a facet, the kind's data phases run once over every panel (`dataRun`),
	// and each panel's core runs only the phases after them. The run over every
	// row, without the legend (the frame), also gives the domains that facets
	// and timeline steps share.
	const dataRun = $derived.by(() => {
		const run = pipeline;
		if (!sliced || !run?.facets) return undefined;
		return (r: TRow[], f: FacetConfig<TRow> | undefined, legend: LegendState | null) =>
			run.runData(core ?? {}, r, f as never, legend, cfg);
	});
	// Kept while its inputs are the same objects: a timeline step re-reads them without changing them.
	let frame: { inputs: unknown[]; state: DataRunState | undefined } | undefined;
	const frameState = $derived.by(() => {
		const inputs = [dataRun, facet, rows];
		if (frame?.inputs.every((input, i) => input === inputs[i])) return frame.state;
		const state = dataRun && rows ? dataRun(rows, facet, null) : undefined;
		frame = { inputs, state };
		return state;
	});
	// The domains slices share, from the frame's "sharedScales" phase, keyed by facet panel.
	const sharedScales = $derived(frameState?.sharedScales);

	const timelineInterpolation = $derived.by(() => {
		if (!timeline) return undefined;
		const tween = pipeline?.interpolation<TRow>((core ?? {}) as { data?: TRow[] }, cfg);
		if (tween) return Interpolation.buildTimeline(timeline.interpolate, tween);
		return typeof timeline.interpolate === 'object' ? timeline.interpolate : undefined;
	});

	/** A core's props without `margins`, for a core that binds them instead. */
	function withoutMargins<T extends object>(props: T): Omit<T, 'margins'> {
		const rest = { ...props } as T & { margins?: unknown };
		delete rest.margins;
		return rest;
	}

	function buildSliceProps(ctx: PlotCellContext<TRow, TScales>) {
		return {
			...core,
			...(ctx.data ? { data: ctx.data } : {}),
			width: ctx.width,
			height: ctx.height,
			margins: ctx.margins ?? margins,
			scales: merge(ctx.scales, core?.scales as TScales | undefined),
			tooltip: ctx.tooltip,
			...(ctx.panel ? { panelState: ctx.panel } : {})
		};
	}
</script>

<!-- One slice: the kind's core with the slice's rows, box and scales, or the author's own `cell`. -->
{#snippet sliceCell(ctx: PlotCellContext<TRow, TScales>)}
	{#if cell}
		{@render cell(ctx)}
	{:else if Core && sliced}
		<Core {...(slice ?? buildSliceProps)(ctx)} {pipeline} />
	{:else if Core}
		<Core
			{...withoutMargins((slice ?? buildSliceProps)(ctx))}
			bind:margins
			{pipeline}
		/>
	{/if}
{/snippet}

{#snippet facetCell(
	place: FacetCellContext<TRow>,
	time: TimeValue | undefined,
	panels: FacetStageState | undefined
)}
	<HoverScope id={scopeOf(place.facetValue)}>
		{@render sliceCell({
			data: place.data,
			width: place.width,
			height: place.height,
			margins: place.margins,
			tooltip: tooltipConfig,
			scales: slicing.facetScales<TScales>(sharedScales, place),
			panel: panels ? FacetPhase.buildPanelState(panels, slicing.panelKey(place) ?? '') : undefined,
			keep: slicing.keep({ time, facet: place })
		})}
	</HoverScope>
{/snippet}

{#snippet facetGrid(
	stepRows: TRow[],
	w: number,
	h: number,
	time: TimeValue | undefined,
	panels: FacetStageState | undefined
)}
	<FacetLayout data={stepRows} {...slicing.layout} width={w} height={h}>
		{#snippet cell(place)}
			{@render facetCell(place, time, panels)}
		{/snippet}
	</FacetLayout>
{/snippet}

{#snippet facetBody(
	stepRows: TRow[] | undefined,
	w: number,
	h: number,
	time: TimeValue | undefined
)}
	{#if facet && stepRows && dataRun}
		<PanelRun
			rows={stepRows}
			run={(r, legendInteraction) => dataRun(r, facet, legendInteraction)}
			frame={stepRows === rows ? frameState : undefined}
		>
			{#snippet children(panels)}
				{@render facetGrid(stepRows, w, h, time, panels)}
			{/snippet}
		</PanelRun>
	{:else if facet && stepRows}
		{@render facetGrid(stepRows, w, h, time, undefined)}
	{:else}
		{@render sliceCell({
			data: stepRows,
			width: w,
			height: h,
			tooltip: tooltipConfig,
			scales: slicing.timelineScales<TScales>(sharedScales),
			keep: slicing.keep({ time })
		})}
	{/if}
{/snippet}

{#snippet body({ width: w, height: h }: { width: number; height: number })}
	{#if timeline && rows}
		<TimelineLayout
			data={rows}
			accessor={timeline.accessor}
			progress={timelineState?.progress ?? timeline.progress ?? 0}
			values={sharedTimeline ? sharedTimeline.steps : timeline.values}
			onsteps={ownTimeline ? (found) => ownTimeline.setSteps(found) : undefined}
			orientation={timeline.orientation}
			show={false}
			filterMode={slicing.filterMode}
			interpolate={timelineInterpolation}
			width={w}
			height={h}
		>
			{#snippet child({ data: stepRows, width: tw, height: th, selectedValue })}
				{@render facetBody(stepRows, tw, th, selectedValue)}
			{/snippet}
		</TimelineLayout>
	{:else}
		{@render facetBody(rows, w, h, undefined)}
	{/if}
{/snippet}

<Figure
	width={width ?? core?.width}
	height={height ?? core?.height}
	area={core?.area}
	inset={core?.inset}
	{title}
	{subtitle}
	{caption}
	{header}
	{footer}
	{legend}
	{order}
	hoverStrategy={hoverSettings.strategy}
	hoverSync={hoverSettings.sync}
	timelineState={ownTimeline}
	{body}
/>
