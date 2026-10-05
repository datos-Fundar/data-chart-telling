<script lang="ts" generics="TData extends Record<string, unknown>">
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import { buildData } from '$lib/plots/area/phases/data';
	import { buildMapping } from '$lib/plots/area/phases/mapping';
	import { buildStatistics } from '$lib/plots/area/phases/statistics';
	import { buildScales } from '$lib/plots/area/phases/scales';
	import { buildMarkers } from '$lib/plots/area/phases/markers';
	import { runStages } from '$lib/layout/phases/runStages';
	import { createPlotHover } from '$lib/layout/tooltip/createPlotHover.svelte';
	import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
	import {
		hasHoverMarker,
		resolveHoverStrategy,
		resolveHoverSync
	} from '$lib/layout/tooltip/utils';
	import type { BasePlotProps } from '$lib/types/plots/props';
	import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
	import type { SeriesProps, DataProps } from '$lib/types/plots/data/common';
	import type { AreaStyle } from '$lib/types/plots/styling';
	import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
	import type { AreaPlotState, AreaPlotCtx } from '$lib/types/plots/area/state';
	import type { PhaseStage } from '$lib/types/layout/phases';

	/**
	 * An area per series, filled from its own baseline. Takes the same data as
	 * a line plot — `series`, or flat `data` with `x`/`y`/`grouping`/`color` —
	 * and draws each series as a filled area instead of a line.
	 */
	type Props = BasePlotProps<
		SeriesProps<TData> | DataProps<TData>,
		TData,
		AxisBasedStylesConfig,
		AreaStyle,
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
		grouping,
		color,
		styles = {},
		markers = [],
		scales = {},
		margins = $bindable(),
		tooltip = undefined,
		statistics = [],
		transforms = [],
		segments = {}
	}: Props = $props();

	const cfg = $derived(getConfiguration());
	const legendInteraction = $derived(getLegendInteraction());

	// The plot's own pipeline, run once via `runStages`. "scales" only pads an
	// unpinned `x` domain; the rest is forwarded unresolved to `BasePlotLayout`.
	const stages: PhaseStage<AreaPlotState<TData>, AreaPlotCtx>[] = [
		{ phase: 'data', run: buildData },
		{ phase: 'mapping', run: buildMapping },
		{ phase: 'statistics', run: buildStatistics },
		{ phase: 'scales', run: buildScales },
		{ phase: 'markers', run: buildMarkers }
	];
	const ctx = $derived<AreaPlotCtx>({ cfg, legendInteraction });
	const plotState = $derived(
		runStages<AreaPlotState<TData>, AreaPlotCtx>(
			stages,
			{
				series,
				data,
				x,
				y,
				grouping,
				color,
				scales,
				statistics,
				segments,
				transforms,
				authorMarkers: markers
			} as AreaPlotState<TData>,
			ctx
		)
	);

	const resolvedSeries = $derived(plotState.resolvedSeries!);
	const scopedGroups = $derived(plotState.scopedGroups!);
	const colorForSeries = $derived(plotState.colorForSeries!);
	const flat = $derived(plotState.flat!);
	const resolvedScales = $derived(plotState.scales);
	const xAcc = $derived(plotState.channels!.x.accessor);
	const yAcc = $derived(plotState.channels!.y.accessor);

	const hoverPoints = $derived(
		resolvedSeries.flatMap((s) => {
			if (legendInteraction?.disabledSeries.has(s.name)) return [];
			const sx = resolveAccessor(s.x);
			const sy = resolveAccessor(s.y);
			return s.data.map((d) => ({
				x: sx(d) as AxisValue,
				y: Number(sy(d)),
				row: d,
				label: String(sy(d)),
				series: s.name,
				color: colorForSeries(s.name)
			}));
		})
	);

	const hover = $derived({
		active: tooltip != null || hasHoverMarker(markers),
		points: hoverPoints,
		label: (r: TData) => String(yAcc(r)),
		strategy: resolveHoverStrategy(tooltip?.strategy, markers, 'x'),
		sync: resolveHoverSync(tooltip?.sync, markers),
		tooltip
	});

	// Created once, not `$derived`.
	const hoverController = createPlotHover<TData>({
		hover: () => hover,
		getX: () => xAcc,
		getY: () => (d: TData) => Number(yAcc(d)),
		width: () => width,
		height: () => height
	});
</script>

<BasePlotLayout
	{width}
	{height}
	data={flat}
	getX={xAcc}
	getY={(d) => Number(yAcc(d))}
	{hover}
	scales={resolvedScales}
	{styles}
	{margins}
	markers={plotState.markers ?? []}
	seriesData={resolvedSeries}
	{scopedGroups}
	{hoverController}
/>
