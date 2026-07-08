<script
  lang="ts"
  generics="TData extends Record<string, unknown>"
>
  import { SvelteMap } from 'svelte/reactivity';
  import { paletteColor } from '$lib/utils/color';
  import { buildSeries } from '$lib/utils/grouping';
  import { BarX, BarY, Text } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { buildGroupedSeries, validateSegments, resolveSegmentsForSeries, matchesSegmentX } from '$lib/plots/utils/segments';
  import { numericMargin } from '$lib/layout/plot/margins';
  import PlotLayout from '$lib/layout/plot/PlotLayout.svelte';
  import HoverMarker from '$lib/plots/markers/HoverMarker.svelte';
  import type { Marker } from '$lib/types/plots/markers';
  import type { PlotProps } from '$lib/types/plots/props';
  import type { Series, AxisValue, AxisScale } from '$lib/types/plots/common';
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
   * Bars default to a 0 baseline. When the value axis's domain is set and
   * excludes 0 (e.g. `[75, 85]`, to zoom in on a tight range), a literal 0
   * baseline sits way outside the visible domain — the scale still maps it
   * linearly, so the bar's "start" lands far past the plot's own edge and
   * the bar overflows into the margin instead of appearing to end at the
   * frame. Clamping the baseline to whichever domain bound is closest to 0
   * makes bars cut off exactly at the visible edge instead, which is the
   * point of setting a truncated domain in the first place. Left as 0 (no
   * clamp) when the domain isn't set or already straddles 0 naturally.
   */
  const valueScale = $derived(isHorizontal ? scales.x : scales.y);
  const valueBaseline = $derived.by(() => {
    const domain = valueScale?.domain;
    if (!domain || domain.length < 2) return 0;
    const lo = Number(domain[0]);
    const hi = Number(domain[domain.length - 1]);
    if (Number.isNaN(lo) || Number.isNaN(hi)) return 0;
    const min = Math.min(lo, hi);
    const max = Math.max(lo, hi);
    if (min > 0) return min;
    if (max < 0) return max;
    return 0;
  });

  /**
   * How series sharing the same category are arranged — see
   * {@link AxisScale.seriesLayout}. Read off `scales.z` since it's the
   * grouping axis, not the category axis itself.
   */
  const layout = $derived(scales.z?.seriesLayout ?? 'overlap');

  /**
   * Approximate per-category band size in pixels (width for vertical bars,
   * height for horizontal ones), used only to size each series' slice in
   * 'grouped' layout via inset props. Derived from this plot's own
   * `width`/`height`/`margins` rather than svelteplot's actual measured
   * scale (not part of its public API) — close enough for a grouped look,
   * though it can be slightly off when an 'auto' margin ends up wider than
   * the estimate (e.g. unusually long tick labels). Follows the same
   * band-scale formula (and 0.15 default padding) svelteplot itself uses,
   * so the category axis's own `paddingInner`/`paddingOuter` — the space
   * *between* categories — is reflected here too, not just svelteplot's
   * real render.
   */
  const categoricalScale = $derived(isHorizontal ? scales.y : scales.x);
  const seriesCount = $derived(groupedSeries.length);
  const estimatedBandwidth = $derived.by(() => {
    const categoryCount = new Set(flat.map((d) => xAcc(d))).size;
    if (categoryCount === 0) return 0;
    const baseMargins = { ...cfg.margins, ...margins };
    const innerSize = isHorizontal
      ? Math.max(0, height - numericMargin('top', baseMargins.top) - numericMargin('bottom', baseMargins.bottom))
      : Math.max(0, width - numericMargin('left', baseMargins.left) - numericMargin('right', baseMargins.right));
    const paddingInner = categoricalScale?.paddingInner ?? categoricalScale?.padding ?? 0.15;
    const paddingOuter = categoricalScale?.paddingOuter ?? categoricalScale?.padding ?? 0.15;
    const step = innerSize / (categoryCount - paddingInner + 2 * paddingOuter);
    return step * (1 - paddingInner);
  });
  // Each series gets an equal slice of the band; `seriesPadding` (0–1, space
  // *within* a group, between its series) reserves a fraction of that slice
  // as a gap split evenly on either side of the bar.
  const seriesStep = $derived(seriesCount > 0 ? estimatedBandwidth / seriesCount : 0);
  const seriesGap = $derived(Math.max(0, Math.min(1, scales.z?.seriesPadding ?? 0)) * seriesStep);

  /**
   * Per-category cumulative sums for 'stacked' layout — `stackedPrefixSums.get(category)[i]`
   * is the sum of series `0..i-1`'s value at that category, i.e. series `i`'s
   * own segment spans `[prefix, prefix + value]`. Computed by hand (rather
   * than svelteplot's `stackY`/`stackX` transform, which needs every series'
   * rows in one call to line up cumulative offsets) so the same numbers can
   * position both the bar segment and its middle-anchored label.
   */
  const stackedPrefixSums = $derived.by(() => {
    const sums = new SvelteMap<AxisValue, number[]>();
    if (layout !== 'stacked') return sums;
    for (const category of new Set(flat.map((d) => xAcc(d)))) {
      let running = 0;
      const prefix: number[] = [];
      for (const group of groupedSeries) {
        prefix.push(running);
        const seriesXFn = resolveAccessor(group.series.x);
        const seriesYFn = resolveAccessor(group.series.y);
        const row = group.series.data.find((d) => seriesXFn(d) === category);
        running += row ? Number(seriesYFn(row)) : 0;
      }
      sums.set(category, prefix);
    }
    return sums;
  });
  function stackedBaseline(category: AxisValue, seriesIndex: number): number {
    return stackedPrefixSums.get(category)?.[seriesIndex] ?? 0;
  }

  // `x`/`y` here are visual (matched against PlotLayout's own getX/getY,
  // which drive tick/domain computation and the Pointer's hit-testing) —
  // `row` (see PlotLayout/HoverPoint) is what lets the template recover the
  // semantic category regardless of which axis it landed on.
  const hoverPoints = $derived(
    resolvedSeries.flatMap((s, idx) => {
      const sx = resolveAccessor(s.x);
      const sy = resolveAccessor(s.y);
      return s.data.map((d) => {
        const category = sx(d) as AxisValue;
        const value = Number(sy(d));
        return {
          x: isHorizontal ? value : category,
          y: isHorizontal ? category : value,
          row: d,
          label: String(sy(d)),
          series: s.name,
          color: paletteColor(idx, cfg.palette),
        };
      });
    }),
  );
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
    {@const xFn = resolveAccessor(group.series.x)}
    {@const yFn = resolveAccessor(group.series.y)}
    {#if layout === 'stacked'}
      {@const stackedBaselineFn = (d: TData) => stackedBaseline(xFn(d), seriesIndex)}
      {@const stackedTopFn = (d: TData) => stackedBaseline(xFn(d), seriesIndex) + Number(yFn(d))}
      <BarMark
        data={group.series.data}
        {...isHorizontal
          ? { y: xFn, x1: stackedBaselineFn, x2: stackedTopFn }
          : { x: xFn, y1: stackedBaselineFn, y2: stackedTopFn }}
        fill={defaultColor}
      />
    {:else}
      {#each group.visualSegments as seg, i (`${group.series.name}-${i}`)}
        <BarMark
          data={seg.data}
          {...isHorizontal
            ? { y: xFn, x1: valueBaseline, x2: yFn }
            : { x: xFn, y1: valueBaseline, y2: yFn }}
          fill={seg.style.fill ?? defaultColor}
          fillOpacity={seg.style.fillOpacity ?? 1}
          {...layout === 'grouped'
            ? isHorizontal
              ? {
                  insetTop: seriesIndex * seriesStep + seriesGap / 2,
                  insetBottom: (seriesCount - 1 - seriesIndex) * seriesStep + seriesGap / 2,
                }
              : {
                  insetLeft: seriesIndex * seriesStep + seriesGap / 2,
                  insetRight: (seriesCount - 1 - seriesIndex) * seriesStep + seriesGap / 2,
                }
            : {}}
        />
      {/each}
    {/if}

    {#if showVals}
      {@const valueTextFn = layout === 'stacked'
          ? (d: TData) => stackedBaseline(xFn(d), seriesIndex) + Number(yFn(d)) / 2
          : valAnchor === 'middle' && !isHorizontal
          ? (d: TData) => Number(yFn(d)) / 2
          : valAnchor === 'end'
          ? () => 0
          : (d: TData) => Number(yFn(d))}
      {@const defaultOffset = valAnchor === 'outside' ? (isHorizontal ? 6 : -6) : valAnchor === 'start' ? (isHorizontal ? -4 : 4) : valAnchor === 'end' ? (isHorizontal ? 4 : -4) : 0}
      {@const defaultLA = valAnchor === 'outside' || valAnchor === 'end'
        ? ('bottom' as const)
        : valAnchor === 'start'
        ? ('top' as const)
        : ('middle' as const)}
      {@const groupDx = layout === 'grouped' && !isHorizontal
          ? -(estimatedBandwidth / 2) + seriesIndex * seriesStep + seriesStep / 2
          : 0}
      {@const groupDy = layout === 'grouped' && isHorizontal
          ? -(estimatedBandwidth / 2) + seriesIndex * seriesStep + seriesStep / 2
          : 0}
      <Text
        data={group.series.data}
        {...isHorizontal ? { y: xFn, x: valueTextFn } : { x: xFn, y: valueTextFn }}
        text={(d: TData) => fmtVal(Number(yFn(d)), group.series.name)}
        dx={styles.values?.dx ?? (isHorizontal ? defaultOffset : groupDx)}
        dy={styles.values?.dy ?? (isHorizontal ? groupDy : defaultOffset)}
        textAnchor={styles.values?.textAnchor ?? (isHorizontal ? (valAnchor === 'outside' || valAnchor === 'end' ? 'start' : valAnchor === 'start' ? 'end' : 'middle') : 'middle')}
        lineAnchor={styles.values?.lineAnchor ?? (isHorizontal ? 'middle' : defaultLA)}
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
