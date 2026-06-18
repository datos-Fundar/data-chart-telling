<script lang="ts">
  import BarChart from '$lib/charts/kinds/BarChart.svelte';
  import Scrubber from '../Scrubber.svelte';
  import { TIME_SERIES, type SeriesPoint } from '../data';
</script>

<Scrubber>
  {#snippet children({ progress })}
    <BarChart
      width={760}
      height={460}
      title="Métricas por región y año"
      subtitle="Timeline compartido + facetas"
      data={TIME_SERIES}
      x={'metric' as keyof SeriesPoint}
      y="value"
      colors={{ series: '#9333ea' }}
      facet={{ by: 'region' as keyof SeriesPoint, columns: 2 }}
      timeline={{ accessor: 'year', progress, orientation: 'horizontal' }}
    />
  {/snippet}
</Scrubber>
