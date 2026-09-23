<script lang="ts" generics="TData extends Record<string, unknown>">
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import {
		disabledFillOverride,
		resolveEffectiveDisabledStyle
	} from '$lib/plots/utils/legendDisabled';
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { validateSegments } from '$lib/plots/utils/segments';
	import { createBarLayout } from '$lib/plots/bar/layout.svelte';
	import {
		createLabelMarginTracker,
		halfDimensionOverflowCap
	} from '$lib/plots/utils/labelOverflow.svelte';
	import { estimateValueLabelMargin } from '$lib/plots/utils/valueLabelMargin';
	import { buildHoverPoints } from '$lib/plots/bar/hoverPoints';
	import { buildMarkers } from '$lib/plots/bar/phases/markers';
	import { buildData } from '$lib/plots/bar/phases/data';
	import { buildMapping } from '$lib/plots/bar/phases/mapping';
	import { buildScales } from '$lib/plots/bar/phases/scales';
	import ValueLabels from '$lib/plots/bar/ValueLabels.svelte';
	import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
	import {
		hasHoverMarker,
		resolveHoverStrategy,
		resolveHoverSync
	} from '$lib/layout/tooltip/utils';
	import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
	import type { BasePlotProps } from '$lib/types/plots/props';
	import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import type { SeriesProps, DataProps } from '$lib/types/plots/data/common';
	import type { GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
	import type { ValueAnchor } from '$lib/types/plots/constants';
	import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
	import type { LegendDisabledStyle } from '$lib/types/layout/legend';
	import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';

	/**
	 * A bar chart, vertical by default. Accepts either a pre-built `series`
	 * array or flat `data/x/y/z` props — mirrors the line/heatmap plot contract
	 * so the chart-level container/timeline/facet/legend wrap it unchanged.
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
		z,
		styles = {},
		segments = {},
		markers = [],
		scales = {},
		margins,
		tooltip = undefined
	}: Props = $props();

	$effect(() => {
		validateSegments(segments);
	});

	const cfg = $derived(getConfiguration());
	const legendInteraction = $derived(getLegendInteraction());

	const showVals = $derived(styles.values?.show ?? false);
	const formatValue = $derived(styles.values?.format ?? ((v: number) => `${v}`));
	const valAnchor = $derived<ValueAnchor>(styles.values?.anchor ?? 'outside');

	// "data" phase: resolved/legend-filtered/segment-grouped series, gap
	// fills, and per-series color — see `phases/data.ts`.
	const barSeries = $derived(
		buildData<TData>({
			series,
			data,
			x,
			y,
			z,
			segments,
			gaps: styles.gaps ?? {},
			legendInteraction,
			palette: cfg.palette
		})
	);
	const resolvedSeries = $derived(barSeries.resolvedSeries);
	const groupedSeries = $derived(barSeries.groupedSeries);
	const gapFillMaps = $derived(barSeries.gapFillMaps);
	const flat = $derived(barSeries.flat);
	const scopedGroups = $derived(barSeries.scopedGroups);
	const colorForSeries = $derived(barSeries.colorForSeries);

	// "mapping" phase: category/value axis assignment + each channel's own
	// data accessor — see `phases/mapping.ts`. `xAcc`/`yAcc` are always
	// data-semantic (category/value), independent of which *visual* axis
	// ends up drawing them, decided by `categoricalAxis`.
	const barMapping = $derived(buildMapping<TData>({ scales, resolvedSeries }));
	const categoricalAxis = $derived(barMapping.categoricalAxis);
	const isHorizontal = $derived(barMapping.isHorizontal);
	const xAcc = $derived(barMapping.channels.x.accessor);
	const yAcc = $derived(barMapping.channels.y.accessor);

	// "scales" phase: resolved x/y scales, given the mapping above — see
	// `phases/scales.ts`. Both `BasePlotLayout` and `createBarLayout` read
	// `resolvedScales` for everything, so there's one copy to keep in sync.
	const resolvedScales = $derived(
		buildScales<TData>({
			scales,
			resolvedSeries,
			categoricalAxis,
			isHorizontal,
			width,
			height,
			padding: { inner: cfg.bar.paddingInner, outer: cfg.bar.paddingOuter }
		})
	);

	// The accessor feeding each *visual* channel — swapped from the
	// data-semantic xAcc/yAcc when the category is drawn on Y.
	const plotGetX = $derived(isHorizontal ? (d: TData) => Number(yAcc(d)) : xAcc);
	const plotGetY = $derived(isHorizontal ? xAcc : (d: TData) => Number(yAcc(d)));

	/**
	 * Series-layout geometry (grouped/stacked offsets, band-width estimate,
	 * value baseline) — the single source of truth shared by bar-segment
	 * rendering, value labels, and hover markers below. See `layout.svelte.ts`.
	 */
	const barLayout = createBarLayout<TData>({
		scales: () => resolvedScales,
		isHorizontal: () => isHorizontal,
		width: () => width,
		height: () => height,
		margins: () => margins,
		flat: () => flat,
		xAcc: () => xAcc,
		groupedSeries: () => groupedSeries,
		gapFillMaps: () => gapFillMaps
	});

	// `x`/`y` here are visual (matched against BasePlotLayout's own getX/getY,
	// which drive tick/domain computation and the Pointer's hit-testing) —
	// `row` (see BasePlotLayout/HoverPoint) is what lets the template recover the
	// semantic category regardless of which axis it landed on.
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

	// A legend-disabled series is dimmed on the bar itself, but never surfaces
	// in hover/tooltip — its points are simply absent from the candidate list.
	const hoverPoints = $derived(
		buildHoverPoints(resolvedSeries, isHorizontal, barLayout, colorForSeries).filter(
			(p) => !legendInteraction?.disabledSeries.has(p.series!)
		)
	);

	const hover = $derived({
		active: tooltip != null || hasHoverMarker(markers),
		points: hoverPoints,
		label: (r: TData) => String(yAcc(r)),
		strategy: resolveHoverStrategy(tooltip?.strategy, markers, categoricalAxis),
		sync: resolveHoverSync(tooltip?.sync, markers),
		tooltip,
		// The category axis is a band scale — `<Pointer>`'s nearest-point-by-
		// distance match (svelteplot's own projection of each candidate's band
		// centre) can disagree by a couple of pixels with where `<BarX>`/`<BarY>`
		// (via svelteplot's `RectPath`) actually render that band, which is
		// enough to mismatch the neighbouring category once bands get thin
		// (many categories). The `role: 'hitArea'` bar markers `phases/markers.ts`
		// emits hit-test each series' own segment directly instead — see its
		// own doc comment.
		pointMatching: 'contains' as const
	});

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
	getX={plotGetX}
	getY={plotGetY}
	{hover}
	scales={resolvedScales}
	{...labelMargin.plotProps}
	xTickRotate={resolvedScales?.x?.tickRotate}
	markers={({ setHoverMatch, clearHoverMatch }) => [
		...buildMarkers({
			groupedSeries,
			barLayout,
			isHorizontal,
			hoverPoints,
			colorFor: colorForSeries,
			disabledFillFor: (name) => disabledFillOverride(effectiveDisabledFor(name)),
			active: hover.active,
			setHoverMatch,
			clearHoverMatch,
			gapFillMaps
		}),
		...markers
	]}
	seriesData={resolvedSeries}
	{scopedGroups}
>
	{#snippet children({ numericMargins })}
		{#if showVals}
			{#each groupedSeries as group, seriesIndex (group.series.name)}
				<ValueLabels
					{group}
					{seriesIndex}
					{barLayout}
					{isHorizontal}
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
