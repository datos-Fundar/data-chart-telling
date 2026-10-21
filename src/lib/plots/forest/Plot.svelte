<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildForestDefaults } from '$lib/plots/forest/defaults';
	import type { ForestPlotProps, ForestPlotCoreProps } from '$lib/types/plots/forest/props';

	/**
	 * A forest plot: per category, a dot - an estimate - on a stem that spans its interval, given by each row's `lower` and `upper` (or an `error` either side of it), upright or sideways when the categories run along `y`. Draws from pre-built `series` or flat `data` rows. For several series sharing a category, see `facet`, `DumbbellPlot` and `ClevelandPlot`.
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
	}: ForestPlotProps<TData> = $props();
</script>

<Plot
	core={core as ForestPlotCoreProps<TData>}
	defaults={buildForestDefaults}
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
