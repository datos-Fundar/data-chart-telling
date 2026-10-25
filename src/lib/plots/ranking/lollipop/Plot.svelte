<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildLollipopDefaults } from '$lib/plots/ranking/lollipop/defaults';
	import type {
		LollipopPlotProps,
		LollipopPlotCoreProps
	} from '$lib/types/plots/ranking/lollipop/props';

	/**
	 * A lollipop plot: one value per category as a dot on a thin stem that rises from the baseline, upright, or sideways when the categories run along `y`. Draws from pre-built `series` or flat `data` rows. For several series per category, see `DumbbellPlot` and `ClevelandPlot`.
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
	}: LollipopPlotProps<TData> = $props();
</script>

<Plot
	core={core as LollipopPlotCoreProps<TData>}
	defaults={buildLollipopDefaults}
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
