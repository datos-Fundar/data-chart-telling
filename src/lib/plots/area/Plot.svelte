<script lang="ts" generics="TData extends Record<string, unknown>">
	import Core from '$lib/plots/area/Core.svelte';
	import PlotShell from '$lib/layout/shell/PlotShell.svelte';
	import { buildAreaPresentation } from '$lib/plots/area/presentation';
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

<PlotShell
	{Core}
	core={core as AreaPlotCoreProps<TData>}
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
	presentation={buildAreaPresentation<TData>}
/>
