<script lang="ts" generics="TData = Record<string, unknown>">
  import { Text } from 'svelteplot';
  import type { MarkerProps } from '$lib/types/markers/props';
  import type { AxisValue } from '$lib/types/layout/scales';
  import type { FontStyle } from '$lib/types/plots/styling';

  interface Props extends MarkerProps<TData> {
    x?: AxisValue | ((d: TData) => AxisValue);
    y?: AxisValue | ((d: TData) => AxisValue);
    text?: string | ((d: TData) => string);
    styles?: FontStyle;
  }

  const {
    data = [],
    x,
    y,
    text = '',
    styles,
  }: Props = $props();

  const xAccessor = $derived(typeof x === 'function' ? x : () => x ?? 0);
  const yAccessor = $derived(typeof y === 'function' ? y : () => y ?? 0);
  const textAccessor = $derived(typeof text === 'function' ? text : () => text ?? '');
  const displayData = $derived(data.length > 0 ? data : [{} as TData]);

  const fill = $derived(styles?.fill ?? 'currentColor');
  const fontSize = $derived(styles?.fontSize ?? 12);
  const fontWeight = $derived(styles?.fontWeight ?? 'normal');
  const fontStyleProp = $derived(styles?.fontStyle ?? 'normal');
  // 'outside' is meant to be resolved per-point by the caller (see
  // HoverMarker, which knows each point's signed x); a caller that passes it
  // through unresolved falls back to 'start' rather than an invalid svelteplot value.
  const textAnchor = $derived(styles?.textAnchor === 'outside' ? 'start' : (styles?.textAnchor ?? 'middle'));
  const lineAnchor = $derived(styles?.lineAnchor ?? 'middle');
  const dx = $derived(styles?.dx ?? 0);
  const dy = $derived(styles?.dy ?? 0);
</script>

{#if text}
  <Text
    data={displayData}
    x={xAccessor}
    y={yAccessor}
    text={textAccessor}
    {fill}
    {fontSize}
    {fontWeight}
    fontStyle={fontStyleProp}
    {textAnchor}
    {lineAnchor}
    lineHeight={styles?.lineHeight}
    rotate={styles?.rotate}
    stroke={styles?.stroke}
    strokeWidth={styles?.strokeWidth}
    paintOrder={styles?.paintOrder}
    {dx}
    {dy}
    class={styles?.class}
    textClass={styles?.textClass}
  />
{/if}
