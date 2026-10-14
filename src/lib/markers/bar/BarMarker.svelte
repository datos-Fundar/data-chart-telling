<script lang="ts">
	import { BarX, BarY } from 'svelteplot';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { PlotContext } from '$lib/layout/plot/PlotContext';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { BarMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'bar'` marker: `role: 'segment'` (visible bar via
	 * `<BarX>`/`<BarY>`), `role: 'hitArea'` (invisible hover hit region for
	 * one segment), or `role: 'highlight'` (visible area highlight).
	 */
	let { marker }: { marker: BarMarkerConfig } = $props();

	const cfg = $derived(getConfiguration());
	const data = $derived(marker.data ?? []);
	const channelFill = $derived(MarkerChannels.buildFill(data, marker.color, marker.scales, cfg));

	const plot = usePlot().svelteplot;
	const hover = PlotContext.current()?.hover;
	const enter = $derived(
		marker.hover ? () => hover?.onPointer((marker.data ?? []) as Record<string, unknown>[]) : undefined
	);
	const leave = $derived(marker.hover ? hover?.onLeave : undefined);
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
	{@const categoryScale = categoryScaleFor(marker.isHorizontal)}
	{@const bandwidth = categoryScale?.type === 'band' ? categoryScale.fn.bandwidth() : 0}
	{#if marker.isHorizontal}
		<BarX
			{data}
			y={marker.y}
			x1={marker.x1}
			x2={marker.x2}
			insetTop={marker.insetTop != null ? marker.insetTop * bandwidth : undefined}
			insetBottom={marker.insetBottom != null ? marker.insetBottom * bandwidth : undefined}
			fill={channelFill ?? marker.styles?.fill}
			fillOpacity={marker.styles?.fillOpacity}
			stroke={marker.styles?.stroke}
			strokeWidth={marker.styles?.strokeWidth}
			strokeOpacity={marker.styles?.strokeOpacity}
			strokeDasharray={marker.styles?.strokeDasharray}
			borderRadius={marker.styles?.borderRadius}
		/>
	{:else}
		<BarY
			{data}
			x={marker.x}
			y1={marker.y1}
			y2={marker.y2}
			insetLeft={marker.insetLeft != null ? marker.insetLeft * bandwidth : undefined}
			insetRight={marker.insetRight != null ? marker.insetRight * bandwidth : undefined}
			fill={channelFill ?? marker.styles?.fill}
			fillOpacity={marker.styles?.fillOpacity}
			stroke={marker.styles?.stroke}
			strokeWidth={marker.styles?.strokeWidth}
			strokeOpacity={marker.styles?.strokeOpacity}
			strokeDasharray={marker.styles?.strokeDasharray}
			borderRadius={marker.styles?.borderRadius}
		/>
	{/if}
{:else}
	{@const categoryScale = categoryScaleFor(marker.isHorizontal)}
	{#if categoryScale?.type === 'band'}
		{@const bandwidth = categoryScale.fn.bandwidth()}
		{@const bandStart = Number(categoryScale.fn(marker.category as never) ?? 0)}
		{@const insetLeft = (marker.insetLeft ?? 0) * bandwidth}
		{@const insetRight = (marker.insetRight ?? 0) * bandwidth}
		{@const insetTop = (marker.insetTop ?? 0) * bandwidth}
		{@const insetBottom = (marker.insetBottom ?? 0) * bandwidth}
		{#if marker.role === 'hitArea'}
			<!-- The band runs the plot's whole value axis, so the pointer needn't be over the bar. -->
			{@const [rangeMin, rangeMax] = valueExtentFor(marker.isHorizontal)}
			{#if marker.isHorizontal}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<rect
					class="dct-hit-area"
					x={rangeMin + insetLeft}
					y={bandStart + insetBottom}
					width={Math.max(0, rangeMax - rangeMin - insetLeft - insetRight)}
					height={Math.max(0, bandwidth - insetTop - insetBottom)}
					fill="transparent"
					onpointerenter={enter}
					onpointerleave={leave}
				/>
			{:else}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<rect
					class="dct-hit-area"
					x={bandStart + insetLeft}
					y={rangeMin + insetBottom}
					width={Math.max(0, bandwidth - insetLeft - insetRight)}
					height={Math.max(0, rangeMax - rangeMin - insetTop - insetBottom)}
					fill="transparent"
					onpointerenter={enter}
					onpointerleave={leave}
				/>
			{/if}
		{:else}
			{@const [valueMin, valueMax] = valueExtentFor(marker.isHorizontal)}
			{#if marker.isHorizontal}
				{@const thickness = Math.max(0, bandwidth - insetTop - insetBottom) + 2}
				{@const center = bandStart + insetBottom + (bandwidth - insetTop - insetBottom) / 2}
				<rect
					class="hover-area"
					x={valueMin}
					y={center - thickness / 2}
					width={Math.max(0, valueMax - valueMin)}
					height={thickness}
					fill={marker.styles?.fill}
					fill-opacity={marker.styles?.fillOpacity}
					stroke={marker.styles?.stroke}
					stroke-width={marker.styles?.strokeWidth}
					stroke-opacity={marker.styles?.strokeOpacity}
					stroke-dasharray={marker.styles?.strokeDasharray}
					rx={marker.styles?.borderRadius}
					pointer-events="none"
				/>
			{:else}
				{@const thickness = Math.max(0, bandwidth - insetLeft - insetRight) + 2}
				{@const center = bandStart + insetLeft + (bandwidth - insetLeft - insetRight) / 2}
				<rect
					class="hover-area"
					x={center - thickness / 2}
					y={valueMin}
					width={thickness}
					height={Math.max(0, valueMax - valueMin)}
					fill={marker.styles?.fill}
					fill-opacity={marker.styles?.fillOpacity}
					stroke={marker.styles?.stroke}
					stroke-width={marker.styles?.strokeWidth}
					stroke-opacity={marker.styles?.strokeOpacity}
					stroke-dasharray={marker.styles?.strokeDasharray}
					ry={marker.styles?.borderRadius}
					pointer-events="none"
				/>
			{/if}
		{/if}
	{/if}
{/if}
