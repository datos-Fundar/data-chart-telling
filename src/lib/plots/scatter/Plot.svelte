<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import { buildSeries } from '$lib/utils/grouping';
  import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
  import { disabledDotsOverride } from '$lib/plots/utils/legendDisabled';
  import { buildScatterMarkers } from '$lib/plots/scatter/buildScatterMarkers';
  import { resolveRadiusPaddedDomain } from '$lib/plots/scatter/resolveRadiusPaddedDomain';
  import { createLabelMarginTracker } from '$lib/plots/utils/labelOverflow.svelte';
  import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
  import ValueLabels from '$lib/plots/scatter/ValueLabels.svelte';
  import { hasHoverMarker, resolveHoverStrategy, resolveHoverSync } from '$lib/layout/tooltip/utils';
  import { buildGroupedSeries, validateSegments, buildScopedMarkerGroups } from '$lib/plots/utils/segments';
  import { numericMargin } from '$lib/layout/plot/margins';
  import type { BasePlotProps } from '$lib/types/plots/props';
  import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
  import type { Series } from '$lib/types/plots/data/common';
  import type { ScatterDataProps } from '$lib/types/plots/data/scatter';
  import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
  import type { ScatterSegmentStyle } from '$lib/types/plots/segments/common';
  import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
  import type { LegendDisabledStyle } from '$lib/types/layout/legend';

  /**
   * A point cloud on continuous x/y axes. Accepts either a pre-built `series`
   * array or flat `data/x/y/z` props — mirrors the line/bar plot contract so
   * the chart-level container/timeline/facet/legend wrap it unchanged. `r`
   * gives every dot a per-row radius (bubble sizing), independent of `z`
   * grouping/coloring — see {@link ScatterDataProps} for its auto-scaling
   * behavior.
   */
  type Props = BasePlotProps<
    ScatterDataProps<TData>,
    TData,
    AxisBasedStylesConfig,
    ScatterSegmentStyle,
    AxisBasedMarkersConfig,
    AxisBasedScalesConfig<TData>
  >;

  let {
    width,
    height,
    series,
    data,
    x,
    y,
    z,
    r,
    styles = {},
    segments = {},
    markers = [],
    scales = {},
    margins,
    tooltip = undefined,
  }: Props = $props();

  const resolvedSeries = $derived(series ?? buildSeries(data!, x!, y!, z));
  const legendInteraction = $derived(getLegendInteraction());

  $effect(() => { validateSegments(segments); });

  // A scatter point cloud is discrete (no connecting line), so adjacent
  // segments never need a bridge point at their boundary — see
  // buildGroupedSeries's own doc.
  const groupedSeries = $derived(
    buildGroupedSeries<Series<TData>, ScatterSegmentStyle>(resolvedSeries, segments, false),
  );

  const cfg = $derived(getConfiguration());
  const showVals = $derived(styles.values?.show ?? false);
  const formatValue = $derived(styles.values?.format ?? ((v: number) => `${v}`));
  const hoverIsolate = $derived(styles.values?.hoverIsolate ?? false);

  // A value label hovered while `styles.values.hoverIsolate` is on dims
  // every other series exactly like a legend toggle would — local to this
  // one `<Plot>` instance (not the shared HoverStore) so the gesture can't
  // leak into unrelated tooltip/crosshair behavior.
  let hoverIsolatedSeries = $state<string | null>(null);

  function effectiveDisabledFor(name: string): LegendDisabledStyle | undefined {
    return (
      legendInteraction?.disabledSeries.get(name) ??
      (hoverIsolate && hoverIsolatedSeries && hoverIsolatedSeries !== name
        ? { opacity: cfg.legend.disabledOpacity }
        : undefined)
    );
  }

  const xAcc = $derived(resolveAccessor(resolvedSeries[0]?.x ?? ((d: TData) => d)));
  const yAcc = $derived(resolveAccessor(resolvedSeries[0]?.y ?? ((d: TData) => d)));
  const flat = $derived(resolvedSeries.flatMap((s) => s.data));

  // A legend-disabled series is dimmed on the mark itself, but never surfaces
  // in hover/tooltip — its points are simply absent from the candidate list.
  const hoverPoints = $derived(
    resolvedSeries.flatMap((s, idx) => {
      if (legendInteraction?.disabledSeries.has(s.name)) return [];
      const sx = resolveAccessor(s.x);
      const sy = resolveAccessor(s.y);
      return s.data.map((d) => ({
        x: sx(d) as AxisValue,
        y: Number(sy(d)),
        row: d,
        label: `${sx(d)}, ${sy(d)}`,
        series: s.name,
        color: paletteColor(idx, cfg.palette),
      }));
    }),
  );

  // Points scatter freely across x/y rather than sharing discrete x values —
  // 'punctual' matches the single nearest point, not a whole column.
  const hover = $derived({
    active: tooltip != null || hasHoverMarker(markers),
    points: hoverPoints,
    label: (row: TData) => `${xAcc(row)}, ${yAcc(row)}`,
    strategy: resolveHoverStrategy(tooltip?.strategy, markers, 'punctual'),
    sync: resolveHoverSync(tooltip?.sync, markers),
    tooltip,
  });

  const scatterMarkers = $derived(
    buildScatterMarkers({
      groupedSeries,
      r,
      disabledDotsFor: (name) => disabledDotsOverride(effectiveDisabledFor(name)),
    }),
  );

  const scopedGroups = $derived(
    buildScopedMarkerGroups<TData, Series<TData>, ScatterSegmentStyle>({
      groupedSeries,
      segments,
      colorFor: (_series, seriesIndex) => paletteColor(seriesIndex, cfg.palette),
      segmentColorFor: (style, defaultColor) => style?.dotFill ?? defaultColor,
    }),
  );

  // svelteplot treats a per-row `r` (a field key or accessor function) as a
  // proper channel bound to its own auto sqrt scale — the raw values it
  // returns (e.g. a population in the millions) are data, not pixels, and
  // get compressed into a modest, roughly data-magnitude-independent pixel
  // range regardless of how large the raw numbers are. A literal constant
  // `r` (or the theme/segment `dotRadius` fallback), by contrast, *is*
  // already a literal pixel value. `AUTO_SCALED_RADIUS_ESTIMATE` stands in
  // for whatever svelteplot's own r-scale ends up rendering at, since the
  // real value isn't knowable until that scale is built.
  const AUTO_SCALED_RADIUS_ESTIMATE = 20;

  // The largest radius any dot actually renders at — pads the scale domain
  // below so a point at the data extreme doesn't get its own circle clipped
  // by the frame. svelteplot's own 'auto' margin only measures axis chrome,
  // never mark geometry.
  const maxDotRadius = $derived.by(() => {
    let max = 0;
    for (const marker of scatterMarkers) {
      const rConst = typeof marker.r === 'number' ? marker.r : undefined;
      const isChannel = typeof marker.r === 'function';
      const fallbackR = marker.style?.dotRadius ?? cfg.scatter.dotRadius;
      if (rConst !== undefined) {
        max = Math.max(max, rConst);
      } else if (isChannel) {
        max = Math.max(max, AUTO_SCALED_RADIUS_ESTIMATE);
      } else {
        max = Math.max(max, fallbackR);
      }
    }
    return max;
  });

  // Best-effort pre-render estimate of the plot's own inner content size —
  // the real size isn't known until svelteplot measures its own axis
  // chrome, so this is only used to convert a pixel radius into a domain
  // padding amount, not as the actual rendered margin.
  const estimatedMargins = $derived({ ...cfg.margins, ...margins });
  const estimatedInnerWidth = $derived(
    width - numericMargin('left', estimatedMargins.left) - numericMargin('right', estimatedMargins.right),
  );
  const estimatedInnerHeight = $derived(
    height - numericMargin('top', estimatedMargins.top) - numericMargin('bottom', estimatedMargins.bottom),
  );

  const resolvedScales = $derived.by((): AxisBasedScalesConfig<TData> => {
    if (maxDotRadius <= 0) return scales;
    const xValues = flat.map((d) => Number(xAcc(d)));
    const yValues = flat.map((d) => Number(yAcc(d)));
    const paddedX = scales.x?.domain
      ? undefined
      : resolveRadiusPaddedDomain(xValues, maxDotRadius, estimatedInnerWidth);
    const paddedY = scales.y?.domain
      ? undefined
      : resolveRadiusPaddedDomain(yValues, maxDotRadius, estimatedInnerHeight);
    if (!paddedX && !paddedY) return scales;
    return {
      ...scales,
      x: paddedX ? { ...scales.x, domain: paddedX } : scales.x,
      y: paddedY ? { ...scales.y, domain: paddedY } : scales.y,
    };
  });

  // A scatter point's value label can grow past the plot's own content box
  // (e.g. a point volcado toward a corner, past what its own edge-aware flip
  // can fit) — reserving real space there is what each label's own overflow
  // measurement feeds into here, via a tracker local to this one `<Plot>`
  // instance. See `labelOverflow.svelte.ts`.
  const labelMargin = createLabelMarginTracker(() => margins);
</script>

<BasePlotLayout
  {width}
  {height}
  {styles}
  data={flat}
  getX={xAcc}
  getY={(d) => Number(yAcc(d))}
  {hover}
  scales={resolvedScales}
  margins={labelMargin.resolvedMargins}
  markers={[...scatterMarkers, ...markers]}
  seriesData={resolvedSeries}
  {scopedGroups}
>
  {#if showVals}
    {#each groupedSeries as group (group.series.name)}
      <ValueLabels
        {group}
        {formatValue}
        values={styles.values}
        defaultColor={cfg.axis.color}
        disabled={effectiveDisabledFor(group.series.name)}
        onHoverSeries={hoverIsolate ? () => { hoverIsolatedSeries = group.series.name; } : undefined}
        onHoverEnd={hoverIsolate ? () => { hoverIsolatedSeries = null; } : undefined}
        onOverflow={labelMargin.report}
      />
    {/each}
  {/if}
</BasePlotLayout>
