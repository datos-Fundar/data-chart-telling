<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildPyramidDefaults } from '$lib/plots/pyramid/defaults';
	import type { PyramidPlotProps, PyramidPlotCoreProps } from '$lib/types/plots/pyramid/props';

	/**
	 * A population-pyramid-style diverging bar plot: horizontal when its categories run along `y`, vertical when they run along `x`. Draws from pre-built `series` or flat `data` rows.
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
	}: PyramidPlotProps<TData> = $props();

</script>

<Plot
	core={core as PyramidPlotCoreProps<TData>}
	defaults={buildPyramidDefaults}
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
