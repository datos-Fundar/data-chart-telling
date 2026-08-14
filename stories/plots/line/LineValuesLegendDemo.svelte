<script lang="ts">
  import LinePlot from '$lib/plots/line/Plot.svelte';
  import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
  import { provideLegendInteraction } from '$lib/layout/legend/interaction.svelte';
  import { FEMALE_LIFE_EXPECTANCY, MALE_LIFE_EXPECTANCY } from './data';

  // Registers the same context `BaseChart` provides internally — composing
  // `LegendLayout` and `LinePlot` as siblings here, both descendants of this
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
          { name: 'female', label: 'Mujeres', symbol: 'line' },
          { name: 'male', label: 'Varones', symbol: 'line' },
        ],
      },
    ]}
  />
  <LinePlot
    width={950}
    height={400}
    series={[
      { name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE_EXPECTANCY },
      { name: 'male', x: 'year', y: 'value', data: MALE_LIFE_EXPECTANCY },
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
