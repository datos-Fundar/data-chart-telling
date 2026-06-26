<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { SvelteMap } from 'svelte/reactivity';
  import { Line, Dot, Text } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import { buildSeries } from '$lib/utils/grouping';
  import PlotLayout from '$lib/layout/plot/PlotLayout.svelte';
  import HoverMarker from '$lib/plots/markers/HoverMarker.svelte';
  import { buildGroupedSeries, validateSegments, resolveSegmentsForSeries, matchesSegmentX, getDataForSegments } from '$lib/plots/utils/segments';
  import type { PlotProps } from '$lib/types/plots/props';
  import type { Series, AxisValue } from '$lib/types/plots/common';
  import type { LineSegmentStyle, ValueAnchor } from '$lib/types/plots/styles';
  import type { Marker } from '$lib/types/plots/markers';

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
  }: PlotProps<TData, LineSegmentStyle> = $props();

  const resolvedSeries = $derived(series ?? buildSeries(data!, x!, y!, z));

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
  const fmtVal = $derived(
    styles.values?.format ?? ((v: number, name: string) => `${name} - ${v}`),
  );
  const valAnchor = $derived<ValueAnchor>(styles.values?.anchor ?? 'start');

  const xAcc = $derived(resolveAccessor(resolvedSeries[0]?.x ?? ((d: TData) => d)));
  const yAcc = $derived(resolveAccessor(resolvedSeries[0]?.y ?? ((d: TData) => d)));
  const flat = $derived(resolvedSeries.flatMap((s) => s.data));
  const hoverPoints = $derived(
    resolvedSeries.flatMap((s, idx) => {
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
</script>

<PlotLayout
  {width}
  {height}
  x={scales.x}
  y={scales.y}
  data={flat}
  getX={xAcc}
  getY={(d) => Number(yAcc(d))}
  {hoverPoints}
  label={(r) => String(yAcc(r))}
  {tooltip}
  {markers}
  seriesData={resolvedSeries}
  {scales}
  {margins}
  defaultStrategy="x"
>
  {#snippet children({ matchedPoints, ruleX, ruleY, impliesRuleX, impliesRuleY })}
  {#each groupedSeries as group, seriesIndex (group.series.name)}
    {@const defaultColor = paletteColor(seriesIndex, cfg.palette)}
    {#each group.visualSegments as seg, i (`${group.series.name}-${i}`)}
      {@const strokeStyle = seg.style.stroke}
      {@const lineData = seg.data as unknown as Record<string | symbol, never>[]}
      <Line
        data={lineData}
        x={resolveAccessor(group.series.x)}
        y={resolveAccessor(group.series.y)}
        stroke={strokeStyle?.stroke ?? defaultColor}
        strokeWidth={strokeStyle?.strokeWidth ?? cfg.line.strokeWidth}
        strokeOpacity={strokeStyle?.strokeOpacity ?? 1}
        strokeDasharray={strokeStyle?.strokeDasharray}
        strokeLinejoin={strokeStyle?.strokeLinejoin}
        strokeLinecap={strokeStyle?.strokeLinecap}
      />
      {#if seg.style.dots}
        {@const dotStyle = seg.style.dots}
        <Dot
          data={seg.data}
          x={resolveAccessor(group.series.x)}
          y={resolveAccessor(group.series.y)}
          r={dotStyle.dotRadius ?? cfg.line.dotRadius}
          fill={dotStyle.dotFill ?? strokeStyle?.stroke ?? defaultColor}
          symbol={dotStyle.dotSymbol ?? 'circle'}
          stroke={dotStyle.dotStroke ?? strokeStyle?.stroke ?? defaultColor}
          strokeWidth={dotStyle.dotStrokeWidth ?? 1}
          fillOpacity={dotStyle.dotFillOpacity ?? strokeStyle?.strokeOpacity ?? 1}
          strokeOpacity={dotStyle.dotStrokeOpacity ?? strokeStyle?.strokeOpacity ?? 1}
          strokeDasharray={dotStyle.dotStrokeDasharray}
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
              />
            {/if}
          {/each}
        {:else}
          <HoverMarker
            data={seriesPoints}
            ruleX={marker.ruleX !== false && (impliesRuleX || marker.ruleX === true) ? ruleX : null}
            ruleY={marker.ruleY !== false && (impliesRuleY || marker.ruleY === true) ? ruleY : null}
            showLabels={marker.showLabels}
            ruleStyle={marker.ruleStyle}
            dotStyle={marker.dotStyle}
            fontStyle={marker.fontStyle}
          />
        {/if}
      {/if}
    {/each}
  {/each}

  {#if showVals}
    {@const defaultDx = valAnchor === 'start' ? 6 : valAnchor === 'end' ? -6 : 0}
    {@const defaultDy = valAnchor === 'outside' ? -8 : 0}
    {@const defaultTA = valAnchor === 'start'
      ? ('start' as const)
      : valAnchor === 'end'
      ? ('end' as const)
      : ('middle' as const)}
    {@const defaultLA = valAnchor === 'outside'
      ? ('bottom' as const)
      : ('middle' as const)}
    {#each lastPoints as { series: s, lastRow, seriesIndex } (s.name)}
      {@const xFn = resolveAccessor(s.x)}
      {@const yFn = resolveAccessor(s.y)}
      {@const seriesColor = paletteColor(seriesIndex, cfg.palette)}
      <Text
        data={[lastRow]}
        x={xFn}
        y={yFn}
        text={() => fmtVal(Number(yFn(lastRow)), s.name)}
        dx={styles.values?.dx ?? defaultDx}
        dy={styles.values?.dy ?? defaultDy}
        textAnchor={styles.values?.textAnchor ?? defaultTA}
        lineAnchor={styles.values?.lineAnchor ?? defaultLA}
        lineHeight={styles.values?.lineHeight}
        rotate={styles.values?.rotate}
        class={styles.values?.class}
        textClass={styles.values?.textClass}
        fill={seriesColor}
        fontSize={12}
      />
    {/each}
  {/if}
  {/snippet}
</PlotLayout>
