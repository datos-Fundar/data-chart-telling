<script lang="ts">
	import Figure from '$lib/layout/figure/Figure.svelte';
	import Grid from '$lib/layout/grid/Grid.svelte';
	import TimelineFrame from '$lib/layout/timeline/TimelineFrame.svelte';
	import { TimelineSteps } from '$lib/layout/timeline/TimelineSteps';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { SharedTimeline } from '$lib/layout/composer/SharedTimeline';
	import type { Snippet } from 'svelte';
	import type { FigureBoxProps, PlotChromeProps } from '$lib/types/plots/props';
	import type { PlotBoxContext } from '$lib/types/layout/figure';
	import type {
		ComposerHoverConfig,
		ComposerLayout,
		ComposerTags,
		ComposerTimelineConfig
	} from '$lib/types/layout/composer';

	/**
	 * Combines separate plots into one figure, drawn as a `Figure` of its own:
	 * every plot (or composer) drawn straight in its `children` takes a cell of
	 * its `Grid` - its `area`, an `inset` over it, or the next free one,
	 * laid out by `layout` - with panel tags, shared hover and legend, and one
	 * `timeline` for every panel. Anything else goes in a `GridCell`.
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
		layout = {},
		tags,
		hover,
		timeline,
		children
	}: PlotChromeProps &
		FigureBoxProps & {
		layout?: ComposerLayout;
		tags?: ComposerTags;
		hover?: ComposerHoverConfig;
		timeline?: ComposerTimelineConfig;
		children: Snippet;
	} = $props();

	const cfg = $derived(getConfiguration());

	// svelte-ignore state_referenced_locally
	if (timeline) {
		SharedTimeline.provide({
			progress: () => timeline?.progress ?? 0,
			values: () => timeline?.values ?? []
		});
	}

	/** Height of the tag row above every panel, when the composer tags them. */
	const TAG_H = 24;

	const steps = $derived(new TimelineSteps(timeline?.values ?? []));
	const selectedValue = $derived(steps.at(timeline?.progress ?? 0));
</script>

{#snippet grid({ width: w, height: h }: PlotBoxContext)}
	<Grid
		width={w}
		height={h}
		gap={layout.gap ?? 12}
		columns={layout.columns}
		areas={layout.areas}
		widths={layout.widths}
		heights={layout.heights}
		align={layout.align ?? false}
		header={tags === undefined ? 0 : TAG_H}
		{tags}
		scoped
	>
		{@render children()}
	</Grid>
{/snippet}

{#snippet body({ width: w, height: h }: PlotBoxContext)}
	{#if timeline && selectedValue !== undefined}
		<TimelineFrame
			steps={steps.values}
			{selectedValue}
			orientation={timeline.orientation}
			show={timeline.show}
			thickness={timeline.thickness ?? cfg.timeline.thickness}
			width={w}
			height={h}
			child={grid}
		/>
	{:else}
		{@render grid({ width: w, height: h })}
	{/if}
{/snippet}

<Figure
	{width}
	{height}
	{area}
	{inset}
	{title}
	{subtitle}
	{caption}
	{header}
	{footer}
	{legend}
	{order}
	hoverStrategy={hover?.strategy ?? 'x'}
	hoverSync={hover?.sync ?? false}
	{body}
/>
