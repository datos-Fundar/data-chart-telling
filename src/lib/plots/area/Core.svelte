<script lang="ts" generics="TData extends Record<string, unknown>">
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import {
		disabledFillOverride,
		resolveEffectiveDisabledStyle
	} from '$lib/plots/utils/legendDisabled';
	import {
		createLabelMarginTracker,
		halfDimensionOverflowCap
	} from '$lib/plots/utils/labelOverflow.svelte';
	import { estimateLineValueLabelMargin } from '$lib/plots/line/valueLabelMargin';
	import { processedPosition } from '$lib/layout/phases/transforms';
	import { buildAxisStages, runStages } from '$lib/layout/phases/stages';
	import { buildHover, buildProcessedHoverPoints } from '$lib/layout/tooltip/buildHover';
	import { buildAreaKind } from '$lib/plots/area/kind';
	import { createPlotHover } from '$lib/layout/tooltip/createPlotHover.svelte';
	import BasePlotLayout from '$lib/layout/base/BasePlotLayout.svelte';
	import type { AreaPlotCoreProps } from '$lib/types/plots/area/props';
	import type { AxisValue } from '$lib/types/layout/mapping';
	import type { AreaPlotState, AreaPlotCtx } from '$lib/types/plots/area/state';
	import type { LegendDisabledStyle } from '$lib/types/layout/legend';
	import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';

	/** An area per series, filled from its own baseline. Draws from pre-built `series` or flat `data`. */
	type Props = AreaPlotCoreProps<TData>;

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
	const hoverIsolate = $derived(styles.values?.hoverIsolate ?? false);

	// Dims every other series like a legend toggle when a value label is
	// hovered, local to this `<Plot>` instance.
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

	// The plot's own pipeline (see `buildAreaKind`), run once via `runStages`.
	const stages = buildAxisStages(buildAreaKind<TData>());
	const ctx = $derived<AreaPlotCtx>({
		cfg,
		legendInteraction,
		disabledFor: effectiveDisabledFor,
		disabledFillFor: (name) => disabledFillOverride(effectiveDisabledFor(name)),
		onValueLabelOverflow: (overflow) => labelMargin.report(overflow),
		onValueLabelHover: (name) => {
			hoverIsolatedSeries = name;
		}
	});
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
				width,
				height,
				margins,
				statistics,
				segments,
				values: styles.values,
				transforms,
				authorMarkers: markers
			} as AreaPlotState<TData>,
			ctx
		)
	);

	const resolvedSeries = $derived(plotState.resolvedSeries!);
	const scopedGroups = $derived(plotState.scopedGroups!);
	const colorForSeries = $derived(plotState.colorForSeries!);
	const resolvedScales = $derived(plotState.scales);
	const yAcc = $derived(plotState.channels!.y.accessor);
	const processed = $derived(plotState.processedData!);

	// A row sits at its `x`, as tall as its top: a stacked row's `y2`, or its `y`.
	const position = $derived(processedPosition(processed));
	const getX = $derived((d: TData) => position.x(d) as AxisValue);
	const getY = $derived((d: TData) => Number(position.y(d)));

	const hoverPoints = $derived(
		buildProcessedHoverPoints<TData>({
			processed,
			colorFor: colorForSeries,
			legendInteraction,
			label: (row) => String(yAcc(row))
		})
	);

	const hover = $derived(
		buildHover({
			tooltip,
			format: plotState.tooltipFormat!,
			markers,
			points: hoverPoints,
			label: (r: TData) => String(yAcc(r)),
			defaultStrategy: 'x'
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

	// End-of-series labels sit like LinePlot's, so their margin is estimated the same way.
	const valueLabelFloor = $derived.by((): MarginOverflow | undefined => {
		if (!styles.values?.show) return undefined;
		return estimateLineValueLabelMargin(resolvedSeries, {
			valAnchor: styles.values.anchor,
			fontStyle: styles.values.fontStyle,
			formatValue: styles.values.format,
			yDomain: resolvedScales.y?.domain
		});
	});

	// Grows the margin to fit value labels that overflow the content box.
	const labelMargin = createLabelMarginTracker(
		() => margins,
		() => resolvedSeries,
		() => valueLabelFloor ?? { left: 0, right: 0, top: 0, bottom: 0 },
		() => halfDimensionOverflowCap(width, height)
	);
</script>

<BasePlotLayout
	{width}
	{height}
	data={processed.data as TData[]}
	{getX}
	{getY}
	{hover}
	scales={resolvedScales}
	{styles}
	{...labelMargin.plotProps}
	markers={plotState.markers ?? []}
	seriesData={resolvedSeries}
	{scopedGroups}
	{hoverController}
/>
