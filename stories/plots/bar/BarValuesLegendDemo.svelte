<script lang="ts">
  import BarPlot from '$lib/plots/bar/Plot.svelte';
  import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
  import { provideLegendInteraction } from '$lib/layout/legend/interaction.svelte';
  import { FEMALE_LIFE_EXPECTANCY_BY_PROVINCE, MALE_LIFE_EXPECTANCY_BY_PROVINCE } from './data';

  // Registers the same context `BaseChart` provides internally — composing
  // `LegendLayout` and `BarPlot` as siblings here, both descendants of this
  // component, is what lets toggling a legend item reach the plot.
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
          { name: 'female', label: 'Mujeres', symbol: 'square' },
          { name: 'male', label: 'Varones', symbol: 'square' },
        ],
      },
    ]}
  />
  <BarPlot
    width={950}
    height={500}
    margins={{ top: 20 }}
    series={[
      { name: 'female', x: 'province', y: 'value', data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE },
      { name: 'male', x: 'province', y: 'value', data: MALE_LIFE_EXPECTANCY_BY_PROVINCE },
    ]}
    styles={{
      values: {
        show: true,
        format: (v: number, name: string) => `${name} (${v.toFixed(1)})`,
      },
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
