<script lang="ts" generics="TData extends Record<string, unknown>">
  import { Text } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { disabledFillOverride } from '$lib/plots/utils/legendDisabled';
  import { watchLabelOverflow } from '$lib/plots/utils/labelOverflow.svelte';
  import { isGapValue } from '$lib/plots/utils/gaps';
  import type { Series } from '$lib/types/plots/data/common';
  import type { ValuesStyle } from '$lib/types/layout/styles';
  import type { ValueAnchor } from '$lib/types/plots/constants';
  import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
  import type { VisualGroup } from '$lib/types/plots/segments/config';
  import type { LegendDisabledStyle } from '$lib/types/layout/legend';
  import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';

  /**
   * Renders one series' value label on a pyramid bar — anchor-driven default
   * position/offset, mirrored left/right of the shared zero baseline
   * depending on `group.series.side`, overridable per-field via
   * `styles.values.fontStyle`.
   */
  let {
    group,
    valAnchor,
    formatValue,
    values,
    axisColor,
    disabled,
    width,
    height,
    numericMargins,
    onHoverSeries,
    onHoverEnd,
    onOverflow,
  }: {
    group: VisualGroup<Series<TData> & { side: 'left' | 'right' }, BarSegmentStyle>;
    valAnchor: ValueAnchor;
    formatValue: (value: number, seriesName: string) => string;
    values: ValuesStyle | undefined;
    axisColor: string;
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
    /** Reports how far this label overflows the plot's own content box, in pixels, on each side (0 = no overflow). */
    onOverflow?: (overflow: MarginOverflow) => void;
  } = $props();

  const fillOverride = $derived(disabledFillOverride(disabled));
  let groupEl: SVGGElement | undefined = $state();

  watchLabelOverflow({
    el: () => groupEl,
    // Built from our own `width`/`height`/`numericMargins` rather than
    // `usePlot().scales.x/y.fn.range()` — see line/ValueLabels.svelte's
    // matching comment for why that scale's exposed range can't be trusted
    // once a caller fixes `width`/`height` explicitly (every plot kind here
    // does).
    bounds: () => {
      // getBBox() inside isn't itself tracked — depend on whatever actually
      // changes the rendered label layout so this re-measures.
      void group;
      void values;
      void valAnchor;
      return {
        left: numericMargins.left,
        right: width - numericMargins.right,
        top: numericMargins.top,
        bottom: height - numericMargins.bottom,
      };
    },
    onOverflow: (overflow) => onOverflow?.(overflow),
  });

  const isLeft = $derived(group.series.side === 'left');
  const getCategory = $derived(resolveAccessor(group.series.x));
  const getMagnitude = $derived(resolveAccessor(group.series.y));
  // A gap row — missing data, whether or not `styles.gaps` fills it with a
  // synthetic bar — never gets a value label, same as LinePlot's `lastPoints`.
  const labelData = $derived(group.series.data.filter((d) => !isGapValue(getMagnitude(d))));
  const signedValue = $derived((d: TData) => {
    const v = Math.abs(Number(getMagnitude(d)));
    return isLeft ? -v : v;
  });

  const xFn = $derived(
    valAnchor === 'middle'
      ? (d: TData) => signedValue(d) / 2
      : valAnchor === 'end'
        ? () => 0
        : (d: TData) => signedValue(d),
  );
  const defaultDx = $derived(
    valAnchor === 'middle' ? 0 : valAnchor === 'end' ? (isLeft ? -4 : 4) : isLeft ? -6 : 6,
  );
  const defaultTextAnchor = $derived(
    valAnchor === 'middle' ? ('middle' as const) : isLeft ? ('end' as const) : ('start' as const),
  );

  const font = $derived(values?.fontStyle);
  // 'outside' is a per-point escape hatch resolved by HoverMarker; pyramid's
  // own value labels already have their own `anchor: 'outside'` concept
  // (resolved above via `valAnchor`), so if it leaks through here just fall
  // back to the anchor-derived default.
  const resolvedTextAnchor = $derived(font?.textAnchor === 'outside' ? undefined : font?.textAnchor);
</script>

<!-- svelteplot's Text mark never wires pointer handlers to its DOM node,
     despite declaring them in its types — a wrapping <g> catches the
     boundary crossing instead (pointerenter/leave fire on every ancestor). -->
<g bind:this={groupEl} role="presentation" onpointerenter={onHoverSeries} onpointerleave={onHoverEnd}>
  <Text
    data={labelData}
    x={xFn}
    y={getCategory}
    text={(d: TData) => formatValue(Math.abs(Number(getMagnitude(d))), group.series.name)}
    dx={font?.dx ?? defaultDx}
    dy={font?.dy ?? 0}
    textAnchor={resolvedTextAnchor ?? defaultTextAnchor}
    lineAnchor={font?.lineAnchor ?? 'middle'}
    lineHeight={font?.lineHeight}
    rotate={font?.rotate}
    class={font?.class}
    textClass={font?.textClass}
    fill={font?.fill ?? axisColor}
    fillOpacity={fillOverride?.fillOpacity}
    fontSize={font?.fontSize ?? 12}
    fontWeight={font?.fontWeight}
    fontStyle={font?.fontStyle}
    stroke={font?.stroke}
    strokeWidth={font?.strokeWidth}
    paintOrder={font?.paintOrder}
  />
</g>
