<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildRaincloudDefaults } from '$lib/plots/distribution/raincloud/defaults';
	import type {
		RaincloudPlotProps,
		RaincloudPlotCoreProps
	} from '$lib/types/plots/distribution/raincloud/props';

	/**
	 * A raincloud per category: half the density estimate of its values (the cloud), a dot per value scattered beside it (the rain) and a box, over the density, the dots or between them. Draws from pre-built `series` or flat `data` rows.
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
	}: RaincloudPlotProps<TData> = $props();
</script>

<Plot
	core={core as RaincloudPlotCoreProps<TData>}
	defaults={buildRaincloudDefaults}
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
