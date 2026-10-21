<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildSparklineDefaults } from '$lib/plots/evolution/sparkline/defaults';
	import type {
		SparklinePlotProps,
		SparklinePlotCoreProps
	} from '$lib/types/plots/evolution/sparkline/props';

	/**
	 * A sparkline: a small line plot with no axes or legend, a dot on the last point of each series and its value beside it. Draws from pre-built `series` or flat `data` rows.
	 * Optional chrome (`title`, `subtitle`, `caption`, `header`, `footer`,
	 * `legend`) frames it, though none is there by default; `timeline` and `facet` slice its `data` rows.
	 * `margins` is bindable: it reports the margin the plot settled on.
	 */
	let {
		title,
		subtitle,
		caption,
		header,
		footer,
		legend = false,
		order,
		timeline,
		facet,
		tooltip,
		margins = $bindable({ top: 6, bottom: 6, left: 4 }),
		...core
	}: SparklinePlotProps<TData> = $props();
</script>

<Plot
	core={core as SparklinePlotCoreProps<TData>}
	defaults={buildSparklineDefaults}
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
