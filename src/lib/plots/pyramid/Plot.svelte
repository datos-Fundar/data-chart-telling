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
	import { buildData } from '$lib/plots/pyramid/phases/data';
	import { buildMapping } from '$lib/plots/pyramid/phases/mapping';
	import { buildScales } from '$lib/plots/pyramid/phases/scales';
	import { buildMarkers } from '$lib/plots/pyramid/phases/markers';
	import { runStages } from '$lib/layout/phases/runStages';
	import { createPlotHover } from '$lib/layout/tooltip/createPlotHover.svelte';
	import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
	import ValueLabels from '$lib/plots/pyramid/ValueLabels.svelte';
	import {
		hasHoverMarker,
		resolveHoverStrategy,
		resolveHoverSync
	} from '$lib/layout/tooltip/utils';
	import type { BasePlotProps } from '$lib/types/plots/props';
	import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import type { SeriesProps, DataProps } from '$lib/types/plots/data/common';
	import type { GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
	import type { ValueAnchor } from '$lib/types/plots/constants';
	import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
	import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
	import type { LegendDisabledStyle } from '$lib/types/layout/legend';
	import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';
	import type {
		PyramidPlotState,
		PyramidPlotCtx,
		PyramidTaggedRow
	} from '$lib/types/plots/pyramid/state';
	import type { PhaseStage } from '$lib/types/layout/phases';

	/**
	 * A population-pyramid-style diverging bar chart: each series is mirrored
	 * left or right of a shared zero baseline along a categorical band axis.
	 * Mirrors the bar/line plot contract — series in, marks out — so the
	 * chart-level container/timeline/facet/legend wrap it unchanged.
	 *
	 * Side assignment comes from `grouping` (falling back to `color` when
	 * unset, so a lone `color` accessor still assigns sides *and* colors them,
	 * as it always has) — series names are sorted alphabetically and the first
	 * goes left, the second right. Pass `scales.grouping.reverse: true` to
	 * flip the order. `scales.color`, when set, overrides the default
	 * left/right coloring with a real per-series-name color.
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
		scales = {},
		margins,
		segments = {},
		markers = [],
		tooltip = undefined
	}: Props = $props();

	$effect(() => {
		validateSegments(segments);
	});

	const cfg = $derived(getConfiguration());
	const legendInteraction = $derived(getLegendInteraction());
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

	const showVals = $derived(styles.values?.show ?? false);
	const formatValue = $derived(styles.values?.format ?? ((v: number) => `${v}`));
	const valAnchor = $derived<ValueAnchor>(styles.values?.anchor ?? 'outside');

	// The plot's own pipeline, run once via `runStages`.
	const stages: PhaseStage<PyramidPlotState<TData>, PyramidPlotCtx>[] = [
		{ phase: 'data', run: buildData },
		{ phase: 'mapping', run: buildMapping },
		{ phase: 'scales', run: buildScales },
		{ phase: 'markers', run: buildMarkers }
	];
	const ctx = $derived<PyramidPlotCtx>({
		cfg,
		formatValue,
		disabledFillFor: (name) => disabledFillOverride(effectiveDisabledFor(name))
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
				gaps: styles.gaps ?? {},
				scales,
				width,
				height,
				margins
			},
			ctx
		)
	);

	const resolvedSeries = $derived(plotState.resolvedSeries!);
	const groupedSeries = $derived(plotState.groupedSeries!);
	const scopedGroups = $derived(plotState.scopedGroups!);
	const flat = $derived(plotState.flat!);
	const resolvedScales = $derived(plotState.scales);
	const colorForSeries = $derived(plotState.colorForSeries!);

	const getX = (d: PyramidTaggedRow<TData>) => d.__x;
	const getY = (d: PyramidTaggedRow<TData>) => d.__y;
	const labelFor = (d: PyramidTaggedRow<TData>) => d.__label;

	// A legend-disabled series is dimmed on the bar itself, but never surfaces
	// in hover/tooltip — its points are simply absent from the candidate list.
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

	const hover = $derived({
		active: tooltip != null || hasHoverMarker(markers),
		points: hoverPoints,
		label: labelFor,
		strategy: resolveHoverStrategy(tooltip?.strategy, markers, 'y'),
		sync: resolveHoverSync(tooltip?.sync, markers),
		tooltip
	});

	// Created once, not `$derived`.
	const hoverController = createPlotHover<PyramidTaggedRow<TData>>({
		hover: () => hover,
		getX: () => getX,
		getY: () => getY,
		width: () => width,
		height: () => height
	});

	// Estimated overflow for an `'outside'`- or `'start'`-anchored value label
	// (both anchor at the row's own full magnitude, pushed further outward —
	// see `ValueLabels.svelte`'s `xFn`) at the most extreme value on each
	// side of the whole dataset, not just the current frame, so it stays
	// stable across a timeline scrubber instead of resetting to zero and
	// regrowing on every tick. `'middle'`/`'end'` anchor inside the bar,
	// toward its own zero baseline, so they carry no such risk.
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

	// A pyramid bar's value label can grow past the plot's own content box —
	// `valueLabelFloor` covers the common case up front; each label's own
	// rendered overflow still feeds `labelMargin.report` for whatever that
	// estimate doesn't cover. See `labelOverflow.svelte.ts`.
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
	channelScales={resolvedScales}
	{...labelMargin.plotProps}
	xTickRotate={resolvedScales?.x?.tickRotate}
	{hoverController}
	markers={[...(plotState.markers ?? []), ...markers]}
	seriesData={resolvedSeries}
	{scopedGroups}
>
	{#snippet children({ numericMargins })}
		{#if showVals}
			{#each groupedSeries as group (group.series.name)}
				<ValueLabels
					{group}
					{valAnchor}
					{formatValue}
					values={styles.values}
					axisColor={cfg.axis.color}
					disabled={effectiveDisabledFor(group.series.name)}
					{width}
					{height}
					{numericMargins}
					onHoverSeries={hoverIsolate
						? () => {
								hoverIsolatedSeries = group.series.name;
							}
						: undefined}
					onHoverEnd={hoverIsolate
						? () => {
								hoverIsolatedSeries = null;
							}
						: undefined}
					onOverflow={labelMargin.report}
				/>
			{/each}
		{/if}
	{/snippet}
</BasePlotLayout>
