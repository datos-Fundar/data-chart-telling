<script lang="ts" generics="TData = Record<string, unknown>">
  import { Dot } from 'svelteplot';
  import { makeColorScale } from '$lib/utils/color';
  import { getConfiguration } from '$lib/configuration/config.svelte';
  import type { MarkerProps } from '$lib/types/markers/props';
  import type { AxisValue } from '$lib/types/layout/scales';
  import type { DotStyle } from '$lib/types/plots/styling';
  import type { ColorsStyle } from '$lib/types/layout/styles';

  interface Props extends MarkerProps<TData> {
    x?: AxisValue | ((d: TData) => AxisValue);
    y?: AxisValue | ((d: TData) => AxisValue);
    /** Per-row radius, or a constant — overrides `style.dotRadius` when set. */
    r?: number | ((d: TData) => number);
    /** Per-row fill, overriding `style.dotFill` — ignored when `value` is set. */
    fill?: (d: TData) => string;
    /** Continuous value driving a per-dot color ramp through `style.colors` — takes priority over `fill`/`style.dotFill` when set. */
    value?: (d: TData) => number;
    style?: DotStyle & { colors?: ColorsStyle };
  }

  const { data = [], x, y, r: rProp, fill: fillProp, value, style }: Props = $props();

  const cfg = $derived(getConfiguration());

  const xAccessor = $derived(typeof x === 'function' ? x : () => x ?? 0);
  const yAccessor = $derived(typeof y === 'function' ? y : () => y ?? 0);
  /** A literal `x`/`y` draws one dot at a fixed point regardless of `data`; an accessor reads its position per row. */
  const displayData = $derived(
    data.length > 0 || typeof x === 'function' || typeof y === 'function' ? data : [{} as TData],
  );

  /** Color scale built from `value`'s own data extent — `null` when `value` is unset. */
  const valueColorScale = $derived.by(() => {
    if (!value) return null;
    const vals = displayData.map((d) => Number(value(d))).filter((v) => Number.isFinite(v));
    if (!vals.length) return null;
    return makeColorScale(
      Math.min(...vals),
      Math.max(...vals),
      style?.colors?.min ?? cfg.continuous.min,
      style?.colors?.max ?? cfg.continuous.max,
    );
  });

  const r = $derived(rProp ?? style?.dotRadius ?? 5);
  const fill = $derived(
    valueColorScale && value ? (d: TData) => valueColorScale(Number(value(d))) : (fillProp ?? style?.dotFill ?? 'currentColor'),
  );
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
