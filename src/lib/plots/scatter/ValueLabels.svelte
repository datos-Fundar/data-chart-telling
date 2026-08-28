<script lang="ts" generics="TData extends Record<string, unknown>">
  import { Text, usePlot } from 'svelteplot';
  import { SvelteMap } from 'svelte/reactivity';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import { disabledFillOverride } from '$lib/plots/utils/legendDisabled';
  import { watchLabelOverflow } from '$lib/plots/utils/labelOverflow.svelte';
  import { resolveEdgeAwareAnchor } from '$lib/utils/edgeAwareAnchor';
  import { measureTextWidth } from '$lib/layout/plot/measureText';
  import type { Series } from '$lib/types/plots/data/common';
  import type { ValuesStyle } from '$lib/types/layout/styles';
  import type { ScatterSegmentStyle } from '$lib/types/plots/segments/common';
  import type { VisualGroup } from '$lib/types/plots/segments/config';
  import type { LegendDisabledStyle } from '$lib/types/layout/legend';
  import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';

  /**
   * Renders one series' point value labels — one `<Text>` mark per series
   * (mirrors line/bar/pyramid's own `ValueLabels`), so a legend-disabled or
   * hover-isolated series can carry its own constant `fillOpacity`. Labels
   * the Y value, matching the "Y is the value axis" convention every other
   * plot kind uses. Placement is edge-aware: a label whose default
   * anchor/offset would push it past the plot's own content box flips to
   * the opposite side instead of clipping — `onOverflow` below is a second,
   * coarser line of defense for whatever the flip still can't fit (e.g. a
   * corner point with no room in any direction).
   */
  let {
    group,
    formatValue,
    values,
    defaultColor,
    disabled,
    width,
    height,
    numericMargins,
    onHoverSeries,
    onHoverEnd,
    onOverflow,
  }: {
    group: VisualGroup<Series<TData>, ScatterSegmentStyle>;
    formatValue: (value: number, seriesName: string) => string;
    values: ValuesStyle | undefined;
    defaultColor: string;
    /** Resolved legend/hover-isolate dimming style for this group's series, if any. */
    disabled?: LegendDisabledStyle;
    /** The plot's own pixel size — together with `numericMargins`, the ground truth for its content box (see `bounds()` below). */
    width: number;
    height: number;
    /** `BasePlotLayout`'s resolved margins, already numeric on every side. */
    numericMargins: { top: number; right: number; bottom: number; left: number };
    /** Fired when the pointer enters this series' label — only wired when hover-isolate is enabled. */
    onHoverSeries?: () => void;
    onHoverEnd?: () => void;
    /** Reports how far this series' labels overflow the plot's own content box, in pixels, on each side (0 = no overflow). */
    onOverflow?: (overflow: MarginOverflow) => void;
  } = $props();

  const data = $derived(group.series.data);
  const getX = $derived(resolveAccessor(group.series.x));
  const getY = $derived(resolveAccessor(group.series.y));
  const plot = usePlot();
  let groupEl: SVGGElement | undefined = $state();

  watchLabelOverflow({
    el: () => groupEl,
    // Built from our own `width`/`height`/`numericMargins` rather than
    // `usePlot().scales.x/y.fn.range()` — see line/ValueLabels.svelte's
    // matching comment for why that scale's exposed range can't be trusted
    // once a caller fixes `width`/`height` explicitly (every plot kind here
    // does). `plot.plotWidth`/`plotHeight` (used below for edge-aware
    // placement) don't have this problem — only the scale's own `.range()`.
    bounds: () => {
      // getBBox() inside isn't itself tracked — depend on whatever actually
      // changes the rendered label layout so this re-measures.
      void data;
      void values;
      return {
        left: numericMargins.left,
        right: width - numericMargins.right,
        top: numericMargins.top,
        bottom: height - numericMargins.bottom,
      };
    },
    onOverflow: (overflow) => onOverflow?.(overflow),
  });

  const cfg = $derived(getConfiguration());
  const font = $derived(values?.fontStyle);
  const preferredTextAnchor = $derived(
    font?.textAnchor === 'outside' || font?.textAnchor === undefined ? 'start' : font.textAnchor,
  );
  const preferredLineAnchor = $derived(font?.lineAnchor ?? 'middle');
  const gapX = $derived(Math.abs(font?.dx ?? 8));
  const gapY = $derived(Math.abs(font?.dy ?? 0));
  const fontSize = $derived(typeof font?.fontSize === 'number' ? font.fontSize : 11);
  const canvasFont = $derived(`${fontSize}px ${cfg.font === 'inherit' ? 'sans-serif' : cfg.font}`);
  const fillOverride = $derived(disabledFillOverride(disabled));

  function textOf(d: TData): string {
    return formatValue(Number(getY(d)), group.series.name);
  }

  /** One placement per row, keyed by row reference — avoids recomputing the same scale/edge lookup for each of the four accessor channels below. */
  const placements = $derived.by(() => {
    const map = new SvelteMap<TData, ReturnType<typeof resolveEdgeAwareAnchor>>();
    const xFn = plot.scales.x?.fn;
    const yFn = plot.scales.y?.fn;
    if (!xFn || !yFn) return map;
    for (const d of data) {
      const px = Number(xFn(getX(d) as never));
      const py = Number(yFn(getY(d) as never));
      const text = textOf(d);
      map.set(
        d,
        resolveEdgeAwareAnchor({
          px,
          py,
          width: plot.plotWidth,
          height: plot.plotHeight,
          textAnchor: preferredTextAnchor,
          lineAnchor: preferredLineAnchor,
          gapX,
          gapY,
          extent: { width: measureTextWidth(text, canvasFont), height: fontSize * 1.2 },
        }),
      );
    }
    return map;
  });
</script>

<!-- svelteplot's Text mark never wires pointer handlers to its DOM node,
     despite declaring them in its types — a wrapping <g> catches the
     boundary crossing instead (pointerenter/leave fire on every ancestor). -->
<g bind:this={groupEl} role="presentation" onpointerenter={onHoverSeries} onpointerleave={onHoverEnd}>
  <Text
    {data}
    x={getX}
    y={getY}
    text={(d: TData) => textOf(d)}
    fill={font?.fill ?? defaultColor}
    fillOpacity={fillOverride?.fillOpacity}
    {fontSize}
    fontWeight={font?.fontWeight ?? 500}
    fontStyle={font?.fontStyle}
    textAnchor={(d: TData) => placements.get(d)?.textAnchor ?? preferredTextAnchor}
    lineAnchor={
      // svelteplot's own `lineAnchor` accessor type isn't parameterized over the mark's row type like its siblings are.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (d: any) => placements.get(d)?.lineAnchor ?? preferredLineAnchor
    }
    dx={(d: TData) => placements.get(d)?.dx ?? gapX}
    dy={(d: TData) => placements.get(d)?.dy ?? gapY}
    lineHeight={font?.lineHeight}
    rotate={font?.rotate}
    stroke={font?.stroke}
    strokeWidth={font?.strokeWidth}
    paintOrder={font?.paintOrder}
    class={font?.class}
    textClass={font?.textClass}
  />
</g>
