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
  import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
  import ScalesLayout from '$lib/layout/scales/ScalesLayout.svelte';
  import GeometryLayout from '$lib/layout/geometry/GeometryLayout.svelte';
  import ValueLabels from '$lib/plots/line/ValueLabels.svelte';
  import { hasHoverMarker, resolveHoverStrategy, resolveHoverSync } from '$lib/layout/tooltip/utils';
  import { buildGroupedSeries, validateSegments, buildScopedMarkerGroups } from '$lib/plots/utils/segments';
  import type { BasePlotProps } from '$lib/types/plots/props';
  import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
  import type { Series, SeriesProps, DataProps } from '$lib/types/plots/data/common';
  import type { BasePlotStyles } from '$lib/types/plots/styles/common';
  import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
  import type { Marker } from '$lib/types/markers/common';

  type Props = BasePlotProps<
    SeriesProps<TData> | DataProps<TData>,
    TData,
    BasePlotStyles,
    LineSegmentStyle,
    Marker,
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

  const resolvedSeries = $derived(series ?? buildSeries(data!, x!, y!, z));
  const legendInteraction = $derived(getLegendInteraction());

  $effect(() => { validateSegments(segments); });

  const groupedSeries = $derived(
    buildGroupedSeries<Series<TData>, LineSegmentStyle>(resolvedSeries, segments),
  );

  const cfg = $derived(getConfiguration());
  const showVals = $derived(styles.values?.show ?? false);

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
        label: String(sy(d)),
        series: s.name,
        color: paletteColor(idx, cfg.palette),
      }));
    }),
  );

  // Last data point per series, with its palette index for colour.
  const lastPoints = $derived(
    resolvedSeries
      .map((s, idx) => ({ series: s, lastRow: s.data[s.data.length - 1], seriesIndex: idx }))
      .filter(({ lastRow }) => lastRow !== undefined),
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
      disabledStrokeFor: (name) => disabledStrokeOverride(legendInteraction?.disabledSeries.get(name)),
      disabledDotsFor: (name) => disabledDotsOverride(legendInteraction?.disabledSeries.get(name)),
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
</script>

<BasePlotLayout
  {width}
  {height}
  data={flat}
  getX={xAcc}
  getY={(d) => Number(yAcc(d))}
  {hover}
  {scales}
  {margins}
  xTickRotate={scales?.x?.tickRotate}
>
  {#snippet children({ matchedPoints, activePoint, impliesCrosshairX, impliesCrosshairY, numericMargins })}
  <ScalesLayout data={flat} getX={xAcc} getY={(d) => Number(yAcc(d))} {width} {height} {numericMargins} {scales} />
  <GeometryLayout markers={[...lineMarkers, ...markers]} seriesData={resolvedSeries} {scopedGroups} {matchedPoints} {activePoint} {impliesCrosshairX} {impliesCrosshairY}>
  {#if showVals}
    <ValueLabels {lastPoints} values={styles.values} />
  {/if}
  </GeometryLayout>
  {/snippet}
</BasePlotLayout>
