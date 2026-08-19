<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import { buildSeries } from '$lib/utils/grouping';
  import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
  import { disabledStrokeOverride, disabledDotsOverride } from '$lib/plots/utils/legendDisabled';
  import { buildLineMarkers } from '$lib/plots/line/buildLineMarkers';
  import { buildGapMarkers } from '$lib/plots/line/buildGapMarkers';
  import { isGapValue } from '$lib/plots/utils/gaps';
  import { createLabelMarginTracker } from '$lib/plots/utils/labelOverflow.svelte';
  import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
  import ValueLabels from '$lib/plots/line/ValueLabels.svelte';
  import { hasHoverMarker, resolveHoverStrategy, resolveHoverSync } from '$lib/layout/tooltip/utils';
  import { buildGroupedSeries, validateSegments, buildScopedMarkerGroups } from '$lib/plots/utils/segments';
  import type { BasePlotProps } from '$lib/types/plots/props';
  import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
  import type { Series, SeriesProps, DataProps } from '$lib/types/plots/data/common';
  import type { GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
  import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
  import type { LineMarkersConfig } from '$lib/types/markers/line';
  import type { LegendDisabledStyle } from '$lib/types/layout/legend';

  type Props = BasePlotProps<
    SeriesProps<TData> | DataProps<TData>,
    TData,
    GapsAwarePlotStylesConfig<LineSegmentStyle>,
    LineSegmentStyle,
    LineMarkersConfig,
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
    styles = {},
    segments = {},
    markers = [],
    scales = {},
    margins,
    tooltip = undefined,
  }: Props = $props();

  // Fills leading/internal/trailing missing-data holes with an
  // interpolated, distinctly-styled bridge, resolved per series like
  // `segments` — see `GapsAwarePlotStylesConfig` (`types/layout/styles.ts`).
  const gaps = $derived(styles.gaps ?? {});

  const resolvedSeries = $derived(series ?? buildSeries(data!, x!, y!, z));
  const legendInteraction = $derived(getLegendInteraction());

  $effect(() => { validateSegments(segments); });

  const groupedSeries = $derived(
    buildGroupedSeries<Series<TData>, LineSegmentStyle>(resolvedSeries, segments),
  );

  const cfg = $derived(getConfiguration());
  const showVals = $derived(styles.values?.show ?? false);
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
  // A gap row (see `gaps`) is excluded the same way — it carries no real
  // value to hover.
  const hoverPoints = $derived(
    resolvedSeries.flatMap((s, idx) => {
      if (legendInteraction?.disabledSeries.has(s.name)) return [];
      const sx = resolveAccessor(s.x);
      const sy = resolveAccessor(s.y);
      return s.data
        .filter((d) => !isGapValue(sy(d)))
        .map((d) => ({
          x: sx(d) as AxisValue,
          y: Number(sy(d)),
          row: d,
          label: String(sy(d)),
          series: s.name,
          color: paletteColor(idx, cfg.palette),
        }));
    }),
  );

  // Last *real* data point per series (skipping any trailing gap row), with
  // its palette index for colour.
  const lastPoints = $derived(
    resolvedSeries
      .map((s, idx) => {
        const sy = resolveAccessor(s.y);
        const lastRow = [...s.data].reverse().find((d) => !isGapValue(sy(d)));
        return { series: s, lastRow, seriesIndex: idx };
      })
      .filter((p): p is { series: Series<TData>; lastRow: TData; seriesIndex: number } => p.lastRow !== undefined),
  );

  const hover = $derived({
    active: tooltip != null || hasHoverMarker(markers),
    points: hoverPoints,
    label: (r: TData) => String(yAcc(r)),
    strategy: resolveHoverStrategy(tooltip?.strategy, markers, 'x'),
    sync: resolveHoverSync(tooltip?.sync, markers),
    tooltip,
  });

  const lineMarkers = $derived(
    buildLineMarkers({
      groupedSeries,
      disabledStrokeFor: (name) => disabledStrokeOverride(effectiveDisabledFor(name)),
      disabledDotsFor: (name) => disabledDotsOverride(effectiveDisabledFor(name)),
    }),
  );

  const gapMarkers = $derived(
    buildGapMarkers<TData>({
      seriesList: resolvedSeries,
      gaps,
      colorFor: (seriesIndex) => paletteColor(seriesIndex, cfg.palette),
    }),
  );

  const scopedGroups = $derived(
    buildScopedMarkerGroups<TData, Series<TData>, LineSegmentStyle>({
      groupedSeries,
      segments,
      colorFor: (_series, seriesIndex) => paletteColor(seriesIndex, cfg.palette),
      segmentColorFor: (style, defaultColor) => style?.stroke?.stroke ?? defaultColor,
    }),
  );

  // End-of-line labels can grow past the plot's own content box, into its
  // margin — reserving real space there (rather than padding the domain,
  // which would falsely imply data exists past the last real point) is
  // what ValueLabels's own overflow measurement feeds into here, via a
  // tracker local to this one `<Plot>` instance — see ValueLabels.svelte's
  // own doc comment for why that locality (vs. svelteplot's shared margin
  // context) matters.
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
  {scales}
  {...labelMargin.plotProps}
  xTickRotate={scales?.x?.tickRotate}
  markers={[...gapMarkers, ...lineMarkers, ...markers]}
  seriesData={resolvedSeries}
  {scopedGroups}
>
  {#snippet children({ numericMargins })}
    {#if showVals}
      <ValueLabels
        {lastPoints}
        values={styles.values}
        {width}
        {height}
        {numericMargins}
        onOverflow={labelMargin.report}
        disabledFor={effectiveDisabledFor}
        onHoverSeries={hoverIsolate ? (name) => { hoverIsolatedSeries = name; } : undefined}
        onHoverEnd={hoverIsolate ? () => { hoverIsolatedSeries = null; } : undefined}
      />
    {/if}
  {/snippet}
</BasePlotLayout>
