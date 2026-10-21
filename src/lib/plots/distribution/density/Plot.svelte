<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildDensityDefaults } from '$lib/plots/distribution/density/defaults';
	import type {
		DensityPlotProps,
		DensityPlotCoreProps
	} from '$lib/types/plots/distribution/density/props';

	/**
	 * A kernel density estimate: each series smoothed along `x` - or along `y` alone, for a horizontal curve - and drawn as an area or a line. Draws from pre-built `series` or flat `data` rows.
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
	}: DensityPlotProps<TData> = $props();
</script>

<Plot
	core={core as DensityPlotCoreProps<TData>}
	defaults={buildDensityDefaults}
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
