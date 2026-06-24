<script lang="ts">
  import PyramidChart from '$lib/charts/pyramid/Chart.svelte';
  import Scrubber from '../../common/Scrubber.svelte';
  import { AGE_GROUPS, POPULATION_PYRAMID, type PopulationRow } from '../../data/population-pyramid';
  import type { LegendSection } from '$lib/types/charts/legend';

  /** Age groups dimmed to focus attention — mirrors the old per-chart `highlight: string[]` prop. */
  const { highlight = [] as string[] }: { highlight?: string[] } = $props();

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

  const segments = $derived(
    highlight.length === 0
      ? undefined
      : Object.fromEntries(
          (['Mujeres', 'Varones'] as const).map((name) => [
            name,
            AGE_GROUPS.map((ageGroup) => ({
              from: ageGroup,
              to: ageGroup,
              style: { fillOpacity: highlight.includes(ageGroup) ? 1 : 0.25 },
            })),
          ]),
        ),
  );
</script>

<Scrubber>
  {#snippet children({ progress })}
    <PyramidChart
      width={680}
      height={560}
      title="Pirámide poblacional"
      subtitle="Porcentaje del rango etario sobre el total de la población"
      caption="Datos sintéticos. Arrastrá el scrubber para cambiar de año."
      data={POPULATION_PYRAMID}
      y={'ageGroup' as keyof PopulationRow}
      x={'pct' as keyof PopulationRow}
      z={'sex' as keyof PopulationRow}
      scales={{ y: { domain: AGE_GROUPS } }}
      styles={{ colors: { left: '#d6336c', right: '#1971c2' }, values: { format: (v) => `${v.toFixed(1)}%` } }}
      {segments}
      {legend}
      timeline={{ accessor: 'year', progress, orientation: 'vertical' }}
    />
  {/snippet}
</Scrubber>
