<script lang="ts">
  import BaseChart from '$lib/charts/BaseChart.svelte';
  import LinePlot from '$lib/plots/line/Plot.svelte';
  import type { FacetConfig } from '$lib/types/layout/facet';

  type Row = { region: string; sex: 'male' | 'female'; year: number; value: number };

  let { data, width = 400, height = 320 }: { data: Row[]; width?: number; height?: number } = $props();

  const facet: FacetConfig<Row> = {
    by: 'region',
    columns: 1,
    mode: 'paginated',
    pageSize: 1,
    navLayout: 'below',
  };
</script>

<BaseChart {data} {facet} {width} {height}>
  {#snippet plot({ data: cellData, width: w, height: h })}
    <LinePlot
      width={w}
      height={h}
      data={cellData}
      x="year"
      y="value"
      z="sex"
      styles={{ values: { show: true } }}
    />
  {/snippet}
</BaseChart>
