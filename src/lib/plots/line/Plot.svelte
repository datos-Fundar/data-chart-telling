<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { SvelteMap } from 'svelte/reactivity';
  import { Line, Dot } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import { buildSeries } from '$lib/utils/grouping';
  import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
  import { disabledStrokeOverride, disabledDotsOverride } from '$lib/plots/utils/legendDisabled';
  import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
  import AxisLayout from '$lib/layout/plot/AxisLayout.svelte';
  import GridLayout from '$lib/layout/plot/GridLayout.svelte';
  import RuleLayout from '$lib/layout/plot/RuleLayout.svelte';
  import HoverMarker from '$lib/markers/HoverMarker.svelte';
  import ValueLabels from '$lib/plots/line/ValueLabels.svelte';
  import { hasHoverMarker, resolveHoverStrategy, resolveHoverSync } from '$lib/layout/tooltip/utils';
  import { buildGroupedSeries, validateSegments, resolveSegmentsForSeries, matchesSegmentX, getDataForSegments } from '$lib/plots/utils/segments';
  import type { BasePlotProps } from '$lib/types/plots/props';
  import type { AxisValue } from '$lib/types/plots/axis';
  import type { Series, SeriesProps, DataProps } from '$lib/types/plots/data/common';
  import type { AxisBasedScalesConfig } from '$lib/types/plots/props';
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
  {#snippet children({ matchedPoints, ruleX, ruleY, impliesRuleX, impliesRuleY, numericMargins })}
  <AxisLayout data={flat} getX={xAcc} getY={(d) => Number(yAcc(d))} {width} {height} {numericMargins} {scales} />
  <GridLayout {scales} />
  <RuleLayout {markers} seriesData={resolvedSeries} {matchedPoints} {ruleX} {ruleY} {impliesRuleX} {impliesRuleY}>
  {#each groupedSeries as group, seriesIndex (group.series.name)}
    {@const defaultColor = paletteColor(seriesIndex, cfg.palette)}
    {@const disabledOverride = legendInteraction?.disabledSeries.get(group.series.name)}
    {@const disabledStroke = disabledStrokeOverride(disabledOverride)}
    {@const disabledDots = disabledDotsOverride(disabledOverride)}
    {#each group.visualSegments as seg, i (`${group.series.name}-${i}`)}
      {@const strokeStyle = seg.style.stroke}
      {@const lineData = seg.data as unknown as Record<string | symbol, never>[]}
      <Line
        data={lineData}
        x={resolveAccessor(group.series.x)}
        y={resolveAccessor(group.series.y)}
        stroke={disabledStroke?.stroke ?? strokeStyle?.stroke ?? defaultColor}
        strokeWidth={disabledStroke?.strokeWidth ?? strokeStyle?.strokeWidth ?? cfg.line.strokeWidth}
        strokeOpacity={disabledStroke?.strokeOpacity ?? strokeStyle?.strokeOpacity ?? 1}
        strokeDasharray={disabledStroke?.strokeDasharray ?? strokeStyle?.strokeDasharray}
        strokeLinejoin={disabledStroke?.strokeLinejoin ?? strokeStyle?.strokeLinejoin}
        strokeLinecap={disabledStroke?.strokeLinecap ?? strokeStyle?.strokeLinecap}
      />
      {#if seg.style.dots}
        {@const dotStyle = seg.style.dots}
        <Dot
          data={seg.data}
          x={resolveAccessor(group.series.x)}
          y={resolveAccessor(group.series.y)}
          r={disabledDots?.dotRadius ?? dotStyle.dotRadius ?? cfg.line.dotRadius}
          fill={disabledDots?.dotFill ?? dotStyle.dotFill ?? strokeStyle?.stroke ?? defaultColor}
          symbol={disabledDots?.dotSymbol ?? dotStyle.dotSymbol ?? 'circle'}
          stroke={disabledDots?.dotStroke ?? dotStyle.dotStroke ?? strokeStyle?.stroke ?? defaultColor}
          strokeWidth={disabledDots?.dotStrokeWidth ?? dotStyle.dotStrokeWidth ?? 1}
          fillOpacity={disabledDots?.dotFillOpacity ?? dotStyle.dotFillOpacity ?? strokeStyle?.strokeOpacity ?? 1}
          strokeOpacity={disabledDots?.dotStrokeOpacity ?? dotStyle.dotStrokeOpacity ?? strokeStyle?.strokeOpacity ?? 1}
          strokeDasharray={disabledDots?.dotStrokeDasharray ?? dotStyle.dotStrokeDasharray}
        />
      {/if}
    {/each}

    {#each seriesMarkers.get(group.series.name) ?? [] as marker, i (`series-${group.series.name}-${marker.type}-${i}`)}
      {#if marker.type === 'component'}
        {#if marker.scope === 'segment'}
          {@const segs = resolveSegmentsForSeries(segments, group.series.name)}
          {@const xAccessor = resolveAccessor(group.series.x)}
          {@const segmentDataArrays = getDataForSegments(group.series.data, xAccessor, segs)}
          {#each segmentDataArrays as segmentData, segIdx (`${group.series.name}-marker-segment-${segIdx}`)}
            {#if segmentData.length > 0}
              {@const segmentColor = segs[segIdx]?.style?.stroke?.stroke ?? defaultColor}
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
          {@const seriesColor = segs[0]?.style?.stroke?.stroke ?? defaultColor}
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
                data={segPoints}
                ruleX={marker.ruleX !== false && (impliesRuleX || marker.ruleX === true) ? ruleX : null}
                ruleY={marker.ruleY !== false && (impliesRuleY || marker.ruleY === true) ? ruleY : null}
                showLabels={marker.showLabels}
                ruleStyle={marker.ruleStyle}
                dotStyle={marker.dotStyle}
                fontStyle={marker.fontStyle}
                seriesColor={seg.style?.stroke?.stroke ?? defaultColor}
              />
            {/if}
          {/each}
        {:else}
          {@const segs = resolveSegmentsForSeries(segments, group.series.name)}
          <HoverMarker
            data={seriesPoints}
            ruleX={marker.ruleX !== false && (impliesRuleX || marker.ruleX === true) ? ruleX : null}
            ruleY={marker.ruleY !== false && (impliesRuleY || marker.ruleY === true) ? ruleY : null}
            showLabels={marker.showLabels}
            ruleStyle={marker.ruleStyle}
            dotStyle={marker.dotStyle}
            fontStyle={marker.fontStyle}
            seriesColor={segs[0]?.style?.stroke?.stroke ?? defaultColor}
          />
        {/if}
      {/if}
    {/each}
  {/each}

  {#if showVals}
    <ValueLabels {lastPoints} values={styles.values} />
  {/if}
  </RuleLayout>
  {/snippet}
</BasePlotLayout>
