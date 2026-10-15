<script lang="ts">
	import Figure from '$lib/layout/figure/Figure.svelte';
	import Grid from '$lib/layout/grid/Grid.svelte';
	import { TimelineState } from '$lib/layout/timeline/TimelineState.svelte';
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

	// One timeline for every panel, which the plots below follow instead of their own.
	const timelineState = new TimelineState(() => timeline);
	timelineState.watch();

	/** Height of the tag row above every panel, when the composer tags them. */
	const TAG_H = 24;

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
	{@render grid({ width: w, height: h })}
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
	{timelineState}
	{body}
/>
