<script lang="ts" generics="TData = Record<string, unknown>">
	import { Dot } from 'svelteplot';
	import { resolveChannelFill } from '$lib/markers/resolveChannelFill';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { MarkerProps } from '$lib/types/markers/props';
	import type { AxisValue, ChannelScalesConfig } from '$lib/types/layout/scales';
	import type { DotStyle } from '$lib/types/plots/styling';

	interface Props extends MarkerProps<TData> {
		x?: AxisValue | ((d: TData) => AxisValue);
		y?: AxisValue | ((d: TData) => AxisValue);
		/** Per-row radius, or a constant — overrides `styles.dotRadius` when set. */
		r?: number | ((d: TData) => number);
		/** Per-row fill, overriding `styles.dotFill` — ignored when `color` is set. */
		fill?: (d: TData) => string;
		/** Continuous value driving a per-dot color ramp — takes priority over `fill`/`styles.dotFill` when set. */
		color?: (d: TData) => unknown;
		/** The ramp itself — same shape as a plot's own `scales` prop. */
		scales?: ChannelScalesConfig;
		styles?: DotStyle;
	}

	const { data = [], x, y, r: rProp, fill: fillProp, color, scales, styles }: Props = $props();

	const cfg = $derived(getConfiguration());

	const xAccessor = $derived(typeof x === 'function' ? x : () => x ?? 0);
	const yAccessor = $derived(typeof y === 'function' ? y : () => y ?? 0);
	/** A literal `x`/`y` draws one dot at a fixed point regardless of `data`; an accessor reads its position per row. */
	const displayData = $derived(
		data.length > 0 || typeof x === 'function' || typeof y === 'function' ? data : [{} as TData]
	);

	const resolvedFill = $derived(resolveChannelFill(displayData, color, scales, cfg));
	const r = $derived(rProp ?? styles?.dotRadius ?? 5);
	const fill = $derived(resolvedFill ?? fillProp ?? styles?.dotFill ?? 'currentColor');
	const fillOpacity = $derived(styles?.dotFillOpacity ?? 1);
	const symbol = $derived(styles?.dotSymbol ?? 'circle');
	const stroke = $derived(styles?.dotStroke ?? 'currentColor');
	const strokeWidth = $derived(styles?.dotStrokeWidth ?? 1);
	const strokeOpacity = $derived(styles?.dotStrokeOpacity ?? 1);
	const strokeDasharray = $derived(styles?.dotStrokeDasharray);
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
