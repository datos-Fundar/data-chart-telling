<script lang="ts" generics="TData extends Record<string, unknown>">
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import {
		disabledStrokeOverride,
		disabledDotsOverride,
		resolveEffectiveDisabledStyle
	} from '$lib/plots/utils/legendDisabled';
	import { isGapValue } from '$lib/plots/utils/gaps';
	import {
		createLabelMarginTracker,
		halfDimensionOverflowCap
	} from '$lib/plots/utils/labelOverflow.svelte';
	import { estimateLineValueLabelMargin } from '$lib/plots/line/valueLabelMargin';
	import { buildData } from '$lib/plots/line/phases/data';
	import { buildMapping } from '$lib/plots/line/phases/mapping';
	import { buildMarkers } from '$lib/plots/line/phases/markers';
	import { runStages } from '$lib/layout/phases/runStages';
	import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
	import ValueLabels from '$lib/plots/line/ValueLabels.svelte';
	import {
		hasHoverMarker,
		resolveHoverStrategy,
		resolveHoverSync
	} from '$lib/layout/tooltip/utils';
	import { validateSegments } from '$lib/plots/utils/segments';
	import type { BasePlotProps, MarginConfig } from '$lib/types/plots/props';
	import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import type { Series, SeriesProps, DataProps } from '$lib/types/plots/data/common';
	import type { GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
	import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
	import type { LineMarkersConfig } from '$lib/types/markers/line';
	import type { LegendDisabledStyle } from '$lib/types/layout/legend';
	import type { ValueAnchor } from '$lib/types/plots/constants';
	import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';
	import type { LinePlotState, LinePlotCtx } from '$lib/types/plots/line/state';
	import type { PhaseStage } from '$lib/types/layout/phases';

	type Props = BasePlotProps<
		SeriesProps<TData> | DataProps<TData>,
		TData,
		GapsAwarePlotStylesConfig<LineSegmentStyle>,
		LineSegmentStyle,
		LineMarkersConfig,
		AxisBasedScalesConfig<TData>
	>;

	let {
		width,
		height,
		series,
		data,
		x,
		y,
		z,
		styles = {},
		segments = {},
		markers = [],
		scales = {},
		margins = $bindable(),
		tooltip = undefined
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

	// The plot's own pipeline, run once via `runStages`. No "scales" stage —
	// LinePlot forwards `scales` unresolved to `BasePlotLayout`.
	const stages: PhaseStage<LinePlotState<TData>, LinePlotCtx>[] = [
		{ phase: 'data', run: buildData },
		{ phase: 'mapping', run: buildMapping },
		{ phase: 'markers', run: buildMarkers }
	];
	const ctx = $derived<LinePlotCtx>({
		cfg,
		legendInteraction,
		disabledStrokeFor: (name) => disabledStrokeOverride(effectiveDisabledFor(name)),
		disabledDotsFor: (name) => disabledDotsOverride(effectiveDisabledFor(name))
	});
	const plotState = $derived(
		runStages<LinePlotState<TData>, LinePlotCtx>(
			stages,
			{ series, data, x, y, z, segments, gaps: styles.gaps ?? {}, scales, width, height, margins },
			ctx
		)
	);

	const resolvedSeries = $derived(plotState.resolvedSeries!);
	const scopedGroups = $derived(plotState.scopedGroups!);
	const colorForSeries = $derived(plotState.colorForSeries!);
	const flat = $derived(plotState.flat!);
	const xAcc = $derived(plotState.channels!.x.accessor);
	const yAcc = $derived(plotState.channels!.y.accessor);

	// Legend-disabled series and gap rows are excluded from hover candidates.
	const hoverPoints = $derived(
		resolvedSeries.flatMap((s) => {
			if (legendInteraction?.disabledSeries.has(s.name)) return [];
			const sx = resolveAccessor(s.x);
			const sy = resolveAccessor(s.y);
			return s.data
				.filter((d) => !isGapValue(sy(d)))
				.map((d) => ({
					x: sx(d) as AxisValue,
					y: Number(sy(d)),
					row: d,
					label: String(sy(d)),
					series: s.name,
					color: colorForSeries(s.name)
				}));
		})
	);

	const hover = $derived({
		active: tooltip != null || hasHoverMarker(markers),
		points: hoverPoints,
		label: (r: TData) => String(yAcc(r)),
		strategy: resolveHoverStrategy(tooltip?.strategy, markers, 'x'),
		sync: resolveHoverSync(tooltip?.sync, markers),
		tooltip
	});

	const lastPoints = $derived(
		resolvedSeries
			.map((s) => {
				const sy = resolveAccessor(s.y);
				const lastRow = [...s.data].reverse().find((d) => !isGapValue(sy(d)));
				if (lastRow === undefined) return undefined;
				const group = scopedGroups.find((g) => g.name === s.name);
				const matchedSeg = group?.segments.find((seg) => seg.match(lastRow));
				const color =
					matchedSeg?.color ?? group?.segments[0]?.color ?? group?.color ?? colorForSeries(s.name);
				return { series: s, lastRow, color };
			})
			.filter((p): p is { series: Series<TData>; lastRow: TData; color: string } => p !== undefined)
	);

	// Estimated overflow for the end-of-line label fan and its own vertical
	// reach — see `estimateLineValueLabelMargin`'s own doc comment.
	const valueLabelFloor = $derived.by((): MarginOverflow | undefined => {
		if (!showVals) return undefined;
		return estimateLineValueLabelMargin(resolvedSeries, {
			valAnchor,
			fontStyle: styles.values?.fontStyle,
			formatValue,
			yDomain: scales.y?.domain
		});
	});

	// See `halfDimensionOverflowCap`'s own doc comment.
	const maxLabelOverflow = $derived(halfDimensionOverflowCap(width, height));

	// Grows the plot's margin to fit value labels that overflow the content
	// box. `valueLabelFloor` covers the common rightward case up front; each
	// label's own rendered overflow still feeds `labelMargin.report` for
	// whatever that estimate doesn't cover. See `labelOverflow.svelte.ts`.
	const labelMargin = createLabelMarginTracker(
		() => margins,
		() => resolvedSeries,
		() => valueLabelFloor ?? { left: 0, right: 0, top: 0, bottom: 0 },
		() => maxLabelOverflow
	);

	// Writes the resolved margin back into the bindable `margins` prop once it
	// settles, so a caller binding it (`bind:margins`) can capture and reuse a
	// fixed margin later. `lastWritten` is a plain variable (not `$state`) so
	// the effect only depends on `resolvedMargins`, never on `margins` itself.
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
	data={flat}
	getX={xAcc}
	getY={(d) => Number(yAcc(d))}
	{hover}
	{scales}
	{...labelMargin.plotProps}
	xTickRotate={scales?.x?.tickRotate}
	markers={[...(plotState.markers ?? []), ...markers]}
	seriesData={resolvedSeries}
	{scopedGroups}
>
	{#snippet children({ numericMargins })}
		{#if showVals}
			<ValueLabels
				{lastPoints}
				values={styles.values}
				{width}
				{height}
				{numericMargins}
				onOverflow={labelMargin.report}
				disabledFor={effectiveDisabledFor}
				onHoverSeries={hoverIsolate
					? (name) => {
							hoverIsolatedSeries = name;
						}
					: undefined}
				onHoverEnd={hoverIsolate
					? () => {
							hoverIsolatedSeries = null;
						}
					: undefined}
			/>
		{/if}
	{/snippet}
</BasePlotLayout>
