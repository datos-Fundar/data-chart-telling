<script lang="ts" generics="TData extends Record<string, unknown>">
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import {
		disabledDotsOverride,
		disabledFillOverride,
		resolveEffectiveDisabledStyle
	} from '$lib/plots/utils/legendDisabled';
	import { processedPosition } from '$lib/layout/phases/transforms';
	import { runStages } from '$lib/layout/phases/runStages';
	import { buildAxisStages } from '$lib/layout/phases/axisStages';
	import { buildHover, buildProcessedHoverPoints } from '$lib/layout/tooltip/buildHover';
	import { buildScatterKind } from '$lib/plots/scatter/kind';
	import {
		createLabelMarginTracker,
		halfDimensionOverflowCap
	} from '$lib/plots/utils/labelOverflow.svelte';
	import { createPlotHover } from '$lib/layout/tooltip/createPlotHover.svelte';
	import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
	import { validateSegments } from '$lib/plots/utils/segments';
	import type { BasePlotProps } from '$lib/types/plots/props';
	import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import type { AxisValue } from '$lib/types/layout/mapping';
	import type { SeriesProps, DataProps } from '$lib/types/plots/data/common';
	import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
	import type { ScatterSegmentStyle } from '$lib/types/plots/segments/common';
	import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
	import type { LegendDisabledStyle } from '$lib/types/layout/legend';
	import type { ScatterPlotState, ScatterPlotCtx } from '$lib/types/plots/scatter/state';

	/**
	 * A point cloud on continuous x/y axes. Accepts either a pre-built `series`
	 * array or flat `data/x/y/color` props — mirrors the line/bar plot contract
	 * so the chart-level container/timeline/facet/legend wrap it unchanged. `r`
	 * gives every dot a per-row radius (bubble sizing), independent of `color`
	 * grouping — see `ChannelValue.r` for its auto-scaling behavior.
	 */
	type Props = BasePlotProps<
		SeriesProps<TData> | DataProps<TData>,
		TData,
		AxisBasedStylesConfig,
		ScatterSegmentStyle,
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
		r,
		opacity,
		symbol,
		styles = {},
		segments = {},
		markers = [],
		scales = {},
		margins,
		tooltip = undefined,
		statistics = [],
		transforms = []
	}: Props = $props();

	const cfg = $derived(getConfiguration());
	const legendInteraction = $derived(getLegendInteraction());

	$effect(() => {
		validateSegments(segments);
	});

	const hoverIsolate = $derived(styles.values?.hoverIsolate ?? false);

	// A value label hovered while `styles.values.hoverIsolate` is on dims
	// every other series exactly like a legend toggle would — local to this
	// one `<Plot>` instance (not the shared HoverStore) so the gesture can't
	// leak into unrelated tooltip/crosshair behavior.
	let hoverIsolatedSeries = $state<string | null>(null);

	function effectiveDisabledFor(name: string): LegendDisabledStyle | undefined {
		return resolveEffectiveDisabledStyle(
			name,
			legendInteraction,
			cfg.legend.disabledOpacity,
			hoverIsolate,
			hoverIsolatedSeries
		);
	}

	// The plot's own pipeline (see `buildScatterKind`), run once via `runStages`.
	const stages = buildAxisStages(buildScatterKind<TData>());
	const ctx = $derived<ScatterPlotCtx>({
		cfg,
		legendInteraction,
		disabledDotsFor: (name) => disabledDotsOverride(effectiveDisabledFor(name)),
		disabledFillFor: (name) => disabledFillOverride(effectiveDisabledFor(name)),
		onValueLabelOverflow: (overflow) => labelMargin.report(overflow),
		onValueLabelHover: (name) => {
			hoverIsolatedSeries = name;
		}
	});
	const plotState = $derived(
		runStages<ScatterPlotState<TData>, ScatterPlotCtx>(
			stages,
			{
				series,
				data,
				x,
				y,
				grouping,
				color,
				r,
				opacity,
				symbol,
				segments,
				values: styles.values,
				scales,
				width,
				height,
				margins,
				authorMarkers: markers,
				statistics,
				transforms
			},
			ctx
		)
	);

	const resolvedSeries = $derived(plotState.resolvedSeries!);
	const scopedGroups = $derived(plotState.scopedGroups!);
	const colorForSeries = $derived(plotState.colorForSeries!);
	const xAcc = $derived(plotState.channels!.x.accessor);
	const yAcc = $derived(plotState.channels!.y.accessor);
	const resolvedScales = $derived(plotState.scales);

	const processed = $derived(plotState.processedData!);
	const position = $derived(processedPosition(processed));
	const getX = $derived((d: TData) => position.x(d) as AxisValue);
	const getY = $derived((d: TData) => Number(position.y(d)));

	// A legend-disabled series is dimmed on the mark itself, but never surfaces
	// in hover/tooltip — its points are simply absent from the candidate list.
	const hoverPoints = $derived(
		buildProcessedHoverPoints<TData>({
			processed,
			colorFor: colorForSeries,
			legendInteraction,
			label: (row) => `${xAcc(row)}, ${yAcc(row)}`
		})
	);

	// Points scatter freely across x/y rather than sharing discrete x values —
	// 'punctual' matches the single nearest point, not a whole column.
	const hover = $derived(
		buildHover({
			tooltip,
			markers,
			points: hoverPoints,
			label: (row: TData) => `${xAcc(row)}, ${yAcc(row)}`,
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

	// See `halfDimensionOverflowCap`'s own doc comment — relevant here mainly
	// for a corner point with no room in any direction even after
	// `resolveEdgeAwareAnchor`'s own flip.
	const maxLabelOverflow = $derived(halfDimensionOverflowCap(width, height));

	// A scatter point's value label can grow past the plot's own content box
	// (e.g. a point pushed toward a corner, past what its own edge-aware flip
	// can fit) — reserving real space there is what each label's own overflow
	// measurement feeds into here, via a tracker local to this one `<Plot>`
	// instance. See `labelOverflow.svelte.ts`. Resets on `resolvedSeries` so
	// overflow from an earlier, differently-shaped frame doesn't linger once
	// that frame is gone.
	const labelMargin = createLabelMarginTracker(
		() => margins,
		() => resolvedSeries,
		undefined,
		() => maxLabelOverflow
	);
</script>

<BasePlotLayout
	{width}
	{height}
	{styles}
	data={processed.data as TData[]}
	{getX}
	{getY}
	{hover}
	scales={resolvedScales}
	{...labelMargin.plotProps}
	{hoverController}
	markers={plotState.markers ?? []}
	seriesData={resolvedSeries}
	{scopedGroups}
/>
