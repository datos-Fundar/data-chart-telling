<script lang="ts">
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import { REGION_SECTOR_BARS, type RegionSector } from '../../data/region-bars';

	type Orientation = 'vertical' | 'horizontal';

	// Zero-prop marker - keeps Storybook's render typing happy.
	const props = $props();
	// svelte-ignore state_referenced_locally
	void props;

	let layout = $state<'stacked' | 'grouped'>('stacked');
	let orientation = $state<Orientation>('vertical');

	const LAYOUTS: ('stacked' | 'grouped')[] = ['stacked', 'grouped'];
	const ORIENTATIONS: Orientation[] = ['vertical', 'horizontal'];
	const horizontal = $derived(orientation === 'horizontal');
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
		<span class="demo__hint">hover a segment - the same sector highlights in every region</span>
	</div>

	<BarPlot
		width={760}
		height={420}
		title="Value by sector, faceted by region"
		subtitle="Layout: {layout} · Orientation: {orientation} · Strategy: series · Sync: on"
		data={REGION_SECTOR_BARS}
		x={horizontal ? 'value' : ('region' as keyof RegionSector)}
		y={horizontal ? ('region' as keyof RegionSector) : 'value'}
		color={'sector' as keyof RegionSector}
		transforms={layout === 'stacked' ? [{ type: horizontal ? 'stackX' : 'stackY' }] : []}
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
