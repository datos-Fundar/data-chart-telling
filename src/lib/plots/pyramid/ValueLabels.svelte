<script lang="ts" generics="TData extends Record<string, unknown>">
  import { Text, usePlot } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import { disabledFillOverride } from '$lib/plots/utils/legendDisabled';
  import { watchLabelOverflow } from '$lib/plots/utils/labelOverflow.svelte';
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
    /** Fired when the pointer enters this series' label — only wired when hover-isolate is enabled. */
    onHoverSeries?: () => void;
    onHoverEnd?: () => void;
    /** Reports how far this label overflows the plot's own content box, in pixels, on each side (0 = no overflow). */
    onOverflow?: (overflow: MarginOverflow) => void;
  } = $props();

  const fillOverride = $derived(disabledFillOverride(disabled));
  const plot = usePlot();
  let groupEl: SVGGElement | undefined = $state();

  watchLabelOverflow({
    el: () => groupEl,
    bounds: () => {
      // getBBox() inside isn't itself tracked — depend on whatever actually
      // changes the rendered label layout so this re-measures.
      void group;
      void values;
      void valAnchor;
      const xRange = plot.scales.x?.fn?.range?.()?.map(Number);
      const yRange = plot.scales.y?.fn?.range?.()?.map(Number);
      if (!xRange || !yRange) return undefined;
      return {
        left: Math.min(xRange[0], xRange[1]),
        right: Math.max(xRange[0], xRange[1]),
        top: Math.min(yRange[0], yRange[1]),
        bottom: Math.max(yRange[0], yRange[1]),
      };
    },
    onOverflow: (overflow) => onOverflow?.(overflow),
  });

  const isLeft = $derived(group.series.side === 'left');
  const getCategory = $derived(resolveAccessor(group.series.x));
  const getMagnitude = $derived(resolveAccessor(group.series.y));
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
    data={group.series.data}
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
