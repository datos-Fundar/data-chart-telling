<script lang="ts" generics="TData extends Record<string, unknown>">
	import Core from '$lib/plots/bar/Core.svelte';
	import PlotShell from '$lib/layout/shell/PlotShell.svelte';
	import { buildBarPresentation } from '$lib/plots/bar/presentation';
	import type { BarPlotProps, BarPlotCoreProps } from '$lib/types/plots/bar/props';

	/**
	 * A bar plot, vertical by default - or horizontal with `scales.y.type: 'categorical'`. Draws from pre-built `series` or flat `data` rows.
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

<PlotShell
	{Core}
	core={core as BarPlotCoreProps<TData>}
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
	presentation={buildBarPresentation<TData>}
/>
