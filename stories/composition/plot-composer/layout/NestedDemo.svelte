<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import GridCell from '$lib/layout/grid/GridCell.svelte';
	import Placeholder from './Placeholder.svelte';
</script>

<PlotComposer width={720} height={400} layout={{ columns: 1, heights: [1, 2] }}>
	<GridCell>
		{#snippet children({ width, height })}
			<Placeholder label="top" {width} {height} />
		{/snippet}
	</GridCell>
	<PlotComposer layout={{ columns: 2 }}>
		<GridCell>
			{#snippet children({ width, height })}
				<Placeholder label="bottom left" {width} {height} />
			{/snippet}
		</GridCell>
		<GridCell>
			{#snippet children({ width, height })}
				<Placeholder label="bottom right" {width} {height} />
			{/snippet}
		</GridCell>
	</PlotComposer>
</PlotComposer>
