<script lang="ts" generics="TData extends Record<string, unknown>">
  import { Text } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import type { Series } from '$lib/types/plots/common';
  import type { BarSegmentStyle, ValueAnchor, ValuesStyle, VisualGroup } from '$lib/types/plots/styles';
  import type { BarLayout } from './layout.svelte';

  /**
   * Renders one series-group's value label — anchor-driven default
   * position/offset, overridable per-field via `styles.values`. Positions
   * account for the same grouped/stacked geometry as the bars themselves
   * (via {@link BarLayout}), so a label lands on its own bar/segment instead
   * of a shared default position.
   */
  let {
    group,
    seriesIndex,
    barLayout,
    isHorizontal,
    valAnchor,
    fmtVal,
    values,
    axisColor,
  }: {
    group: VisualGroup<Series<TData>, BarSegmentStyle>;
    seriesIndex: number;
    barLayout: BarLayout<TData>;
    isHorizontal: boolean;
    valAnchor: ValueAnchor;
    fmtVal: (value: number, seriesName: string) => string;
    values: ValuesStyle | undefined;
    axisColor: string;
  } = $props();

  const xFn = $derived(resolveAccessor(group.series.x));
  const yFn = $derived(resolveAccessor(group.series.y));

  const valueTextFn = $derived(
    barLayout.layout === 'stacked'
      ? (d: TData) => barLayout.stackedBaseline(xFn(d), seriesIndex) + Number(yFn(d)) / 2
      : valAnchor === 'middle' && !isHorizontal
        ? (d: TData) => Number(yFn(d)) / 2
        : valAnchor === 'end'
          ? () => 0
          : (d: TData) => Number(yFn(d)),
  );
  const defaultOffset = $derived(
    valAnchor === 'outside' ? (isHorizontal ? 6 : -6)
    : valAnchor === 'start' ? (isHorizontal ? -4 : 4)
    : valAnchor === 'end' ? (isHorizontal ? 4 : -4)
    : 0,
  );
  const defaultLA = $derived(
    valAnchor === 'outside' || valAnchor === 'end' ? ('bottom' as const)
    : valAnchor === 'start' ? ('top' as const)
    : ('middle' as const),
  );
  const groupOffset = $derived(barLayout.groupOffset(seriesIndex));

  // `textAnchor: 'outside'` is a per-point escape hatch resolved by
  // HoverMarker (which knows each point's signed x) — value labels already
  // have their own `anchor: 'outside'` concept (computed above), so if it
  // leaks through here just fall back to the anchor-derived default.
  const resolvedTextAnchor = $derived(values?.textAnchor === 'outside' ? undefined : values?.textAnchor);
</script>

<Text
  data={group.series.data}
  {...isHorizontal ? { y: xFn, x: valueTextFn } : { x: xFn, y: valueTextFn }}
  text={(d: TData) => fmtVal(Number(yFn(d)), group.series.name)}
  dx={values?.dx ?? (isHorizontal ? defaultOffset : groupOffset.dx)}
  dy={values?.dy ?? (isHorizontal ? groupOffset.dy : defaultOffset)}
  textAnchor={resolvedTextAnchor ?? (isHorizontal ? (valAnchor === 'outside' || valAnchor === 'end' ? 'start' : valAnchor === 'start' ? 'end' : 'middle') : 'middle')}
  lineAnchor={values?.lineAnchor ?? (isHorizontal ? 'middle' : defaultLA)}
  lineHeight={values?.lineHeight}
  rotate={values?.rotate}
  class={values?.class}
  textClass={values?.textClass}
  fill={values?.fill ?? axisColor}
  fontSize={values?.fontSize ?? 12}
  fontWeight={values?.fontWeight}
  fontStyle={values?.fontStyle}
  stroke={values?.stroke}
  strokeWidth={values?.strokeWidth}
  paintOrder={values?.paintOrder}
/>
