<script lang="ts" generics="TRow extends Record<string, unknown>">
  import Chart from '$lib/charts/Chart.svelte';
  import BarPlot from '$lib/plots/bar/Plot.svelte';
  import {
    resolveTooltip,
    resolveHoverStrategy,
    resolveHoverSync,
    hasHoverMarker
  } from '$lib/layout/tooltip/utils';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { resolveTimelineInterpolation } from '$lib/utils/interpolate';
  import type { BarSegmentStyle } from '$lib/types/plots/styles';
  import type { ChartProps } from '$lib/types/charts/props';

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
    header,
    footer,
    data,
    x,
    y,
    z,
    styles = {},
    scales = {},
    margins,
    segments,
    markers = [],
    facet,
    timeline,
    tooltip,
  }: ChartProps<TRow, BarSegmentStyle> = $props();

  const tip = $derived(resolveTooltip(tooltip, 'x'));
  const hoverEnabled = $derived(tip.enabled || hasHoverMarker(markers));
  const resolvedStrategy = $derived(resolveHoverStrategy(tip.enabled ? tip.strategy : undefined, markers, 'x'));
  const resolvedSync = $derived(resolveHoverSync(tip.enabled ? tip.sync : undefined, markers));
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
  {header}
  {footer}
  {data}
  {facet}
  timeline={timelineConfig}
  hover={hoverEnabled ? { strategy: resolvedStrategy, sync: resolvedSync } : undefined}
>
  {#snippet plot({ data: rows, width: w, height: h, facetValue })}
    <BarPlot
      width={w}
      height={h}
      data={rows}
      {x}
      {y}
      {z}
      {styles}
      {scales}
      {margins}
      {segments}
      {markers}
      tooltip={tip.enabled
        ? {
            format: tip.format ?? defaultFormat,
            facetId: facetValue ?? '',
            strategy: tip.strategy,
            sync: tip.sync,
            series: tip.series,
            content: tip.content,
          }
        : undefined}
    />
  {/snippet}
</Chart>
