<script lang="ts" generics="TData extends Record<string, unknown>">
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import { buildData } from '$lib/plots/histogram/phases/data';
	import { buildMarkers } from '$lib/plots/histogram/phases/markers';
	import { buildScales } from '$lib/plots/histogram/phases/scales';
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
	import type { Accessor, SeriesProps } from '$lib/types/plots/data/common';
	import type { AreaStyle } from '$lib/types/plots/styling';
	import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
	import type { HistogramPlotState, HistogramPlotCtx } from '$lib/types/plots/histogram/state';
	import type { PhaseStage } from '$lib/types/layout/phases';

	/** Flat rows binned on `x`. A histogram has no `y` of its own: each bin's count is its height. */
	type HistogramDataProps<TRow extends Record<string, unknown>> = {
		series?: never;
		data: TRow[];
		x: Accessor<TRow, AxisValue>;
		y?: never;
		grouping?: Accessor<TRow, unknown>;
		color?: Accessor<TRow, unknown>;
		opacity?: never;
	};

	/**
	 * A histogram: the rows of each series binned on `x`, one bar per bin, its
	 * height the bin's count. Takes the same data as a bar plot — `series`, or
	 * flat `data` with `x`/`grouping`/`color` — and a `transforms` entry of
	 * `binX` to change the bins, merged over the default one.
	 */
	type Props = Omit<
		BasePlotProps<
			SeriesProps<TData> | HistogramDataProps<TData>,
			TData,
			AxisBasedStylesConfig,
			AreaStyle,
			AxisBasedMarkersConfig,
			AxisBasedScalesConfig<TData>
		>,
		'statistics'
	>;

	/** A bin marker as the "markers" phase leaves it: its own rows, and the series it is scoped to. */
	type BinRect<TRow> = { data?: TRow[]; series?: string; grouping?: unknown };

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
		segments = {}
	}: Props = $props();

	const cfg = $derived(getConfiguration());
	const legendInteraction = $derived(getLegendInteraction());

	// The plot's own pipeline, run once via `runStages`. "scales" pads the
	// domains to what the bins draw; the rest is forwarded to `BasePlotLayout`.
	const stages: PhaseStage<HistogramPlotState<TData>, HistogramPlotCtx>[] = [
		{ phase: 'data', run: buildData },
		{ phase: 'markers', run: buildMarkers },
		{ phase: 'scales', run: buildScales }
	];
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
				transforms,
				segments,
				authorMarkers: markers
			} as HistogramPlotState<TData>,
			ctx
		)
	);

	const colorForSeries = $derived(plotState.colorForSeries!);
	// A bin marker is a `rect` with its own rows, scoped to a series or not.
	const binMarkers = $derived((plotState.binMarkers ?? []) as BinRect<TData>[]);
	const resolvedScales = $derived(plotState.scales);
	const scopedGroups = $derived(plotState.scopedGroups!);
	const binRows = $derived(binMarkers.flatMap((m) => m.data ?? []));

	// The channels a bin's rows carry: svelteplot names a bin's edges with
	// symbols and its reduced value with a key, and every bin marker shares them.
	const binKeys = $derived(
		(binMarkers[0] ?? {}) as { x1?: PropertyKey; x2?: PropertyKey; y?: PropertyKey }
	);
	const binCentre = (d: TData) => {
		const row = d as Record<PropertyKey, unknown>;
		return (Number(row[binKeys.x1!]) + Number(row[binKeys.x2!])) / 2;
	};
	const binCount = (d: TData) => Number((d as Record<PropertyKey, unknown>)[binKeys.y!]);

	// What a hovered bar reads as: its own rows, plus its count, the edges it
	// spans, and its group. A flat histogram's group is its grouping field's value.
	const binFrom = (d: TData) => Number((d as Record<PropertyKey, unknown>)[binKeys.x1!]);
	const binTo = (d: TData) => Number((d as Record<PropertyKey, unknown>)[binKeys.x2!]);
	const groupField = $derived(binMarkers[0]?.grouping);
	const binRow = (d: TData, seriesName: string | undefined) => ({
		...d,
		count: binCount(d),
		from: binFrom(d),
		to: binTo(d),
		group:
			seriesName ??
			(typeof groupField === 'string' ? (d as Record<string, unknown>)[groupField] : undefined)
	});

	const hoverPoints = $derived(
		binMarkers.flatMap((m) => {
			const seriesName = m.series;
			if (seriesName !== undefined && legendInteraction?.disabledSeries.has(seriesName)) return [];
			return (m.data ?? []).map((d) => ({
				x: binCentre(d),
				y: binCount(d),
				row: binRow(d, seriesName) as TData,
				label: String(binCount(d)),
				series: seriesName,
				color: seriesName !== undefined ? colorForSeries(seriesName) : undefined
			}));
		})
	);

	const hover = $derived({
		active: tooltip != null || hasHoverMarker(markers),
		points: hoverPoints,
		label: (r: TData) => String(binCount(r)),
		strategy: resolveHoverStrategy(tooltip?.strategy, markers, 'x'),
		sync: resolveHoverSync(tooltip?.sync, markers),
		tooltip
	});

	// Created once, not `$derived`.
	const hoverController = createPlotHover<TData>({
		hover: () => hover,
		getX: () => binCentre,
		getY: () => binCount,
		width: () => width,
		height: () => height
	});
</script>

<BasePlotLayout
	{width}
	{height}
	data={binRows}
	getX={binCentre}
	getY={binCount}
	{hover}
	scales={resolvedScales}
	{styles}
	{margins}
	markers={plotState.markers ?? []}
	seriesData={plotState.resolvedSeries}
	{scopedGroups}
	{hoverController}
/>
