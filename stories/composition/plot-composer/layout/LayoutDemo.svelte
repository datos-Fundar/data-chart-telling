<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import PlotPanel from '$lib/layout/composer/PlotPanel.svelte';
	import type { ComposerLayout, ComposerTags } from '$lib/types/layout/composer';
	import Placeholder from './Placeholder.svelte';

	/**
	 * Lays out placeholder panels with a given `layout`. `panels` lists the `area`
	 * of each `PlotPanel` in order; `undefined` leaves it to flow into the next
	 * free cell.
	 */
	let {
		layout,
		panels,
		tags,
		width = 720,
		height = 320
	}: {
		layout?: ComposerLayout;
		panels: (string | undefined)[];
		tags?: ComposerTags;
		width?: number;
		height?: number;
	} = $props();
</script>

<PlotComposer {width} {height} {layout} {tags}>
	{#each panels as area, i (i)}
		<PlotPanel {area}>
			{#snippet children({ width, height })}
				<Placeholder label={area ?? String(i + 1)} {width} {height} />
			{/snippet}
		</PlotPanel>
	{/each}
</PlotComposer>
