<script lang="ts">
  import LineChart from '$lib/charts/line/Chart.svelte';
  import HeatmapChart from '$lib/charts/heatmap/Chart.svelte';
  import type { TooltipSync } from '$lib/types/layout/tooltip';
  import { TIME_SERIES, METRIC_COLORS, type SeriesPoint } from '../../data/time-series';
  import { HEAT_CELLS, type HeatCell } from '../../data/heat-cells';
  import type { LegendSection } from '$lib/types/charts/legend';

  const { kind = 'line' }: { kind?: 'line' | 'heatmap' } = $props();

  // Hover one facet and watch the matching point light up in the others.
  // svelte-ignore state_referenced_locally
  let sync = $state<TooltipSync>(kind === 'heatmap' ? 'xy' : 'x');

  const SYNCS: TooltipSync[] = ['none', 'x', 'y', 'xy'];

  const lineLegend: LegendSection[] = [
    {
      type: 'discrete',
      title: 'Indicador',
      columns: 2,
      items: [
        { name: 'PBI', color: METRIC_COLORS.PBI, symbol: 'line' },
        { name: 'Empleo', color: METRIC_COLORS.Empleo, symbol: 'line' },
      ],
    },
  ];

  const heatData = HEAT_CELLS.filter((d) => d.year === 2022);
</script>

<div class="demo">
  <div class="demo__controls">
    <span class="demo__label">tooltip sync:</span>
    {#each SYNCS as s (s)}
      <button class:active={sync === s} onclick={() => (sync = s)}>{s}</button>
    {/each}
    <span class="demo__hint">hover a facet — the match is mirrored in the others</span>
  </div>

  {#if kind === 'heatmap'}
    <HeatmapChart
      width={760}
      height={460}
      title="Hogares por ambientes (2022)"
      subtitle="Tooltip sync: {sync}"
      data={heatData}
      x={'rooms' as keyof HeatCell}
      y={'people' as keyof HeatCell}
      value={'pct' as keyof HeatCell}
      xScale={{ label: 'Ambientes' }}
      yScale={{ label: 'Personas' }}
      showValues={false}
      formatValue={(v) => `${(v * 100).toFixed(0)}%`}
      facet={{ by: 'scenario' as keyof HeatCell, columns: 2 }}
      tooltip={{ sync }}
    />
  {:else}
    <LineChart
      width={760}
      height={440}
      title="PBI vs. Empleo por región"
      subtitle="Tooltip sync: {sync}"
      data={TIME_SERIES}
      x="year"
      y="value"
      z={'metric' as keyof SeriesPoint}
      colors={METRIC_COLORS}
      legend={lineLegend}
      facet={{ by: 'region' as keyof SeriesPoint, columns: 2 }}
      tooltip={{ sync }}
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
