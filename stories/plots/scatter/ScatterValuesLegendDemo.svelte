<script lang="ts">
  import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
  import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
  import { provideLegendInteraction } from '$lib/layout/legend/interaction.svelte';
  import { AMERICAS, EUROPE } from './data';

  // Registers the same context `BaseChart` provides internally — composing
  // `LegendLayout` and `ScatterPlot` as siblings here, both descendants of
  // this component, is what lets toggling a legend item reach the plot.
  provideLegendInteraction();
</script>

<div class="legend-demo">
  <LegendLayout
    sections={[
      {
        type: 'discrete',
        title: 'Región',
        interactive: true,
        items: [
          { name: 'Americas', symbol: 'circle' },
          { name: 'Europe', symbol: 'circle' },
        ],
      },
    ]}
  />
  <ScatterPlot
    width={950}
    height={500}
    data={[...AMERICAS, ...EUROPE]}
    x="gdpPerCapita"
    y="lifeExpectancy"
    z="region"
    styles={{
      values: { show: true, format: (v: number) => v.toFixed(0) },
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
