<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { SvelteMap } from 'svelte/reactivity';
  import { Line, Dot, AxisX, AxisY } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import { buildSeries } from '$lib/utils/grouping';
  import PlotLayout from '$lib/layout/plot/PlotLayout.svelte';
  import HoverMarker from '$lib/plots/markers/HoverMarker.svelte';
  import { buildGroupedSeries, validateSegments } from '$lib/plots/utils/segments';
  import type { Series, SeriesProps, DataProps, ScalesConfig } from '$lib/types/plots/common';
  import type { LineSegmentStyle, SegmentsMap } from '$lib/types/plots/styles';
  import type { XValue } from '$lib/types/plots/common';
  import type { Marker } from '$lib/types/plots/markers';
  import type { TooltipRuntime } from '$lib/types/layout/tooltip';

  let {
    width,
    height,
    series,
    data,
    x,
    y,
    z,
    segments = {},
    markers = [],
    scales = {},
    tooltip = undefined,
  }: (SeriesProps<TData> | DataProps<TData>) & {
    width: number;
    height: number;
    segments?: SegmentsMap;
    markers?: Marker[];
    scales?: ScalesConfig;
    tooltip?: TooltipRuntime<TData>;
  } = $props();

  const resolvedSeries = $derived(series ?? buildSeries(data!, x!, y!, z));

  $effect(() => {
    if (Object.keys(segments).length > 0) validateSegments(segments);
  });

  const groupedSeries = $derived(
    buildGroupedSeries<Series<TData>, LineSegmentStyle>(resolvedSeries, segments),
  );

  const getSegmentData = (data: TData[], xAccessor: (d: TData) => XValue, segmentRanges: { from?: XValue; to?: XValue }[]) => {
    return segmentRanges.map(range =>
      data.filter(d => {
        const x = xAccessor(d);
        const inRange = (!range.from || x >= range.from) && (!range.to || x <= range.to);
        return inRange;
      })
    );
  };

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

  const xAcc = $derived(resolveAccessor(resolvedSeries[0]?.x ?? ((d: TData) => d)));
  const yAcc = $derived(resolveAccessor(resolvedSeries[0]?.y ?? ((d: TData) => d)));
  const flat = $derived(resolvedSeries.flatMap((s) => s.data));
  const hoverPoints = $derived(
    resolvedSeries.flatMap((s) => {
      const sx = resolveAccessor(s.x);
      const sy = resolveAccessor(s.y);
      return s.data.map((d) => ({
        x: sx(d) as XValue,
        y: Number(sy(d)),
        row: d,
        label: String(sy(d)),
        series: s.name,
      }));
    }),
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
>
  {#snippet children({ matchedPoints, ruleX, ruleY })}
  <AxisX tickSize={cfg.axis.tickSize} tickPadding={cfg.axis.tickPadding} tickFontSize={cfg.axis.fontSize} />
  <AxisY tickSize={0} tickPadding={cfg.axis.tickPadding} tickFontSize={cfg.axis.fontSize} />

  {#each groupedSeries as group, seriesIndex (group.series.name)}
    {@const defaultColor = paletteColor(seriesIndex, cfg.palette)}
    {#each group.visualSegments as seg, i (`${group.series.name}-${i}`)}
      {@const strokeStyle = seg.style.stroke}
      <Line
        data={seg.data}
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
        {#if marker.strategy === 'segment'}
          {@const segmentRanges = segments[group.series.name] ?? []}
          {@const xAccessor = resolveAccessor(group.series.x)}
          {@const segmentDataArrays = getSegmentData(group.series.data, xAccessor, segmentRanges)}
          {#each segmentDataArrays as segmentData, segIdx (`${group.series.name}-marker-segment-${segIdx}`)}
            {#if segmentData.length > 0}
              {@const segmentColor = segmentRanges[segIdx]?.style?.stroke?.stroke ?? defaultColor}
              <marker.component
                {...marker.props}
                series={group.series.name}
                data={segmentData}
                seriesColor={segmentColor}
              />
            {/if}
          {/each}
        {:else}
          {@const seriesColor = (segments[group.series.name] ?? [])[0]?.style?.stroke?.stroke ?? defaultColor}
          <marker.component
            {...marker.props}
            series={group.series.name}
            data={group.series.data}
            seriesColor={seriesColor}
          />
        {/if}
      {:else if marker.type === 'hover'}
        {@const seriesPoints = matchedPoints.filter((p) => p.series === group.series.name)}
        {#if marker.strategy === 'segment'}
          {@const segmentRanges = segments[group.series.name] ?? []}
          {#each segmentRanges as range, segIdx (`${group.series.name}-hover-segment-${segIdx}`)}
            {@const segPoints = seriesPoints.filter(
              (p) => (range.from === undefined || p.x >= range.from) && (range.to === undefined || p.x <= range.to),
            )}
            {#if segPoints.length > 0}
              <HoverMarker
                data={segPoints}
                ruleX={marker.ruleX !== false ? ruleX : null}
                ruleY={marker.ruleY !== false ? ruleY : null}
                color={marker.color}
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
            ruleX={marker.ruleX !== false ? ruleX : null}
            ruleY={marker.ruleY !== false ? ruleY : null}
            color={marker.color}
            showLabels={marker.showLabels}
            ruleStyle={marker.ruleStyle}
            dotStyle={marker.dotStyle}
            fontStyle={marker.fontStyle}
          />
        {/if}
      {/if}
    {/each}
  {/each}
  {/snippet}
</PlotLayout>
