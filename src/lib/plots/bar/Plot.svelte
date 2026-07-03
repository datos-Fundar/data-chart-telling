<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { SvelteMap } from 'svelte/reactivity';
  import { paletteColor } from '$lib/utils/color';
  import { buildSeries } from '$lib/utils/grouping';
  import { BarY, Text } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { buildGroupedSeries, validateSegments, resolveSegmentsForSeries, matchesSegmentX } from '$lib/plots/utils/segments';
  import PlotLayout from '$lib/layout/plot/PlotLayout.svelte';
  import HoverMarker from '$lib/plots/markers/HoverMarker.svelte';
  import type { Marker } from '$lib/types/plots/markers';
  import type { PlotProps } from '$lib/types/plots/props';
  import type { Series, AxisValue } from '$lib/types/plots/common';
  import type { BarSegmentStyle, ValueAnchor } from '$lib/types/plots/styles';

  /**
   * A vertical bar chart. Accepts either a pre-built `series` array or flat
   * `data/x/y/z` props — mirrors the line/heatmap plot contract so the
   * chart-level container/timeline/facet/legend wrap it unchanged.
   */
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
  }: PlotProps<TData, BarSegmentStyle> = $props();

  $effect(() => { validateSegments(segments); });

  const cfg = $derived(getConfiguration());
  const resolvedSeries = $derived(series ?? buildSeries(data!, x!, y!, z));
  const groupedSeries = $derived(
    buildGroupedSeries<Series<TData>, BarSegmentStyle>(resolvedSeries, segments),
  );
  const showVals = $derived(styles.values?.show ?? false);
  const fmtVal = $derived(styles.values?.format ?? ((v: number) => `${v}`));
  const valAnchor = $derived<ValueAnchor>(styles.values?.anchor ?? 'outside');

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
    {@const xFn = resolveAccessor(group.series.x)}
    {@const yFn = resolveAccessor(group.series.y)}
    {#each group.visualSegments as seg, i (`${group.series.name}-${i}`)}
      <BarY
        data={seg.data}
        x={xFn}
        y={yFn}
        fill={seg.style.fill ?? defaultColor}
        fillOpacity={seg.style.fillOpacity ?? 1}
      />
    {/each}

    {#if showVals}
      {@const yTextFn = valAnchor === 'middle'
        ? (d: TData) => Number(yFn(d)) / 2
        : valAnchor === 'end'
        ? () => 0
        : (d: TData) => Number(yFn(d))}
      {@const defaultDy = valAnchor === 'outside' ? -6 : valAnchor === 'start' ? 4 : valAnchor === 'end' ? -4 : 0}
      {@const defaultLA = valAnchor === 'outside' || valAnchor === 'end'
        ? ('bottom' as const)
        : valAnchor === 'start'
        ? ('top' as const)
        : ('middle' as const)}
      <Text
        data={group.series.data}
        x={xFn}
        y={yTextFn}
        text={(d: TData) => fmtVal(Number(yFn(d)), group.series.name)}
        dx={styles.values?.dx ?? 0}
        dy={styles.values?.dy ?? defaultDy}
        textAnchor={styles.values?.textAnchor ?? 'middle'}
        lineAnchor={styles.values?.lineAnchor ?? defaultLA}
        lineHeight={styles.values?.lineHeight}
        rotate={styles.values?.rotate}
        class={styles.values?.class}
        textClass={styles.values?.textClass}
        fill={cfg.axis.color}
        fontSize={12}
      />
    {/if}

    {#each seriesMarkers.get(group.series.name) ?? [] as marker, i (`series-${group.series.name}-hover-${i}`)}
      {#if marker.type === 'hover'}
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
                seriesColor={seg.style?.fill ?? defaultColor}
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
            seriesColor={segs[0]?.style?.fill ?? defaultColor}
          />
        {/if}
      {/if}
    {/each}
  {/each}
  {/snippet}
</PlotLayout>
