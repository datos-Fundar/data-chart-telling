<script lang="ts">
  import BarPlot from '$lib/plots/bar/Plot.svelte';
  import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
  import { provideLegendInteraction } from '$lib/layout/legend/interaction.svelte';
  import { FEMALE_LIFE_EXPECTANCY_BY_PROVINCE, MALE_LIFE_EXPECTANCY_BY_PROVINCE } from './data';

  // `disabled: { mode: 'omit' }` with `scales.z.seriesLayout: 'stacked'`.
  provideLegendInteraction();
</script>

<div class="legend-demo">
  <LegendLayout
    sections={[
      {
        type: 'discrete',
        title: 'Sexo',
        interactive: { enabled: true, disabled: { mode: 'omit' } },
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
    series={[
      { name: 'female', x: 'province', y: 'value', data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE },
      { name: 'male', x: 'province', y: 'value', data: MALE_LIFE_EXPECTANCY_BY_PROVINCE },
    ]}
    scales={{ z: { seriesLayout: 'stacked' } }}
  />
</div>

<style>
  .legend-demo {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
