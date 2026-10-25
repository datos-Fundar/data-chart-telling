<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildSlopeDefaults } from '$lib/plots/evolution/slope/defaults';
	import type { SlopePlotProps, SlopePlotCoreProps } from '$lib/types/plots/evolution/slope/props';

	/**
	 * A slope plot: a line and a dot per series between two positions on a category axis, labelled at both ends, to read how each one changed. Draws from pre-built `series` or flat `data` rows.
	 * Optional chrome (`title`, `subtitle`, `caption`, `header`, `footer`,
	 * `legend`) frames it; `timeline` and `facet` slice its `data` rows.
	 * `margins` is bindable: it reports the margin the plot settled on.
	 */
	let {
		title,
		subtitle,
		caption,
		header,
		footer,
		legend,
		order,
		timeline,
		facet,
		tooltip,
		margins = $bindable(),
		...core
	}: SlopePlotProps<TData> = $props();
</script>

<Plot
	core={core as SlopePlotCoreProps<TData>}
	defaults={buildSlopeDefaults}
	bind:margins
	{title}
	{subtitle}
	{caption}
	{header}
	{footer}
	{legend}
	{order}
	{timeline}
	{facet}
	{tooltip}
/>
