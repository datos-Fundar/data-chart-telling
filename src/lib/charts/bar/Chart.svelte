<script lang="ts" generics="TRow extends Record<string, unknown>">
  import Chart from '$lib/charts/Chart.svelte';
  import BarPlot from '$lib/plots/bar/Plot.svelte';
  import { resolveTooltip, resolveHoverSync, hasHoverMarker } from '$lib/layout/tooltip/utils';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import type { TooltipProp } from '$lib/types/layout/tooltip';
  import type {
    FacetConfig,
    TimelineConfig,
  } from '$lib/types/charts/common';
  import type { LegendSection } from '$lib/types/charts/legend';
  import type { BarSegmentStyle, SegmentsMap } from '$lib/types/plots/styles';
  import type { Marker } from '$lib/types/plots/markers';
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
    markers = [],
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
    z?: Accessor<TRow, unknown>;
    segments?: SegmentsMap<BarSegmentStyle>;
    markers?: Marker[];
    facet?: FacetConfig<TRow>;
    timeline?: TimelineConfig<TRow>;
    tooltip?: TooltipProp<TRow>;
  } = $props();

  const tip = $derived(resolveTooltip(tooltip, 'x'));
  const hoverEnabled = $derived(tip.enabled || hasHoverMarker(markers));
  const resolvedSync = $derived(resolveHoverSync(tip.enabled ? tip.sync : undefined, markers, 'x'));
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
  hover={hoverEnabled ? { sync: resolvedSync } : undefined}
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
      {markers}
      tooltip={tip.enabled
        ? {
            format: tip.format ?? defaultFormat,
            facetId: facetValue ?? '',
            sync: tip.sync,
            series: tip.series,
            content: tip.content,
          }
        : undefined}
    />
  {/snippet}
</Chart>
