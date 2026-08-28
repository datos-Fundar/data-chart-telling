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
	import { measureTextWidth } from '$lib/layout/plot/measureText';
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
	import type { ValueAnchor } from '$lib/types/plots/constants';
	import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';

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
	const valAnchor = $derived<ValueAnchor>(styles.values?.anchor ?? 'start');
	const formatValue = $derived(styles.values?.format ?? ((v: number, name: string) => `${name} - ${v}`));

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

	// Estimated overflow for a rightward-fanning end-of-line label (the
	// default: `valAnchor: 'start'`, or any anchor whose resolved `dx` isn't
	// negative). `lanesUsed` (see `declutter1D`/`laneAssignment`) never
	// exceeds the series count, so that bounds the reach even without
	// knowing which points will actually end up clustered together. A
	// leftward fan (negative `dx`) instead flips itself to the right when it
	// runs out of room — see `ValueLabels.svelte`'s own doc comment — so it
	// carries no such risk and is left to the DOM-measured fallback below.
	//
	// Only the fraction of the label that actually extends to the right of
	// its own anchor point counts toward the margin — `textAnchor: 'start'`
	// (the default `'start'`/`'outside'`-less case) puts the whole label
	// there, but `'middle'` (`valAnchor: 'outside'`, or the shared-anchor
	// default for anything other than `'start'`/`'end'`) centers it on the
	// anchor, so only half sticks out; `'end'` puts none of it there at all.
	// Same `preferredTA` derivation as `ValueLabels.svelte` (`'outside'`
	// itself is a `dy`/`lineAnchor` shorthand, not a real textAnchor value —
	// it resolves through `defaultTA` same as an unset one).
	//
	// The widest label is measured from `scales.y.domain` when the caller
	// pins one (e.g. a shared domain covering a whole timeline range) rather
	// than from `resolvedSeries`'s own values — a timeline scrubber's `data`
	// is only the currently-revealed slice, so measuring straight off it
	// would keep changing the floor (and, via `resetKey`, remounting the
	// plot) on every tick even though the true worst case across the whole
	// range never changes. Without a pinned domain there's no such stable
	// source, so this falls back to the current frame's own values, same as
	// no floor at all for a caller not pinning a domain in the first place.
	//
	// This estimate is close but not exact (declutter's real elbow/connector
	// geometry vs. this reach formula) — with a pinned domain, that gap can
	// still cost one extra DOM-measured correction (and its remount) on
	// whichever tick first renders real declutter geometry, but never more
	// than one across a whole scrub — see `LinePlot.ValueLabelStability`'s
	// own test for what "settled" means here.
	const valueLabelFloor = $derived.by((): MarginOverflow | undefined => {
		if (!showVals) return undefined;
		const font = styles.values?.fontStyle;
		const defaultDx = valAnchor === 'start' ? 6 : valAnchor === 'end' ? -6 : 0;
		const baseDx = typeof font?.dx === 'number' ? font.dx : defaultDx;
		if ((Math.sign(baseDx) || 1) !== 1) return undefined;

		const defaultTA = valAnchor === 'start' ? 'start' : valAnchor === 'end' ? 'end' : 'middle';
		const resolvedTextAnchor = font?.textAnchor === 'outside' ? undefined : font?.textAnchor;
		const preferredTA = resolvedTextAnchor ?? defaultTA;
		const rightFraction = preferredTA === 'start' ? 1 : preferredTA === 'end' ? 0 : 0.5;

		const fontSize = typeof font?.fontSize === 'number' ? font.fontSize : 12;
		const canvasFont = `${fontSize}px ${cfg.font === 'inherit' ? 'sans-serif' : cfg.font}`;
		const lineCfg = cfg.line.valueLabels;
		const seriesCount = resolvedSeries.length;
		const reach =
			seriesCount > 1
				? lineCfg.elbowGap + (seriesCount - 1) * lineCfg.laneStep + lineCfg.labelGap
				: Math.abs(baseDx);

		const pinnedDomain = scales.y?.domain;
		let maxLabelWidth = 0;
		if (pinnedDomain && pinnedDomain.length >= 2) {
			const lo = Number(pinnedDomain[0]);
			const hi = Number(pinnedDomain[pinnedDomain.length - 1]);
			for (const s of resolvedSeries) {
				maxLabelWidth = Math.max(
					maxLabelWidth,
					measureTextWidth(formatValue(lo, s.name), canvasFont),
					measureTextWidth(formatValue(hi, s.name), canvasFont)
				);
			}
		} else {
			for (const s of resolvedSeries) {
				const sy = resolveAccessor(s.y);
				for (const d of s.data) {
					const v = Number(sy(d));
					if (Number.isNaN(v)) continue;
					maxLabelWidth = Math.max(maxLabelWidth, measureTextWidth(formatValue(v, s.name), canvasFont));
				}
			}
		}
		// +2px: canvas text measurement and svelteplot's own rendered SVG text
		// can disagree by a pixel or so (different rendering engines) — a small
		// buffer that narrows, but doesn't eliminate, the gap noted above.
		return { left: 0, right: Math.ceil(reach + rightFraction * maxLabelWidth) + 2, top: 0, bottom: 0 };
	});

	// Grows the plot's margin to fit value labels that overflow the content
	// box. `valueLabelFloor` covers the common rightward case up front; each
	// label's own rendered overflow still feeds `labelMargin.report` for
	// whatever that estimate doesn't cover. See `labelOverflow.svelte.ts`.
	const labelMargin = createLabelMarginTracker(
		() => margins,
		() => resolvedSeries,
		() => valueLabelFloor ?? { left: 0, right: 0, top: 0, bottom: 0 }
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
