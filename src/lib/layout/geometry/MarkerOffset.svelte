<script lang="ts">
	import type { Snippet } from 'svelte';
	import { RowOffset } from '$lib/markers/utils/RowOffset';
	import type { RowOffset as RowOffsetConfig } from '$lib/types/markers/channels/commonMarkerConfigWithRowOffset';

	/**
	 * Moves what it draws by the marker's `dx` and `dy` (the numbers; a function of
	 * the row is each marker's own), as a translate of the whole marker - so any
	 * marker kind can be offset, on a map too, where svelteplot ignores a mark's
	 * own `dx`/`dy`. A `text` marker places its own labels, since its lanes and
	 * flips depend on the offset.
	 */
	let {
		marker,
		children
	}: {
		marker: { type: string; dx?: RowOffsetConfig; dy?: RowOffsetConfig };
		children: Snippet;
	} = $props();

	const offset = $derived(marker.type === 'text' ? { dx: 0, dy: 0 } : RowOffset.whole(marker));
</script>

{#if offset.dx !== 0 || offset.dy !== 0}
	<g transform="translate({offset.dx},{offset.dy})">{@render children()}</g>
{:else}
	{@render children()}
{/if}
