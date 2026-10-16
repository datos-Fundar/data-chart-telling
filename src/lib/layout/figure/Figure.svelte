<script lang="ts">
	import FigureChrome from '$lib/layout/figure/FigureChrome.svelte';
	import GridCell from '$lib/layout/grid/GridCell.svelte';
	import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
	import TimelinePlayer from '$lib/layout/timeline/TimelinePlayer.svelte';
	import TimelineRule from '$lib/layout/timeline/TimelineRule.svelte';
	import { TimelineState } from '$lib/layout/timeline/TimelineState.svelte';
	import { GridCellsRegistry } from '$lib/layout/grid/GridCellsRegistry.svelte';
	import {
		getConfiguration,
		configToCssVars,
		cssVarsStyle
	} from '$lib/configuration/config.svelte';
	import { HoverState } from '$lib/layout/hover/HoverState.svelte';
	import { LegendState } from '$lib/layout/legend/LegendState.svelte';
	import type { HoverStrategy } from '$lib/types/layout/hover';
	import type { FigureBoxProps, PlotChromeConfig } from '$lib/types/plots/props';
	import type { PlotBoxSnippet } from '$lib/types/layout/figure';
	import type { LegendSection } from '$lib/types/layout/legend';

	/**
	 * One figure - a plot or a `PlotComposer` - and everything around what it
	 * draws. Its box: drawn straight inside a `Grid` (a composer's), it takes a
	 * cell of its own - its `area`, an `inset` over it, or the next free one -
	 * and is that cell's size; anywhere else, its own `width` and `height`.
	 * Its shared stores: the hover store, unless an enclosing figure already
	 * shares one, and its {@link LegendState}. And its chrome (title, legend,
	 * caption...) around `body`, which gets the box that's left - or `body`
	 * alone in a themed box when there's no chrome.
	 *
	 * Its timeline - a rule or a player bar - is the chrome's `timeline` block.
	 *
	 * Its legend: unset or `true`, the one its plots read as - what they
	 * register on its `LegendState`; `false`, none; a list of sections,
	 * exactly those; `{ items, sections, series, color... }`, the automatic one
	 * with those added and the sections of each channel adjusted. A figure inside another (a composer's panel) leaves an unset
	 * legend to the outer one, which reads every panel's plots.
	 */
	let {
		width,
		height,
		area,
		inset,
		title,
		subtitle,
		caption,
		header,
		footer,
		legend,
		order,
		hoverStrategy,
		hoverSync,
		timelineState,
		body
	}: PlotChromeConfig &
		FigureBoxProps & {
			hoverStrategy: HoverStrategy;
			hoverSync: boolean;
			/** The figure's timeline, made and watched by its plot or composer: shared with everything inside, and drawn here as a player bar when it is one. */
			timelineState?: TimelineState | null;
			body: PlotBoxSnippet;
		} = $props();

	const cfg = $derived(getConfiguration());
	const grid = GridCellsRegistry.current();

	const ownHover = HoverState.current() ? null : HoverState.provide();
	$effect(() => {
		if (!ownHover) return;
		ownHover.strategy = hoverStrategy;
		ownHover.sync = hoverSync;
	});

	// svelte-ignore state_referenced_locally
	if (timelineState) TimelineState.provide(timelineState);
	/** Whether the chrome draws the timeline: a rule or a player bar - one with controls to draw. */
	const timelineShown = $derived(
		!!timelineState &&
			timelineState.enabled &&
			timelineState.shown &&
			(timelineState.type === 'rule' || timelineState.controls.length > 0)
	);
	/** A vertical rule sits beside the plot, as if the chrome's `order` had `'(plot, timeline)'`. */
	const timelineBesidePlot = $derived(
		timelineShown && timelineState!.type === 'rule' && timelineState!.orientation === 'vertical'
	);

	// Read once at setup: a figure that shows a legend of its own scopes its toggles - and what its plots register - to itself.
	const outer = LegendState.current();
	// svelte-ignore state_referenced_locally
	const ownLegend = (legend !== undefined && legend !== false) || !outer;
	const legendState = ownLegend ? LegendState.provide() : outer!;

	/** What the figure adds to its automatic legend, when `legend` is `{ items, sections }`. */
	const extension = $derived(
		legend && typeof legend === 'object' && !Array.isArray(legend) ? legend : undefined
	);

	/** What the legend shows: the author's sections, the ones its plots read as (with `extension`), or none. */
	const legendMode = $derived(
		Array.isArray(legend)
			? 'explicit'
			: legend === false || (legend === undefined && !ownLegend)
				? 'none'
				: 'auto'
	);
	const sections = $derived(
		legendMode === 'explicit'
			? legendState.colorize(legend as LegendSection[])
			: legendMode === 'auto'
				? legendState.sections(extension)
				: []
	);

	/**
	 * Whether the figure draws chrome around its plot. A figure with an
	 * automatic legend always does: its plots register what they draw after
	 * they mount, and the legend that fills in then mustn't remount them.
	 */
	const hasChrome = $derived(
		Boolean(title || subtitle || caption || header || footer) ||
			timelineShown ||
			legendMode === 'auto' ||
			(legendMode === 'explicit' && sections.length > 0)
	);
</script>

{#snippet legendSnippet()}
	<LegendLayout {sections} />
{/snippet}

{#snippet timelineSnippet()}
	{#if timelineState && timelineState.type === 'rule'}
		<TimelineRule timeline={timelineState} />
	{:else if timelineState && timelineState.steps.length > 1}
		<TimelinePlayer timeline={timelineState} />
	{/if}
{/snippet}

{#snippet frame(w: number, h: number)}
	{#if hasChrome}
		<FigureChrome
			width={w}
			height={h}
			{title}
			{subtitle}
			{caption}
			{header}
			{footer}
			{order}
			legend={sections.length > 0 ? legendSnippet : undefined}
			timeline={timelineShown ? timelineSnippet : undefined}
			{timelineBesidePlot}
			plot={body}
		/>
	{:else}
		<!-- No chrome means no container to stamp the `--dct-*` vars that facet and timeline chrome read. -->
		<div
			style={cssVarsStyle(configToCssVars(cfg))}
			style:font-family="var(--dct-font, inherit)"
			style:width="{w}px"
			style:height="{h}px"
		>
			{@render body({ width: w, height: h })}
		</div>
	{/if}
{/snippet}

{#if grid}
	<GridCell class="dct-grid-cell--figure" {area} {inset}>
		{#snippet children(cell)}
			{@render frame(cell.width, cell.height)}
		{/snippet}
	</GridCell>
{:else}
	{@render frame(width ?? 0, height ?? 0)}
{/if}
