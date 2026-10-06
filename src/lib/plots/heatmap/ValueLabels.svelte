<script lang="ts" generics="TData extends Record<string, unknown>">
	import { Text } from 'svelteplot';
	import type { AxisValue } from '$lib/types/layout/mapping';
	import type { ValuesStyle } from '$lib/types/layout/styles';

	/**
	 * Renders every cell's value label in one mark — heatmaps have no
	 * per-series concept to loop over, so unlike bar/line/pyramid this covers
	 * the whole flat dataset at once. Centered by default, overridable
	 * per-field via `styles.values.fontStyle`.
	 */
	let {
		data,
		getX,
		getY,
		getColor,
		formatValue,
		values,
		defaultColor
	}: {
		data: TData[];
		getX: (d: TData) => AxisValue;
		getY: (d: TData) => AxisValue;
		getColor: (d: TData) => unknown;
		formatValue: (value: number, seriesName: string) => string;
		values: ValuesStyle | undefined;
		defaultColor: string;
	} = $props();

	const font = $derived(values?.fontStyle);
	// 'outside' is a per-point escape hatch resolved by HoverMarker; heatmaps
	// have no signed axis to resolve it against, so treat it as unset.
	const resolvedTextAnchor = $derived(
		font?.textAnchor === 'outside' ? undefined : font?.textAnchor
	);
</script>

<Text
	{data}
	x={getX}
	y={getY}
	text={(d: TData) => formatValue(Number(getColor(d)), '')}
	fill={font?.fill ?? defaultColor}
	fontSize={font?.fontSize ?? 12}
	fontWeight={font?.fontWeight ?? 600}
	fontStyle={font?.fontStyle}
	textAnchor={resolvedTextAnchor ?? 'middle'}
	lineAnchor={font?.lineAnchor ?? 'middle'}
	dx={font?.dx ?? 0}
	dy={font?.dy ?? 0}
	lineHeight={font?.lineHeight}
	rotate={font?.rotate}
	stroke={font?.stroke}
	strokeWidth={font?.strokeWidth}
	paintOrder={font?.paintOrder}
	class={font?.class}
	textClass={font?.textClass}
/>
