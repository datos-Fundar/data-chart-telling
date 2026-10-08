<script lang="ts">
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import BarPlot from '$lib/plots/bar/Plot.svelte';
	import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
	import Scrubber from '../../common/Scrubber.svelte';
	import { TIME_SERIES, type SeriesPoint } from '../../data/time-series';
	import { HEAT_CELLS } from '../../data/heat-cells';
	import type { LegendSection } from '$lib/types/layout/legend';

	/**
	 * Three plot kinds, one set of chrome props. Title, legend, timeline and
	 * facet are the same props on every plot kind - switching kinds only
	 * changes the component and its own encodings.
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
	const indicatorLegend: LegendSection[] = [
		{
			type: 'discrete',
			title: 'Indicator',
			columns: 2,
			items: [
				{ name: 'GDP', symbol: 'line' },
				{ name: 'Employment', symbol: 'line' }
			]
		}
	];
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
				title="Same chrome, interchangeable plot"
				subtitle="HeatmapPlot"
				data={HEAT_CELLS.filter((d) => d.scenario === 'Baseline')}
				x="rooms"
				y="people"
				color="pct"
				legend={continuousLegend}
				timeline={{ accessor: 'year', progress, orientation: 'vertical' }}
				scales={{ x: { label: 'Rooms' }, y: { label: 'People' } }}
				styles={{ values: { format: (v) => `${(v * 100).toFixed(0)}%` } }}
			/>
		{:else if kind === 'line'}
			<LinePlot
				width={720}
				height={460}
				title="Same chrome, interchangeable plot"
				subtitle="LinePlot"
				data={northSeries}
				x="year"
				y="value"
				color="metric"
				legend={indicatorLegend}
				facet={{ by: 'metric' as keyof SeriesPoint, columns: 2 }}
			/>
		{:else}
			<BarPlot
				width={720}
				height={460}
				title="Same chrome, interchangeable plot"
				subtitle="BarPlot"
				data={northSeries}
				x="year"
				y="value"
				legend={indicatorLegend}
				facet={{ by: 'metric' as keyof SeriesPoint, columns: 2 }}
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
