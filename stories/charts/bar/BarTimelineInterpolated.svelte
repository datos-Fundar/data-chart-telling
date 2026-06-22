<script lang="ts">
  import BarChart from '$lib/charts/bar/Chart.svelte';
  import Scrubber from '../../common/Scrubber.svelte';
  import { REGION_BARS } from '../../data/region-bars';
</script>

<Scrubber>
  {#snippet children({ progress })}
    <BarChart
      width={680}
      height={420}
      title="Valor por región en el tiempo, interpolado"
      subtitle="Timeline interactivo — cada barra crossfadea entre años en vez de saltar"
      caption="Los años 2018/2020/2022 tienen huecos: `interpolate: true` tween el valor de cada región a través de ellos."
      data={REGION_BARS}
      x="region"
      y="value"
      timeline={{ accessor: 'year', progress, orientation: 'horizontal', interpolate: true }}
    />
  {/snippet}
</Scrubber>
