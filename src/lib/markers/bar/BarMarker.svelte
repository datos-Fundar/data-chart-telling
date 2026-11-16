<script lang="ts">
	import { RowStyle } from '$lib/markers/utils/RowStyle';
	import { Paint } from '$lib/markers/utils/Paint';
	import GradientDefs from '$lib/markers/utils/GradientDefs.svelte';
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { BarX, BarY } from 'svelteplot';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { BarMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'bar'` marker: `role: 'segment'` (visible bar via
	 * `<BarX>`/`<BarY>`) or `role: 'hitArea'` (invisible hover hit region for
	 * one segment).
	 */
	let { marker }: { marker: BarMarkerConfig } = $props();
	const events = MarkerEvents.use(() => marker);

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelFill = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));
	const id = $props.id();
	const fill = $derived(Paint.of(data, marker.styles?.fill, channelFill, `${id}-fill`));
	const stroke = $derived(Paint.of(data, marker.styles?.stroke, undefined, `${id}-stroke`));

	const context = usePlot();
	const plot = context.svelteplot;
	const isHorizontal = $derived(marker.isHorizontal ?? context.axes?.isHorizontal ?? false);
	function categoryScaleFor(isHorizontal: boolean) {
		return isHorizontal ? plot.scales.y : plot.scales.x;
	}
	function valueScaleFor(isHorizontal: boolean) {
		return isHorizontal ? plot.scales.x : plot.scales.y;
	}
	function valueExtentFor(isHorizontal: boolean): [number, number] {
		const range = valueScaleFor(isHorizontal)?.fn?.range?.();
		if (!range || range.length < 2) return [0, 0];
		const a = Number(range[0]);
		const b = Number(range[range.length - 1]);
		return [Math.min(a, b), Math.max(a, b)];
	}
</script>

{#if marker.role === 'segment'}
	<GradientDefs paints={[fill, stroke]} />
	{@const categoryScale = categoryScaleFor(isHorizontal)}
	{@const bandwidth = categoryScale?.type === 'band' ? categoryScale.fn.bandwidth() : 0}
	{@const centered =
		marker.thickness != null ? Math.max(0, (bandwidth - marker.thickness) / 2) : undefined}
	{#if isHorizontal}
		<BarX
			{...events.props}
			{data}
			y={marker.y}
			x1={marker.x1}
			x2={marker.x2}
			insetTop={centered ??
				(marker.styles?.insetTop != null ? marker.styles?.insetTop * bandwidth : undefined)}
			insetBottom={centered ??
				(marker.styles?.insetBottom != null ? marker.styles?.insetBottom * bandwidth : undefined)}
			fill={fill.prop}
			fillOpacity={RowStyle.opacity(marker.styles?.fillOpacity)}
			stroke={stroke.prop}
			strokeWidth={RowStyle.field(marker.styles?.strokeWidth)}
			strokeOpacity={RowStyle.opacity(marker.styles?.strokeOpacity)}
			strokeDasharray={marker.styles?.strokeDasharray}
			borderRadius={RowStyle.field(marker.styles?.borderRadius)}
		/>
	{:else}
		<BarY
			{...events.props}
			{data}
			x={marker.x}
			y1={marker.y1}
			y2={marker.y2}
			insetLeft={centered ??
				(marker.styles?.insetLeft != null ? marker.styles?.insetLeft * bandwidth : undefined)}
			insetRight={centered ??
				(marker.styles?.insetRight != null ? marker.styles?.insetRight * bandwidth : undefined)}
			fill={fill.prop}
			fillOpacity={RowStyle.opacity(marker.styles?.fillOpacity)}
			stroke={stroke.prop}
			strokeWidth={RowStyle.field(marker.styles?.strokeWidth)}
			strokeOpacity={RowStyle.opacity(marker.styles?.strokeOpacity)}
			strokeDasharray={marker.styles?.strokeDasharray}
			borderRadius={RowStyle.field(marker.styles?.borderRadius)}
		/>
	{/if}
{:else}
	{@const categoryScale = categoryScaleFor(isHorizontal)}
	{#if categoryScale?.type === 'band'}
		{@const bandwidth = categoryScale.fn.bandwidth()}
		{@const bandStart = Number(categoryScale.fn(marker.category as never) ?? 0)}
		{@const insetLeft = (marker.styles?.insetLeft ?? 0) * bandwidth}
		{@const insetRight = (marker.styles?.insetRight ?? 0) * bandwidth}
		{@const insetTop = (marker.styles?.insetTop ?? 0) * bandwidth}
		{@const insetBottom = (marker.styles?.insetBottom ?? 0) * bandwidth}
		<!-- The band runs the plot's whole value axis, so the pointer needn't be over the bar. -->
		{@const [rangeMin, rangeMax] = valueExtentFor(isHorizontal)}
		{#if isHorizontal}
			<rect
				class="dct-hit-area"
				x={rangeMin + insetLeft}
				y={bandStart + insetBottom}
				width={Math.max(0, rangeMax - rangeMin - insetLeft - insetRight)}
				height={Math.max(0, bandwidth - insetTop - insetBottom)}
				fill="transparent"
				{...events.forRow(data[0], 0)}
			/>
		{:else}
			<rect
				class="dct-hit-area"
				x={bandStart + insetLeft}
				y={rangeMin + insetBottom}
				width={Math.max(0, bandwidth - insetLeft - insetRight)}
				height={Math.max(0, rangeMax - rangeMin - insetTop - insetBottom)}
				fill="transparent"
				{...events.forRow(data[0], 0)}
			/>
		{/if}
	{/if}
{/if}
