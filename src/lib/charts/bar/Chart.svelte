<script lang="ts" generics="TRow extends Record<string, unknown>">
  import Chart from '$lib/charts/Chart.svelte';
  import BarPlot from '$lib/plots/bar/Plot.svelte';
  import { resolveTooltip, resolveHoverSync, hasHoverMarker } from '$lib/layout/tooltip/utils';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { resolveTimelineInterpolation } from '$lib/utils/interpolate';
  import type { TooltipProp } from '$lib/types/layout/tooltip';
  import type {
    FacetConfig,
    TimelineConfig,
  } from '$lib/types/charts/common';
  import type { LegendSection } from '$lib/types/charts/legend';
  import type { BarSegmentStyle, SegmentsMap } from '$lib/types/plots/styles';
  import type { Marker } from '$lib/types/plots/markers';
  import type { AxisValue, Accessor } from '$lib/types/plots/common';

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
    x: Accessor<TRow, AxisValue>;
    y: Accessor<TRow, AxisValue>;
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
  const getZ = $derived(z ? resolveAccessor<TRow>(z) : null);
  const defaultFormat = $derived((row: TRow) => `${String(getX(row))}: ${getY(row)}`);

  // A bar timeline snapshots one frame per step; interpolation needs to match
  // each bar across steps by its category (`x`) — and by `z` too, when the
  // chart groups categories into series — not by the timeline's own time field.
  const timelineConfig = $derived(
    timeline
      ? {
          ...timeline,
          interpolate: resolveTimelineInterpolation(timeline.interpolate, {
            value: y,
            key: getZ ? (d: TRow) => `${String(getX(d))}::${String(getZ(d))}` : x,
          }),
        }
      : undefined,
  );
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
  timeline={timelineConfig}
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
