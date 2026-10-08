<script lang="ts" generics="TData extends Record<string, unknown>">
	import { validateSegments } from '$lib/plots/utils/segments';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import { buildAxisStages, runStages } from '$lib/layout/phases/stages';
	import { buildHover } from '$lib/layout/tooltip/buildHover';
	import { buildHeatmapKind } from '$lib/plots/heatmap/kind';
	import { createPlotHover } from '$lib/layout/tooltip/createPlotHover.svelte';
	import BasePlotLayout from '$lib/layout/base/BasePlotLayout.svelte';
	import type { HeatmapPlotCoreProps } from '$lib/types/plots/heatmap/props';
	import type { AxisValue } from '$lib/types/layout/mapping';
	import type { HeatmapPlotState, HeatmapPlotCtx } from '$lib/types/plots/heatmap/state';

	/** A grid of value-colored cells; the ramp comes from `scales.color`, its domain from the visible data when unset. */
	type Props = HeatmapPlotCoreProps<TData>;

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
		margins = $bindable(),
		markers = [],
		tooltip = undefined,
		statistics = [],
		transforms = []
	}: Props = $props();

	$effect(() => {
		validateSegments(segments);
		const scoped = markers.filter(
			(m) => (m.type === 'hover' || m.type === 'component') && m.series
		);
		if (scoped.length > 0) {
			console.warn(
				'HeatmapPlot: markers scoped to a `series` are ignored - heatmaps have no series concept.'
			);
		}
		const seriesKeys = Object.keys(segments).filter((k) => k !== 'default');
		if (seriesKeys.length > 0) {
			console.warn(
				`HeatmapPlot: segment groups have series-specific keys (${seriesKeys.join(', ')}) - heatmaps have no named series. Use the 'default' key instead.`
			);
		}
	});

	const cfg = $derived(getConfiguration());
	const formatValue = $derived(styles.values?.format ?? ((v: number) => `${v}`));

	const legendInteraction = $derived(getLegendInteraction());
	const range = $derived(legendInteraction?.continuousRange);

	// The plot's own pipeline (see `buildHeatmapKind`), run once via `runStages`.
	const stages = buildAxisStages(buildHeatmapKind<TData>());
	const ctx = $derived<HeatmapPlotCtx>({ cfg, legendInteraction, range });
	const plotState = $derived(
		runStages<HeatmapPlotState<TData>, HeatmapPlotCtx>(
			stages,
			{
				series,
				data,
				x,
				y,
				color,
				opacity,
				segments,
				values: styles.values,
				scales,
				width,
				height,
				margins,
				statistics,
				transforms,
				authorMarkers: markers
			},
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
	// in hover/tooltip - it's simply absent from the candidate list.
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

	const hover = $derived(
		buildHover({
			tooltip,
			format: plotState.tooltipFormat!,
			markers,
			points: hoverPoints,
			label: (d: TData) => formatValue(Number(getColor(d)), ''),
			defaultStrategy: 'punctual'
		})
	);

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
	markers={plotState.markers ?? []}
	seriesData={resolvedSeries}
/>
