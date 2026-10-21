<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildViolinDefaults } from '$lib/plots/distribution/violin/defaults';
	import type {
		ViolinPlotProps,
		ViolinPlotCoreProps
	} from '$lib/types/plots/distribution/violin/props';

	/**
	 * A violin per category: the mirrored density estimate of each category's values, with a box inside. Draws from pre-built `series` or flat `data` rows.
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
	}: ViolinPlotProps<TData> = $props();
</script>

<Plot
	core={core as ViolinPlotCoreProps<TData>}
	defaults={buildViolinDefaults}
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
