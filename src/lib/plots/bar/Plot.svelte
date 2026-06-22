<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { SvelteMap } from 'svelte/reactivity';
  import { BarY, AxisX, AxisY } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import { buildSeries } from '$lib/utils/grouping';
  import { buildGroupedSeries, validateSegments } from '$lib/plots/utils/segments';
  import PlotLayout from '$lib/layout/plot/PlotLayout.svelte';
  import HoverMarker from '$lib/plots/markers/HoverMarker.svelte';
  import type { AxisScale, Series, SeriesProps, DataProps } from '$lib/types/plots/common';
  import type { BarSegmentStyle, SegmentsMap } from '$lib/types/plots/styles';
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
    /** Per-series x-axis ranges with their own fill, keyed by series name. */
    segments?: SegmentsMap<BarSegmentStyle>;
    /** Standalone (`ruleX`/`ruleY`/unscoped `hover`) plus per-series-scoped `hover` markers. */
    markers?: Marker[];
    xScale?: AxisScale;
    yScale?: AxisScale;
    tooltip?: TooltipRuntime<TData>;
  } = $props();

  $effect(() => {
    if (Object.keys(segments).length > 0) validateSegments(segments);
  });

  const cfg = $derived(getConfiguration());
  const resolvedSeries = $derived(series ?? buildSeries(data!, x!, y!, z));
  const groupedSeries = $derived(
    buildGroupedSeries<Series<TData>, BarSegmentStyle>(resolvedSeries, segments),
  );

  const seriesMarkers = $derived.by(() => {
    const map = new SvelteMap<string, Marker[]>();
    for (const marker of markers) {
      if (marker.type === 'hover' && marker.series) {
        if (!map.has(marker.series)) map.set(marker.series, []);
        map.get(marker.series)!.push(marker);
      }
    }
    return map;
  });

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
  x={{ ...xScale, type: 'band', padding: 0.2 }}
  y={yScale}
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
      <BarY
        data={seg.data}
        x={resolveAccessor(group.series.x)}
        y={resolveAccessor(group.series.y)}
        fill={seg.style.fill ?? defaultColor}
        fillOpacity={seg.style.fillOpacity ?? 1}
      />
    {/each}

    {#each seriesMarkers.get(group.series.name) ?? [] as marker, i (`series-${group.series.name}-hover-${i}`)}
      {#if marker.type === 'hover'}
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
