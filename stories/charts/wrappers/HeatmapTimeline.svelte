<script lang="ts">
  import HeatmapChart from '$lib/charts/kinds/HeatmapChart.svelte';
  import Scrubber from '../Scrubber.svelte';
  import { HEAT_CELLS, type HeatCell } from '../data';
  import type { LegendSection } from '$lib/types/charts/legend';

  const { faceted = false }: { faceted?: boolean } = $props();

  const data = $derived(faceted ? HEAT_CELLS : HEAT_CELLS.filter((d) => d.scenario === 'Base'));

  const maxPct = Math.max(...HEAT_CELLS.map((d) => d.pct));
  const legend: LegendSection[] = [
    {
      type: 'continuous',
      title: 'Porcentaje',
      min: 0,
      max: maxPct,
      colorMin: '#e0e7ff',
      colorMax: '#4f46e5',
      ticks: [maxPct * 0.25, maxPct * 0.5, maxPct * 0.75].map((v) => Math.round(v * 1000) / 1000),
      format: (v) => `${(v * 100).toFixed(0)}%`,
      width: 200,
    },
  ];
</script>

<Scrubber>
  {#snippet children({ progress })}
    <HeatmapChart
      width={760}
      height={520}
      title="Hogares por personas y ambientes"
      subtitle={faceted ? 'Timeline compartido + facetas por escenario' : 'Timeline interactivo'}
      caption="Datos sintéticos. Arrastrá el scrubber para cambiar de año."
      {data}
      x={'rooms' as keyof HeatCell}
      y={'people' as keyof HeatCell}
      value={'pct' as keyof HeatCell}
      xLabel="Ambientes"
      yLabel="Personas"
      {legend}
      formatValue={(v) => `${(v * 100).toFixed(0)}%`}
      facet={faceted ? { by: 'scenario' as keyof HeatCell, columns: 2 } : undefined}
      timeline={{ accessor: 'year', progress, orientation: 'vertical' }}
    />
  {/snippet}
</Scrubber>
