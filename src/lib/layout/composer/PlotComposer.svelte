<script lang="ts">
	import PlotContainer from '$lib/layout/shell/PlotContainer.svelte';
	import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
	import Timeline from '$lib/layout/timeline/Timeline.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { hasPlotChrome } from '$lib/layout/shell/shell';
	import { getHover, provideHover } from '$lib/layout/tooltip/hover.svelte';
	import { getHoverScope } from '$lib/layout/tooltip/hoverScope';
	import {
		getLegendInteraction,
		provideLegendInteraction
	} from '$lib/layout/legend/interaction.svelte';
	import { buildTag, provideComposer, provideSharedTimeline } from '$lib/layout/composer/context';
	import type { Snippet } from 'svelte';
	import type { PlotChromeProps } from '$lib/types/plots/props';
	import type {
		ComposerHoverConfig,
		ComposerLayout,
		ComposerTags,
		ComposerTimelineConfig
	} from '$lib/types/layout/composer';

	/**
	 * Combines separate plots into one figure: `PlotPanel` children placed by
	 * `layout`, with chrome of its own, panel tags, shared hover and legend, and
	 * one `timeline` for every panel. It nests inside a panel.
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
		layout = {},
		tags,
		hover,
		timeline,
		children
	}: PlotChromeProps & {
		width: number;
		height: number;
		layout?: ComposerLayout;
		tags?: ComposerTags;
		hover?: ComposerHoverConfig;
		timeline?: ComposerTimelineConfig;
		children: Snippet;
	} = $props();

	const cfg = $derived(getConfiguration());

	const ownHover = getHover() ? null : provideHover();
	$effect(() => {
		if (!ownHover) return;
		ownHover.strategy = hover?.strategy ?? 'x';
		ownHover.sync = hover?.sync ?? false;
	});

	// Read once at setup: a composition with its own legend scopes its toggles to its panels.
	// svelte-ignore state_referenced_locally
	if (legend?.length || !getLegendInteraction()) provideLegendInteraction();

	// svelte-ignore state_referenced_locally
	if (timeline) {
		provideSharedTimeline({
			progress: () => timeline?.progress ?? 0,
			values: () => timeline?.values ?? []
		});
	}

	let tagCount = 0;
	let panelCount = $state(0);
	const parentScope = getHoverScope();
	provideComposer({
		register: (inset) => {
			if (!inset) panelCount++;
			return tagCount++;
		},
		tagOf: (index) => (tags === undefined ? undefined : buildTag(tags, index)),
		scope: parentScope
	});

	const gap = $derived(layout.gap ?? 12);
	const areaRows = $derived(layout.areas?.map((row) => row.trim().split(/\s+/)));
	const columns = $derived(
		areaRows?.[0]?.length ?? layout.columns ?? Math.max(1, Math.ceil(Math.sqrt(panelCount)))
	);
	const rows = $derived(areaRows?.length ?? Math.max(1, Math.ceil(panelCount / columns)));
	const track = (sizes: number[] | undefined, count: number) =>
		sizes?.length === count
			? sizes.map((size) => `minmax(0, ${size}fr)`).join(' ')
			: `repeat(${count}, minmax(0, 1fr))`;

	const steps = $derived([...(timeline?.values ?? [])].sort((a, b) => a - b));
	const selectedValue = $derived(
		steps[
			Math.min(
				steps.length - 1,
				Math.max(0, Math.round((timeline?.progress ?? 0) * (steps.length - 1)))
			)
		]
	);
	const showTimeline = $derived(timeline != null && timeline.show !== false && steps.length > 0);
	const thickness = $derived(timeline?.thickness ?? cfg.timeline.thickness);
	const vertical = $derived((timeline?.orientation ?? 'vertical') === 'vertical');

	// The panels' box beside the timeline: whatever its gutter and `--dct-timeline-gap` leave.
	let gridWidth = $state(0);
	let gridHeight = $state(0);
</script>

{#snippet grid(w: number, h: number)}
	<div
		class="dct-composer"
		style:width="{w}px"
		style:height="{h}px"
		style:gap="{gap}px"
		style:grid-template-areas={areaRows
			? areaRows.map((r) => `"${r.join(' ')}"`).join(' ')
			: undefined}
		style:grid-template-columns={track(layout.widths, columns)}
		style:grid-template-rows={track(layout.heights, rows)}
	>
		{@render children()}
	</div>
{/snippet}

{#snippet body({ width: w, height: h }: { width: number; height: number })}
	{#if showTimeline}
		<div
			class="dct-composer-timeline"
			class:dct-composer-timeline--horizontal={!vertical}
			style:width="{w}px"
			style:height="{h}px"
		>
			<div
				class="dct-composer-timeline__grid"
				bind:clientWidth={gridWidth}
				bind:clientHeight={gridHeight}
			>
				{#if gridWidth > 0 && gridHeight > 0}
					{@render grid(gridWidth, gridHeight)}
				{/if}
			</div>
			<Timeline
				currentValue={selectedValue}
				values={steps}
				orientation={vertical ? 'vertical' : 'horizontal'}
				width={vertical ? thickness : w}
				height={vertical ? h : thickness}
			/>
		</div>
	{:else}
		{@render grid(w, h)}
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

<style>
	.dct-composer {
		position: relative;
		display: grid;
	}
	.dct-composer-timeline {
		display: flex;
		flex-direction: row;
		gap: var(--dct-timeline-gap, 12px);
	}
	.dct-composer-timeline__grid {
		flex: 1 1 0;
		min-width: 0;
		min-height: 0;
	}
	.dct-composer-timeline--horizontal {
		flex-direction: column;
	}
</style>
