<script lang="ts" generics="TData extends Record<string, unknown>">
	import { validateSegments } from '$lib/plots/utils/segments';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import { buildData } from '$lib/plots/heatmap/phases/data';
	import { buildMapping } from '$lib/plots/heatmap/phases/mapping';
	import { buildScales } from '$lib/plots/heatmap/phases/scales';
	import { buildMarkers } from '$lib/plots/heatmap/phases/markers';
	import { runStages } from '$lib/layout/phases/runStages';
	import { createPlotHover } from '$lib/layout/tooltip/createPlotHover.svelte';
	import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
	import ValueLabels from '$lib/plots/heatmap/ValueLabels.svelte';
	import {
		hasHoverMarker,
		resolveHoverStrategy,
		resolveHoverSync
	} from '$lib/layout/tooltip/utils';
	import type { BasePlotProps } from '$lib/types/plots/props';
	import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import type { SeriesProps, DataProps } from '$lib/types/plots/data/common';
	import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
	import type { CellSegmentStyle } from '$lib/types/plots/segments/common';
	import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
	import type { HeatmapPlotState, HeatmapPlotCtx } from '$lib/types/plots/heatmap/state';
	import type { PhaseStage } from '$lib/types/layout/phases';

	/**
	 * A categorical grid of value-coloured cells. Accepts either a pre-built
	 * `series` array (each {@link Series} may carry `color` as the colour
	 * accessor) or flat `data/x/y/color` props — mirrors the line/bar plot
	 * contract so the chart-level container/timeline/facet/legend wrap it
	 * unchanged.
	 *
	 * The colour ramp is configured via `scales.color` (domain/scheme/pivot);
	 * an unset domain is derived from the visible slice of data.
	 */
	type Props = BasePlotProps<
		SeriesProps<TData> | DataProps<TData>,
		TData,
		AxisBasedStylesConfig,
		CellSegmentStyle,
		AxisBasedMarkersConfig,
		AxisBasedScalesConfig<TData>
	>;

	let {
		width,
		height,
		series,
		data,
		x,
		y,
		color,
		opacity,
		styles = {},
		segments = {},
		scales = {},
		margins,
		markers = [],
		tooltip = undefined
	}: Props = $props();

	$effect(() => {
		validateSegments(segments);
		const scoped = markers.filter(
			(m) => (m.type === 'hover' || m.type === 'component') && m.series
		);
		if (scoped.length > 0) {
			console.warn(
				'HeatmapPlot: markers scoped to a `series` are ignored — heatmaps have no series concept.'
			);
		}
		const seriesKeys = Object.keys(segments).filter((k) => k !== 'default');
		if (seriesKeys.length > 0) {
			console.warn(
				`HeatmapPlot: segment groups have series-specific keys (${seriesKeys.join(', ')}) — heatmaps have no named series. Use the 'default' key instead.`
			);
		}
	});

	const cfg = $derived(getConfiguration());
	const showVals = $derived(styles.values?.show ?? true);
	const formatValue = $derived(styles.values?.format ?? ((v: number) => `${v}`));

	const legendInteraction = $derived(getLegendInteraction());
	const range = $derived(legendInteraction?.continuousRange);

	// The plot's own pipeline, run once via `runStages`.
	const stages: PhaseStage<HeatmapPlotState<TData>, HeatmapPlotCtx>[] = [
		{ phase: 'data', run: buildData },
		{ phase: 'mapping', run: buildMapping },
		{ phase: 'scales', run: buildScales },
		{ phase: 'markers', run: buildMarkers }
	];
	const ctx = $derived<HeatmapPlotCtx>({ cfg, range });
	const plotState = $derived(
		runStages<HeatmapPlotState<TData>, HeatmapPlotCtx>(
			stages,
			{ series, data, x, y, color, opacity, segments, scales, width, height, margins },
			ctx
		)
	);

	const resolvedSeries = $derived(plotState.resolvedSeries!);
	const flat = $derived(plotState.flat!);
	const getX = $derived(plotState.channels!.x.accessor);
	const getY = $derived(plotState.channels!.y.accessor);
	const getColor = $derived(plotState.channels!.color.accessor);
	const resolvedScales = $derived(plotState.scales);

	// A cell outside the active range is dimmed in place, but never surfaces
	// in hover/tooltip — it's simply absent from the candidate list.
	const hoverPoints = $derived(
		flat
			.filter((d) => {
				if (range == null) return true;
				const v = Number(getColor(d));
				return v >= range.min && v <= range.max;
			})
			.map((d) => ({
				x: getX(d) as AxisValue,
				y: getY(d) as AxisValue,
				row: d,
				label: formatValue(Number(getColor(d)), '')
			}))
	);

	const hover = $derived({
		active: tooltip != null || hasHoverMarker(markers),
		points: hoverPoints,
		label: (d: TData) => formatValue(Number(getColor(d)), ''),
		strategy: resolveHoverStrategy(tooltip?.strategy, markers, 'punctual'),
		sync: resolveHoverSync(tooltip?.sync, markers),
		tooltip
	});

	// Created once, not `$derived`.
	const hoverController = createPlotHover<TData>({
		hover: () => hover,
		getX: () => getX,
		getY: () => getY,
		width: () => width,
		height: () => height
	});
</script>

<BasePlotLayout
	{width}
	{height}
	{styles}
	data={flat}
	{getX}
	{getY}
	{hover}
	scales={resolvedScales}
	{margins}
	{hoverController}
	markers={[...(plotState.markers ?? []), ...markers]}
	seriesData={resolvedSeries}
>
	{#if showVals}
		<ValueLabels
			data={flat}
			{getX}
			{getY}
			{getColor}
			{formatValue}
			values={styles.values}
			defaultColor={cfg.continuous.labelColor}
		/>
	{/if}
</BasePlotLayout>
