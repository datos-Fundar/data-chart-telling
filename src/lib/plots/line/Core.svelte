<script lang="ts" generics="TData extends Record<string, unknown>">
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import {
		disabledStrokeOverride,
		disabledDotsOverride,
		disabledFillOverride,
		resolveEffectiveDisabledStyle
	} from '$lib/plots/utils/legendDisabled';
	import { isGapValue } from '$lib/plots/utils/gaps';
	import {
		createLabelMarginTracker,
		halfDimensionOverflowCap
	} from '$lib/plots/utils/labelOverflow.svelte';
	import { estimateLineValueLabelMargin } from '$lib/plots/line/valueLabelMargin';
	import { processedPosition } from '$lib/layout/phases/transforms';
	import { buildAxisStages, runStages } from '$lib/layout/phases/stages';
	import { buildHover, buildProcessedHoverPoints } from '$lib/layout/tooltip/buildHover';
	import { buildLineKind } from '$lib/plots/line/kind';
	import { createPlotHover } from '$lib/layout/tooltip/createPlotHover.svelte';
	import BasePlotLayout from '$lib/layout/base/BasePlotLayout.svelte';
	import { validateSegments } from '$lib/plots/utils/segments';
	import type { MarginConfig } from '$lib/types/plots/props';
	import type { LinePlotCoreProps } from '$lib/types/plots/line/props';
	import type { AxisValue } from '$lib/types/layout/mapping';
	import type { LegendDisabledStyle } from '$lib/types/layout/legend';
	import type { ValueAnchor } from '$lib/types/plots/constants';
	import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';
	import type { LinePlotState, LinePlotCtx } from '$lib/types/plots/line/state';

	type Props = LinePlotCoreProps<TData>;

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
		segments = {},
		markers = [],
		scales = {},
		margins = $bindable(),
		tooltip = undefined,
		statistics = [],
		transforms = []
	}: Props = $props();

	$effect(() => {
		validateSegments(segments);
	});

	const cfg = $derived(getConfiguration());
	const legendInteraction = $derived(getLegendInteraction());
	const showVals = $derived(styles.values?.show ?? false);
	const hoverIsolate = $derived(styles.values?.hoverIsolate ?? false);
	const valAnchor = $derived<ValueAnchor>(styles.values?.anchor ?? 'start');
	const formatValue = $derived(
		styles.values?.format ?? ((v: number, name: string) => `${name} - ${v}`)
	);

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

	// The plot's own pipeline (see `buildLineKind`), run once via `runStages`.
	const stages = buildAxisStages(buildLineKind<TData>());
	const ctx = $derived<LinePlotCtx>({
		cfg,
		legendInteraction,
		disabledStrokeFor: (name) => disabledStrokeOverride(effectiveDisabledFor(name)),
		disabledDotsFor: (name) => disabledDotsOverride(effectiveDisabledFor(name)),
		disabledFillFor: (name) => disabledFillOverride(effectiveDisabledFor(name)),
		onValueLabelOverflow: (overflow) => labelMargin.report(overflow),
		onValueLabelHover: (name) => {
			hoverIsolatedSeries = name;
		}
	});
	const plotState = $derived(
		runStages<LinePlotState<TData>, LinePlotCtx>(
			stages,
			{
				series,
				data,
				x,
				y,
				grouping,
				color,
				segments,
				gaps: styles.gaps,
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
	const yAcc = $derived(plotState.channels!.y.accessor);
	const processed = $derived(plotState.processedData!);

	// A row sits at its `x`, as tall as its top: a stacked row's `y2`, or its `y`.
	const position = $derived(processedPosition(processed));
	const getX = $derived((d: TData) => position.x(d) as AxisValue);
	const getY = $derived((d: TData) => Number(position.y(d)));

	// Legend-disabled series and gap rows are excluded from hover candidates.
	const hoverPoints = $derived(
		buildProcessedHoverPoints<TData>({
			processed,
			colorFor: colorForSeries,
			legendInteraction,
			label: (row) => String(yAcc(row)),
			include: (row) => !isGapValue(position.y(row))
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

	// Estimated overflow for the end-of-line label fan and its own vertical
	// reach - see `estimateLineValueLabelMargin`'s own doc comment.
	const valueLabelFloor = $derived.by((): MarginOverflow | undefined => {
		if (!showVals) return undefined;
		return estimateLineValueLabelMargin(resolvedSeries, {
			valAnchor,
			fontStyle: styles.values?.fontStyle,
			formatValue,
			yDomain: plotState.scales.y?.domain
		});
	});

	// See `halfDimensionOverflowCap`'s own doc comment.
	const maxLabelOverflow = $derived(halfDimensionOverflowCap(width, height));

	// Grows the margin to fit value labels that overflow the content box.
	const labelMargin = createLabelMarginTracker(
		() => margins,
		() => resolvedSeries,
		() => valueLabelFloor ?? { left: 0, right: 0, top: 0, bottom: 0 },
		() => maxLabelOverflow
	);

	// Writes the settled margin back to the bindable `margins` prop.
	let lastWritten: MarginConfig | undefined;
	$effect(() => {
		const next = labelMargin.resolvedMargins;
		if (!next) return;
		const changed =
			!lastWritten ||
			next.top !== lastWritten.top ||
			next.right !== lastWritten.right ||
			next.bottom !== lastWritten.bottom ||
			next.left !== lastWritten.left;
		if (changed) {
			lastWritten = { top: next.top, right: next.right, bottom: next.bottom, left: next.left };
			margins = next;
		}
	});
</script>

<BasePlotLayout
	{width}
	{height}
	{styles}
	data={processed.data as TData[]}
	{getX}
	{getY}
	{hover}
	scales={plotState.scales}
	{...labelMargin.plotProps}
	xTickRotate={scales?.x?.tickRotate}
	{hoverController}
	markers={plotState.markers ?? []}
	seriesData={resolvedSeries}
	{scopedGroups}
/>
