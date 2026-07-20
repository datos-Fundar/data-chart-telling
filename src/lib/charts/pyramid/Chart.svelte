<script lang="ts" generics="TRow extends Record<string, unknown>">
  import BaseChart from '$lib/charts/BaseChart.svelte';
  import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
  import {
    resolveTooltip,
    resolveHoverStrategy,
    resolveHoverSync,
    hasHoverMarker
  } from '$lib/layout/tooltip/utils';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { resolveTimelineInterpolation } from '$lib/utils/interpolate';
  import type { AxisValue } from '$lib/types/plots/axis';
  import type { Accessor } from '$lib/types/plots/data/common';
  import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
  import type { ChartProps } from '$lib/types/charts/props';

  /**
   * High-level population-pyramid-style chart. Forwards flat rows and the
   * `x`/`y`/`z` accessors straight to {@link PyramidPlot}, which groups them
   * into series and assigns left/right sides automatically from the
   * alphabetical order of `z` values. Pass `scales.z.reverse: true` to flip
   * which side goes first. Delegates all chrome (title, legend, timeline,
   * facets) to {@link BaseChart}.
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
    x: magnitude,
    y: category,
    z: sides,
    styles = {},
    scales = {},
    margins,
    segments,
    markers = [],
    facet,
    timeline,
    tooltip,
  }: ChartProps<TRow, BarSegmentStyle> & { x: Accessor<TRow, number>; z: Accessor<TRow, unknown> } = $props();

  const getMagnitude = $derived(resolveAccessor<TRow>(magnitude));
  const getCategory = $derived(resolveAccessor<TRow>(category));
  const getSides = $derived(resolveAccessor<TRow>(sides));
  const fmtVal = $derived(styles.values?.format ?? ((v: number) => `${v}`));

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
  const resolvedStrategy = $derived(resolveHoverStrategy(tip.enabled ? tip.strategy : undefined, markers, 'y'));
  const resolvedSync = $derived(resolveHoverSync(tip.enabled ? tip.sync : undefined, markers));
  const defaultFormat = $derived(
    (row: TRow) => `${String(getSides(row))}\n${String(getCategory(row))}: ${fmtVal(Number(getMagnitude(row)), String(getSides(row)))}`,
  );
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
  timeline={timelineConfig}
  hover={hoverEnabled ? { strategy: resolvedStrategy, sync: resolvedSync } : undefined}
>
  {#snippet plot({ data: rows, width: w, height: h, facetValue })}
    <PyramidPlot
      width={w}
      height={h}
      data={rows}
      x={magnitude}
      y={category}
      z={sides}
      {styles}
      scales={resolvedScales}
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
</BaseChart>
