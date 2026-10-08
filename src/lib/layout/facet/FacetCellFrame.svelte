<script lang="ts">
	import { provideMarginReport } from '$lib/layout/facet/alignment';
	import type { CellMargins } from '$lib/layout/facet/alignment';
	import type { Snippet } from 'svelte';

	/**
	 * One facet's slot in an aligned grid: listens for the margins its plot
	 * settles on, and remounts the plot once its margins get pinned.
	 */
	let {
		pinned,
		onMargins,
		children
	}: {
		pinned?: CellMargins;
		onMargins: (margins: CellMargins) => void;
		children: Snippet;
	} = $props();

	// svelte-ignore state_referenced_locally
	provideMarginReport(onMargins);
</script>

{#key JSON.stringify(pinned ?? null)}
	{@render children()}
{/key}
