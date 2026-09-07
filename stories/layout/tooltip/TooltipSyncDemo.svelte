<script module lang="ts">
	import { HEAT_CELLS } from '../../data/heat-cells';
	import { POPULATION_PYRAMID } from '../../data/population-pyramid';

	/** Filtered data reused by the story's docs source override, see `stories/common/docsSource.ts`. */
	export const heatData = HEAT_CELLS.filter((d) => d.year === 2022);
	export const pyramidData = POPULATION_PYRAMID.filter((d) =>
		[1991, 2022, 2030, 2040].includes(d.year)
	);
</script>

<script lang="ts">
	import LineChart from '$lib/charts/line/Chart.svelte';
	import BarChart from '$lib/charts/bar/Chart.svelte';
	import HeatmapChart from '$lib/charts/heatmap/Chart.svelte';
	import PyramidChart from '$lib/charts/pyramid/Chart.svelte';
	import type { HoverStrategy } from '$lib/types/layout/tooltip';
	import { TIME_SERIES, type SeriesPoint } from '../../data/time-series';
	import type { HeatCell } from '../../data/heat-cells';
	import { REGION_BARS, type RegionYear } from '../../data/region-bars';
	import { AGE_GROUPS, type PopulationRow } from '../../data/population-pyramid';

	const { kind = 'line' }: { kind?: 'line' | 'heatmap' | 'bar' | 'pyramid' } = $props();

	const defaultStrategy: HoverStrategy =
		kind === 'heatmap' ? 'punctual' : kind === 'pyramid' ? 'y' : 'x';

	// svelte-ignore state_referenced_locally
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
		<span class="demo__hint">hover a facet — the match is mirrored in the others</span>
	</div>

	{#if kind === 'heatmap'}
		<HeatmapChart
			width={760}
			height={460}
			title="Hogares por ambientes (2022)"
			subtitle="Strategy: {strategy} · Sync: {sync ? 'on' : 'off'}"
			data={heatData}
			x={'rooms' as keyof HeatCell}
			y={'people' as keyof HeatCell}
			z={'pct' as keyof HeatCell}
			scales={{ x: { label: 'Ambientes' }, y: { label: 'Personas' } }}
			styles={{ values: { show: false, format: (v) => `${(v * 100).toFixed(0)}%` } }}
			facet={{ by: 'scenario' as keyof HeatCell, columns: 2 }}
			tooltip={{ strategy, sync }}
			markers={[{ type: 'hover' }]}
		/>
	{:else if kind === 'bar'}
		<BarChart
			width={760}
			height={420}
			title="Valor por región y año"
			subtitle="Strategy: {strategy} · Sync: {sync ? 'on' : 'off'}"
			data={REGION_BARS}
			x={'region' as keyof RegionYear}
			y="value"
			facet={{ by: 'year' as keyof RegionYear, columns: 3 }}
			tooltip={{ strategy, sync }}
			markers={[{ type: 'hover' }]}
		/>
	{:else if kind === 'pyramid'}
		<PyramidChart
			width={760}
			height={520}
			title="Pirámide poblacional por año"
			subtitle="Strategy: {strategy} · Sync: {sync ? 'on' : 'off'}"
			data={pyramidData}
			y={'ageGroup' as keyof PopulationRow}
			x={'pct' as keyof PopulationRow}
			z={'sex' as keyof PopulationRow}
			scales={{ y: { domain: AGE_GROUPS } }}
			styles={{
				colors: { left: '#d6336c', right: '#1971c2' },
				values: { format: (v) => `${v.toFixed(1)}%` }
			}}
			facet={{ by: 'year' as keyof PopulationRow, columns: 2 }}
			tooltip={{ strategy, sync }}
			markers={[{ type: 'hover' }]}
		/>
	{:else}
		<LineChart
			width={760}
			height={440}
			title="PBI vs. Empleo por región"
			subtitle="Strategy: {strategy} · Sync: {sync ? 'on' : 'off'}"
			data={TIME_SERIES}
			x="year"
			y="value"
			z={'metric' as keyof SeriesPoint}
			legend={[
				{
					type: 'discrete',
					title: 'Indicador',
					columns: 2,
					items: [
						{ name: 'PBI', symbol: 'line' },
						{ name: 'Empleo', symbol: 'line' }
					]
				}
			]}
			facet={{ by: 'region' as keyof SeriesPoint, columns: 2 }}
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
