<script lang="ts">
  import LineChart from '$lib/charts/line/Chart.svelte';
  import Scrubber from '../../common/Scrubber.svelte';
  import { TIME_SERIES, type SeriesPoint } from '../../data/time-series';

  const data = TIME_SERIES.filter((d) => d.region === 'Norte');
  const years = [...new Set(data.map((d) => d.year))].sort((a, b) => a - b);
</script>

<Scrubber>
  {#snippet children({ progress })}
    <LineChart
      width={680}
      height={460}
      title="PBI vs. Empleo, año por año"
      subtitle="Timeline interactivo — la línea crece hasta el año seleccionado"
      caption="A diferencia de bar/heatmap, el timeline acumula los datos en vez de aislar un único año."
      {data}
      x="year"
      y="value"
      z={'metric' as keyof SeriesPoint}
      scales={{ x: { domain: [years[0], years[years.length - 1]] }, y: { domain: [20, 80] } }}
      timeline={{ accessor: 'year', progress, orientation: 'horizontal' }}
    />
  {/snippet}
</Scrubber>
