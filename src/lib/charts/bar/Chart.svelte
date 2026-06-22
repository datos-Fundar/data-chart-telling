<script lang="ts" generics="TRow extends Record<string, unknown>">
  import Chart from '$lib/charts/Chart.svelte';
  import BarPlot from '$lib/plots/bar/Plot.svelte';
  import { resolveTooltip } from '$lib/layout/tooltip/utils';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import type { TooltipProp } from '$lib/types/layout/tooltip';
  import type {
    FacetConfig,
    TimelineConfig,
  } from '$lib/types/charts/common';
  import type { LegendSection } from '$lib/types/charts/legend';
  import type { BarSegmentStyle, SegmentsMap } from '$lib/types/plots/styles';
  import type { XValue, YValue, Accessor } from '$lib/types/plots/common';

  /**
   * High-level bar chart. Groups flat rows by `z` into one series per group
   * and delegates all chrome to {@link Chart}. Styling lives entirely in
   * `segments` — there's no separate colour shorthand, so a series' look is
   * always defined in one place.
   */
  let {
    width,
    height,
    title,
    subtitle,
    caption,
    legend,
    data,
    x,
    y,
    z,
    segments,
    facet,
    timeline,
    tooltip,
  }: {
    width: number;
    height: number;
    title?: string;
    subtitle?: string;
    caption?: string;
    legend?: LegendSection[];
    data: TRow[];
    x: Accessor<TRow, XValue>;
    y: Accessor<TRow, YValue>;
    /** Grouping dimension: one series per distinct value. */
    z?: Accessor<TRow, unknown>;
    /** Per-group range styling, keyed by the group (`z`) value. */
    segments?: SegmentsMap<BarSegmentStyle>;
    facet?: FacetConfig<TRow>;
    timeline?: TimelineConfig<TRow>;
    /** Enable hover tooltips. `true` for defaults, or `{ sync, format }`. */
    tooltip?: TooltipProp<TRow>;
  } = $props();

  const tip = $derived(resolveTooltip(tooltip, 'x'));
  const getX = $derived(resolveAccessor<TRow>(x));
  const getY = $derived(resolveAccessor<TRow>(y));
  const defaultFormat = $derived((row: TRow) => `${String(getX(row))}: ${getY(row)}`);
</script>

<Chart
  {width}
  {height}
  {title}
  {subtitle}
  {caption}
  {legend}
  {data}
  {facet}
  {timeline}
  tooltip={tip.enabled ? { sync: tip.sync } : undefined}
>
  {#snippet plot({ data: rows, width: w, height: h, facetValue })}
    <BarPlot
      width={w}
      height={h}
      data={rows}
      {x}
      {y}
      {z}
      {segments}
      tooltip={tip.enabled
        ? { format: tip.format ?? defaultFormat, facetId: facetValue ?? '', sync: tip.sync }
        : undefined}
    />
  {/snippet}
</Chart>
