<script lang="ts" generics="TData extends Record<string, unknown>">
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import {
		disabledDotsOverride,
		resolveEffectiveDisabledStyle
	} from '$lib/plots/utils/legendDisabled';
	import { buildData } from '$lib/plots/scatter/phases/data';
	import { buildMapping } from '$lib/plots/scatter/phases/mapping';
	import { buildScales } from '$lib/plots/scatter/phases/scales';
	import { buildMarkers } from '$lib/plots/scatter/phases/markers';
	import { runStages } from '$lib/layout/phases/runStages';
	import {
		createLabelMarginTracker,
		halfDimensionOverflowCap
	} from '$lib/plots/utils/labelOverflow.svelte';
	import { createPlotHover } from '$lib/layout/tooltip/createPlotHover.svelte';
	import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
	import ValueLabels from '$lib/plots/scatter/ValueLabels.svelte';
	import {
		hasHoverMarker,
		resolveHoverStrategy,
		resolveHoverSync
	} from '$lib/layout/tooltip/utils';
	import { validateSegments } from '$lib/plots/utils/segments';
	import type { BasePlotProps } from '$lib/types/plots/props';
	import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import type { ScatterDataProps } from '$lib/types/plots/data/scatter';
	import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
	import type { ScatterSegmentStyle } from '$lib/types/plots/segments/common';
	import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
	import type { LegendDisabledStyle } from '$lib/types/layout/legend';
	import type { ScatterPlotState, ScatterPlotCtx } from '$lib/types/plots/scatter/state';
	import type { PhaseStage } from '$lib/types/layout/phases';

	/**
	 * A point cloud on continuous x/y axes. Accepts either a pre-built `series`
	 * array or flat `data/x/y/color` props — mirrors the line/bar plot contract
	 * so the chart-level container/timeline/facet/legend wrap it unchanged. `r`
	 * gives every dot a per-row radius (bubble sizing), independent of `color`
	 * grouping — see {@link ScatterDataProps} for its auto-scaling behavior.
	 */
	type Props = BasePlotProps<
		ScatterDataProps<TData>,
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
		styles = {},
		segments = {},
		markers = [],
		scales = {},
		margins,
		tooltip = undefined
	}: Props = $props();

	const cfg = $derived(getConfiguration());
	const legendInteraction = $derived(getLegendInteraction());

	$effect(() => {
		validateSegments(segments);
	});

	const showVals = $derived(styles.values?.show ?? false);
	const formatValue = $derived(styles.values?.format ?? ((v: number) => `${v}`));
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

	// The plot's own pipeline, run once via `runStages`.
	const stages: PhaseStage<ScatterPlotState<TData>, ScatterPlotCtx>[] = [
		{ phase: 'data', run: buildData },
		{ phase: 'mapping', run: buildMapping },
		{ phase: 'scales', run: buildScales },
		{ phase: 'markers', run: buildMarkers }
	];
	const ctx = $derived<ScatterPlotCtx>({
		cfg,
		legendInteraction,
		disabledDotsFor: (name) => disabledDotsOverride(effectiveDisabledFor(name))
	});
	const plotState = $derived(
		runStages<ScatterPlotState<TData>, ScatterPlotCtx>(
			stages,
			{ series, data, x, y, grouping, color, r, segments, scales, width, height, margins },
			ctx
		)
	);

	const resolvedSeries = $derived(plotState.resolvedSeries!);
	const groupedSeries = $derived(plotState.groupedSeries!);
	const flat = $derived(plotState.flat!);
	const scopedGroups = $derived(plotState.scopedGroups!);
	const colorForSeries = $derived(plotState.colorForSeries!);
	const xAcc = $derived(plotState.channels!.x.accessor);
	const yAcc = $derived(plotState.channels!.y.accessor);
	const resolvedScales = $derived(plotState.scales);

	// A legend-disabled series is dimmed on the mark itself, but never surfaces
	// in hover/tooltip — its points are simply absent from the candidate list.
	const hoverPoints = $derived(
		resolvedSeries.flatMap((s) => {
			if (legendInteraction?.disabledSeries.has(s.name)) return [];
			const sx = resolveAccessor(s.x);
			const sy = resolveAccessor(s.y);
			return s.data.map((d) => ({
				x: sx(d) as AxisValue,
				y: Number(sy(d)),
				row: d,
				label: `${sx(d)}, ${sy(d)}`,
				series: s.name,
				color: colorForSeries(s.name)
			}));
		})
	);

	// Points scatter freely across x/y rather than sharing discrete x values —
	// 'punctual' matches the single nearest point, not a whole column.
	const hover = $derived({
		active: tooltip != null || hasHoverMarker(markers),
		points: hoverPoints,
		label: (row: TData) => `${xAcc(row)}, ${yAcc(row)}`,
		strategy: resolveHoverStrategy(tooltip?.strategy, markers, 'punctual'),
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
	data={flat}
	getX={xAcc}
	getY={(d) => Number(yAcc(d))}
	{hover}
	scales={resolvedScales}
	channelScales={resolvedScales}
	{...labelMargin.plotProps}
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
					{formatValue}
					values={styles.values}
					defaultColor={cfg.axis.color}
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
