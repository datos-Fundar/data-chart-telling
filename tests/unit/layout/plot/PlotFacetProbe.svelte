<script lang="ts" generics="TRow extends Record<string, unknown>">
  import Plot from '$lib/layout/plot/Plot.svelte';
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

<Plot {data} {facet} {width} {height}>
  {#snippet cell({ data: rows, width: w, height: h })}
    <div data-testid="cell" data-rows={rows?.length} data-width={w} data-height={h}></div>
  {/snippet}
</Plot>
