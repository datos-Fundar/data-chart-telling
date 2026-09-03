<script lang="ts">
  import FacetLayout from '$lib/layout/facet/FacetLayout.svelte';
  import { estimateCategoricalAxisMargin } from '$lib/plots/utils/categoricalAxisMargin';
  import { estimateValueLabelMargin } from '$lib/plots/utils/valueLabelMargin';

  type Row = { group: string; label: string };

  let {
    rows,
    columns = 3,
    width = 600,
    height = 400,
    bothSides = false,
  }: {
    rows: Row[];
    columns?: number;
    width?: number;
    height?: number;
    bothSides?: boolean;
  } = $props();
</script>

<FacetLayout
  data={rows}
  by="group"
  {columns}
  {width}
  {height}
  marginsForFacet={(cellRows) => {
    const labels = cellRows.map((r) => r.label);
    const left = estimateCategoricalAxisMargin(labels);
    if (!bothSides) return { left };
    // A different formula (extra fixed `reach` on top) than `left`'s, so a
    // test asserting the two sides don't clobber each other can tell them
    // apart rather than coincidentally matching.
    const right = estimateValueLabelMargin(labels, { canvasFont: '12px sans-serif', reach: 8 });
    return { left, right };
  }}
>
  {#snippet cell({ facetValue, width: w, height: h, margins })}
    <div
      data-testid="cell"
      data-facet={facetValue}
      data-width={w}
      data-height={h}
      data-left={margins?.left}
      data-right={margins?.right}
    ></div>
  {/snippet}
</FacetLayout>
