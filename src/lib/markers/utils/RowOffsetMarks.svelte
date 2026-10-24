<script lang="ts" generics="TRow">
	import type { Snippet } from 'svelte';
	import { RowOffset } from '$lib/markers/utils/RowOffset';
	import type { RowOffset as RowOffsetConfig } from '$lib/types/markers/channels/commonMarkerConfigWithRowOffset';

	/**
	 * Draws a marker's rows through `mark`, each moved by the marker's per-row
	 * `dx`/`dy` (a function of the row). A fixed offset is not applied here -
	 * `MarkerOffset` moves the whole marker. With no function offset, the rows
	 * are drawn together as they are.
	 */
	let {
		marker,
		rows,
		mark
	}: {
		marker: { dx?: RowOffsetConfig; dy?: RowOffsetConfig };
		rows: TRow[];
		mark: Snippet<[TRow[]]>;
	} = $props();
</script>

{#if RowOffset.isPerRow(marker)}
	{#each rows as row, index (index)}
		{@const { dx, dy } = RowOffset.ofRow(marker, row)}
		<g transform="translate({dx},{dy})">{@render mark([row])}</g>
	{/each}
{:else}
	{@render mark(rows)}
{/if}
