<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildScatterDefaults } from '$lib/plots/correlation/scatter/defaults';
	import type {
		ScatterPlotProps,
		ScatterPlotCoreProps
	} from '$lib/types/plots/correlation/scatter/props';

	/**
	 * A point cloud on continuous x/y axes; `r` sizes each dot. Draws from pre-built `series` or flat `data` rows.
	 * Optional chrome (`title`, `subtitle`, `caption`, `header`, `footer`,
	 * `legend`) frames it; `timeline` and `facet` slice its `data` rows.
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
	}: ScatterPlotProps<TData> = $props();
</script>

<Plot
	core={core as ScatterPlotCoreProps<TData>}
	defaults={buildScatterDefaults}
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
