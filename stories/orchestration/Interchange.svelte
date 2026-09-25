<script lang="ts">
	import BaseChart from '$lib/charts/BaseChart.svelte';
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import BarPlot from '$lib/plots/bar/Plot.svelte';
	import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
	import Scrubber from '../common/Scrubber.svelte';
	import { TIME_SERIES, type SeriesPoint } from '../data/time-series';
	import { HEAT_CELLS, type HeatCell } from '../data/heat-cells';
	import type { LegendSection } from '$lib/types/layout/legend';

	/**
	 * One generic <BaseChart> orchestrator, three different leaf plots. The container,
	 * timeline, facet and legend chrome is *identical* across all three — only the
	 * `plot` snippet changes. This is the interchangeability the package is built
	 * around: any plot that accepts `{ data, width, height }` slots in.
	 */
	let kind = $state<'line' | 'bar' | 'heatmap'>('line');
	const maxPct = Math.max(...HEAT_CELLS.map((d) => d.pct));
	const continuousLegend: LegendSection[] = [
		{
			type: 'continuous',
			title: 'Percentage',
			min: 0,
			max: maxPct,
			format: (v) => `${(v * 100).toFixed(0)}%`,
			width: 180
		}
	];

	const northSeries = TIME_SERIES.filter((d) => d.region === 'North');
</script>

<div class="switcher">
	{#each ['line', 'bar', 'heatmap'] as const as k (k)}
		<button class:active={kind === k} onclick={() => (kind = k)}>{k}</button>
	{/each}
</div>

<Scrubber>
	{#snippet children({ progress })}
		{#if kind === 'heatmap'}
			<BaseChart
				width={720}
				height={520}
				title="Same chrome, interchangeable plot"
				subtitle="Leaf: HeatmapPlot"
				data={HEAT_CELLS.filter((d) => d.scenario === 'Baseline')}
				legend={continuousLegend}
				timeline={{ accessor: 'year', progress, orientation: 'vertical' }}
			>
				{#snippet plot({ data, width, height })}
					<HeatmapPlot
						{width}
						{height}
						series={[
							{
								name: '',
								data,
								x: 'rooms' as keyof HeatCell,
								y: 'people' as keyof HeatCell,
								color: 'pct' as keyof HeatCell
							}
						]}
						scales={{ x: { label: 'Rooms' }, y: { label: 'People' } }}
						styles={{ values: { format: (v) => `${(v * 100).toFixed(0)}%` } }}
					/>
				{/snippet}
			</BaseChart>
		{:else}
			<BaseChart
				width={720}
				height={460}
				title="Same chrome, interchangeable plot"
				subtitle={`Leaf: ${kind === 'line' ? 'LinePlot' : 'BarPlot'}`}
				data={northSeries}
				legend={[
					{
						type: 'discrete',
						title: 'Indicator',
						columns: 2,
						items: [
							{ name: 'GDP', symbol: 'line' },
							{ name: 'Employment', symbol: 'line' }
						]
					}
				]}
				facet={{ by: 'metric' as keyof SeriesPoint, columns: 2 }}
			>
				{#snippet plot({ data, width, height })}
					{#if kind === 'line'}
						<LinePlot {width} {height} {data} x="year" y="value" color="metric" />
					{:else}
						<BarPlot {width} {height} {data} x="year" y="value" />
					{/if}
				{/snippet}
			</BaseChart>
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
