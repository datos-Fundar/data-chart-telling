<script lang="ts" generics="TData extends Record<string, unknown>">
  import { Text, usePlot } from 'svelteplot';
  import { SvelteMap } from 'svelte/reactivity';
  import { resolveEdgeAwareAnchor, estimateTextWidth } from '$lib/utils/edgeAwareAnchor';
  import type { AxisValue } from '$lib/types/layout/scales';
  import type { ValuesStyle } from '$lib/types/layout/styles';

  /**
   * Renders every point's value label in one mark — scatter has no
   * per-series endpoint to single out (unlike line), so this covers the
   * whole flat dataset at once, mirroring heatmap's own `ValueLabels`.
   * Labels the Y value, matching the "Y is the value axis" convention every
   * other plot kind uses. Placement is edge-aware: a label whose default
   * anchor/offset would push it past the plot's own content box flips to
   * the opposite side instead of clipping. Deliberately read-only against
   * `usePlot()`'s live scale — doesn't register into svelteplot's shared
   * margin-auto-sizing context, which can spike CPU/memory into
   * unresponsiveness when many `<Plot>` instances mount/unmount together
   * (e.g. switching from a multi-story docs page to a single story).
   */
  let {
    data,
    getX,
    getY,
    fmtVal,
    values,
    defaultColor,
  }: {
    data: TData[];
    getX: (d: TData) => AxisValue;
    getY: (d: TData) => AxisValue;
    fmtVal: (value: number, seriesName: string) => string;
    values: ValuesStyle | undefined;
    defaultColor: string;
  } = $props();

  const font = $derived(values?.fontStyle);
  const preferredTextAnchor = $derived(
    font?.textAnchor === 'outside' || font?.textAnchor === undefined ? 'start' : font.textAnchor,
  );
  const preferredLineAnchor = $derived(font?.lineAnchor ?? 'middle');
  const gapX = $derived(Math.abs(font?.dx ?? 8));
  const gapY = $derived(Math.abs(font?.dy ?? 0));
  const fontSize = $derived(typeof font?.fontSize === 'number' ? font.fontSize : 11);

  const plot = usePlot();

  function textOf(d: TData): string {
    return fmtVal(Number(getY(d)), '');
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
          // Rough average glyph width — these labels are short numeric/formatted strings, not measured DOM text.
          extent: { width: estimateTextWidth(text, fontSize), height: fontSize * 1.2 },
        }),
      );
    }
    return map;
  });
</script>

<Text
  {data}
  x={getX}
  y={getY}
  text={(d: TData) => textOf(d)}
  fill={font?.fill ?? defaultColor}
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
