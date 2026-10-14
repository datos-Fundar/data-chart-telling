<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildHeatmapDefaults } from '$lib/plots/heatmap/defaults';
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

	$effect(() => {
		const scoped = (core.markers ?? []).filter(
			(m) => (m.type === 'hover' || m.type === 'component') && (m as { series?: unknown }).series
		);
		if (scoped.length > 0) {
			console.warn(
				'HeatmapPlot: markers scoped to a `series` are ignored - heatmaps have no series concept.'
			);
		}
		const seriesKeys = Object.keys(core.segments ?? {}).filter((k) => k !== 'default');
		if (seriesKeys.length > 0) {
			console.warn(
				`HeatmapPlot: segment groups have series-specific keys (${seriesKeys.join(', ')}) - heatmaps have no named series. Use the 'default' key instead.`
			);
		}
	});

</script>

<Plot
	core={core as HeatmapPlotCoreProps<TData>}
	defaults={buildHeatmapDefaults}
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
