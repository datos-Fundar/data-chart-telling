<script
	lang="ts"
	generics="TRow extends Record<string, unknown>, TNode extends Record<string, unknown> = Record<string, unknown>"
>
	import AbstractPlot from '$lib/layout/plot/AbstractPlot.svelte';
	import { buildSankeyDefaults } from '$lib/plots/flow/sankey/defaults';
	import type { SankeyPlotProps, SankeyPlotCoreProps } from '$lib/types/plots/flow/sankey/props';

	/**
	 * Flows between nodes standing in columns: each link is a ribbon as thick as its value, from the node it leaves
	 * to the node it reaches, and each node a bar as tall as what flows through it, labelled with its name and that
	 * value (`styles.values`). Its `data` is its links (`from`, `to`, `value`, and `nodes` when they carry more than
	 * an id), or a table and the `columns` to make them of. `color` is what the legend lists: the nodes' labels
	 * (`'source'`, the default, or `'target'`), so a link takes the color of a node at one of its ends
	 * (`styles.links.fill`), or a value of the links' own. Optional chrome (`title`, `subtitle`, `caption`,
	 * `header`, `footer`, `legend`) frames it; `timeline` and `facet` slice its `data` rows.
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
	}: SankeyPlotProps<TRow, TNode> = $props();
</script>

<AbstractPlot
	core={core as SankeyPlotCoreProps<TRow, TNode>}
	defaults={buildSankeyDefaults}
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
