<script lang="ts" generics="TRow extends Record<string, unknown>">
	import BaseChart from '$lib/charts/BaseChart.svelte';
	import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
	import {
		resolveTooltip,
		resolveHoverStrategy,
		resolveHoverSync,
		hasHoverMarker
	} from '$lib/layout/tooltip/utils';
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import type { Accessor } from '$lib/types/plots/data/common';
	import type { ScatterSegmentStyle } from '$lib/types/plots/segments/common';
	import type { ChartProps } from '$lib/types/charts/props';

	/**
	 * High-level scatter chart. Groups flat rows by `color` into one point
	 * cloud per group and delegates all chrome to {@link BaseChart}. `r` gives
	 * every point a per-row radius (bubble sizing), independent of `color`
	 * grouping.
	 */
	let {
		width,
		height,
		title,
		subtitle,
		caption,
		legend,
		header,
		footer,
		data,
		x,
		y,
		grouping,
		color,
		r,
		styles = {},
		segments,
		markers = [],
		scales = {},
		margins,
		facet,
		timeline,
		tooltip
	}: ChartProps<TRow, ScatterSegmentStyle> & { r?: Accessor<TRow, number> | number } = $props();

	const tip = $derived(resolveTooltip(tooltip, 'punctual'));
	const hoverEnabled = $derived(tip.enabled || hasHoverMarker(markers));
	const resolvedStrategy = $derived(
		resolveHoverStrategy(tip.enabled ? tip.strategy : undefined, markers, 'punctual')
	);
	const resolvedSync = $derived(resolveHoverSync(tip.enabled ? tip.sync : undefined, markers));
	const getX = $derived(resolveAccessor<TRow>(x));
	const getY = $derived(resolveAccessor<TRow>(y));
	const defaultFormat = $derived((row: TRow) => `${String(getX(row))}, ${String(getY(row))}`);
</script>

<BaseChart
	{width}
	{height}
	{title}
	{subtitle}
	{caption}
	{legend}
	{header}
	{footer}
	{data}
	{facet}
	{timeline}
	hover={hoverEnabled ? { strategy: resolvedStrategy, sync: resolvedSync } : undefined}
>
	{#snippet plot({ data: rows, width: w, height: h, facetValue })}
		<ScatterPlot
			width={w}
			height={h}
			data={rows}
			{x}
			{y}
			{grouping}
			{color}
			{r}
			{styles}
			{segments}
			{markers}
			{scales}
			{margins}
			tooltip={tip.enabled
				? {
						format: tip.format ?? defaultFormat,
						facetId: facetValue ?? '',
						strategy: tip.strategy,
						sync: tip.sync,
						series: tip.series,
						content: tip.content,
						anchorX: tip.anchorX,
						anchorY: tip.anchorY
					}
				: undefined}
		/>
	{/snippet}
</BaseChart>
