<script lang="ts" generics="TData extends Record<string, unknown>">
  import { SvelteMap } from 'svelte/reactivity';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import { buildSeries } from '$lib/utils/grouping';
  import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
  import { disabledFillOverride } from '$lib/plots/utils/legendDisabled';
  import { buildPyramidBarMarkers } from '$lib/plots/pyramid/buildPyramidBarMarkers';
  import { buildGroupedSeries, validateSegments, resolveSegmentsForSeries, matchesSegmentX, getDataForSegments } from '$lib/plots/utils/segments';
  import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
  import AxisLayout from '$lib/layout/plot/AxisLayout.svelte';
  import GridLayout from '$lib/layout/plot/GridLayout.svelte';
  import GeometryLayout from '$lib/layout/plot/GeometryLayout.svelte';
  import HoverMarker from '$lib/markers/HoverMarker.svelte';
  import ValueLabels from '$lib/plots/pyramid/ValueLabels.svelte';
  import { hasHoverMarker, resolveHoverStrategy, resolveHoverSync } from '$lib/layout/tooltip/utils';
  import type { BasePlotProps } from '$lib/types/plots/props';
  import type { AxisValue } from '$lib/types/plots/axis';
  import type { Series, SeriesProps, DataProps } from '$lib/types/plots/data/common';
  import type { AxisBasedScalesConfig } from '$lib/types/plots/props';
  import type { BasePlotStyles } from '$lib/types/plots/styles/common';
  import type { ValueAnchor } from '$lib/types/plots/constants';
  import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
  import type { Marker } from '$lib/types/markers/common';

  /**
   * A population-pyramid-style diverging bar chart: each series is mirrored
   * left or right of a shared zero baseline along a categorical band axis.
   * Mirrors the bar/line plot contract — series in, marks out — so the
   * chart-level container/timeline/facet/legend wrap it unchanged. Like
   * `LinePlot`/`BarPlot`, accepts either pre-built `series` or flat `data` +
   * `x`/`y`/`z` accessors.
   *
   * Side assignment is automatic: series names are sorted alphabetically and
   * the first goes left, the second right. Pass `scales.z.reverse: true` to
   * flip the order.
   */

  type PyramidSide = 'left' | 'right';
  type InternalSeries = Series<TData> & { side: PyramidSide };

  type Props = BasePlotProps<
    SeriesProps<TData> | DataProps<TData>,
    TData,
    BasePlotStyles,
    BarSegmentStyle,
    Marker,
    AxisBasedScalesConfig<TData>
  >;

  let {
    width,
    height,
    series,
    data,
    x: magnitude,
    y: category,
    z: sides,
    styles = {},
    scales = {},
    margins,
    segments = {},
    markers = [],
    tooltip = undefined,
  }: Props = $props();

  $effect(() => { validateSegments(segments); });

  const cfg = $derived(getConfiguration());
  const legendInteraction = $derived(getLegendInteraction());
  const leftColor = $derived(styles.colors?.left ?? paletteColor(0, cfg.palette));
  const rightColor = $derived(styles.colors?.right ?? paletteColor(1, cfg.palette));
  const showVals = $derived(styles.values?.show ?? false);
  const fmtVal = $derived(styles.values?.format ?? ((v: number) => `${v}`));
  const valAnchor = $derived<ValueAnchor>(styles.values?.anchor ?? 'outside');

  // Sort series names alphabetically; even index → left, odd → right.
  // scales.z.reverse flips the assignment so the second name goes left.
  const zReversed = $derived(scales.z?.reverse ?? false);
  const resolvedSeries = $derived.by((): InternalSeries[] => {
    const base: Series<TData>[] = series ?? buildSeries(data!, category!, magnitude!, sides);
    const sortedNames = [...base.map((s) => s.name)].sort((a, b) => a.localeCompare(b));
    return base.map((s) => {
      const idx = sortedNames.indexOf(s.name);
      const side: PyramidSide = (idx % 2 === 0) !== zReversed ? 'left' : 'right';
      return { ...s, side };
    });
  });

  const groupedSeries = $derived(
    // connect: false — bars are discrete; there's no visual gap between
    // adjacent categories to bridge (see buildGroupedSeries's own doc).
    buildGroupedSeries<InternalSeries, BarSegmentStyle>(resolvedSeries, segments, false),
  );

  function signedValue(s: InternalSeries, d: TData): number {
    const v = Math.abs(Number(resolveAccessor(s.y)(d)));
    return s.side === 'left' ? -v : v;
  }

  // svelteplot's `Pointer` rebuilds its quadtree from shallow-cloned rows
  // (`{ ...d }`), never the original references, so a row's owning series
  // can't be recovered by identity once hover is active. Pre-compute
  // everything `getX`/`getY`/`labelFor` need as plain enumerable properties —
  // they survive the clone automatically.
  type TaggedRow = TData & {
    __side: string;
    __x: number;
    __y: AxisValue;
    __label: string;
    __series: string;
  };

  const flat = $derived.by((): TaggedRow[] =>
    resolvedSeries.flatMap((s) => {
      const getCategory = resolveAccessor(s.x);
      const getMagnitude = resolveAccessor(s.y);
      return s.data.map((d) => {
        const v = Math.abs(Number(getMagnitude(d)));
        return {
          ...d,
          __side: s.side,
          __x: s.side === 'left' ? -v : v,
          __y: getCategory(d) as AxisValue,
          __label: fmtVal(v, s.name),
          __series: s.name,
        } as TaggedRow;
      });
    }),
  );

  const getX = (d: TaggedRow) => d.__x;
  const getY = (d: TaggedRow) => d.__y;
  const labelFor = (d: TaggedRow) => d.__label;

  // A legend-disabled series is dimmed on the bar itself, but never surfaces
  // in hover/tooltip — its points are simply absent from the candidate list.
  const hoverPoints = $derived(
    flat
      .filter((d) => !legendInteraction?.disabledSeries.has(d.__series))
      .map((d) => ({
        x: d.__x,
        y: d.__y,
        row: d,
        label: d.__label,
        series: d.__series,
        color: d.__side === 'left' ? leftColor : rightColor,
      })),
  );

  const yDomain = $derived([
    ...new Set(
      resolvedSeries.flatMap((s) => {
        const getCategory = resolveAccessor(s.x);
        return s.data.map((d) => getCategory(d) as AxisValue);
      }),
    ),
  ]);

  const maxMagnitude = $derived.by(() => {
    const vals = resolvedSeries.flatMap((s) => {
      const getMagnitude = resolveAccessor(s.y);
      return s.data.map((d) => Math.abs(Number(getMagnitude(d))));
    });
    return vals.length ? Math.max(...vals) : 1;
  });

  const seriesMarkers = $derived.by(() => {
    const map = new SvelteMap<string, Marker[]>();
    for (const marker of markers) {
      if ((marker.type === 'component' || marker.type === 'hover') && marker.series) {
        if (!map.has(marker.series)) map.set(marker.series, []);
        map.get(marker.series)!.push(marker);
      }
    }
    return map;
  });

  // The single, fully-resolved scales object BasePlotLayout reads for
  // everything (ticks, grid, sort, and the real svelteplot scale) — avoids
  // keeping a second, separately-defaulted copy of `scales.x`/`scales.y`
  // (our own diverging-domain + band-scale defaults) out of sync with the
  // one actually forwarded.
  const resolvedScales = $derived<AxisBasedScalesConfig<TData>>({
    ...scales,
    x: {
      domain: [-maxMagnitude, maxMagnitude],
      tickFormat: (v: unknown) => fmtVal(Math.abs(Number(v)), ''),
      ...(scales.x ?? {}),
    },
    y: { type: 'band', padding: 0.2, domain: yDomain, ...(scales.y ?? {}) },
  });

  const hover = $derived({
    active: tooltip != null || hasHoverMarker(markers),
    points: hoverPoints,
    label: labelFor,
    strategy: resolveHoverStrategy(tooltip?.strategy, markers, 'y'),
    sync: resolveHoverSync(tooltip?.sync, markers),
    tooltip,
  });

  const pyramidMarkers = $derived(
    buildPyramidBarMarkers({
      groupedSeries,
      valueFor: signedValue,
      colorFor: (s) => (s.side === 'left' ? leftColor : rightColor),
      disabledFillFor: (name) => disabledFillOverride(legendInteraction?.disabledSeries.get(name)),
    }),
  );
