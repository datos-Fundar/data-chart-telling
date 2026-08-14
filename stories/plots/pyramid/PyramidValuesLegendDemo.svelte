<script lang="ts">
  import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
  import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
  import { provideLegendInteraction } from '$lib/layout/legend/interaction.svelte';
  import { AGE_GROUPS, POPULATION_PYRAMID } from '../../data/population-pyramid';

  const DATA = POPULATION_PYRAMID.filter((d) => d.year === 2022);

  // Registers the same context `BaseChart` provides internally — composing
  // `LegendLayout` and `PyramidPlot` as siblings here, both descendants of
  // this component, is what lets toggling a legend item reach the plot.
  provideLegendInteraction();
</script>

<div class="legend-demo">
  <LegendLayout
    sections={[
      {
        type: 'discrete',
        title: 'Sexo',
        interactive: true,
        items: [
          { name: 'Mujeres', symbol: 'square' },
          { name: 'Varones', symbol: 'square' },
        ],
      },
    ]}
  />
  <PyramidPlot
    width={950}
    height={520}
    data={DATA}
    x="pct"
    y="ageGroup"
    z="sex"
    scales={{ x: { domain: [-6, 6] }, y: { domain: AGE_GROUPS } }}
    styles={{
      values: { show: true, format: (v: number) => `${v.toFixed(1)}%` },
    }}
  />
</div>

<style>
  .legend-demo {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
