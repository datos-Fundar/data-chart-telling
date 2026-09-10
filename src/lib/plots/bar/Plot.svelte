<script lang="ts" generics="TData extends Record<string, unknown>">
	import { paletteColor } from '$lib/utils/color';
	import { buildSeries } from '$lib/utils/grouping';
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import {
		disabledFillOverride,
		resolveEffectiveDisabledStyle,
		omitDisabledSeries,
		buildSeriesColorIndex
	} from '$lib/plots/utils/legendDisabled';
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import {
		buildGroupedSeries,
		validateSegments,
		buildScopedMarkerGroups
	} from '$lib/plots/utils/segments';
	import { createBarLayout } from '$lib/plots/bar/layout.svelte';
	import {
		createLabelMarginTracker,
		halfDimensionOverflowCap
	} from '$lib/plots/utils/labelOverflow.svelte';
	import { estimateValueLabelMargin } from '$lib/plots/utils/valueLabelMargin';
	import { buildHoverPoints } from '$lib/plots/bar/hoverPoints';
	import { buildBarMarkers } from '$lib/plots/bar/buildBarMarkers';
	import { resolveGapsForSeries, resolveDiscreteGapFills } from '$lib/plots/utils/gaps';
	import ValueLabels from '$lib/plots/bar/ValueLabels.svelte';
	import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
	import {
		hasHoverMarker,
		resolveHoverStrategy,
		resolveHoverSync
	} from '$lib/layout/tooltip/utils';
	import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
	import type { BasePlotProps } from '$lib/types/plots/props';
	import type { AxisScale, AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import type { Series, SeriesProps, DataProps } from '$lib/types/plots/data/common';
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
	// Unfiltered series list, for stable per-name color indexing.
	const fullSeries = $derived(series ?? buildSeries(data!, x!, y!, z));
	const colorIndex = $derived(buildSeriesColorIndex(fullSeries));
	function colorForSeries(name: string): string {
		return paletteColor(colorIndex.get(name) ?? 0, cfg.palette);
	}
	// Drops series toggled off with `disabled: { mode: 'omit' }`.
	const resolvedSeries = $derived(omitDisabledSeries(fullSeries, legendInteraction));
	const groupedSeries = $derived(
		// connect: false — bars are discrete; there's no visual gap between
		// adjacent categories to bridge (see buildGroupedSeries's own doc).
		buildGroupedSeries<Series<TData>, BarSegmentStyle>(resolvedSeries, segments, false)
	);
	const showVals = $derived(styles.values?.show ?? false);
	const formatValue = $derived(styles.values?.format ?? ((v: number) => `${v}`));
	const valAnchor = $derived<ValueAnchor>(styles.values?.anchor ?? 'outside');

	// Fills leading/internal/trailing missing-data holes with an
	// interpolated, distinctly-styled bar, resolved per series like
	// `segments` — see `GapsAwarePlotStylesConfig` (`types/layout/styles.ts`).
	const gaps = $derived(styles.gaps ?? {});
	const gapFillMaps = $derived(
		new Map(
			resolvedSeries.map((s) => [
				s.name,
				resolveDiscreteGapFills(s, resolveGapsForSeries(gaps, s.name))
			])
		)
	);

	// `xAcc`/`yAcc` are always data-semantic (category/value) — independent of
	// which *visual* axis ends up drawing them, decided by `categoricalAxis`.
	const xAcc = $derived(resolveAccessor(resolvedSeries[0]?.x ?? ((d: TData) => d)));
	const yAcc = $derived(resolveAccessor(resolvedSeries[0]?.y ?? ((d: TData) => d)));
	const flat = $derived(resolvedSeries.flatMap((s) => s.data));

	const scopedGroups = $derived(
		buildScopedMarkerGroups<TData, Series<TData>, BarSegmentStyle>({
			groupedSeries,
			segments,
			colorFor: (series) => colorForSeries(series.name),
			segmentColorFor: (style, defaultColor) => style?.fill ?? defaultColor
		})
	);

	/**
	 * Which visual axis draws the category, and therefore whether this renders
	 * as vertical bars (`BarY`, category on X) or horizontal bars (`BarX`,
	 * category on Y). Mirrors how pyramid/heatmap default an `AxisScale.type`
	 * themselves: `scales.x`/`scales.y` always describe *that visual axis*
	 * regardless of which data field lands there, so marking `scales.y.type:
	 * 'categorical'` simply says "the category is drawn on Y this time" — x
	 * defaults to categorical when neither is marked.
	 */
	const categoricalAxis = $derived.by((): 'x' | 'y' => {
		const xCategorical = scales.x?.type === 'categorical';
		const yCategorical = scales.y?.type === 'categorical';
		if (xCategorical && yCategorical) {
			console.warn(
				"BarPlot: scales.x.type and scales.y.type can't both be 'categorical' — " +
					'mark only one axis as the category axis. Defaulting to x.'
			);
			return 'x';
		}
		return yCategorical ? 'y' : 'x';
	});
	const isHorizontal = $derived(categoricalAxis === 'y');

	/**
	 * `'categorical'` is our own sentinel (BarPlot-only), not a real svelteplot
	 * scale type — svelteplot's x/y scales don't recognise it (it's valid only
	 * for `color`/`symbol`). Strip it before the scale reaches svelteplot so it
	 * auto-infers the real type (typically `point`/`band`) the same way it
	 * already does when `type` is left unset entirely.
	 */
	function stripCategoricalType(scale?: AxisScale<TData>): AxisScale<TData> | undefined {
		if (scale?.type !== 'categorical') return scale;
		const rest = { ...scale };
		delete rest.type;
		return rest;
	}
	// The single, fully-resolved scales object BasePlotLayout reads for
	// everything (ticks, grid, sort, and the real svelteplot scale) — avoids
	// keeping a second, separately-patched copy of `scales.x`/`scales.y` in
	// sync with the one actually forwarded.
	const resolvedScales = $derived({
		...scales,
		x: stripCategoricalType(scales.x),
		y: stripCategoricalType(scales.y)
	});

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
		scales: () => scales,
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
		// (many categories). The `role: 'hitArea'` bar markers `buildBarMarkers`
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
		...buildBarMarkers({
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
