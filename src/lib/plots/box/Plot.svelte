<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildBoxDefaults } from '$lib/plots/box/defaults';
	import type { BoxPlotProps, BoxPlotCoreProps } from '$lib/types/plots/box/props';

	/**
	 * A box plot: the distribution of each series' values per category - quartiles, whiskers and outliers - one box per category, upright, or sideways when the categories run along `y`. Draws from pre-built `series` or flat `data` rows.
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
	}: BoxPlotProps<TData> = $props();
</script>

<Plot
	core={core as BoxPlotCoreProps<TData>}
	defaults={buildBoxDefaults}
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
