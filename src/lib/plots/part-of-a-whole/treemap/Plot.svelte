<script lang="ts" generics="TData extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { buildTreemapDefaults } from '$lib/plots/part-of-a-whole/treemap/defaults';
	import type {
		TreemapPlotProps,
		TreemapPlotCoreProps
	} from '$lib/types/plots/part-of-a-whole/treemap/props';
	import type { TreemapTransform } from '$lib/types/transforms/treemap';

	/**
	 * A part-to-whole of rectangles: each row is a tile whose area is its `value`, nested by `grouping` - a field,
	 * or a list of them, outermost first, whose last names the tile. The outermost level colors the tiles and is what
	 * the legend lists; each tile is labelled with its name and its share of the whole, cut short or left out where it
	 * does not fit (`styles.values`). Optional chrome (`title`, `subtitle`, `caption`, `header`, `footer`, `legend`)
	 * frames it. The tiles are those of the `treemap` transform, drawn as `rect` markers.
	 */
	let {
		title,
		subtitle,
		caption,
		header,
		footer,
		legend,
		order,
		tooltip,
		margins = $bindable(),
		data,
		value,
		grouping,
		tile,
		width,
		height,
		...core
	}: TreemapPlotProps<TData> = $props();

	const levels = $derived(
		(Array.isArray(grouping) ? grouping : grouping === undefined ? [] : [grouping]) as (
			| keyof TData
			| ((row: TData) => unknown)
		)[]
	);

	/** The plot's inner box is not known before it is drawn, so tiles are shaped for the figure's own: close enough to keep them near squares. */
	const aspect = $derived(width && height ? width / height : 1.6);

	/** The tiles, before any transform of the author's own. */
	const treemap = $derived({
		type: 'treemap',
		value,
		levels,
		tile,
		aspect
	} as unknown as TreemapTransform);

	/** The plot's own rows have no position until the transform gives them one. */
	const placeholder = () => 0;
</script>

<Plot
	core={{
		...core,
		data,
		x: placeholder,
		y: placeholder,
		...(levels[0] !== undefined ? { grouping: levels[0] } : {}),
		transforms: [treemap, ...(core.transforms ?? [])],
		width,
		height
	} as unknown as TreemapPlotCoreProps<TData>}
	defaults={buildTreemapDefaults}
	bind:margins
	{title}
	{subtitle}
	{caption}
	{header}
	{footer}
	{legend}
	{order}
	{tooltip}
/>
