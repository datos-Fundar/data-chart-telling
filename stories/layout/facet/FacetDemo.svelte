<script lang="ts">
  import FacetLayout from '$lib/layout/facet/FacetLayout.svelte';
  import BarPlot from '$lib/plots/bar/Plot.svelte';
  import type { FacetColumns } from '$lib/types/charts/common';

  /**
   * `FacetLayout` is data/plot-agnostic: it just splits rows by `by`, lays the
   * groups out in a grid and hands each one its measured box via the `cell`
   * snippet. This wrapper exists only because that snippet can't be expressed
   * in a plain `.stories.ts` args object — the grid/group shape itself
   * (`groupCount` + `columns`) is fully controlled by story args.
   */
  let {
    groupCount,
    columns,
    width = 720,
    height = 480,
  }: {
    groupCount: number;
    columns: FacetColumns;
    width?: number;
    height?: number;
  } = $props();

  type Row = { group: string; category: string; value: number };

  const CATEGORIES = ['A', 'B', 'C', 'D'];
  const GROUP_NAMES = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const PALETTE = ['#4f46e5', '#e6580d', '#16a34a', '#dc2626', '#0891b2', '#9333ea', '#ca8a04', '#db2777'];

  const data = $derived.by((): Row[] => {
    const names = GROUP_NAMES.slice(0, groupCount);
    return names.flatMap((group, gi) =>
      CATEGORIES.map((category, ci) => ({
        group: `Grupo ${group}`,
        category,
        value: Math.round(30 + 15 * Math.sin(gi * 1.3 + ci) + 15),
      })),
    );
  });
</script>

<FacetLayout {data} by="group" {columns} {width} {height}>
  {#snippet cell({ facetValue, data: cellData, width: w, height: h })}
    {@const name = String(facetValue)}
    <BarPlot
      width={w}
      height={h}
      series={[{ name, x: 'category', y: 'value', data: cellData }]}
      segments={{
        [name]: [{ style: { fill: PALETTE[GROUP_NAMES.indexOf(name.replace('Grupo ', '')) % PALETTE.length] } }],
      }}
    />
  {/snippet}
</FacetLayout>
