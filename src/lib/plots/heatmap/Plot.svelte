<script lang="ts" generics="TData extends Record<string, unknown>">
	import Core from '$lib/plots/heatmap/Core.svelte';
	import PlotShell from '$lib/layout/shell/PlotShell.svelte';
	import { buildHeatmapPresentation } from '$lib/plots/heatmap/presentation';
	import type { HeatmapPlotProps, HeatmapPlotCoreProps } from '$lib/types/plots/heatmap/props';

	/**
	 * A categorical grid of value-colored cells. Draws from pre-built `series` or flat `data` rows.
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
	}: HeatmapPlotProps<TData> = $props();
</script>

<PlotShell
	{Core}
	core={core as HeatmapPlotCoreProps<TData>}
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
	presentation={buildHeatmapPresentation<TData>}
/>
