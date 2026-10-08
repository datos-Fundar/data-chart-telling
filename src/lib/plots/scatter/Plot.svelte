<script lang="ts" generics="TData extends Record<string, unknown>">
	import Core from '$lib/plots/scatter/Core.svelte';
	import PlotShell from '$lib/layout/shell/PlotShell.svelte';
	import { buildScatterPresentation } from '$lib/plots/scatter/presentation';
	import type { ScatterPlotProps, ScatterPlotCoreProps } from '$lib/types/plots/scatter/props';

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

<PlotShell
	{Core}
	core={core as ScatterPlotCoreProps<TData>}
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
	presentation={buildScatterPresentation<TData>}
/>
