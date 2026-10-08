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
	import { estimateValueLabelMargin } from '$lib/plots/utils/valueLabelMargin';
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import { validateSegments } from '$lib/plots/utils/segments';
	import { buildAxisStages, runStages } from '$lib/layout/phases/stages';
	import { buildHover } from '$lib/layout/tooltip/buildHover';
	import { buildPyramidKind } from '$lib/plots/pyramid/kind';
	import { createPlotHover } from '$lib/layout/tooltip/createPlotHover.svelte';
	import BasePlotLayout from '$lib/layout/base/BasePlotLayout.svelte';
	import type { PyramidPlotCoreProps } from '$lib/types/plots/pyramid/props';
	import type { ValueAnchor } from '$lib/types/plots/constants';
	import type { LegendDisabledStyle } from '$lib/types/layout/legend';
	import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';
	import type {
		PyramidPlotState,
		PyramidPlotCtx,
		PyramidTaggedRow
	} from '$lib/types/plots/pyramid/state';

	/**
	 * A diverging bar plot: each series mirrored left or right of a shared zero
	 * baseline along a category axis. Sides come from `grouping` (else `color`),
	 * alphabetically; `scales.grouping.reverse` flips them.
	 */
	type Props = PyramidPlotCoreProps<TData>;

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
		scales = {},
		margins = $bindable(),
		segments = {},
		markers = [],
		tooltip = undefined,
		statistics = [],
		transforms = []
	}: Props = $props();

	$effect(() => {
		validateSegments(segments);
	});

	const cfg = $derived(getConfiguration());
	const legendInteraction = $derived(getLegendInteraction());
	const hoverIsolate = $derived(styles.values?.hoverIsolate ?? false);

	// A hovered value label dims the other series (`styles.values.hoverIsolate`), locally to this plot.
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

	const showVals = $derived(styles.values?.show ?? false);
	const formatValue = $derived(styles.values?.format ?? ((v: number) => `${v}`));
	const valAnchor = $derived<ValueAnchor>(styles.values?.anchor ?? 'outside');

	// The plot's own pipeline (see `buildPyramidKind`), run once via `runStages`.
	const stages = buildAxisStages(buildPyramidKind<TData>());
	const ctx = $derived<PyramidPlotCtx>({
		cfg,
		legendInteraction,
		formatValue,
		disabledFillFor: (name) => disabledFillOverride(effectiveDisabledFor(name)),
		onValueLabelOverflow: (overflow) => labelMargin.report(overflow),
		onValueLabelHover: (name) => {
			hoverIsolatedSeries = name;
		}
	});
	const plotState = $derived(
		runStages<PyramidPlotState<TData>, PyramidPlotCtx>(
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
	const flat = $derived(plotState.flat!);
	const resolvedScales = $derived(plotState.scales);
	const colorForSeries = $derived(plotState.colorForSeries!);

	const getX = (d: PyramidTaggedRow<TData>) => d.__x;
	const getY = (d: PyramidTaggedRow<TData>) => d.__y;
	const labelFor = (d: PyramidTaggedRow<TData>) => d.__label;

	// A legend-disabled series is dimmed on the bar itself, but never surfaces
	// in hover/tooltip - its points are simply absent from the candidate list.
	const hoverPoints = $derived(
		flat
			.filter((d) => !legendInteraction?.disabledSeries.has(d.__series))
			.map((d) => ({
				x: d.__x,
				y: d.__y,
				row: d,
				label: d.__label,
				series: d.__series,
				color: colorForSeries(d.__series)
			}))
	);

	const hover = $derived(
		buildHover({
			tooltip,
			format: plotState.tooltipFormat!,
			markers,
			points: hoverPoints,
			label: labelFor,
			defaultStrategy: 'y'
		})
	);

	// Created once, not `$derived`.
	const hoverController = createPlotHover<PyramidTaggedRow<TData>>({
		hover: () => hover,
		getX: () => getX,
		getY: () => getY,
		width: () => width,
		height: () => height
	});

	// Overflow of outside/start-anchored labels at each side's extreme value, stable across a timeline.
	const valueLabelFloor = $derived.by((): MarginOverflow | undefined => {
		if (!showVals || valAnchor === 'middle' || valAnchor === 'end') return undefined;
		const font = styles.values?.fontStyle;
		const fontSize = typeof font?.fontSize === 'number' ? font.fontSize : 12;
		const canvasFont = `${fontSize}px ${cfg.font === 'inherit' ? 'sans-serif' : cfg.font}`;
		const offset = Math.abs(typeof font?.dx === 'number' ? font.dx : 6);

		const leftTexts: string[] = [];
		const rightTexts: string[] = [];
		for (const s of resolvedSeries) {
			const sy = resolveAccessor(s.y);
			let extreme = 0;
			let extremeRow: TData | undefined;
			for (const d of s.data) {
				const v = Math.abs(Number(sy(d)));
				if (Number.isNaN(v)) continue;
				if (extremeRow === undefined || v > extreme) {
					extreme = v;
					extremeRow = d;
				}
			}
			if (extremeRow === undefined) continue;
			const text = formatValue(extreme, s.name);
			if (s.side === 'left') leftTexts.push(text);
			else rightTexts.push(text);
		}
		const left = estimateValueLabelMargin(leftTexts, { canvasFont, reach: offset });
		const right = estimateValueLabelMargin(rightTexts, { canvasFont, reach: offset });
		return { left, right, top: 0, bottom: 0 };
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
	{...labelMargin.plotProps}
	xTickRotate={resolvedScales?.x?.tickRotate}
	{hoverController}
	markers={plotState.markers ?? []}
	seriesData={resolvedSeries}
	{scopedGroups}
/>
