<script lang="ts" generics="TRow extends Record<string, unknown>">
  import Chart from '$lib/charts/Chart.svelte';
  import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
  import { resolveTooltip, resolveHoverSync, hasHoverMarker } from '$lib/layout/tooltip/utils';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { resolveTimelineInterpolation } from '$lib/utils/interpolate';
  import type { TooltipProp } from '$lib/types/layout/tooltip';
  import type { FacetConfig, TimelineConfig } from '$lib/types/charts/common';
  import type { LegendSection } from '$lib/types/charts/legend';
  import type { BarSegmentStyle, SegmentsMap } from '$lib/types/plots/styles';
  import type { Marker } from '$lib/types/plots/markers';
  import type { ScalesConfig, XValue, Accessor } from '$lib/types/plots/common';
  import type { PyramidSide } from '$lib/types/plots/pyramid';

  /**
   * High-level population-pyramid-style chart. Forwards flat rows and the
   * `y`/`x`/`side`/`z` accessors straight to {@link PyramidPlot}, which groups
   * them into series itself, and delegates all chrome (title, legend, timeline,
   * facets) to {@link Chart} — mirroring how {@link BarChart}/{@link LineChart}
   * adapt flat rows for their plot.
   */
  let {
    width,
    height,
    title,
    subtitle,
    caption,
    legend,
    data,
    y,
    x,
    side,
    z,
    colorLeft,
    colorRight,
    scales = {},
    showValues = false,
    formatValue = (v: number) => `${v}`,
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
    /** Category bands, e.g. age group — rendered on the Y axis. */
    y: Accessor<TRow, XValue>;
    /** Magnitude, always given positive — mirrored left or right by `side`. */
    x: Accessor<TRow, number>;
    /** Maps each `z` group value to the half it is drawn on. */
    side: Record<string, PyramidSide>;
    /** Groups rows into one series per value, e.g. by sex. */
    z: Accessor<TRow, unknown>;
    colorLeft?: string;
    colorRight?: string;
    scales?: ScalesConfig;
    showValues?: boolean;
    formatValue?: (v: number) => string;
    segments?: SegmentsMap<BarSegmentStyle>;
    markers?: Marker[];
    facet?: FacetConfig<TRow>;
    timeline?: TimelineConfig<TRow>;
    tooltip?: TooltipProp<TRow>;
  } = $props();

  const getY = $derived(resolveAccessor<TRow>(y));
  const getX = $derived(resolveAccessor<TRow>(x));
  const getZ = $derived(resolveAccessor<TRow>(z));

  // Computed once over the full dataset (not the per-facet/timeline-filtered
  // rows) so the diverging axis and category bands stay comparable across
  // timeline steps/facets — the same reasoning HeatmapChart applies to its
  // colour domain.
  const categoryDomain = $derived([...new Set(data.map((d) => getY(d) as XValue))]);
  const maxMagnitude = $derived.by(() => {
    const vals = data.map((d) => Math.abs(Number(getX(d))));
    return vals.length ? Math.max(...vals) : 1;
  });
  // Merge full-dataset domains into scales so each facet/timeline step keeps
  // the same axis range. User-supplied scales.x/y.domain overrides these.
  const resolvedScales = $derived({
    x: { domain: [-maxMagnitude, maxMagnitude], ...(scales.x ?? {}) },
    y: { domain: categoryDomain, ...(scales.y ?? {}) },
  });
  // A pyramid timeline snapshots one frame per step; interpolation needs to
  // match each bar across steps by its category and side, not by the
  // timeline's own time field.
  const timelineConfig = $derived(
    timeline
      ? {
          ...timeline,
          interpolate: resolveTimelineInterpolation(timeline.interpolate, {
            value: x,
            key: (d: TRow) => `${String(getY(d))}::${String(getZ(d))}`,
          }),
        }
      : undefined,
  );

  const tip = $derived(resolveTooltip(tooltip, 'y'));
  const hoverEnabled = $derived(tip.enabled || hasHoverMarker(markers));
  const resolvedSync = $derived(resolveHoverSync(tip.enabled ? tip.sync : undefined, markers, 'y'));
  const defaultFormat = $derived(
    (row: TRow) => `${String(getZ(row))}\n${String(getY(row))}: ${formatValue(Number(getX(row)))}`,
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
    <PyramidPlot
      width={w}
      height={h}
      data={rows}
      {y}
      {x}
      {side}
      {z}
      {colorLeft}
      {colorRight}
      scales={resolvedScales}
      {showValues}
      {formatValue}
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
