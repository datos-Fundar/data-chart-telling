<script module lang="ts">
  export type BarRow = { province: string; category: string; value: number };
  export type LineRow = { province: string; year: number; value: number };

  export const PROVINCES = ['Salta', 'Buenos Aires', 'Ciudad Autónoma de Buenos Aires', 'San Luis', 'Entre Ríos', 'La Rioja'];

  export const barData: BarRow[] = PROVINCES.map((province, i) => ({
    province,
    category: province,
    value: 60 + 8 * Math.sin(i * 1.7) + i * 3,
  }));

  // Wildly different magnitudes across facets, so the numeric Y axis needs a
  // different tick-label width per facet.
  const MAGNITUDES = [5, 500, 5_000, 50_000, 500_000, 5_000_000];
  export const lineData: LineRow[] = PROVINCES.flatMap((province, i) => [
    { province, year: 2016, value: MAGNITUDES[i] * 0.6 },
    { province, year: 2020, value: MAGNITUDES[i] },
  ]);

  /** Exported for the story's docs source override too, see `stories/common/docsSource.ts`. */
  export function truncate(label: unknown): string {
    const s = String(label);
    return s.length > 18 ? `${s.slice(0, 18)}...` : s;
  }
</script>

<script lang="ts">
  import FacetLayout from '$lib/layout/facet/FacetLayout.svelte';
  import BarPlot from '$lib/plots/bar/Plot.svelte';
  import LinePlot from '$lib/plots/line/Plot.svelte';
  import { getConfiguration, configToCssVars, cssVarsStyle } from '$lib/configuration/config.svelte';
  import { estimateCategoricalAxisMargin } from '$lib/plots/utils/categoricalAxisMargin';

  /**
   * `aligned = false`: each facet's own `margins` stays unset, so its plot
   * auto-sizes its own left margin. `aligned = true`: `marginsForFacet`
   * measures every facet's candidate labels and feeds back one shared
   * `margins.left`.
   */
  let {
    kind = 'bar',
    aligned = false,
    width = 900,
    height = 420,
  }: {
    kind?: 'bar' | 'line';
    aligned?: boolean;
    width?: number;
    height?: number;
  } = $props();

  const themeStyle = $derived(cssVarsStyle(configToCssVars(getConfiguration())));
</script>

<div style={themeStyle}>
  {#if kind === 'bar'}
    <FacetLayout
      data={barData}
      by="province"
      columns={3}
      {width}
      {height}
      marginsForFacet={aligned
        ? (rows) => ({ left: estimateCategoricalAxisMargin(rows.map((r) => truncate(r.category))) })
        : undefined}
    >
      {#snippet cell({ facetValue, data: cellData, width: w, height: h, margins })}
        {@const name = String(facetValue)}
        <BarPlot
          width={w}
          height={h}
          series={[{ name, x: 'category', y: 'value', data: cellData }]}
          scales={{ y: { type: 'categorical', tickFormat: truncate } }}
          {margins}
        />
      {/snippet}
    </FacetLayout>
  {:else}
    <FacetLayout
      data={lineData}
      by="province"
      columns={3}
      {width}
      {height}
      marginsForFacet={aligned
        ? (rows) => ({
            left: estimateCategoricalAxisMargin(rows.map((r) => r.value.toLocaleString('en-US'))),
          })
        : undefined}
    >
      {#snippet cell({ facetValue, data: cellData, width: w, height: h, margins })}
        {@const name = String(facetValue)}
        <LinePlot
          width={w}
          height={h}
          series={[{ name, x: 'year', y: 'value', data: cellData }]}
          {margins}
        />
      {/snippet}
    </FacetLayout>
  {/if}
</div>
