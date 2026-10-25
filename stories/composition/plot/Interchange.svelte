<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
	import Scrubber from '../../common/Scrubber.svelte';
	import { POPULATION_BY_BROAD_AGE, type AgeRow } from '$datasets';

	/**
	 * Three plot kinds over the same dataset, each a different view of it, with
	 * the same chrome props. Title, legend, timeline and
	 * facet are props every plot kind takes on its own - switching kinds swaps
	 * the whole plot (chrome included), and only the scrubber's position is
	 * shared, since it lives outside.
	 */
	let kind = $state<'line' | 'bar' | 'heatmap'>('line');
</script>

<div class="switcher">
	{#each ['line', 'bar', 'heatmap'] as const as k (k)}
		<button class:active={kind === k} onclick={() => (kind = k)}>{k}</button>
	{/each}
</div>

<Scrubber>
	{#snippet children({ progress })}
		{#if kind === 'heatmap'}
			<HeatmapPlot
				width={720}
				height={520}
				title="Same props, interchangeable plot"
				subtitle="HeatmapPlot"
				data={POPULATION_BY_BROAD_AGE}
				x="ageGroup"
				y="sex"
				color="share"
				timeline={{ accessor: 'year', type: 'rule', progress, orientation: 'vertical' }}
				scales={{ x: { label: 'Age group' }, y: { label: 'Sex' } }}
			/>
		{:else if kind === 'line'}
			<LinePlot
				width={720}
				height={460}
				title="Same props, interchangeable plot"
				subtitle="LinePlot"
				data={POPULATION_BY_BROAD_AGE}
				x="year"
				y="share"
				color="ageGroup"
				timeline={{ accessor: 'year', type: 'rule', progress, orientation: 'vertical' }}
				facet={{ by: 'sex' as keyof AgeRow, columns: 2 }}
			/>
		{:else}
			<BarPlot
				width={720}
				height={460}
				title="Same props, interchangeable plot"
				subtitle="BarPlot"
				data={POPULATION_BY_BROAD_AGE}
				x="year"
				y="share"
				color="ageGroup"
				timeline={{
					accessor: 'year',
					type: 'rule',
					progress,
					orientation: 'vertical',
					filterMode: 'upTo'
				}}
				facet={{ by: 'sex' as keyof AgeRow, columns: 2 }}
			/>
		{/if}
	{/snippet}
</Scrubber>

<style>
	.switcher {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}
	.switcher button {
		padding: 0.25rem 0.75rem;
		border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
		border-radius: 0.375rem;
		background: transparent;
		color: inherit;
		cursor: pointer;
		text-transform: capitalize;
	}
	.switcher button.active {
		background: #4f46e5;
		color: white;
		border-color: #4f46e5;
	}
</style>
