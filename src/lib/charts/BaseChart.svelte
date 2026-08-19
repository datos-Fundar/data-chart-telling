<script lang="ts" generics="TRow extends Record<string, unknown>">
  import ChartContainer from '$lib/charts/container/ChartContainer.svelte';
  import TimelineLayout from '$lib/layout/timeline/TimelineLayout.svelte';
  import FacetLayout from '$lib/layout/facet/FacetLayout.svelte';
  import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { provideHover } from '$lib/layout/tooltip/hover.svelte';
  import { provideLegendInteraction } from '$lib/layout/legend/interaction.svelte';
  import type { Snippet } from 'svelte';
  import type { LegendSection } from '$lib/types/layout/legend';
  import type { HoverStrategy } from '$lib/types/layout/tooltip';
  import type { ChartPlotSnippet } from '$lib/types/charts/common';
  import type { FacetConfig } from '$lib/types/layout/facet';
  import type { TimeValue, TimelineConfig } from '$lib/types/layout/timeline';

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
    header,
    footer,
    data,
    facet,
    timeline,
    hover,
    plot,
  }: {
    width: number;
    height: number;
    title?: string;
    subtitle?: string;
    caption?: string;
    legend?: LegendSection[];
    header?: Snippet;
    footer?: Snippet;
    data: TRow[];
    facet?: FacetConfig<TRow>;
    timeline?: TimelineConfig<TRow>;
    hover?: { strategy: HoverStrategy; sync: boolean };
    plot: ChartPlotSnippet<TRow>;
  } = $props();

  const cfg = $derived(getConfiguration());

  const hoverStore = provideHover();
  const legendInteraction = provideLegendInteraction();
  const legendPlotContext = $derived({
    disabledSeries: new Set(legendInteraction.disabledSeries.keys()),
    isDisabled: (name: string) => legendInteraction.disabledSeries.has(name),
  });
  $effect(() => {
    hoverStore.strategy = hover?.strategy ?? 'x';
    hoverStore.sync = hover?.sync ?? false;
  });
</script>

{#snippet body(rows: TRow[], w: number, h: number, selectedValue: TimeValue | undefined)}
  {#if facet}
    <FacetLayout
      data={rows}
      by={facet.by}
      columns={facet.columns}
      values={facet.values}
      gap={facet.gap}
      mode={facet.mode}
      visible={facet.visible}
      pageSize={facet.pageSize}
      navLayout={facet.navLayout}
      formatIndicator={facet.formatIndicator}
      indicator={facet.indicator}
      navButton={facet.navButton}
      width={w}
      height={h}
    >
      {#snippet cell({ facetValue, data: cellData, width: cw, height: ch })}
        {@render plot({
          data: cellData,
          width: cw,
          height: ch,
          facetValue,
          selectedValue,
          legend: legendPlotContext
        })}
      {/snippet}
    </FacetLayout>
  {:else}
    {@render plot({ data: rows, width: w, height: h, selectedValue, legend: legendPlotContext })}
  {/if}
{/snippet}

{#snippet legendSnippet()}
  {#if legend && legend.length > 0}
    <LegendLayout sections={legend} />
  {/if}
{/snippet}

<ChartContainer
  {width}
  {height}
  {title}
  {subtitle}
  {caption}
  {header}
  {footer}
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
        show={timeline.show}
        thickness={timeline.thickness ?? cfg.timeline.thickness}
        filterMode={timeline.filterMode}
        interpolate={typeof timeline.interpolate === 'object' ? timeline.interpolate : undefined}
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
