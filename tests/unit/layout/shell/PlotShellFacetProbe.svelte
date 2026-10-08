<script lang="ts" generics="TRow extends Record<string, unknown>">
  import PlotShell from '$lib/layout/shell/PlotShell.svelte';
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

  const presentation = { hoverStrategy: 'x' as const };
</script>

<PlotShell {data} {facet} {width} {height} {presentation}>
  {#snippet cell({ data: rows, width: w, height: h })}
    <div data-testid="cell" data-rows={rows?.length} data-width={w} data-height={h}></div>
  {/snippet}
</PlotShell>
