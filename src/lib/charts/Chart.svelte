<script lang="ts" generics="TRow extends Record<string, unknown>">
  import ChartContainer from '$lib/charts/container/ChartContainer.svelte';
  import TimelineLayout from '$lib/charts/timeline/TimelineLayout.svelte';
  import FacetGrid from '$lib/charts/facet/FacetGrid.svelte';
  import Legend from '$lib/charts/legend/Legend.svelte';
  import { getConfiguration } from '$lib/charts/config.svelte';
  import { provideHover } from '$lib/charts/hover.svelte';
  import type { LegendSection } from '$lib/types/charts/legend';
  import type { TooltipSync } from '$lib/types/charts/tooltip';
  import type {
    ChartPlotSnippet,
    FacetConfig,
    TimeValue,
    TimelineConfig,
  } from '$lib/types/charts/common';

  /**
   * The orchestrator. It wires together the four interchangeable layout
   * primitives — container, timeline, facet, legend — around a single leaf
   * `plot` snippet. The composition order is fixed and meaningful:
   *
   *   container ▸ timeline (one shared scrubber) ▸ facet (split per small-multiple) ▸ plot
   *
   * The leaf snippet receives `{ data, width, height, facetValue?, selectedValue? }`
   * and knows nothing about how that box or that data slice was produced, which
   * is what lets any plot (line, bar, heatmap, …) drop in unchanged.
   */
  let {
    width,
    height,
    title,
    subtitle,
    caption,
    legend,
    data,
    facet,
    timeline,
    tooltip,
    plot,
  }: {
    width: number;
    height: number;
    title?: string;
    subtitle?: string;
    caption?: string;
    legend?: LegendSection[];
    data: TRow[];
    facet?: FacetConfig<TRow>;
    timeline?: TimelineConfig<TRow>;
    /** Cross-facet tooltip sync mode; the hover store is shared by all facets. */
    tooltip?: { sync?: TooltipSync };
    plot: ChartPlotSnippet<TRow>;
  } = $props();

  const cfg = $derived(getConfiguration());

  // One shared hover store for every facet, so a hover in one syncs to the rest.
  const hoverStore = provideHover();
  $effect(() => {
    hoverStore.sync = tooltip?.sync ?? 'none';
  });
</script>

<!--
  Leaf renderer: facet when configured, otherwise a single full-box plot.
  `selectedValue` is threaded through so faceted small-multiples share the
  timeline's current step.
-->
{#snippet body(rows: TRow[], w: number, h: number, selectedValue: TimeValue | undefined)}
  {#if facet}
    <FacetGrid
      data={rows}
      by={facet.by}
      columns={facet.columns}
      values={facet.values}
      gap={facet.gap}
      width={w}
      height={h}
    >
      {#snippet cell({ facetValue, data: cellData, width: cw, height: ch })}
        {@render plot({ data: cellData, width: cw, height: ch, facetValue, selectedValue })}
      {/snippet}
    </FacetGrid>
  {:else}
    {@render plot({ data: rows, width: w, height: h, selectedValue })}
  {/if}
{/snippet}

{#snippet legendSnippet()}
  {#if legend && legend.length > 0}
    <Legend sections={legend} />
  {/if}
{/snippet}

<ChartContainer
  {width}
  {height}
  {title}
  {subtitle}
  {caption}
  legend={legend && legend.length > 0 ? legendSnippet : undefined}
>
  {#snippet plot({ width: w, height: h })}
    {#if timeline}
      <TimelineLayout
        {data}
        accessor={timeline.accessor}
        progress={timeline.progress}
        values={timeline.values}
        orientation={timeline.orientation}
        thickness={timeline.thickness ?? cfg.timeline.thickness}
        width={w}
        height={h}
      >
        {#snippet child({ selectedValue, data: tData, width: tw, height: th })}
          {@render body(tData, tw, th, selectedValue)}
        {/snippet}
      </TimelineLayout>
    {:else}
      {@render body(data, w, h, undefined)}
    {/if}
  {/snippet}
</ChartContainer>
