<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildClevelandDefaults } from '$lib/plots/ranking/cleveland/defaults';
	import type {
		ClevelandPlotProps,
		ClevelandPlotCoreProps
	} from '$lib/types/plots/ranking/cleveland/props';

	/**
	 * A Cleveland dot plot: per category, one dot for each series that has a value there, joined by a connector from the lowest to the highest - the general form of `LollipopPlot` (one value) and `DumbbellPlot` (two). Upright, or sideways when the categories run along `y`. Draws from pre-built `series` or flat `data` rows.
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
	}: ClevelandPlotProps<TData> = $props();
</script>

<Plot
	core={core as ClevelandPlotCoreProps<TData>}
	defaults={buildClevelandDefaults}
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
