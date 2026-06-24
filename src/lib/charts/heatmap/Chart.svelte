<script lang="ts" generics="TRow extends Record<string, unknown>">
  import Chart from '$lib/charts/Chart.svelte';
  import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
  import type { TooltipProp } from '$lib/types/layout/tooltip';
  import { resolveTooltip, resolveHoverSync, hasHoverMarker } from '$lib/layout/tooltip/utils';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import type {
    FacetConfig,
    TimelineConfig,
  } from '$lib/types/charts/common';
  import type { LegendSection } from '$lib/types/charts/legend';
  import type { Marker } from '$lib/types/plots/markers';
  import type { ScalesConfig, AxisValue, Accessor } from '$lib/types/plots/common';

  /**
   * High-level heatmap. Proves the chart chrome (container/legend/timeline/facet)
   * is plot-agnostic: it reuses {@link Chart} exactly like {@link LineChart}, only
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
    data,
    x,
    y,
    z,
    colorMin,
    colorMax,
    scales = {},
    showValues = true,
    formatValue = (v: number) => `${v}`,
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
    z: Accessor<TRow, number>;
    colorMin?: string;
    colorMax?: string;
    scales?: ScalesConfig;
    showValues?: boolean;
    formatValue?: (v: number) => string;
    markers?: Marker[];
    facet?: FacetConfig<TRow>;
    timeline?: TimelineConfig<TRow>;
    tooltip?: TooltipProp<TRow>;
  } = $props();

  const getX = $derived(resolveAccessor<TRow>(x));
  const getY = $derived(resolveAccessor<TRow>(y));
  const getZ = $derived(resolveAccessor<TRow>(z));

  // Compute domain over the full dataset so colour is comparable across facets/timeline steps.
  // Caller-provided `scales.z.domain` always takes precedence.
  const fullDomain = $derived.by((): [number, number] => {
    const vals = data.map((d) => Number(getZ(d)));
    return vals.length ? [Math.min(...vals, 0), Math.max(...vals)] : [0, 1];
  });
  const mergedScales = $derived<ScalesConfig>({
    ...scales,
    z: { domain: fullDomain, ...(scales.z ?? {}) },
  });

  // Heatmap hover defaults to `xy` sync — the same single cell across facets.
  const tip = $derived(resolveTooltip(tooltip, 'xy'));
  const hoverEnabled = $derived(tip.enabled || hasHoverMarker(markers));
  const resolvedSync = $derived(resolveHoverSync(tip.enabled ? tip.sync : undefined, markers, 'xy'));
  const defaultFormat = $derived((row: TRow) => {
    const xl = scales.x?.label || 'x';
    const yl = scales.y?.label || 'y';
    return `${xl} ${getX(row)} · ${yl} ${getY(row)}\n${formatValue(Number(getZ(row)))}`;
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
  {timeline}
  hover={hoverEnabled ? { sync: resolvedSync } : undefined}
>
  {#snippet plot({ data: rows, width: w, height: h, facetValue })}
    <HeatmapPlot
      width={w}
      height={h}
      data={rows}
      {x}
      {y}
      {z}
      {colorMin}
      {colorMax}
      scales={mergedScales}
      {showValues}
      {formatValue}
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
