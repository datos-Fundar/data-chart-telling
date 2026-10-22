<script lang="ts">
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import { POPULATION_BY_BROAD_AGE, type AgeRow } from '$datasets';

	const DATA = POPULATION_BY_BROAD_AGE.filter((d) => d.year === 1991 || d.year === 2022);

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
		<span class="demo__hint">hover a segment - the same sex highlights in every census</span>
	</div>

	<!-- A bar plot reads `x`, `y` and `transforms` once, so a change of layout or orientation remounts it. -->
	{#key layout + orientation}
		<BarPlot
			width={760}
			height={420}
			title="Population share by sex, faceted by census"
			subtitle="Layout: {layout} · Orientation: {orientation} · Strategy: series · Sync: on"
			data={DATA}
			x={horizontal ? 'share' : ('ageGroup' as keyof AgeRow)}
			y={horizontal ? ('ageGroup' as keyof AgeRow) : 'share'}
			color={'sex' as keyof AgeRow}
			transforms={layout === 'stacked' ? [{ type: horizontal ? 'stackX' : 'stackY' }] : []}
			facet={{ by: 'year' as keyof AgeRow, columns: 2 }}
			tooltip={{
				strategy: 'series',
				sync: true,
				format: (row) => {
					const { sex, share } = row as AgeRow;
					return `${sex}: ${share}%`;
				}
			}}
			markers={[{ type: 'hover' }]}
		/>
	{/key}
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
