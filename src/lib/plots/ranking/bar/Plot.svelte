<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildBarDefaults } from '$lib/plots/ranking/bar/defaults';
	import type { BarPlotProps, BarPlotCoreProps } from '$lib/types/plots/ranking/bar/props';

	/**
	 * A bar plot: vertical when its categories run along `x`, horizontal when they run along `y` (the value then on `x`, as in svelteplot's `BarX`). Draws from pre-built `series` or flat `data` rows.
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
	}: BarPlotProps<TData> = $props();
</script>

<Plot
	core={core as BarPlotCoreProps<TData>}
	defaults={buildBarDefaults}
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
