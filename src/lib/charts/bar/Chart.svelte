<script lang="ts" generics="TRow extends Record<string, unknown>">
	import BaseChart from '$lib/charts/BaseChart.svelte';
	import BarPlot from '$lib/plots/bar/Plot.svelte';
	import {
		resolveTooltip,
		resolveHoverStrategy,
		resolveHoverSync,
		hasHoverMarker
	} from '$lib/layout/tooltip/utils';
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import { resolveTimelineInterpolation } from '$lib/utils/interpolate';
	import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
	import type { GapsAwareChartProps } from '$lib/types/charts/props';

	/**
	 * High-level bar chart. Groups flat rows by `color` into one series per
	 * group and delegates all chrome to {@link BaseChart}. Styling lives
	 * entirely in `segments` — there's no separate colour shorthand, so a
	 * series' look is always defined in one place.
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
		styles = {},
		scales = {},
		margins,
		segments,
		markers = [],
		facet,
		timeline,
		tooltip
	}: GapsAwareChartProps<TRow, BarSegmentStyle> = $props();

	const tip = $derived(resolveTooltip(tooltip, 'x'));
	const hoverEnabled = $derived(tip.enabled || hasHoverMarker(markers));
	const resolvedStrategy = $derived(
		resolveHoverStrategy(tip.enabled ? tip.strategy : undefined, markers, 'x')
	);
	const resolvedSync = $derived(resolveHoverSync(tip.enabled ? tip.sync : undefined, markers));
	const getX = $derived(resolveAccessor<TRow>(x));
	const getY = $derived(resolveAccessor<TRow>(y));
	const getGrouping = $derived(
		grouping ? resolveAccessor<TRow>(grouping) : color ? resolveAccessor<TRow>(color) : null
	);
	const defaultFormat = $derived((row: TRow) => `${String(getX(row))}: ${getY(row)}`);

	// A bar timeline snapshots one frame per step; interpolation needs to match
	// each bar across steps by its category (`x`) — and by its group too, when
	// the chart groups categories into series — not by the timeline's own time field.
	const timelineConfig = $derived(
		timeline
			? {
					...timeline,
					interpolate: resolveTimelineInterpolation(timeline.interpolate, {
						value: y,
						key: getGrouping ? (d: TRow) => `${String(getX(d))}::${String(getGrouping(d))}` : x
					})
				}
			: undefined
	);
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
	timeline={timelineConfig}
	hover={hoverEnabled ? { strategy: resolvedStrategy, sync: resolvedSync } : undefined}
>
	{#snippet plot({ data: rows, width: w, height: h, facetValue })}
		<BarPlot
			width={w}
			height={h}
			data={rows}
			{x}
			{y}
			{grouping}
			{color}
			{styles}
			{scales}
			{margins}
			{segments}
			{markers}
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
