<script lang="ts" generics="TData extends Record<string, unknown>">
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { paletteColor } from '$lib/utils/color';
	import { buildSeries } from '$lib/utils/grouping';
	import { getLegendInteraction } from '$lib/layout/legend/interaction.svelte';
	import { disabledFillOverride } from '$lib/plots/utils/legendDisabled';
	import { buildPyramidBarMarkers } from '$lib/plots/pyramid/buildPyramidBarMarkers';
	import { createLabelMarginTracker } from '$lib/plots/utils/labelOverflow.svelte';
	import { measureTextWidth } from '$lib/layout/plot/measureText';
	import {
		buildGroupedSeries,
		validateSegments,
		buildScopedMarkerGroups
	} from '$lib/plots/utils/segments';
	import { isGapValue, resolveGapsForSeries, resolveDiscreteGapFills } from '$lib/plots/utils/gaps';
	import BasePlotLayout from '$lib/layout/plot/BasePlotLayout.svelte';
	import ValueLabels from '$lib/plots/pyramid/ValueLabels.svelte';
	import {
		hasHoverMarker,
		resolveHoverStrategy,
		resolveHoverSync
	} from '$lib/layout/tooltip/utils';
	import type { BasePlotProps } from '$lib/types/plots/props';
	import type { AxisValue, AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import type { Series, SeriesProps, DataProps } from '$lib/types/plots/data/common';
	import type { GapsAwarePlotStylesConfig } from '$lib/types/layout/styles';
	import type { ValueAnchor } from '$lib/types/plots/constants';
	import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
	import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
	import type { LegendDisabledStyle } from '$lib/types/layout/legend';
	import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';

	/**
	 * A population-pyramid-style diverging bar chart: each series is mirrored
	 * left or right of a shared zero baseline along a categorical band axis.
	 * Mirrors the bar/line plot contract — series in, marks out — so the
	 * chart-level container/timeline/facet/legend wrap it unchanged. Like
	 * `LinePlot`/`BarPlot`, accepts either pre-built `series` or flat `data` +
	 * `x`/`y`/`z` accessors.
	 *
	 * Side assignment is automatic: series names are sorted alphabetically and
	 * the first goes left, the second right. Pass `scales.z.reverse: true` to
	 * flip the order.
	 */

	type PyramidSide = 'left' | 'right';
	type InternalSeries = Series<TData> & { side: PyramidSide };

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
		x: magnitude,
		y: category,
		z: sides,
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
		return (
			legendInteraction?.disabledSeries.get(name) ??
			(hoverIsolate && hoverIsolatedSeries && hoverIsolatedSeries !== name
				? { opacity: cfg.legend.disabledOpacity }
				: undefined)
		);
	}

	const leftColor = $derived(styles.colors?.left ?? paletteColor(0, cfg.palette));
	const rightColor = $derived(styles.colors?.right ?? paletteColor(1, cfg.palette));
	const showVals = $derived(styles.values?.show ?? false);
	const formatValue = $derived(styles.values?.format ?? ((v: number) => `${v}`));
	const valAnchor = $derived<ValueAnchor>(styles.values?.anchor ?? 'outside');

	// Sort series names alphabetically; even index → left, odd → right.
	// scales.z.reverse flips the assignment so the second name goes left.
	const zReversed = $derived(scales.z?.reverse ?? false);
	const resolvedSeries = $derived.by((): InternalSeries[] => {
		const base: Series<TData>[] = series ?? buildSeries(data!, category!, magnitude!, sides);
		const sortedNames = [...base.map((s) => s.name)].sort((a, b) => a.localeCompare(b));
		return base.map((s) => {
			const idx = sortedNames.indexOf(s.name);
			const side: PyramidSide = (idx % 2 === 0) !== zReversed ? 'left' : 'right';
			return { ...s, side };
		});
	});

	const groupedSeries = $derived(
		// connect: false — bars are discrete; there's no visual gap between
		// adjacent categories to bridge (see buildGroupedSeries's own doc).
		buildGroupedSeries<InternalSeries, BarSegmentStyle>(resolvedSeries, segments, false)
	);

	function signedValue(s: InternalSeries, d: TData): number {
		const v = Math.abs(Number(resolveAccessor(s.y)(d)));
		return s.side === 'left' ? -v : v;
	}

	// Signs an already-resolved magnitude (e.g. a gap-fill's interpolated
	// value, which has no row of its own to read via `signedValue`).
	function signFor(s: InternalSeries, magnitude: number): number {
		return s.side === 'left' ? -magnitude : magnitude;
	}

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

	// svelteplot's `Pointer` rebuilds its quadtree from shallow-cloned rows
	// (`{ ...d }`), never the original references, so a row's owning series
	// can't be recovered by identity once hover is active. Pre-compute
	// everything `getX`/`getY`/`labelFor` need as plain enumerable properties —
	// they survive the clone automatically.
	type TaggedRow = TData & {
		__side: string;
		__x: number;
		__y: AxisValue;
		__label: string;
		__series: string;
	};

	const flat = $derived.by((): TaggedRow[] =>
		resolvedSeries.flatMap((s) => {
			const getCategory = resolveAccessor(s.x);
			const getMagnitude = resolveAccessor(s.y);
			return s.data
				.filter((d) => !isGapValue(getMagnitude(d)))
				.map((d) => {
					const v = Math.abs(Number(getMagnitude(d)));
					return {
						...d,
						__side: s.side,
						__x: s.side === 'left' ? -v : v,
						__y: getCategory(d) as AxisValue,
						__label: formatValue(v, s.name),
						__series: s.name
					} as TaggedRow;
				});
		})
	);

	const getX = (d: TaggedRow) => d.__x;
	const getY = (d: TaggedRow) => d.__y;
	const labelFor = (d: TaggedRow) => d.__label;

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
				color: d.__side === 'left' ? leftColor : rightColor
			}))
	);

	const yDomain = $derived([
		...new Set(
			resolvedSeries.flatMap((s) => {
				const getCategory = resolveAccessor(s.x);
				return s.data.map((d) => getCategory(d) as AxisValue);
			})
		)
	]);

	const maxMagnitude = $derived.by(() => {
		const vals = resolvedSeries.flatMap((s) => {
			const getMagnitude = resolveAccessor(s.y);
			const fillMap = gapFillMaps.get(s.name);
			return s.data.flatMap((d) => {
				const raw = getMagnitude(d);
				if (!isGapValue(raw)) return [Math.abs(Number(raw))];
				const fill = fillMap?.get(d);
				return fill ? [Math.abs(fill.value)] : [];
			});
		});
		return vals.length ? Math.max(...vals) : 1;
	});

	// The single, fully-resolved scales object BasePlotLayout reads for
	// everything (ticks, grid, sort, and the real svelteplot scale) — avoids
	// keeping a second, separately-defaulted copy of `scales.x`/`scales.y`
	// (our own diverging-domain + band-scale defaults) out of sync with the
	// one actually forwarded.
	const resolvedScales = $derived<AxisBasedScalesConfig<TData>>({
		...scales,
		x: {
			domain: [-maxMagnitude, maxMagnitude],
			tickFormat: (v: unknown) => formatValue(Math.abs(Number(v)), ''),
			...(scales.x ?? {})
		},
		y: { type: 'band', padding: 0.2, domain: yDomain, ...(scales.y ?? {}) }
	});

	const hover = $derived({
		active: tooltip != null || hasHoverMarker(markers),
		points: hoverPoints,
		label: labelFor,
		strategy: resolveHoverStrategy(tooltip?.strategy, markers, 'y'),
		sync: resolveHoverSync(tooltip?.sync, markers),
		tooltip
	});

	const pyramidMarkers = $derived(
		buildPyramidBarMarkers({
			groupedSeries,
			valueFor: signedValue,
			signFor,
			colorFor: (s) => (s.side === 'left' ? leftColor : rightColor),
			disabledFillFor: (name) => disabledFillOverride(effectiveDisabledFor(name)),
			gapFillMaps
		})
	);

	const scopedGroups = $derived(
		buildScopedMarkerGroups<TData, InternalSeries, BarSegmentStyle>({
			groupedSeries,
			segments,
			colorFor: (series) => (series.side === 'left' ? leftColor : rightColor),
			segmentColorFor: (style, defaultColor) => style?.fill ?? defaultColor
		})
	);

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

		let leftWidth = 0;
		let rightWidth = 0;
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
			const labelWidth = measureTextWidth(formatValue(extreme, s.name), canvasFont);
			if (s.side === 'left') leftWidth = Math.max(leftWidth, labelWidth);
			else rightWidth = Math.max(rightWidth, labelWidth);
		}
		return { left: Math.ceil(offset + leftWidth), right: Math.ceil(offset + rightWidth), top: 0, bottom: 0 };
	});

	// A pyramid bar's value label can grow past the plot's own content box —
	// `valueLabelFloor` covers the common case up front; each label's own
	// rendered overflow still feeds `labelMargin.report` for whatever that
	// estimate doesn't cover. See `labelOverflow.svelte.ts`.
	const labelMargin = createLabelMarginTracker(
		() => margins,
		() => resolvedSeries,
		() => valueLabelFloor ?? { left: 0, right: 0, top: 0, bottom: 0 }
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
	markers={[...pyramidMarkers, ...markers]}
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
