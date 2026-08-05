<script lang="ts" generics="TData extends Record<string, unknown>">
  import { Text } from 'svelteplot';
  import { resolveAccessor } from '$lib/plots/utils/accessors';
  import type { Series } from '$lib/types/plots/data/common';
  import type { ValuesStyle } from '$lib/types/plots/styles/common';
  import type { ValueAnchor } from '$lib/types/plots/constants';
  import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
  import type { VisualGroup } from '$lib/types/plots/segments/config';

  /**
   * Renders one series' value label on a pyramid bar — anchor-driven default
   * position/offset, mirrored left/right of the shared zero baseline
   * depending on `group.series.side`, overridable per-field via
   * `styles.values.fontStyle`.
   */
  let {
    group,
    valAnchor,
    fmtVal,
    values,
    axisColor,
  }: {
    group: VisualGroup<Series<TData> & { side: 'left' | 'right' }, BarSegmentStyle>;
    valAnchor: ValueAnchor;
    fmtVal: (value: number, seriesName: string) => string;
    values: ValuesStyle | undefined;
    axisColor: string;
  } = $props();

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

<Text
  data={group.series.data}
  x={xFn}
  y={getCategory}
  text={(d: TData) => fmtVal(Math.abs(Number(getMagnitude(d))), group.series.name)}
  dx={font?.dx ?? defaultDx}
  dy={font?.dy ?? 0}
  textAnchor={resolvedTextAnchor ?? defaultTextAnchor}
  lineAnchor={font?.lineAnchor ?? 'middle'}
  lineHeight={font?.lineHeight}
  rotate={font?.rotate}
  class={font?.class}
  textClass={font?.textClass}
  fill={font?.fill ?? axisColor}
  fontSize={font?.fontSize ?? 12}
  fontWeight={font?.fontWeight}
  fontStyle={font?.fontStyle}
  stroke={font?.stroke}
  strokeWidth={font?.strokeWidth}
  paintOrder={font?.paintOrder}
/>
