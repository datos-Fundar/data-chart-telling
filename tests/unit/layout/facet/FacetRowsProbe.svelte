<script lang="ts">
	import FacetLayout from '$lib/layout/facet/FacetLayout.svelte';
	import type { FacetMode } from '$lib/types/layout/facet';

	type Row = { group: string; value: number };

	/** A facet layout whose cells write their group and the sum of their rows, to follow what each one is handed. */
	let {
		rows,
		mode = 'grid',
		by = 'group'
	}: { rows: Row[]; mode?: FacetMode; by?: 'group' } = $props();
</script>

<FacetLayout data={rows} {by} {mode} columns={2} width={600} height={400}>
	{#snippet cell({ facetValue, data })}
		<span data-testid="cell" data-group={facetValue}>
			{data.reduce((sum, row) => sum + row.value, 0)}
		</span>
	{/snippet}
</FacetLayout>
