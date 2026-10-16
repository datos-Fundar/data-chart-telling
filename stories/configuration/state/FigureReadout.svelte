<script lang="ts">
	import { useFigure } from '$lib/layout/plot/usePlot';

	// In the figure's footer, outside the plot: `useFigure()` is what reaches the hover and the legend from here.
	const figure = useFigure();

	const series = $derived(
		(figure.legend?.entries ?? []).flatMap((entry) => (entry.type === 'series' ? [entry] : []))
	);
</script>

<div class="readout">
	<span>
		{#if figure.hover.activeX != null}
			Hovering {String(figure.hover.activeX)}{figure.hover.activeSeries
				? ` (${figure.hover.activeSeries})`
				: ''}
		{:else}
			Hover the plot
		{/if}
	</span>
	{#each series as entry (entry.name)}
		<button type="button" onclick={() => figure.legend?.toggle(entry.name, { mode: 'omit' })}>
			{figure.legend?.isOff(entry.name) ? 'Show' : 'Hide'}
			{entry.label ?? entry.name}
		</button>
	{/each}
</div>

<style>
	.readout {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
		font-size: 0.875rem;
	}
	button {
		cursor: pointer;
	}
</style>
