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
  import type { ScalesConfig, AxisValue, Accessor } from '$lib/types/plots/common';

  /**
   * High-level population-pyramid-style chart. Forwards flat rows and the
   * `x`/`y`/`z` accessors straight to {@link PyramidPlot}, which groups them
   * into series and assigns left/right sides automatically from the
   * alphabetical order of `z` values. Pass `scales.z.reverse: true` to flip
   * which side goes first. Delegates all chrome (title, legend, timeline,
   * facets) to {@link Chart}.
   */
  let {
    width,
    height,
    title,
    subtitle,
    caption,
    legend,
    data,
    x: magnitude,
    y: category,
    z: sides,
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
    x: Accessor<TRow, number>;
    y: Accessor<TRow, AxisValue>;
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

  const getMagnitude = $derived(resolveAccessor<TRow>(magnitude));
  const getCategory = $derived(resolveAccessor<TRow>(category));
  const getSides = $derived(resolveAccessor<TRow>(sides));

  // Computed once over the full dataset (not the per-facet/timeline-filtered
  // rows) so the diverging axis and category bands stay comparable across
  // timeline steps/facets — the same reasoning HeatmapChart applies to its
  // colour domain.
  const categoryDomain = $derived([...new Set(data.map((d) => getCategory(d) as AxisValue))]);
  const maxMagnitude = $derived.by(() => {
    const vals = data.map((d) => Math.abs(Number(getMagnitude(d))));
    return vals.length ? Math.max(...vals) : 1;
  });
  // Spread all caller scales first so scales.z (used by PyramidPlot for side
  // assignment) is preserved, then override x/y with the computed domains.
  const resolvedScales = $derived({
    ...scales,
    x: { domain: [-maxMagnitude, maxMagnitude], ...(scales.x ?? {}) },
    y: { domain: categoryDomain, ...(scales.y ?? {}) },
  });
  // A pyramid timeline snapshots one frame per step; interpolation needs to
  // match each bar across steps by its category and z-group, not by the
  // timeline's own time field.
  const timelineConfig = $derived(
    timeline
      ? {
          ...timeline,
          interpolate: resolveTimelineInterpolation(timeline.interpolate, {
            value: magnitude,
            key: (d: TRow) => `${String(getCategory(d))}::${String(getSides(d))}`,
          }),
        }
      : undefined,
  );

  const tip = $derived(resolveTooltip(tooltip, 'y'));
  const hoverEnabled = $derived(tip.enabled || hasHoverMarker(markers));
  const resolvedSync = $derived(resolveHoverSync(tip.enabled ? tip.sync : undefined, markers, 'y'));
  const defaultFormat = $derived(
    (row: TRow) => `${String(getSides(row))}\n${String(getCategory(row))}: ${formatValue(Number(getMagnitude(row)))}`,
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
      x={magnitude}
      y={category}
      z={sides}
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
