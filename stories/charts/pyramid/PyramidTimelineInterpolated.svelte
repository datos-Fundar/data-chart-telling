<script lang="ts">
  import PyramidChart from '$lib/charts/pyramid/Chart.svelte';
  import Scrubber from '../../common/Scrubber.svelte';
  import { AGE_GROUPS, POPULATION_PYRAMID, type PopulationRow } from '../../data/population-pyramid';
  import type { LegendSection } from '$lib/types/charts/legend';

  const legend: LegendSection[] = [
    {
      type: 'discrete',
      items: [
        { name: 'Mujeres', color: '#d6336c', symbol: 'square' },
        { name: 'Varones', color: '#1971c2', symbol: 'square' },
      ],
      columns: 2,
    },
  ];
</script>

<Scrubber>
  {#snippet children({ progress })}
    <PyramidChart
      width={680}
      height={560}
      title="Pirámide poblacional, interpolada"
      subtitle="Timeline interactivo — cada barra crossfadea entre censos en vez de saltar"
      caption="Los años entre 1991 y 2040 tienen huecos irregulares: `interpolate: true` tween el valor de cada grupo etario/lado a través de ellos."
      data={POPULATION_PYRAMID}
      y={'ageGroup' as keyof PopulationRow}
      x={'pct' as keyof PopulationRow}
      z={'sex' as keyof PopulationRow}
      scales={{ y: { domain: AGE_GROUPS } }}
      styles={{ colors: { left: '#d6336c', right: '#1971c2' }, values: { format: (v) => `${v.toFixed(1)}%` } }}
      {legend}
      timeline={{ accessor: 'year', progress, orientation: 'vertical', interpolate: true }}
    />
  {/snippet}
</Scrubber>
