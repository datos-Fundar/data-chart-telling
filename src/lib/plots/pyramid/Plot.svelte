<script lang="ts" generics="TData extends Record<string, unknown>">
  import { SvelteMap } from 'svelte/reactivity';
  import { BarX, Text, AxisX, AxisY } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { paletteColor } from '$lib/utils/color';
  import { buildSeries } from '$lib/utils/grouping';
  import { buildGroupedSeries, validateSegments } from '$lib/plots/utils/segments';
  import PlotLayout from '$lib/layout/plot/PlotLayout.svelte';
  import HoverMarker from '$lib/plots/markers/HoverMarker.svelte';
  import type { PyramidSeries, PyramidSeriesProps, PyramidDataProps } from '$lib/types/plots/pyramid';
  import type { ScalesConfig, XValue } from '$lib/types/plots/common';
  import type { BarSegmentStyle, SegmentsMap } from '$lib/types/plots/styles';
  import type { Marker } from '$lib/types/plots/markers';
  import type { TooltipRuntime } from '$lib/types/layout/tooltip';

  /**
   * A population-pyramid-style diverging bar chart: each series is mirrored
   * left or right of a shared zero baseline along a categorical band axis.
   * Mirrors the bar/line plot contract — series in, marks out — so the
   * chart-level container/timeline/facet/legend wrap it unchanged. Like
   * `LinePlot`/`BarPlot`, accepts either pre-built `series` or flat `data` +
   * `y`/`x`/`side`/`z` accessors, so the plot is usable standalone without
   * going through `PyramidChart`.
   */
  let {
    width,
    height,
    series,
    data,
    y,
    x,
    side,
    z,
    colorLeft,
    colorRight,
    scales = {},
    showValues = false,
    formatValue = (v: number) => `${v}`,
    segments = {},
    markers = [],
    tooltip = undefined,
  }: (PyramidSeriesProps<TData> | PyramidDataProps<TData>) & {
    width: number;
    height: number;
    colorLeft?: string;
    colorRight?: string;
    /** Magnitude (diverging) axis — distinct from `scales.y`, which places the category bands. */
    scales?: ScalesConfig;
    showValues?: boolean;
    formatValue?: (v: number) => string;
    /** Per-series fill/opacity over category ranges — e.g. dim every category but a highlighted few. */
    segments?: SegmentsMap<BarSegmentStyle>;
    /** Standalone (`ruleX`/`ruleY`/unscoped `hover`) plus per-series-scoped markers. */
    markers?: Marker[];
    tooltip?: TooltipRuntime<TData>;
  } = $props();

  $effect(() => {
    if (Object.keys(segments).length > 0) validateSegments(segments);
  });

  const cfg = $derived(getConfiguration());
  const leftColor = $derived(colorLeft ?? paletteColor(0, cfg.palette));
  const rightColor = $derived(colorRight ?? paletteColor(1, cfg.palette));

  // Groups flat rows into one series per z-value, then looks up each group's
  // side from the `side` mapping using the series name (= string z-value).
  const resolvedSeries = $derived.by(() => {
    if (series) return series;
    return buildSeries(data!, y!, x!, z!).map((s) => ({
      ...s,
      side: side![s.name] ?? 'left',
    }));
  });

  const groupedSeries = $derived(
    buildGroupedSeries<PyramidSeries<TData>, BarSegmentStyle>(resolvedSeries, segments),
  );

  function signedValue(s: PyramidSeries<TData>, d: TData): number {
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
    __y: XValue;
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
          __y: getCategory(d) as XValue,
          __label: formatValue(v),
          __series: s.name,
        } as TaggedRow;
      });
    }),
  );

  const getX = (d: TaggedRow) => d.__x;
  const getY = (d: TaggedRow) => d.__y;
  const labelFor = (d: TaggedRow) => d.__label;

  const hoverPoints = $derived(
    flat.map((d) => ({
      x: d.__x,
      y: d.__y,
      row: d,
      label: d.__label,
      series: d.__series,
    })),
  );

  const yDomain = $derived([
    ...new Set(
      resolvedSeries.flatMap((s) => {
        const getCategory = resolveAccessor(s.x);
        return s.data.map((d) => getCategory(d) as XValue);
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

  const getSegmentData = (
    data: TData[],
    categoryAccessor: (d: TData) => XValue,
    segmentRanges: { from?: XValue; to?: XValue }[],
  ) => {
    return segmentRanges.map((range) =>
      data.filter((d) => {
        const x = categoryAccessor(d);
        const inRange = (!range.from || x >= range.from) && (!range.to || x <= range.to);
        return inRange;
      }),
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
</script>

<PlotLayout
  {width}
  {height}
  x={{
    domain: [-maxMagnitude, maxMagnitude],
    tickFormat: (v: unknown) => formatValue(Math.abs(Number(v))),
    ...(scales.x ?? {}),
  }}
  y={{ type: 'band', padding: 0.2, domain: yDomain, ...(scales.y ?? {}) }}
  data={flat}
  {getX}
  {getY}
  matchY={getY}
  {hoverPoints}
  label={labelFor}
  {tooltip}
  {markers}
>
  {#snippet children({ matchedPoints, ruleX, ruleY })}
  <AxisX tickSize={cfg.axis.tickSize} tickPadding={cfg.axis.tickPadding} tickFontSize={cfg.axis.fontSize} />
  <AxisY tickSize={0} tickPadding={cfg.axis.tickPadding} tickFontSize={cfg.axis.fontSize} titleFontSize={cfg.axis.labelFontSize} />

  {#each groupedSeries as group (group.series.name)}
    {@const defaultColor = group.series.side === 'left' ? leftColor : rightColor}
    {@const getCategory = resolveAccessor(group.series.x)}
    {#each group.visualSegments as seg, i (`${group.series.name}-${i}`)}
      <BarX
        data={seg.data}
        x1={0}
        x2={(d: TData) => signedValue(group.series, d)}
        y={getCategory}
        fill={seg.style.fill ?? defaultColor}
        fillOpacity={seg.style.fillOpacity ?? 1}
      />
    {/each}

    {#if showValues}
      <Text
        data={group.series.data}
        x={(d: TData) => signedValue(group.series, d)}
        y={getCategory}
        text={(d: TData) => formatValue(Math.abs(Number(resolveAccessor(group.series.y)(d))))}
        dx={group.series.side === 'left' ? -6 : 6}
        textAnchor={group.series.side === 'left' ? 'end' : 'start'}
        fill={cfg.axis.color}
        fontSize={12}
      />
    {/if}

    {#each seriesMarkers.get(group.series.name) ?? [] as marker, i (`series-${group.series.name}-${marker.type}-${i}`)}
      {#if marker.type === 'component'}
        {#if marker.strategy === 'segment'}
          {@const segmentRanges = segments[group.series.name] ?? []}
          {@const segmentDataArrays = getSegmentData(group.series.data, getCategory, segmentRanges)}
          {#each segmentDataArrays as segmentData, segIdx (`${group.series.name}-marker-segment-${segIdx}`)}
            {#if segmentData.length > 0}
              {@const segmentColor = segmentRanges[segIdx]?.style?.fill ?? defaultColor}
              <marker.component
                {...marker.props}
                series={group.series.name}
                data={segmentData}
                seriesColor={segmentColor}
              />
            {/if}
          {/each}
        {:else}
          {@const seriesColor = (segments[group.series.name] ?? [])[0]?.style?.fill ?? defaultColor}
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
