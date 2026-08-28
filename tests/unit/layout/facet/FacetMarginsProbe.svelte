<script lang="ts">
  import FacetLayout from '$lib/layout/facet/FacetLayout.svelte';

  type Row = { group: string; label: string };

  let {
    rows,
    columns = 3,
    width = 600,
    height = 400,
  }: {
    rows: Row[];
    columns?: number;
    width?: number;
    height?: number;
  } = $props();
</script>

<FacetLayout
  data={rows}
  by="group"
  {columns}
  {width}
  {height}
  labelsForMargin={(cellRows) => cellRows.map((r) => r.label)}
>
  {#snippet cell({ facetValue, width: w, height: h, margins })}
    <div
      data-testid="cell"
      data-facet={facetValue}
      data-width={w}
      data-height={h}
      data-left={margins?.left}
    ></div>
  {/snippet}
</FacetLayout>
