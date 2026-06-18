<script lang="ts">
  import BarChart from '$lib/charts/kinds/BarChart.svelte';
  import Scrubber from '../Scrubber.svelte';
  import { REGION_BARS } from '../data';
</script>

<Scrubber>
  {#snippet children({ progress })}
    <BarChart
      width={680}
      height={420}
      title="Valor por región en el tiempo"
      subtitle="Timeline interactivo — arrastrá el scrubber"
      caption="El timeline filtra los datos al año seleccionado."
      data={REGION_BARS}
      x="region"
      y="value"
      colors={{ series: '#2daa6e' }}
      timeline={{ accessor: 'year', progress, orientation: 'horizontal' }}
    />
  {/snippet}
</Scrubber>
