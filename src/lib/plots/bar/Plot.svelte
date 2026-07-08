<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { SvelteMap } from 'svelte/reactivity';
  import { paletteColor } from '$lib/utils/color';
  import { buildSeries } from '$lib/utils/grouping';
  import { BarX, BarY } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { buildGroupedSeries, validateSegments, resolveSegmentsForSeries, matchesSegmentX } from '$lib/plots/utils/segments';
  import { createBarLayout } from '$lib/plots/bar/layout.svelte';
  import { buildHoverPoints } from '$lib/plots/bar/hoverPoints';
  import BarSegments from '$lib/plots/bar/BarSegments.svelte';
  import ValueLabels from '$lib/plots/bar/ValueLabels.svelte';
  import PlotLayout from '$lib/layout/plot/PlotLayout.svelte';
  import HoverMarker from '$lib/plots/markers/HoverMarker.svelte';
  import type { Marker } from '$lib/types/plots/markers';
  import type { PlotProps } from '$lib/types/plots/props';
  import type { Series, AxisScale } from '$lib/types/plots/common';
  import type { BarSegmentStyle, ValueAnchor } from '$lib/types/plots/styles';

  /**
   * A bar chart, vertical by default. Accepts either a pre-built `series`
   * array or flat `data/x/y/z` props — mirrors the line/heatmap plot contract
   * so the chart-level container/timeline/facet/legend wrap it unchanged.
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
    // connect: false — bars are discrete; there's no visual gap between
    // adjacent categories to bridge (see buildGroupedSeries's own doc).
    buildGroupedSeries<Series<TData>, BarSegmentStyle>(resolvedSeries, segments, false),
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

  // `xAcc`/`yAcc` are always data-semantic (category/value) — independent of
  // which *visual* axis ends up drawing them, decided by `categoricalAxis`.
  const xAcc = $derived(resolveAccessor(resolvedSeries[0]?.x ?? ((d: TData) => d)));
  const yAcc = $derived(resolveAccessor(resolvedSeries[0]?.y ?? ((d: TData) => d)));
  const flat = $derived(resolvedSeries.flatMap((s) => s.data));

  /**
   * Which visual axis draws the category, and therefore whether this renders
   * as vertical bars (`BarY`, category on X) or horizontal bars (`BarX`,
   * category on Y). Mirrors how pyramid/heatmap default an `AxisScale.type`
   * themselves: `scales.x`/`scales.y` always describe *that visual axis*
   * regardless of which data field lands there, so marking `scales.y.type:
   * 'categorical'` simply says "the category is drawn on Y this time" — x
   * defaults to categorical when neither is marked.
   */
  const categoricalAxis = $derived.by((): 'x' | 'y' => {
    const xCategorical = scales.x?.type === 'categorical';
    const yCategorical = scales.y?.type === 'categorical';
    if (xCategorical && yCategorical) {
      console.warn(
        "BarPlot: scales.x.type and scales.y.type can't both be 'categorical' — " +
          'mark only one axis as the category axis. Defaulting to x.',
      );
      return 'x';
    }
    return yCategorical ? 'y' : 'x';
  });
  const isHorizontal = $derived(categoricalAxis === 'y');
  const BarMark = $derived(isHorizontal ? BarX : BarY);

  /**
   * `'categorical'` is our own sentinel (BarPlot-only), not a real svelteplot
   * scale type — svelteplot's x/y scales don't recognise it (it's valid only
   * for `color`/`symbol`). Strip it before the scale reaches svelteplot so it
   * auto-infers the real type (typically `point`/`band`) the same way it
   * already does when `type` is left unset entirely.
   */
  function stripCategoricalType(scale?: AxisScale<TData>): AxisScale<TData> | undefined {
    if (scale?.type !== 'categorical') return scale;
    const rest = { ...scale };
    delete rest.type;
    return rest;
  }
  // The single, fully-resolved scales object PlotLayout reads for
  // everything (ticks, grid, sort, and the real svelteplot scale) — avoids
  // keeping a second, separately-patched copy of `scales.x`/`scales.y` in
  // sync with the one actually forwarded.
  const resolvedScales = $derived({
    ...scales,
    x: stripCategoricalType(scales.x),
    y: stripCategoricalType(scales.y),
  });

  // The accessor feeding each *visual* channel — swapped from the
  // data-semantic xAcc/yAcc when the category is drawn on Y.
  const plotGetX = $derived(isHorizontal ? (d: TData) => Number(yAcc(d)) : xAcc);
  const plotGetY = $derived(isHorizontal ? xAcc : (d: TData) => Number(yAcc(d)));

  /**
   * Series-layout geometry (grouped/stacked offsets, band-width estimate,
   * value baseline) — the single source of truth shared by bar-segment
   * rendering, value labels, and hover markers below. See `layout.svelte.ts`.
   */
  const barLayout = createBarLayout<TData>({
    scales: () => scales,
    isHorizontal: () => isHorizontal,
    width: () => width,
    height: () => height,
    margins: () => margins,
    flat: () => flat,
    xAcc: () => xAcc,
    groupedSeries: () => groupedSeries,
  });

  // `x`/`y` here are visual (matched against PlotLayout's own getX/getY,
  // which drive tick/domain computation and the Pointer's hit-testing) —
  // `row` (see PlotLayout/HoverPoint) is what lets the template recover the
  // semantic category regardless of which axis it landed on.
  const hoverPoints = $derived(buildHoverPoints(resolvedSeries, isHorizontal, barLayout, cfg.palette));
</script>

<PlotLayout
  {width}
  {height}
  data={flat}
  getX={plotGetX}
  getY={plotGetY}
  {hoverPoints}
  label={(r) => String(yAcc(r))}
  {tooltip}
  {markers}
  seriesData={resolvedSeries}
  scales={resolvedScales}
  {margins}
  defaultStrategy={categoricalAxis}
>
  {#snippet children({ matchedPoints, ruleX, ruleY, impliesRuleX, impliesRuleY })}
  {#each groupedSeries as group, seriesIndex (group.series.name)}
    {@const defaultColor = paletteColor(seriesIndex, cfg.palette)}
    <BarSegments {group} {seriesIndex} {barLayout} {isHorizontal} {BarMark} {defaultColor} />

    {#if showVals}
      <ValueLabels {group} {seriesIndex} {barLayout} {isHorizontal} {valAnchor} {fmtVal} values={styles.values} axisColor={cfg.axis.color} />
    {/if}

    {#each seriesMarkers.get(group.series.name) ?? [] as marker, i (`series-${group.series.name}-hover-${i}`)}
      {#if marker.type === 'hover'}
        {@const seriesPoints = matchedPoints.filter((p) => p.series === group.series.name)}
        {#if marker.scope === 'segment'}
          {@const segs = resolveSegmentsForSeries(segments, group.series.name)}
          {#each segs as seg, segIdx (`${group.series.name}-hover-segment-${segIdx}`)}
            {@const segPoints = seriesPoints.filter((p) => matchesSegmentX(xAcc(p.row), seg))}
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
