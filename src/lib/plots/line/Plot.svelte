<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { SvelteMap } from 'svelte/reactivity';
  import { Plot, Line, Dot, AxisX, AxisY, RuleX, RuleY } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils';
  import { buildGroupedSeries, validateSegments } from '$lib/plots/line/segments';
  import { resolveXDeltas, resolveYDeltas } from '$lib/plots/line/delta';
  import DeltaAnnotation from '$lib/plots/line/DeltaAnnotation.svelte';
  import type { LineSeries, SegmentsMap, DeltaConfig } from '$lib/types/plots/lines';
  import type { XValue } from '$lib/types/plots/common';
  import type { Marker } from '$lib/types/plots/markers';
  type AxisScale = { domain?: (number | string | Date)[]; nice?: boolean; reverse?: boolean };

  let {
    width,
    height,
    series,
    segments = {},
    markers = [],
    delta = {},
    x: xScale = {},
    y: yScale = {},
  }: {
    width: number;
    height: number;
    series: LineSeries<TData>[];
    segments?: SegmentsMap;
    markers?: Marker[];
    delta?: { x?: DeltaConfig[]; y?: DeltaConfig[] };
    x?: AxisScale;
    y?: AxisScale;
  } = $props();

  $effect(() => {
    if (Object.keys(segments).length > 0) validateSegments(segments);
  });

  const groupedSeries = $derived(buildGroupedSeries(series, segments));

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

  const topLevelMarkers = $derived.by(() => {
    return markers.filter(
      (marker) =>
        (marker.type === 'ruleX' || marker.type === 'ruleY') ||
        (marker.type === 'component' && !marker.series)
    );
  });

  const resolvedXDeltas = $derived(resolveXDeltas(series, segments, delta.x ?? []));
  const resolvedYDeltas = $derived(resolveYDeltas(series, segments, delta.y ?? []));
</script>

<Plot
  {width}
  {height}
  x={xScale}
  y={yScale}
  margin={{ left: 30, right: 20, top: 20, bottom: 20 }}
>
  <AxisX tickSize={5} tickPadding={10} tickFontSize={14} />
  <AxisY tickSize={0} tickPadding={10} tickFontSize={14} />

  {#each groupedSeries as group (group.series.name)}
    {#each group.visualSegments as seg, i (`${group.series.name}-${i}`)}
      {@const strokeStyle = seg.style.stroke}
      <Line
        data={seg.data}
        x={resolveAccessor(group.series.x)}
        y={resolveAccessor(group.series.y)}
        stroke={strokeStyle?.stroke ?? 'var(--plot-line-stroke, currentColor)'}
        strokeWidth={strokeStyle?.strokeWidth ?? 2}
        strokeOpacity={strokeStyle?.strokeOpacity ?? 1}
        strokeDasharray={strokeStyle?.strokeDasharray}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {#if seg.style.dots}
        {@const dotStyle = seg.style.dots}
        <Dot
          data={seg.data}
          x={resolveAccessor(group.series.x)}
          y={resolveAccessor(group.series.y)}
          r={dotStyle.dotRadius ?? 4}
          fill={dotStyle.dotFill ?? strokeStyle?.stroke ?? 'var(--plot-line-stroke, currentColor)'}
          symbol={dotStyle.dotSymbol ?? 'circle'}
          stroke={dotStyle.dotStroke ?? strokeStyle?.stroke ?? 'var(--plot-line-stroke, currentColor)'}
          strokeWidth={dotStyle.dotStrokeWidth ?? 1}
          fillOpacity={strokeStyle?.strokeOpacity ?? 1}
          strokeOpacity={strokeStyle?.strokeOpacity ?? 1}
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

  {#each topLevelMarkers as marker (marker.type === 'ruleX' ? `${marker.type}-${marker.x}` : marker.type === 'ruleY' ? `${marker.type}-${marker.y}` : `${marker.type}-global`)}
    {#if marker.type === 'ruleX'}
      <RuleX
        data={[{ xValue: marker.x }]}
        x={(d) => d.xValue}
        stroke={marker.style?.stroke ?? 'currentColor'}
        strokeWidth={marker.style?.strokeWidth ?? 1}
        strokeOpacity={marker.style?.strokeOpacity ?? 1}
        strokeDasharray={marker.style?.strokeDasharray}
      />
    {:else if marker.type === 'ruleY'}
      <RuleY
        data={[{ yValue: marker.y }]}
        y={(d) => d.yValue}
        stroke={marker.style?.stroke ?? 'currentColor'}
        strokeWidth={marker.style?.strokeWidth ?? 1}
        strokeOpacity={marker.style?.strokeOpacity ?? 1}
        strokeDasharray={marker.style?.strokeDasharray}
      />
    {:else if marker.type === 'component'}
      <marker.component {...marker.props} />
    {/if}
  {/each}

  {#each resolvedXDeltas as d (`xdelta-${d.cfg.at}`)}
    <DeltaAnnotation delta={d} axis="x" xDomain={xScale.domain} yDomain={yScale.domain} />
  {/each}

  {#each resolvedYDeltas as d (`ydelta-${d.cfg.at}`)}
    <DeltaAnnotation delta={d} axis="y" xDomain={xScale.domain} yDomain={yScale.domain} />
  {/each}
</Plot>
