<script lang="ts">
  import FacetLayout from '$lib/layout/facet/FacetLayout.svelte';
  import type { FacetColumns, FacetMode, FacetNavLayout, Responsive } from '$lib/types/layout/facet';

  type Row = { group: string };

  let {
    groupCount,
    columns,
    mode = 'grid',
    pageSize,
    navLayout = 'overlay',
    width = 600,
    height = 400,
  }: {
    groupCount: number;
    columns: FacetColumns;
    mode?: Responsive<FacetMode>;
    pageSize?: number;
    navLayout?: FacetNavLayout;
    width?: number;
    height?: number;
  } = $props();

  const GROUP_NAMES = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const data = $derived.by((): Row[] => GROUP_NAMES.slice(0, groupCount).map((g) => ({ group: g })));
</script>

<FacetLayout {data} by="group" {columns} {mode} {pageSize} {navLayout} {width} {height}>
  {#snippet cell({ facetValue, width: w, height: h })}
    <div data-testid="cell" data-facet={facetValue} data-width={w} data-height={h}></div>
  {/snippet}
</FacetLayout>
