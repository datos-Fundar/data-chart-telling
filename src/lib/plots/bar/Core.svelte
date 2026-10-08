<script lang="ts" generics="TData extends Record<string, unknown>">
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import {
		disabledFillOverride,
		resolveEffectiveDisabledStyle
	} from '$lib/plots/utils/legendDisabled';
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { validateSegments } from '$lib/plots/utils/segments';
	import {
		createLabelMarginTracker,
		halfDimensionOverflowCap
	} from '$lib/plots/utils/labelOverflow.svelte';
	import { estimateValueLabelMargin } from '$lib/plots/utils/valueLabelMargin';
	import { buildHoverPoints } from '$lib/plots/bar/hoverPoints';
	import { buildHitAreaMarkers } from '$lib/plots/bar/buildHitAreaMarkers';
	import { buildAxisStages, runStages } from '$lib/layout/phases/stages';
	import { buildHover } from '$lib/layout/tooltip/buildHover';
	import { buildBarKind } from '$lib/plots/bar/kind';
	import { createPlotHover } from '$lib/layout/tooltip/createPlotHover.svelte';
	import BasePlotLayout from '$lib/layout/base/BasePlotLayout.svelte';
	import type { BarPlotCoreProps } from '$lib/types/plots/bar/props';
	import type { ValueAnchor } from '$lib/types/plots/constants';
	import type { LegendDisabledStyle } from '$lib/types/layout/legend';
	import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';
	import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/bar/state';

	/** A bar plot, vertical by default. Draws from pre-built `series` or flat `data`. */
	type Props = BarPlotCoreProps<TData>;

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
	const formatValue = $derived(styles.values?.format ?? ((v: number) => `${v}`));
	const valAnchor = $derived<ValueAnchor>(styles.values?.anchor ?? 'outside');

	// A hovered value label dims the other series (`styles.values.hoverIsolate`), locally to this plot.
	const hoverIsolate = $derived(styles.values?.hoverIsolate ?? false);
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

	// The plot's own pipeline (see `buildBarKind`), run once via `runStages`.
	// Hit-area markers stay outside it, below.
	const stages = buildAxisStages(buildBarKind<TData>());
	const ctx = $derived<BarPlotCtx>({
		cfg,
		legendInteraction,
		disabledFillFor: (name) => disabledFillOverride(effectiveDisabledFor(name)),
		onValueLabelOverflow: (overflow) => labelMargin.report(overflow),
		onValueLabelHover: (name) => {
			hoverIsolatedSeries = name;
		}
	});
	const plotState = $derived(
		runStages<BarPlotState<TData>, BarPlotCtx>(
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
	const categoricalAxis = $derived(plotState.categoricalAxis!);
	const isHorizontal = $derived(plotState.isHorizontal!);
	const yAcc = $derived(plotState.channels!.y.accessor);
	const resolvedScales = $derived(plotState.scales);
	const barLayout = $derived(plotState.barLayout!);

	const processed = $derived(plotState.processedData!);

	// Each processed row's category and the top of its bar, on whichever
	// visual channel carries each - swapped when the category is drawn on Y.
	const categoryOf = $derived((d: TData) => barLayout.categoryOf(d));
	const topOf = $derived((d: TData) => barLayout.spanOf(d)?.[1] ?? NaN);
	const plotGetX = $derived(isHorizontal ? topOf : categoryOf);
	const plotGetY = $derived(isHorizontal ? categoryOf : topOf);

	// A legend-disabled series is dimmed on the bar itself, but never surfaces
	// in hover/tooltip - its points are simply absent from the candidate list.
	const hoverPoints = $derived(
		buildHoverPoints<TData>({
			processed,
			isHorizontal,
			geometry: barLayout,
			label: (r) => String(yAcc(r)),
			colorFor: colorForSeries
		}).filter((p) => !legendInteraction?.disabledSeries.has(p.series!))
	);

	// Hover matches each bar's own band (`buildHitAreaMarkers`), not the nearest point.
	const hover = $derived(
		buildHover({
			tooltip,
			format: plotState.tooltipFormat!,
			markers,
			points: hoverPoints,
			label: (r: TData) => String(yAcc(r)),
			defaultStrategy: categoricalAxis,
			pointMatching: 'contains'
		})
	);

	// Created once, not `$derived`.
	const hoverController = createPlotHover<TData>({
		hover: () => hover,
		getX: () => plotGetX,
		getY: () => plotGetY,
		width: () => width,
		height: () => height
	});

	// Bar's own extra step, outside the phase system - see `buildHitAreaMarkers`.
	const hitAreaMarkers = $derived(
		buildHitAreaMarkers({
			barLayout,
			isHorizontal,
			hoverPoints,
			active: hover.active,
			setHoverMatch: hoverController.ctrl.onPointer,
			clearHoverMatch: hoverController.ctrl.onLeave
		})
	);

	// Overflow of an outside-anchored label at the dataset's extreme value, stable across a timeline.
	const valueLabelFloor = $derived.by((): MarginOverflow | undefined => {
		if (!showVals || valAnchor !== 'outside' || barLayout.layout === 'stacked') return undefined;
		const font = styles.values?.fontStyle;
		const fontSize = typeof font?.fontSize === 'number' ? font.fontSize : 12;
		const canvasFont = `${fontSize}px ${cfg.font === 'inherit' ? 'sans-serif' : cfg.font}`;
		if (isHorizontal) {
			const offset = Math.abs(typeof font?.dx === 'number' ? font.dx : 6);
			const texts: string[] = [];
			for (const s of resolvedSeries) {
				const sy = resolveAccessor(s.y);
				let extremeValue = 0;
				let extremeRow: TData | undefined;
				for (const d of s.data) {
					const v = Number(sy(d));
					if (Number.isNaN(v)) continue;
					if (extremeRow === undefined || Math.abs(v) > Math.abs(extremeValue)) {
						extremeValue = v;
						extremeRow = d;
					}
				}
				if (extremeRow === undefined) continue;
				texts.push(formatValue(extremeValue, s.name));
			}
			const right = estimateValueLabelMargin(texts, { canvasFont, reach: offset });
			return { left: 0, right, top: 0, bottom: 0 };
		}
		const offset = Math.abs(typeof font?.dy === 'number' ? font.dy : 6);
		return { left: 0, right: 0, top: Math.ceil(offset + fontSize * 1.2), bottom: 0 };
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
	data={processed.data as TData[]}
	getX={plotGetX}
	getY={plotGetY}
	{hover}
	scales={resolvedScales}
	{...labelMargin.plotProps}
	xTickRotate={resolvedScales?.x?.tickRotate}
	{hoverController}
	markers={[...(plotState.markers ?? []), ...hitAreaMarkers]}
	seriesData={resolvedSeries}
	{scopedGroups}
/>
