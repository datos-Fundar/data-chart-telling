<script lang="ts">
  import Chart from '$lib/charts/Chart.svelte';
  import LinePlot from '$lib/plots/line/Plot.svelte';
  import BarPlot from '$lib/plots/bar/Plot.svelte';
  import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
  import Scrubber from '../Scrubber.svelte';
  import { buildLineSeries, buildBarSeries } from '$lib/charts/utils/group';
  import { TIME_SERIES, HEAT_CELLS, METRIC_COLORS, type SeriesPoint, type HeatCell } from '../data';
  import type { LegendSection } from '$lib/types/charts/legend';

  /**
   * One generic <Chart> orchestrator, three different leaf plots. The container,
   * timeline, facet and legend chrome is *identical* across all three — only the
   * `plot` snippet changes. This is the interchangeability the package is built
   * around: any plot that accepts `{ data, width, height }` slots in.
   */
  let kind = $state<'line' | 'bar' | 'heatmap'>('line');

  const discreteLegend: LegendSection[] = [
    { type: 'discrete', title: 'Indicador', columns: 2, items: [
      { name: 'PBI', color: METRIC_COLORS.PBI, symbol: 'line' },
      { name: 'Empleo', color: METRIC_COLORS.Empleo, symbol: 'line' },
    ] },
  ];

  const maxPct = Math.max(...HEAT_CELLS.map((d) => d.pct));
  const continuousLegend: LegendSection[] = [
    { type: 'continuous', title: 'Porcentaje', min: 0, max: maxPct,
      colorMin: '#e0e7ff', colorMax: '#4f46e5', format: (v) => `${(v * 100).toFixed(0)}%`, width: 180 },
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
      <Chart
        width={720}
        height={520}
        title="Mismo chrome, plot intercambiable"
        subtitle="Leaf: HeatmapPlot"
        data={HEAT_CELLS.filter((d) => d.scenario === 'Base')}
        legend={continuousLegend}
        timeline={{ accessor: 'year', progress, orientation: 'vertical' }}
      >
        {#snippet plot({ data, width, height })}
          <HeatmapPlot
            {width}
            {height}
            series={{ data, x: 'rooms' as keyof HeatCell, y: 'people' as keyof HeatCell, value: 'pct' as keyof HeatCell }}
            xLabel="Ambientes"
            yLabel="Personas"
            formatValue={(v) => `${(v * 100).toFixed(0)}%`}
          />
        {/snippet}
      </Chart>
    {:else}
      <Chart
        width={720}
        height={460}
        title="Mismo chrome, plot intercambiable"
        subtitle={`Leaf: ${kind === 'line' ? 'LinePlot' : 'BarPlot'}`}
        data={TIME_SERIES.filter((d) => d.region === 'Norte')}
        legend={discreteLegend}
        facet={{ by: 'metric' as keyof SeriesPoint, columns: 2 }}
      >
        {#snippet plot({ data, width, height })}
          {#if kind === 'line'}
            <LinePlot {width} {height} series={buildLineSeries(data, 'year', 'value', 'metric')} />
          {:else}
            <BarPlot
              {width}
              {height}
              series={buildBarSeries(data, 'year', 'value', undefined, () => '#4f46e5')}
            />
          {/if}
        {/snippet}
      </Chart>
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
