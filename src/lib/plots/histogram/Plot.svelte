<script lang="ts" generics="TData extends Record<string, unknown>">
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import { processedPosition, SERIES_KEY } from '$lib/layout/phases/transforms';
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import { runStages } from '$lib/layout/phases/runStages';
	import { buildAxisStages } from '$lib/layout/phases/axisStages';
	import { buildHover, buildProcessedHoverPoints } from '$lib/layout/tooltip/buildHover';
	import { buildHistogramKind } from '$lib/plots/histogram/kind';
	import { createPlotHover } from '$lib/layout/tooltip/createPlotHover.svelte';
	import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
	import type { BasePlotProps } from '$lib/types/plots/props';
	import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import type { ChannelAccessors } from '$lib/types/layout/mapping';
	import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
	import type { SeriesProps, DataProps } from '$lib/types/plots/data/common';
	import type { AreaStyle } from '$lib/types/plots/styling';
	import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
	import type { HistogramPlotState, HistogramPlotCtx } from '$lib/types/plots/histogram/state';
	import type { ProcessedChannel, ProcessedRow } from '$lib/types/layout/phases';

	/** Flat rows binned on `x`. `y` is optional: a bin's count is its height. */
	type HistogramDataProps<TRow extends Record<string, unknown>> = Omit<DataProps<TRow>, 'y'> &
		Pick<ChannelAccessors<TRow>, 'y'>;

	/**
	 * A histogram: the rows of each series binned on `x`, one bar per bin, its
	 * height the bin's count. Takes the same data as a bar plot — `series`, or
	 * flat `data` with `x`/`grouping`/`color` — and a `transforms` entry of
	 * `binX` to change the bins, merged over the default one.
	 */
	type Props = BasePlotProps<
		SeriesProps<TData> | HistogramDataProps<TData>,
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
		grouping,
		color,
		styles = {},
		markers = [],
		scales = {},
		margins = $bindable(),
		tooltip = undefined,
		transforms = [],
		statistics = [],
		segments = {}
	}: Props = $props();

	const cfg = $derived(getConfiguration());
	const legendInteraction = $derived(getLegendInteraction());

	// The plot's own pipeline (see `buildHistogramKind`), run once via `runStages`.
	const stages = buildAxisStages(buildHistogramKind<TData>());
	const ctx = $derived<HistogramPlotCtx>({ cfg, legendInteraction });
	const plotState = $derived(
		runStages<HistogramPlotState<TData>, HistogramPlotCtx>(
			stages,
			{
				series,
				data,
				x,
				grouping,
				color,
				scales,
				width,
				height,
				margins,
				transforms,
				statistics,
				segments,
				authorMarkers: markers
			} as HistogramPlotState<TData>,
			ctx
		)
	);

	const colorForSeries = $derived(plotState.colorForSeries!);
	const resolvedScales = $derived(plotState.scales);
	const scopedGroups = $derived(plotState.scopedGroups!);
	const processed = $derived(plotState.processedData!);

	// A bin's row carries its count and edges as channels (often symbol-keyed);
	// it sits at its centre, as tall as its top (a stacked bin's `y2`).
	const position = $derived(processedPosition(processed));
	const read = (channel: ProcessedChannel | undefined) =>
		channel === undefined
			? () => undefined
			: (resolveAccessor(channel as never) as (row: ProcessedRow) => unknown);
	const binCentre = $derived((d: TData) => Number(position.x(d)));
	const binTop = $derived((d: TData) => Number(position.y(d)));
	const binCount = $derived((d: TData) => Number(read(processed.channels.y)(d)));

	// What a hovered bar reads as: its own rows, plus its count, the edges it spans, and its series.
	const binRow = (d: TData) => ({
		...d,
		count: binCount(d),
		from: Number(read(processed.channels.x1)(d)),
		to: Number(read(processed.channels.x2)(d)),
		group: d[SERIES_KEY]
	});

	const hoverPoints = $derived(
		buildProcessedHoverPoints<TData>({
			processed,
			colorFor: colorForSeries,
			legendInteraction,
			label: (row) => String(binCount(row)),
			row: (row) => binRow(row) as TData
		})
	);

	const hover = $derived(
		buildHover({
			tooltip,
			markers,
			points: hoverPoints,
			label: (r: TData) => String(binCount(r)),
			defaultStrategy: 'x'
		})
	);

	// Created once, not `$derived`.
	const hoverController = createPlotHover<TData>({
		hover: () => hover,
		getX: () => binCentre,
		getY: () => binTop,
		width: () => width,
		height: () => height
	});
</script>

<BasePlotLayout
	{width}
	{height}
	data={processed.data as TData[]}
	getX={binCentre}
	getY={binTop}
	{hover}
	scales={resolvedScales}
	{styles}
	{margins}
	markers={plotState.markers ?? []}
	seriesData={plotState.resolvedSeries}
	{scopedGroups}
	{hoverController}
/>
