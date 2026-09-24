<script lang="ts">
	import BarChart from '$lib/charts/bar/Chart.svelte';
	import { REGION_SECTOR_BARS, type RegionSector } from '../../data/region-bars';
	import type { BarSeriesLayout } from '$lib/types/plots/bar/layout';

	type Orientation = 'vertical' | 'horizontal';

	// Zero-prop marker — keeps Storybook's render typing happy.
	const props = $props();
	void props;

	let layout = $state<BarSeriesLayout>('stacked');
	let orientation = $state<Orientation>('vertical');

	const LAYOUTS: BarSeriesLayout[] = ['stacked', 'grouped'];
	const ORIENTATIONS: Orientation[] = ['vertical', 'horizontal'];
</script>

<div class="demo">
	<div class="demo__controls">
		<span class="demo__label">layout:</span>
		{#each LAYOUTS as l (l)}
			<button class:active={layout === l} onclick={() => (layout = l)}>{l}</button>
		{/each}
		<span class="demo__sep">|</span>
		<span class="demo__label">orientation:</span>
		{#each ORIENTATIONS as o (o)}
			<button class:active={orientation === o} onclick={() => (orientation = o)}>{o}</button>
		{/each}
		<span class="demo__hint">hover a segment — the same sector highlights in every region</span>
	</div>

	<BarChart
		width={760}
		height={420}
		title="Value by sector, faceted by region"
		subtitle="Layout: {layout} · Orientation: {orientation} · Strategy: series · Sync: on"
		data={REGION_SECTOR_BARS}
		x={'region' as keyof RegionSector}
		y="value"
		z={'sector' as keyof RegionSector}
		scales={{
			y: orientation === 'horizontal' ? { type: 'categorical' } : undefined,
			z: { seriesLayout: layout }
		}}
		facet={{ by: 'region' as keyof RegionSector, columns: 2 }}
		tooltip={{
			strategy: 'series',
			sync: true,
			format: (row) => {
				const { sector, value } = row as RegionSector;
				return `${sector}: ${value}`;
			}
		}}
		markers={[{ type: 'hover' }]}
	/>
</div>

<style>
	.demo {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		font-family: ui-sans-serif, system-ui, sans-serif;
	}
	.demo__controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.demo__label {
		font-family: ui-monospace, monospace;
		font-size: 0.8rem;
		opacity: 0.7;
	}
	.demo__sep {
		opacity: 0.3;
		margin: 0 0.25rem;
	}
	.demo__controls button {
		padding: 0.3rem 0.8rem;
		border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
		border-radius: 0.375rem;
		background: transparent;
		color: inherit;
		cursor: pointer;
		font-family: ui-monospace, monospace;
	}
	.demo__controls button.active {
		background: #111827;
		color: white;
		border-color: #111827;
	}
	.demo__hint {
		font-size: 0.8rem;
		opacity: 0.65;
	}
</style>
