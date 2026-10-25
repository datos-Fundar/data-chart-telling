<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildDumbbellDefaults } from '$lib/plots/ranking/dumbbell/defaults';
	import type {
		DumbbellPlotProps,
		DumbbellPlotCoreProps
	} from '$lib/types/plots/ranking/dumbbell/props';

	/**
	 * A dumbbell plot: per category, the values of exactly two series as two dots joined by a connector, so the gap between them reads at a glance. Upright, or sideways when the categories run along `y`. Draws from pre-built `series` or flat `data` rows. For another number of series, see `LollipopPlot` and `ClevelandPlot`.
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
	}: DumbbellPlotProps<TData> = $props();
</script>

<Plot
	core={core as DumbbellPlotCoreProps<TData>}
	defaults={buildDumbbellDefaults}
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
