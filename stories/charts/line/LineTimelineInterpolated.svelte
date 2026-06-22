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
      title="PBI vs. Empleo, interpolado"
      subtitle="Timeline interactivo — la línea avanza punto a punto en vez de saltar"
      caption="`interpolate: true` reutiliza el `y`/`z` del chart para tween entre años reales."
      {data}
      x="year"
      y="value"
      z={'metric' as keyof SeriesPoint}
      xScale={{ domain: [years[0], years[years.length - 1]] }}
      yScale={{ domain: [20, 80] }}
      timeline={{
        accessor: 'year',
        progress,
        orientation: 'horizontal',
        interpolate: { progressEasing: 'quartOut' },
      }}
    />
  {/snippet}
</Scrubber>
