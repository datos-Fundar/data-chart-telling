<script lang="ts" generics="TData extends Record<string, unknown>">
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { paletteColor } from '$lib/utils/color';
	import { buildSeries } from '$lib/utils/grouping';
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import { disabledStrokeOverride, disabledDotsOverride } from '$lib/plots/utils/legendDisabled';
	import { buildLineMarkers } from '$lib/plots/line/buildLineMarkers';
	import { buildGapMarkers } from '$lib/plots/line/buildGapMarkers';
	import { isGapValue } from '$lib/plots/utils/gaps';
	import { createLabelMarginTracker } from '$lib/plots/utils/labelOverflow.svelte';
	import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
	import ValueLabels from '$lib/plots/line/ValueLabels.svelte';
	import {
		hasHoverMarker,
		resolveHoverStrategy,
		resolveHoverSync
	} from '$lib/layout/tooltip/utils';
	import {
		buildGroupedSeries,
		validateSegments,
		buildScopedMarkerGroups
	} from '$lib/plots/utils/segments';
	import type { BasePlotProps, MarginConfig } from '$lib/types/plots/props';
	import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import type { Series, SeriesProps, DataProps } from '$lib/types/plots/data/common';
	import type { GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
	import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
	import type { LineMarkersConfig } from '$lib/types/markers/line';
	import type { LegendDisabledStyle } from '$lib/types/layout/legend';

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

	// Fills missing-data gaps with an interpolated, distinctly-styled bridge,
	// resolved per series.
	const gaps = $derived(styles.gaps ?? {});

	const resolvedSeries = $derived(series ?? buildSeries(data!, x!, y!, z));
	const legendInteraction = $derived(getLegendInteraction());

	$effect(() => {
		validateSegments(segments);
	});

	const groupedSeries = $derived(
		buildGroupedSeries<Series<TData>, LineSegmentStyle>(resolvedSeries, segments)
	);

	const cfg = $derived(getConfiguration());
	const showVals = $derived(styles.values?.show ?? false);
	const hoverIsolate = $derived(styles.values?.hoverIsolate ?? false);

	// Dims every other series like a legend toggle when a value label is
	// hovered, local to this `<Plot>` instance.
	let hoverIsolatedSeries = $state<string | null>(null);

	function effectiveDisabledFor(name: string): LegendDisabledStyle | undefined {
		return (
			legendInteraction?.disabledSeries.get(name) ??
			(hoverIsolate && hoverIsolatedSeries && hoverIsolatedSeries !== name
				? { opacity: cfg.legend.disabledOpacity }
				: undefined)
		);
	}

	const xAcc = $derived(resolveAccessor(resolvedSeries[0]?.x ?? ((d: TData) => d)));
	const yAcc = $derived(resolveAccessor(resolvedSeries[0]?.y ?? ((d: TData) => d)));
	const flat = $derived(resolvedSeries.flatMap((s) => s.data));
	// Legend-disabled series and gap rows are excluded from hover candidates.
	const hoverPoints = $derived(
		resolvedSeries.flatMap((s, idx) => {
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
					color: paletteColor(idx, cfg.palette)
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

	const lineMarkers = $derived(
		buildLineMarkers({
			groupedSeries,
			disabledStrokeFor: (name) => disabledStrokeOverride(effectiveDisabledFor(name)),
			disabledDotsFor: (name) => disabledDotsOverride(effectiveDisabledFor(name))
		})
	);

	const gapMarkers = $derived(
		buildGapMarkers<TData>({
			seriesList: resolvedSeries,
			gaps,
			colorFor: (seriesIndex) => paletteColor(seriesIndex, cfg.palette),
			disabledStrokeFor: (name) => disabledStrokeOverride(effectiveDisabledFor(name)),
			disabledDotsFor: (name) => disabledDotsOverride(effectiveDisabledFor(name))
		})
	);

	const scopedGroups = $derived(
		buildScopedMarkerGroups<TData, Series<TData>, LineSegmentStyle>({
			groupedSeries,
			segments,
			colorFor: (_series, seriesIndex) => paletteColor(seriesIndex, cfg.palette),
			segmentColorFor: (style, defaultColor) => style?.stroke?.stroke ?? defaultColor
		})
	);

	const lastPoints = $derived(
		resolvedSeries
			.map((s, idx) => {
				const sy = resolveAccessor(s.y);
				const lastRow = [...s.data].reverse().find((d) => !isGapValue(sy(d)));
				if (lastRow === undefined) return undefined;
				const group = scopedGroups.find((g) => g.name === s.name);
				const matchedSeg = group?.segments.find((seg) => seg.match(lastRow));
				const color =
					matchedSeg?.color ??
					group?.segments[0]?.color ??
					group?.color ??
					paletteColor(idx, cfg.palette);
				return { series: s, lastRow, color };
			})
			.filter((p): p is { series: Series<TData>; lastRow: TData; color: string } => p !== undefined)
	);

	// Grows the plot's margin to fit value labels that overflow the content
	// box. Resets on `resolvedSeries` (e.g. a timeline scrubber revealing a
	// different slice of rows) so overflow measured against an earlier frame's
	// labels doesn't linger and inflate the margin once that frame is gone —
	// see `createLabelMarginTracker`'s own doc comment.
	const labelMargin = createLabelMarginTracker(
		() => margins,
		() => resolvedSeries
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
	markers={[...gapMarkers, ...lineMarkers, ...markers]}
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
