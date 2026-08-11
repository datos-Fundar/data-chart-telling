<script lang="ts" generics="TData = Record<string, unknown>">
  import { Dot } from 'svelteplot';
  import type { MarkerProps } from '$lib/types/markers/props';
  import type { AxisValue } from '$lib/types/layout/scales';
  import type { DotStyle } from '$lib/types/plots/styling';

  interface Props extends MarkerProps<TData> {
    x?: AxisValue | ((d: TData) => AxisValue);
    y?: AxisValue | ((d: TData) => AxisValue);
    style?: DotStyle;
  }

  const { data = [], x, y, style }: Props = $props();

  const xAccessor = $derived(typeof x === 'function' ? x : () => x ?? 0);
  const yAccessor = $derived(typeof y === 'function' ? y : () => y ?? 0);
  const displayData = $derived(data.length > 0 ? data : [{} as TData]);

  const r = $derived(style?.dotRadius ?? 5);
  const fill = $derived(style?.dotFill ?? 'currentColor');
  const fillOpacity = $derived(style?.dotFillOpacity ?? 1);
  const symbol = $derived(style?.dotSymbol ?? 'circle');
  const stroke = $derived(style?.dotStroke ?? 'currentColor');
  const strokeWidth = $derived(style?.dotStrokeWidth ?? 1);
  const strokeOpacity = $derived(style?.dotStrokeOpacity ?? 1);
  const strokeDasharray = $derived(style?.dotStrokeDasharray);
</script>

<Dot
  data={displayData}
  x={xAccessor}
  y={yAccessor}
  {r}
  {fill}
  {fillOpacity}
  {stroke}
  {strokeWidth}
  {strokeOpacity}
  {strokeDasharray}
  {symbol}
/>
