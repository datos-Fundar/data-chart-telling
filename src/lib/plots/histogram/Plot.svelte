<script lang="ts" generics="TData extends Record<string, unknown>">
	import Core from '$lib/plots/histogram/Core.svelte';
	import PlotShell from '$lib/layout/shell/PlotShell.svelte';
	import { buildHistogramPresentation } from '$lib/plots/histogram/presentation';
	import type {
		HistogramPlotProps,
		HistogramPlotCoreProps
	} from '$lib/types/plots/histogram/props';

	/**
	 * A histogram: each series binned on `x`, one bar per bin. Draws from pre-built `series` or flat `data` rows.
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

<PlotShell
	{Core}
	core={core as HistogramPlotCoreProps<TData>}
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
	presentation={buildHistogramPresentation<TData>}
/>
