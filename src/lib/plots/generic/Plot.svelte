<script lang="ts" generics="TData extends Record<string, unknown>">
	import AbstractPlot from '$lib/layout/plot/AbstractPlot.svelte';
	import { buildGenericDefaults } from '$lib/plots/generic/defaults';
	import type { GenericPlotProps, GenericPlotCoreProps } from '$lib/types/plots/generic/props';

	/**
	 * A plot of no kind: no shapes or defaults of its own, only its `markers`. `data` and the channels
	 * are optional; markers without their own take them, and its `segments`, `transforms`, `styles`,
	 * chrome, `timeline` and `facet` work as on any plot.
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
	}: GenericPlotProps<TData> = $props();
</script>

<AbstractPlot
	core={core as GenericPlotCoreProps<TData>}
	defaults={buildGenericDefaults}
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
