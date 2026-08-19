<script lang="ts" generics="TRow extends Record<string, unknown>">
  import BaseChart from '$lib/charts/BaseChart.svelte';
  import type { FacetConfig } from '$lib/types/layout/facet';

  let {
    data,
    facet,
    width = 600,
    height = 400,
  }: {
    data: TRow[];
    facet: FacetConfig<TRow>;
    width?: number;
    height?: number;
  } = $props();
</script>

<BaseChart {data} {facet} {width} {height}>
  {#snippet plot({ facetValue, width: w, height: h })}
    <div data-testid="cell" data-facet={facetValue} data-width={w} data-height={h}></div>
  {/snippet}
</BaseChart>
