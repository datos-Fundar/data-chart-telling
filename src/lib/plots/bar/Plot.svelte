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
	import { runStages } from '$lib/layout/phases/runStages';
	import { buildAxisStages } from '$lib/layout/phases/axisStages';
	import { buildHover } from '$lib/layout/tooltip/buildHover';
	import { buildBarKind } from '$lib/plots/bar/kind';
	import { createPlotHover } from '$lib/layout/tooltip/createPlotHover.svelte';
	import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
	import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
	import type { BasePlotProps } from '$lib/types/plots/props';
	import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import type { SeriesProps, DataProps } from '$lib/types/plots/data/common';
	import type { GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
	import type { ValueAnchor } from '$lib/types/plots/constants';
	import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
	import type { LegendDisabledStyle } from '$lib/types/layout/legend';
	import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';
	import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/bar/state';

	/**
	 * A bar chart, vertical by default. Accepts either a pre-built `series`
	 * array or flat `data/x/y/color` props — mirrors the line/heatmap plot
	 * contract so the chart-level container/timeline/facet/legend wrap it
	 * unchanged.
	 */
	type Props = BasePlotProps<
		SeriesProps<TData> | DataProps<TData>,
		TData,
		GapsAwarePlotStylesConfig<BarSegmentStyle>,
		BarSegmentStyle,
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
		segments = {},
		markers = [],
		scales = {},
		margins,
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

	// A value label hovered while `styles.values.hoverIsolate` is on dims
	// every other series exactly like a legend toggle would — local to this
	// one `<Plot>` instance (not the shared HoverStore) so the gesture can't
	// leak into unrelated tooltip/crosshair behavior.
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
	// visual channel carries each — swapped when the category is drawn on Y.
	const categoryOf = $derived((d: TData) => barLayout.categoryOf(d));
	const topOf = $derived((d: TData) => barLayout.spanOf(d)?.[1] ?? NaN);
	const plotGetX = $derived(isHorizontal ? topOf : categoryOf);
	const plotGetY = $derived(isHorizontal ? categoryOf : topOf);

	// A legend-disabled series is dimmed on the bar itself, but never surfaces
	// in hover/tooltip — its points are simply absent from the candidate list.
	const hoverPoints = $derived(
		buildHoverPoints<TData>({
			processed,
			isHorizontal,
			geometry: barLayout,
			label: (r) => String(yAcc(r)),
			colorFor: colorForSeries
		}).filter((p) => !legendInteraction?.disabledSeries.has(p.series!))
	);

	// The category axis is a band scale — `<Pointer>`'s nearest-point-by-
	// distance match (svelteplot's own projection of each candidate's band
	// centre) can disagree by a couple of pixels with where `<BarX>`/`<BarY>`
	// (via svelteplot's `RectPath`) actually render that band, which is
	// enough to mismatch the neighbouring category once bands get thin
	// (many categories). `buildHitAreaMarkers` hit-tests each series' own
	// segment directly instead — see its own doc comment.
	const hover = $derived(
		buildHover({
			tooltip,
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

	// Bar's own extra step, outside the phase system — see `buildHitAreaMarkers`.
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

	// Estimated overflow for an `'outside'`-anchored value label at the most
	// extreme value in the whole dataset — not just the current frame, so it
	// stays stable across a timeline scrubber instead of resetting to zero
	// and regrowing on every tick. Stacked labels sit at their own segment's
	// midpoint (see `valueTextFn` above), well inside the bar, so they carry
	// no such risk; `start`/`end` anchors sit inside the bar too.
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

	// A bar's value label can grow past the plot's own content box (e.g. a
	// tall bar's `anchor: 'outside'` label pushing past the top margin) —
	// `valueLabelFloor` covers the common case up front; each label's own
	// rendered overflow still feeds `labelMargin.report` (through `ctx`) for
	// whatever that estimate doesn't cover. See `labelOverflow.svelte.ts`.
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
