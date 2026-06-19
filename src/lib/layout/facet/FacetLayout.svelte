<script lang="ts" generics="TRow extends Record<string, unknown>">
  import { isMobile } from '$lib/stores/device';
  import { groupBy } from '$lib/utils/grouping';
  import type {
    FacetColumns,
    FacetCellSnippet,
  } from '$lib/types/charts/common';
  import type { Accessor } from '$lib/types/plots/common';

  /**
   * Small-multiples layout. It splits the data by `by`, arranges the groups in a
   * responsive grid and renders each group through the `cell` snippet with its
   * own measured box. Like the other primitives it never draws the plot itself —
   * any plot that accepts `{ data, width, height }` can be faceted.
   */
  let {
    data,
    by,
    columns = { desktop: 3, mobile: 1 },
    values,
    gap = 12,
    width,
    height,
    cell,
  }: {
    data: TRow[];
    by: Accessor<TRow, unknown>;
    columns?: FacetColumns;
    values?: string[];
    gap?: number;
    width: number;
    height: number;
    cell: FacetCellSnippet<TRow>;
  } = $props();

  const groups = $derived(groupBy(data, by));

  const entries = $derived.by((): [string, TRow[]][] => {
    if (!values) return [...groups.entries()];
    return values
      .filter((v) => groups.has(v))
      .map((v) => [v, groups.get(v)!] as [string, TRow[]]);
  });

  const cols = $derived.by(() => {
    const desired =
      typeof columns === 'number'
        ? columns
        : $isMobile
          ? columns.mobile
          : columns.desktop;
    return Math.max(1, Math.min(desired, entries.length || 1));
  });

  const rows = $derived(Math.ceil((entries.length || 1) / cols));
  const cellWidth = $derived(Math.max(0, Math.floor((width - (cols - 1) * gap) / cols)));
  const TITLE_H = 24;
  const cellHeight = $derived(
    Math.max(0, Math.floor((height - (rows - 1) * gap) / rows) - TITLE_H),
  );
</script>

<div
  class="dct-facet"
  style:grid-template-columns="repeat({cols}, 1fr)"
  style:gap="{gap}px"
>
  {#each entries as [facetValue, rowsForCell] (facetValue)}
    <div class="dct-facet__cell">
      <div class="dct-facet__title">{facetValue}</div>
      {#if cellWidth > 0 && cellHeight > 0}
        {@render cell({ facetValue, data: rowsForCell, width: cellWidth, height: cellHeight })}
      {/if}
    </div>
  {/each}
</div>

<style>
  .dct-facet {
    display: grid;
    width: 100%;
    height: 100%;
  }
  .dct-facet__cell {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }
  .dct-facet__title {
    flex: 0 0 auto;
    font-size: 0.85rem;
    font-weight: 600;
    text-align: center;
    opacity: 0.9;
  }
</style>
