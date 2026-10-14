<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildHistogramDefaults } from '$lib/plots/histogram/defaults';
	import type {
		HistogramPlotProps,
		HistogramPlotCoreProps
	} from '$lib/types/plots/histogram/props';

	/**
	 * A histogram: each series binned on `x` - or on `y` alone, for horizontal bars - one bar per bin. Draws from pre-built `series` or flat `data` rows.
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
	}: HistogramPlotProps<TData> = $props();

</script>

<Plot
	core={core as HistogramPlotCoreProps<TData>}
	defaults={buildHistogramDefaults}
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
