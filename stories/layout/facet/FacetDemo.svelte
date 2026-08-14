<script lang="ts">
  import FacetLayout from '$lib/layout/facet/FacetLayout.svelte';
  import BarPlot from '$lib/plots/bar/Plot.svelte';
  import { getConfiguration, configToCssVars, cssVarsStyle } from '$lib/configuration/config.svelte';
  import type { FacetColumns, FacetMode, Responsive } from '$lib/types/layout/facet';

  /**
   * `FacetLayout` is data/plot-agnostic: it just splits rows by `by`, hands
   * each group its measured box via the `cell` snippet, and arranges them per
   * `mode`. This wrapper exists only because that snippet can't be expressed
   * in a plain `.stories.ts` args object — the shape itself (`groupCount` +
   * `columns`/`mode`/`visible`/`pageSize`) is fully controlled by story args.
   *
   * Always renders from the live global configuration (see `themeStyle`
   * below) — a story that wants a themed variant calls `setConfiguration`
   * itself rather than this component branching on a flag.
   * `customIndicator`/`customNavButton` exercise the other two ways to
   * restyle the indicator badge and pagination buttons: a custom `indicator`
   * snippet and a custom `navButton` snippet.
   */
  let {
    groupCount,
    columns,
    mode = 'grid',
    visible = 1,
    pageSize,
    customIndicator = false,
    customNavButton = false,
    width = 720,
    height = 480,
  }: {
    groupCount: number;
    columns: FacetColumns;
    mode?: Responsive<FacetMode>;
    visible?: number;
    pageSize?: number;
    customIndicator?: boolean;
    customNavButton?: boolean;
    width?: number;
    height?: number;
  } = $props();

  type Row = { group: string; category: string; value: number };

  const CATEGORIES = ['A', 'B', 'C', 'D'];
  const GROUP_NAMES = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

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

  // FacetLayout is used bare here (no BaseChart/ChartContainer around it), so
  // stamp the `--dct-*` vars ourselves — normally ChartContainer does this.
  const themeStyle = $derived(cssVarsStyle(configToCssVars(getConfiguration())));
</script>

<div style={themeStyle}>
  <FacetLayout
    {data}
    by="group"
    {columns}
    {mode}
    {visible}
    {pageSize}
    {width}
    {height}
    indicator={customIndicator ? indicatorSnippet : undefined}
    navButton={customNavButton ? navSnippet : undefined}
  >
    {#snippet cell({ facetValue, data: cellData, width: w, height: h })}
      {@const name = String(facetValue)}
      <BarPlot
        width={w}
        height={h}
        series={[{ name, x: 'category', y: 'value', data: cellData }]}
      />
    {/snippet}
  </FacetLayout>
</div>

{#snippet indicatorSnippet({ current, total }: { current: number; total: number })}
  <div class="demo-indicator">★ {current} de {total}</div>
{/snippet}

{#snippet navSnippet({
  direction,
  disabled,
  onclick,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onclick: () => void;
})}
  <button type="button" class="demo-nav" {disabled} {onclick}>
    {direction === 'prev' ? '◀ Prev' : 'Next ▶'}
  </button>
{/snippet}

<style>
  .demo-indicator {
    padding: 0.2rem 0.6rem;
    border-radius: 0.25rem;
    background: #16a34a;
    color: #fff;
    font-size: 0.8rem;
    font-weight: 600;
  }
  .demo-nav {
    padding: 0.3rem 0.7rem;
    border: none;
    border-radius: 0.25rem;
    background: #16a34a;
    color: #fff;
    font-size: 0.8rem;
    cursor: pointer;
  }
  .demo-nav:disabled {
    opacity: 0.35;
    cursor: default;
  }
</style>
