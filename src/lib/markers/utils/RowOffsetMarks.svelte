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
		marker: { dx?: RowOffsetConfig; dy?: RowOffsetConfig; data?: readonly unknown[] };
		rows: TRow[];
		mark: Snippet<[TRow[]]>;
	} = $props();

	/** Each row's place among the marker's rows, which its offsets read: `rows` may be only some of them. */
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const indexes = $derived(new Map((marker.data ?? []).map((row, index) => [row, index])));
</script>

{#if RowOffset.isPerRow(marker)}
	{#each rows as row, index (index)}
		{@const { dx, dy } = RowOffset.ofRow(marker, row, indexes.get(row))}
		<g transform="translate({dx},{dy})">{@render mark([row])}</g>
	{/each}
{:else}
	{@render mark(rows)}
{/if}
