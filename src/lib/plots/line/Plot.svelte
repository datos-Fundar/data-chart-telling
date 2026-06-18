<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { SvelteMap } from 'svelte/reactivity';
  import { Plot, Line, Dot, AxisX, AxisY, RuleX, RuleY, Pointer } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils';
  import { getConfiguration } from '$lib/charts/config.svelte';
  import { getHover, createHover } from '$lib/charts/hover.svelte';
  import { createHoverController } from '$lib/charts/tooltip/controller.svelte';
  import HoverMarks from '$lib/charts/tooltip/HoverMarks.svelte';
  import Tooltip from '$lib/charts/tooltip/Tooltip.svelte';
  import { buildGroupedSeries, validateSegments } from '$lib/plots/line/segments';
  import { resolveXDeltas, resolveYDeltas } from '$lib/plots/line/delta';
  import DeltaAnnotation from '$lib/plots/line/DeltaAnnotation.svelte';
  import type { LineSeries, SegmentsMap, DeltaConfig } from '$lib/types/plots/lines';
  import type { XValue } from '$lib/types/plots/common';
  import type { Marker } from '$lib/types/plots/markers';
  import type { TooltipRuntime } from '$lib/types/charts/tooltip';
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
    tooltip = undefined,
  }: {
    width: number;
    height: number;
    series: LineSeries<TData>[];
    segments?: SegmentsMap;
    markers?: Marker[];
    delta?: { x?: DeltaConfig[]; y?: DeltaConfig[] };
    x?: AxisScale;
    y?: AxisScale;
    tooltip?: TooltipRuntime<TData>;
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

  const cfg = $derived(getConfiguration());

  // ── Hover / tooltip ───────────────────────────────────────────────────────
  const sharedHover = getHover();
  const localHover = createHover();
  const hover = $derived(sharedHover ?? localHover);
  $effect(() => {
    if (!sharedHover && tooltip) localHover.sync = tooltip.sync;
  });

  const xAcc = $derived(resolveAccessor(series[0]?.x ?? ((d: TData) => d)));
  const yAcc = $derived(resolveAccessor(series[0]?.y ?? ((d: TData) => d)));
  const flat = $derived(series.flatMap((s) => s.data));
  const hoverPoints = $derived(
    flat.map((d) => ({ x: xAcc(d) as XValue, y: Number(yAcc(d)), row: d, label: String(yAcc(d)) })),
  );

  const ctrl = createHoverController<TData>({
    hover: () => hover,
    facetId: () => tooltip?.facetId ?? '',
    points: () => hoverPoints,
    getX: () => (d) => xAcc(d) as XValue,
    getY: () => (d) => Number(yAcc(d)),
    label: () => (r) => String(yAcc(r)),
    format: () => tooltip?.format ?? ((r) => String(yAcc(r))),
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="dct-plot"
  style:color={cfg.axis.color}
  onpointermove={tooltip ? ctrl.onMove : undefined}
  onpointerleave={tooltip ? ctrl.onLeave : undefined}
>
<Plot
  {width}
  {height}
  x={xScale}
  y={yScale}
  margin={cfg.margins}
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
        strokeLinejoin="round"
        strokeLinecap="round"
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

  {#if tooltip}
    <Pointer data={flat} x={xAcc} maxDistance={400} onupdate={ctrl.onPointer} />
    <HoverMarks points={ctrl.points} ruleX={ctrl.ruleX} ruleY={ctrl.ruleY} color={cfg.timeline.activeColor} />
  {/if}
</Plot>

{#if tooltip && ctrl.showTooltip && ctrl.cursor}
  <Tooltip x={ctrl.cursor.x} y={ctrl.cursor.y}>{ctrl.tooltipText}</Tooltip>
{/if}
</div>

<style>
  .dct-plot {
    position: relative;
    line-height: 0;
  }
</style>