</script>

<BasePlotLayout
  {width}
  {height}
  data={flat}
  {getX}
  {getY}
  {hover}
  scales={resolvedScales}
  {margins}
  xTickRotate={resolvedScales?.x?.tickRotate}
>
  {#snippet children({ matchedPoints, activePoint, impliesCrosshairX, impliesCrosshairY, numericMargins })}
  <AxisLayout data={flat} {getX} {getY} {width} {height} {numericMargins} scales={resolvedScales} />
  <GridLayout scales={resolvedScales} />
  <GeometryLayout markers={[...pyramidMarkers, ...markers]} seriesData={resolvedSeries} {matchedPoints} {activePoint} {impliesCrosshairX} {impliesCrosshairY}>
    {#each groupedSeries as group (group.series.name)}
      {@const defaultColor = group.series.side === 'left' ? leftColor : rightColor}
      {@const getCategory = resolveAccessor(group.series.x)}

      {#if showVals}
        <ValueLabels {group} {valAnchor} {fmtVal} values={styles.values} axisColor={cfg.axis.color} />
      {/if}

      {#each seriesMarkers.get(group.series.name) ?? [] as marker, i (`series-${group.series.name}-${marker.type}-${i}`)}
        {#if marker.type === 'component'}
          {#if marker.scope === 'segment'}
            {@const segs = resolveSegmentsForSeries(segments, group.series.name)}
            {@const segmentDataArrays = getDataForSegments(group.series.data, getCategory, segs)}
            {#each segmentDataArrays as segmentData, segIdx (`${group.series.name}-marker-segment-${segIdx}`)}
              {#if segmentData.length > 0}
                {@const segmentColor = segs[segIdx]?.style?.fill ?? defaultColor}
                <marker.component
                  {...marker.props}
                  series={group.series.name}
                  data={segmentData}
                  seriesColor={segmentColor}
                />
              {/if}
            {/each}
          {:else}
            {@const segs = resolveSegmentsForSeries(segments, group.series.name)}
            {@const seriesColor = segs[0]?.style?.fill ?? defaultColor}
            <marker.component
              {...marker.props}
              series={group.series.name}
              data={group.series.data}
              seriesColor={seriesColor}
            />
          {/if}
        {:else if marker.type === 'hover'}
          {@const seriesPoints = matchedPoints.filter((p) => p.series === group.series.name)}
          {#if marker.scope === 'segment'}
            {@const segs = resolveSegmentsForSeries(segments, group.series.name)}
            {#each segs as seg, segIdx (`${group.series.name}-hover-segment-${segIdx}`)}
              {@const segPoints = seriesPoints.filter((p) => matchesSegmentX(p.x, seg))}
              {#if segPoints.length > 0}
                <HoverMarker
                  {marker}
                  data={segPoints}
                  activePoint={segPoints[0] ?? null}
                  {impliesCrosshairX}
                  {impliesCrosshairY}
                  seriesColor={seg.style?.fill ?? defaultColor}
                />
              {/if}
            {/each}
          {:else}
            {@const segs = resolveSegmentsForSeries(segments, group.series.name)}
            <HoverMarker
              {marker}
              data={seriesPoints}
              activePoint={seriesPoints[0] ?? null}
              {impliesCrosshairX}
              {impliesCrosshairY}
              seriesColor={segs[0]?.style?.fill ?? defaultColor}
            />
          {/if}
        {/if}
      {/each}
    {/each}
  </GeometryLayout>
  {/snippet}
</BasePlotLayout>
