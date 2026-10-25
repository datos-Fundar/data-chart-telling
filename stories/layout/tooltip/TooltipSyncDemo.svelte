<script module lang="ts">
	import { PENGUIN_COUNTS_BY_SEX, POPULATION_BY_AGE } from '$datasets';

	/** Filtered data reused by the story's docs source override, see `stories/common/docsSource.ts`. */
	export const pyramidData = POPULATION_BY_AGE.filter((d) =>
		[1991, 2022, 2030, 2040].includes(d.year)
	);
</script>

<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
	import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
	import type { HoverStrategy } from '$lib/types/layout/hover';
	import {
		ARGENTINA_CHILE_TRENDS,
		AGE_GROUPS,
		AGE_SHARES,
		type CountryTrendRow,
		type AgeRow,
		type AgeShareRow,
		type PenguinCount
	} from '$datasets';

	const { kind = 'line' }: { kind?: 'line' | 'heatmap' | 'bar' | 'pyramid' } = $props();

	// svelte-ignore state_referenced_locally
	const defaultStrategy: HoverStrategy =
		kind === 'heatmap' ? 'punctual' : kind === 'pyramid' ? 'y' : 'x';

	let strategy = $state<HoverStrategy>(defaultStrategy);
	let sync = $state(true);

	const STRATEGIES: HoverStrategy[] = ['x', 'y', 'punctual'];
</script>

<div class="demo">
	<div class="demo__controls">
		<span class="demo__label">strategy:</span>
		{#each STRATEGIES as s (s)}
			<button class:active={strategy === s} onclick={() => (strategy = s)}>{s}</button>
		{/each}
		<span class="demo__sep">|</span>
		<span class="demo__label">sync:</span>
		<button class:active={sync} onclick={() => (sync = !sync)}>{sync ? 'on' : 'off'}</button>
		<span class="demo__hint">hover a facet - the match is mirrored in the others</span>
	</div>

	{#if kind === 'heatmap'}
		<HeatmapPlot
			width={760}
			height={460}
			title="Penguins by island and species"
			subtitle="Strategy: {strategy} · Sync: {sync ? 'on' : 'off'}"
			data={PENGUIN_COUNTS_BY_SEX}
			x={'island' as keyof PenguinCount}
			y={'species' as keyof PenguinCount}
			color={'count' as keyof PenguinCount}
			scales={{ x: { label: 'Island' }, y: { label: 'Species' } }}
			styles={{ values: { show: false, format: (v) => `${v}` } }}
			facet={{ by: 'sex' as keyof PenguinCount, columns: 2 }}
			tooltip={{ strategy, sync }}
			markers={[{ type: 'hover' }]}
		/>
	{:else if kind === 'bar'}
		<BarPlot
			width={760}
			height={420}
			title="Population share by age group and year"
			subtitle="Strategy: {strategy} · Sync: {sync ? 'on' : 'off'}"
			data={AGE_SHARES}
			x={'ageGroup' as keyof AgeShareRow}
			y="share"
			facet={{ by: 'year' as keyof AgeShareRow, columns: 2 }}
			tooltip={{ strategy, sync }}
			markers={[{ type: 'hover' }]}
		/>
	{:else if kind === 'pyramid'}
		<PyramidPlot
			width={760}
			height={520}
			title="Population pyramid by year"
			subtitle="Strategy: {strategy} · Sync: {sync ? 'on' : 'off'}"
			data={pyramidData}
			y={'ageGroup' as keyof AgeRow}
			x={'share' as keyof AgeRow}
			color={'sex' as keyof AgeRow}
			scales={{
				y: { domain: AGE_GROUPS },
				color: { scheme: { Female: '#d6336c', Male: '#1971c2' } }
			}}
			styles={{
				values: { format: (v) => `${v.toFixed(1)}%` }
			}}
			facet={{ by: 'year' as keyof AgeRow, columns: 2 }}
			tooltip={{ strategy, sync }}
			markers={[{ type: 'hover' }]}
		/>
	{:else}
		<LinePlot
			width={760}
			height={440}
			title="GDP per capita vs. population by country"
			subtitle="Strategy: {strategy} · Sync: {sync ? 'on' : 'off'}"
			data={ARGENTINA_CHILE_TRENDS}
			x="year"
			y="value"
			color={'metric' as keyof CountryTrendRow}
			legend={[
				{
					type: 'discrete',
					title: 'Indicator',
					columns: 2,
					items: [
						{ name: 'GDP per capita', symbol: 'line' },
						{ name: 'Population', symbol: 'line' }
					]
				}
			]}
			facet={{ by: 'country' as keyof CountryTrendRow, columns: 2 }}
			tooltip={{ strategy, sync }}
			markers={[{ type: 'hover' }]}
		/>
	{/if}
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
