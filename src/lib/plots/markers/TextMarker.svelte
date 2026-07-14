<script lang="ts" generics="TData = Record<string, unknown>">
  import { Text } from 'svelteplot';
  import type { MarkerProps } from '$lib/types/plots/markers';
  import type { AxisValue } from '$lib/types/plots/common';
  import type { FontStyle } from '$lib/types/plots/styles';

  interface Props extends MarkerProps<TData> {
    x?: AxisValue | ((d: TData) => AxisValue);
    y?: AxisValue | ((d: TData) => AxisValue);
    text?: string | ((d: TData) => string);
    style?: FontStyle;
  }

  const {
    data = [],
    x,
    y,
    text = '',
    style,
  }: Props = $props();

  const xAccessor = $derived(typeof x === 'function' ? x : () => x ?? 0);
  const yAccessor = $derived(typeof y === 'function' ? y : () => y ?? 0);
  const textAccessor = $derived(typeof text === 'function' ? text : () => text ?? '');
  const displayData = $derived(data.length > 0 ? data : [{} as TData]);

  const fill = $derived(style?.fill ?? 'currentColor');
  const fontSize = $derived(style?.fontSize ?? 12);
  const fontWeight = $derived(style?.fontWeight ?? 'normal');
  const fontStyleProp = $derived(style?.fontStyle ?? 'normal');
  // 'outside' is meant to be resolved per-point by the caller (see
  // HoverMarker, which knows each point's signed x); a caller that passes it
  // through unresolved falls back to 'start' rather than an invalid svelteplot value.
  const textAnchor = $derived(style?.textAnchor === 'outside' ? 'start' : (style?.textAnchor ?? 'middle'));
  const lineAnchor = $derived(style?.lineAnchor ?? 'middle');
  const dx = $derived(style?.dx ?? 0);
  const dy = $derived(style?.dy ?? 0);
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
    lineHeight={style?.lineHeight}
    rotate={style?.rotate}
    stroke={style?.stroke}
    strokeWidth={style?.strokeWidth}
    paintOrder={style?.paintOrder}
    {dx}
    {dy}
    class={style?.class}
    textClass={style?.textClass}
  />
{/if}
