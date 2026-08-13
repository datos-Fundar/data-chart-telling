<script lang="ts" generics="TRow extends Record<string, unknown>">
  import BaseChart from '$lib/charts/BaseChart.svelte';
  import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
  import {
    resolveTooltip,
    resolveHoverStrategy,
    resolveHoverSync,
    hasHoverMarker
  } from '$lib/layout/tooltip/utils';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import type { Accessor } from '$lib/types/plots/data/common';
  import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
  import type { CellSegmentStyle } from '$lib/types/plots/segments/common';
  import type { ChartProps } from '$lib/types/charts/props';

  /**
   * High-level heatmap. Proves the chart chrome (container/legend/timeline/facet)
   * is plot-agnostic: it reuses {@link BaseChart} exactly like {@link LineChart}, only
   * swapping the leaf for {@link HeatmapPlot}. The colour domain is computed once
   * over the full dataset so cells stay comparable across timeline steps/facets —
   * it is passed via `scales.z.domain` and can be overridden by the caller.
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
    segments = {},
    scales = {},
    margins,
    markers = [],
    facet,
    timeline,
    tooltip,
  }: ChartProps<TRow, CellSegmentStyle> & { z: Accessor<TRow, number> } = $props();

  const getX = $derived(resolveAccessor<TRow>(x));
  const getY = $derived(resolveAccessor<TRow>(y));
  const getZ = $derived(resolveAccessor<TRow>(z));
  const fmtVal = $derived(styles.values?.format ?? ((v: number) => `${v}`));

  // Compute domain over the full dataset so colour is comparable across facets/timeline steps.
  // Caller-provided `scales.z.domain` always takes precedence.
  const fullDomain = $derived.by((): [number, number] => {
    const vals = data.map((d) => Number(getZ(d)));
    return vals.length ? [Math.min(...vals, 0), Math.max(...vals)] : [0, 1];
  });
  const mergedScales = $derived<AxisBasedScalesConfig<TRow>>({
    ...scales,
    z: { domain: fullDomain, ...(scales.z ?? {}) },
  });

  const tip = $derived(resolveTooltip(tooltip, 'punctual'));
  const hoverEnabled = $derived(tip.enabled || hasHoverMarker(markers));
  const resolvedStrategy = $derived(resolveHoverStrategy(tip.enabled ? tip.strategy : undefined, markers, 'punctual'));
  const resolvedSync = $derived(resolveHoverSync(tip.enabled ? tip.sync : undefined, markers));
  const defaultFormat = $derived((row: TRow) => {
    const xl = scales.x?.label || 'x';
    const yl = scales.y?.label || 'y';
    return `${xl} ${getX(row)} · ${yl} ${getY(row)}\n${fmtVal(Number(getZ(row)), '')}`;
  });
</script>

<BaseChart
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
  {timeline}
  hover={hoverEnabled ? { strategy: resolvedStrategy, sync: resolvedSync } : undefined}
>
  {#snippet plot({ data: rows, width: w, height: h, facetValue })}
    <HeatmapPlot
      width={w}
      height={h}
      data={rows}
      {x}
      {y}
      {z}
      {styles}
      {segments}
      scales={mergedScales}
      {margins}
      {markers}
      tooltip={tip.enabled
        ? {
            format: tip.format ?? defaultFormat,
            facetId: facetValue ?? '',
            strategy: tip.strategy,
            sync: tip.sync,
            series: tip.series,
            content: tip.content,
            anchorX: tip.anchorX,
            anchorY: tip.anchorY,
          }
        : undefined}
    />
  {/snippet}
</BaseChart>
