<script lang="ts" generics="TRow extends Record<string, unknown>">
  import Chart from '$lib/charts/Chart.svelte';
  import LinePlot from '$lib/plots/line/Plot.svelte';
  import {
    resolveTooltip,
    resolveHoverSync,
    hasHoverMarker
  } from '$lib/layout/tooltip/utils';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { resolveTimelineInterpolation } from '$lib/utils/interpolate';
  import type { LineSegmentStyle } from '$lib/types/plots/styles';
  import type { ChartProps } from '$lib/types/charts/props';

  /**
   * High-level line chart. It takes flat rows plus `x`/`y`/`z` encodings, groups
   * by `z` into one line per group, and hands the result to {@link LinePlot}.
   * Everything chrome-related (title, legend, timeline, facets) is delegated to
   * {@link Chart}; this component only owns the flat-data → line-series adaption.
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
    styles = {},
    segments,
    markers = [],
    scales = {},
    margins,
    facet,
    timeline,
    tooltip,
  }: ChartProps<TRow, LineSegmentStyle> = $props();

  // A line should grow into its full extent over time, not snap to a single
  // year's point — so default to a cumulative reveal unless the caller wants
  // the bar/heatmap-style exact-step snapshot instead.
  const timelineConfig = $derived(
    timeline
      ? {
          ...timeline,
          filterMode: timeline.filterMode ?? 'upTo',
          interpolate: resolveTimelineInterpolation(timeline.interpolate, { value: y, key: z }),
        }
      : undefined,
  );

  const tip = $derived(resolveTooltip(tooltip, 'x'));
  const hoverEnabled = $derived(tip.enabled || hasHoverMarker(markers));
  const resolvedSync = $derived(resolveHoverSync(tip.enabled ? tip.sync : undefined, markers, 'x'));
  const getX = $derived(resolveAccessor<TRow>(x));
  const getY = $derived(resolveAccessor<TRow>(y));
  const getZ = $derived(z ? resolveAccessor<TRow>(z) : null);
  const fmtX = (v: unknown) => (v instanceof Date ? v.toLocaleDateString() : String(v));
  const defaultFormat = $derived((row: TRow) => {
    const group = getZ ? `${getZ(row)}\n` : '';
    return `${group}${fmtX(getX(row))}: ${getY(row)}`;
  });
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
    <LinePlot
      width={w}
      height={h}
      data={rows}
      {x}
      {y}
      {z}
      {styles}
      {segments}
      {markers}
      {scales}
      {margins}
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
