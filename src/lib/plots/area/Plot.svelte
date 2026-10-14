<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildAreaDefaults } from '$lib/plots/area/defaults';
	import type { AreaPlotProps, AreaPlotCoreProps } from '$lib/types/plots/area/props';

	/**
	 * An area per series, filled from its own baseline. Draws from pre-built `series` or flat `data` rows.
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
	}: AreaPlotProps<TData> = $props();

</script>

<Plot
	core={core as AreaPlotCoreProps<TData>}
	defaults={buildAreaDefaults}
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
