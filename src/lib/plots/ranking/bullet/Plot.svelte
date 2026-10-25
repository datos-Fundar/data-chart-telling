<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildBulletDefaults } from '$lib/plots/ranking/bullet/defaults';
	import type { BulletPlotProps, BulletPlotCoreProps } from '$lib/types/plots/ranking/bullet/props';

	/**
	 * A bullet plot: per category, a bar for its value over bands - `ranges` - that grade it, with a tick marking its `target`, upright or sideways when the categories run along `y`. Draws from pre-built `series` or flat `data` rows.
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
	}: BulletPlotProps<TData> = $props();
</script>

<Plot
	core={core as BulletPlotCoreProps<TData>}
	defaults={buildBulletDefaults}
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
