<script lang="ts" generics="TData extends Record<string, unknown>">
	import Core from '$lib/plots/pyramid/Core.svelte';
	import PlotShell from '$lib/layout/shell/PlotShell.svelte';
	import { buildPyramidPresentation } from '$lib/plots/pyramid/presentation';
	import type { PyramidPlotProps, PyramidPlotCoreProps } from '$lib/types/plots/pyramid/props';

	/**
	 * A population-pyramid-style diverging bar plot. Draws from pre-built `series` or flat `data` rows.
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

<PlotShell
	{Core}
	core={core as PyramidPlotCoreProps<TData>}
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
	presentation={buildPyramidPresentation<TData>}
/>
