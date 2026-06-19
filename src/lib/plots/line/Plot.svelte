<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { SvelteMap } from 'svelte/reactivity';
  import { Line, Dot, AxisX, AxisY } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { buildSeries } from '$lib/utils/grouping';
  import PlotLayout from '$lib/layout/plot/PlotLayout.svelte';
  import { buildGroupedSeries, validateSegments } from '$lib/plots/utils/segments';
  import type { AxisScale, Series, SeriesProps, DataProps } from '$lib/types/plots/common';
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
    xScale = {},
    yScale = {},
    tooltip = undefined,
  }: (SeriesProps<TData> | DataProps<TData>) & {
    width: number;
    height: number;
    segments?: SegmentsMap;
    markers?: Marker[];
    xScale?: AxisScale;
    yScale?: AxisScale;
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
      if ((marker.type === 'component') && marker.series) {
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
    flat.map((d) => ({ x: xAcc(d) as XValue, y: Number(yAcc(d)), row: d, label: String(yAcc(d)) })),
  );
</script>

<PlotLayout
  {width}
  {height}
  x={xScale}
  y={yScale}
  data={flat}
  getX={xAcc}
  getY={(d) => Number(yAcc(d))}
  {hoverPoints}
  label={(r) => String(yAcc(r))}
  {tooltip}
  {markers}
>
  <AxisX tickSize={cfg.axis.tickSize} tickPadding={cfg.axis.tickPadding} tickFontSize={cfg.axis.fontSize} />
  <AxisY tickSize={0} tickPadding={cfg.axis.tickPadding} tickFontSize={cfg.axis.fontSize} />

  {#each groupedSeries as group (group.series.name)}
    {#each group.visualSegments as seg, i (`${group.series.name}-${i}`)}
      {@const strokeStyle = seg.style.stroke}
      <Line
        data={seg.data}
        x={resolveAccessor(group.series.x)}
        y={resolveAccessor(group.series.y)}
        stroke={strokeStyle?.stroke ?? 'var(--plot-line-stroke, currentColor)'}
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
          fill={dotStyle.dotFill ?? strokeStyle?.stroke ?? 'var(--plot-line-stroke, currentColor)'}
          symbol={dotStyle.dotSymbol ?? 'circle'}
          stroke={dotStyle.dotStroke ?? strokeStyle?.stroke ?? 'var(--plot-line-stroke, currentColor)'}
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
              {@const segmentColor = segmentRanges[segIdx]?.style?.stroke?.stroke}
              <marker.component
                {...marker.props}
                series={group.series.name}
                data={segmentData}
                seriesColor={segmentColor}
              />
            {/if}
          {/each}
        {:else}
          {@const seriesColor = (segments[group.series.name] ?? [])[0]?.style?.stroke?.stroke}
          <marker.component
            {...marker.props}
            series={group.series.name}
            data={group.series.data}
            seriesColor={seriesColor}
          />
        {/if}
      {/if}
    {/each}
  {/each}
</PlotLayout>
