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
  import ValueLabels from '$lib/plots/line/ValueLabels.svelte';
  import { hasHoverMarker, resolveHoverStrategy, resolveHoverSync } from '$lib/layout/tooltip/utils';
  import { buildGroupedSeries, validateSegments, buildScopedMarkerGroups } from '$lib/plots/utils/segments';
  import type { BasePlotProps } from '$lib/types/plots/props';
  import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
  import type { Series, SeriesProps, DataProps } from '$lib/types/plots/data/common';
  import type { BasePlotStylesConfig } from '$lib/types/layout/styles';
  import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
  import type { LineMarkersConfig } from '$lib/types/markers/line';

  type Props = BasePlotProps<
    SeriesProps<TData> | DataProps<TData>,
    TData,
    BasePlotStylesConfig,
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

  // End-of-line labels can grow past the plot's own content box, into its
  // margin — reserving real space there (rather than padding the domain,
  // which would falsely imply data exists past the last real point) is
  // what ValueLabels's own overflow measurement feeds into here. Grown
  // monotonically (never shrunk) from that real `getBBox()` measurement:
  // once the real overflow reaches ~0 (the margin now fits it), reporting
  // that same value again is a no-op (`Math.max` of an unchanged value),
  // which is what keeps this converging instead of oscillating between
  // "shrink margin → overflow reappears → grow margin → …". Local to this
  // one `<Plot>` instance — see ValueLabels.svelte's own doc comment for
  // why that locality (vs. svelteplot's shared margin context) matters.
  let measuredLabelMargin = $state({ left: 0, right: 0 });

  function handleLabelOverflow(overflow: { left: number; right: number }) {
    const left = Math.max(measuredLabelMargin.left, overflow.left);
    const right = Math.max(measuredLabelMargin.right, overflow.right);
    if (left !== measuredLabelMargin.left || right !== measuredLabelMargin.right) {
      measuredLabelMargin = { left, right };
    }
  }

  const resolvedMargins = $derived.by(() => {
    if (measuredLabelMargin.left <= 0 && measuredLabelMargin.right <= 0) return margins;
    const out = { ...margins };
    if (measuredLabelMargin.right > 0 && margins?.right === undefined) out.right = measuredLabelMargin.right;
    if (measuredLabelMargin.left > 0 && margins?.left === undefined) out.left = measuredLabelMargin.left;
    return out;
  });
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
  margins={resolvedMargins}
  xTickRotate={scales?.x?.tickRotate}
  markers={[...lineMarkers, ...markers]}
  seriesData={resolvedSeries}
  {scopedGroups}
>
  {#if showVals}
    <ValueLabels {lastPoints} values={styles.values} onOverflow={handleLabelOverflow} />
  {/if}
</BasePlotLayout>
