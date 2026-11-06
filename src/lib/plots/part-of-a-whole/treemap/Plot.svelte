<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildTreemapDefaults } from '$lib/plots/part-of-a-whole/treemap/defaults';
	import type {
		TreemapPlotProps,
		TreemapPlotCoreProps
	} from '$lib/types/plots/part-of-a-whole/treemap/props';

	/**
	 * A part-to-whole of rectangles: each row is a tile whose area is its `value`, nested by `grouping` - a field,
	 * or the fields of several levels joined by dots (`'sector.branch'`), outermost first, whose last names the
	 * tile. The outermost level colors the tiles and is what the legend lists; each tile is labelled with its name
	 * and its share of the whole, cut short or left out where it does not fit (`styles.values`). Optional chrome
	 * (`title`, `subtitle`, `caption`, `header`, `footer`, `legend`) frames it; `timeline` and `facet` slice its
	 * `data` rows.
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
	}: TreemapPlotProps<TData> = $props();
</script>

<Plot
	core={core as TreemapPlotCoreProps<TData>}
	defaults={buildTreemapDefaults}
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
