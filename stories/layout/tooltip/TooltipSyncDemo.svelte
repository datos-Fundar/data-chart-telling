<script lang="ts">
  import LineChart from '$lib/charts/line/Chart.svelte';
  import BarChart from '$lib/charts/bar/Chart.svelte';
  import HeatmapChart from '$lib/charts/heatmap/Chart.svelte';
  import PyramidChart from '$lib/charts/pyramid/Chart.svelte';
  import type { TooltipSync } from '$lib/types/layout/tooltip';
  import { TIME_SERIES, type SeriesPoint } from '../../data/time-series';
  import { HEAT_CELLS, type HeatCell } from '../../data/heat-cells';
  import { REGION_BARS, type RegionYear } from '../../data/region-bars';
  import { AGE_GROUPS, POPULATION_PYRAMID, type PopulationRow } from '../../data/population-pyramid';

  const { kind = 'line' }: { kind?: 'line' | 'heatmap' | 'bar' | 'pyramid' } = $props();

  // svelte-ignore state_referenced_locally
  let sync = $state<TooltipSync>(kind === 'heatmap' ? 'xy' : kind === 'pyramid' ? 'y' : 'x');
  const SYNCS: TooltipSync[] = ['none', 'x', 'y', 'xy'];

  const heatData = HEAT_CELLS.filter((d) => d.year === 2022);
  const pyramidData = POPULATION_PYRAMID.filter((d) => [1991, 2022, 2030, 2040].includes(d.year));
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
      markers={[{ type: 'hover' }]}
    />
  {:else if kind === 'bar'}
    <BarChart
      width={760}
      height={420}
      title="Valor por región y año"
      subtitle="Tooltip sync: {sync}"
      data={REGION_BARS}
      x={'region' as keyof RegionYear}
      y="value"
      facet={{ by: 'year' as keyof RegionYear, columns: 3 }}
      tooltip={{ sync }}
      markers={[{ type: 'hover' }]}
    />
  {:else if kind === 'pyramid'}
    <PyramidChart
      width={760}
      height={520}
      title="Pirámide poblacional por año"
      subtitle="Tooltip sync: {sync}"
      data={pyramidData}
      y={'ageGroup' as keyof PopulationRow}
      x={'pct' as keyof PopulationRow}
      side={{ Mujeres: 'left', Varones: 'right' }}
      z={'sex' as keyof PopulationRow}
      colorLeft="#d6336c"
      colorRight="#1971c2"
      yScale={{ domain: AGE_GROUPS }}
      formatValue={(v) => `${v.toFixed(1)}%`}
      facet={{ by: 'year' as keyof PopulationRow, columns: 2 }}
      tooltip={{ sync }}
      markers={[{ type: 'hover' }]}
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
      legend={[
        {
          type: 'discrete',
          title: 'Indicador',
          columns: 2,
          items: [
            { name: 'PBI', symbol: 'line' },
            { name: 'Empleo', symbol: 'line' },
          ],
        },
      ]}
      facet={{ by: 'region' as keyof SeriesPoint, columns: 2 }}
      tooltip={{ sync }}
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
