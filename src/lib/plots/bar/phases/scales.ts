import { resolveAccessor } from '$lib/plots/utils/accessors';
import { isGapValue } from '$lib/plots/utils/gaps';
import { niceDomain, naturalTickCount } from '$lib/layout/scales/niceDomain';
import { AUTO_MARGIN_ESTIMATE, numericMargin } from '$lib/layout/plot/margins';
import type { AxisScale, AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/bar/state';
import type { BarLayout, BarSeriesLayout } from '$lib/types/plots/bar/layout';
import type { ProcessedChannel, ProcessedData, ProcessedRow } from '$lib/types/layout/phases';
import { SERIES_KEY } from '$lib/layout/phases/transforms';
import type { MarginConfig } from '$lib/types/plots/props';

/** A category as a map key — a `Date` by its time, so two equal dates match. */
function categoryKey(category: unknown): unknown {
	return category instanceof Date ? category.getTime() : category;
}

/**
 * Each stacked bar's `[bottom, top]`, keyed by series and category, read off
 * the rows a plot-level `stackY` produced. Empty when the plot doesn't stack.
 */
function buildStackedSpans(
	processed: ProcessedData | undefined
): Map<string, Map<unknown, [number, number]>> {
	const spans = new Map<string, Map<unknown, [number, number]>>();
	const { channels, data = [] } = processed ?? {};
	if (channels?.y1 === undefined || channels.y2 === undefined || channels.x === undefined) {
		return spans;
	}
	const read = (channel: ProcessedChannel) =>
		resolveAccessor(channel as never) as (row: ProcessedRow) => unknown;
	const [xOf, y1Of, y2Of] = [read(channels.x), read(channels.y1), read(channels.y2)];
	for (const row of data) {
		const lo = Number(y1Of(row));
		const hi = Number(y2Of(row));
		if (!Number.isFinite(lo) || !Number.isFinite(hi)) continue;
		const name = row[SERIES_KEY] as string;
		if (!spans.has(name)) spans.set(name, new Map());
		spans.get(name)!.set(categoryKey(xOf(row)), [lo, hi]);
	}
	return spans;
}

/** BarPlot's series-layout geometry: grouped offsets, stacked spans, band-width estimate, value baseline. */
export function buildBarLayout<TData extends Record<string, unknown>>(args: {
	scales: AxisBasedScalesConfig<TData>;
	isHorizontal: boolean;
	width: number;
	height: number;
	margins: MarginConfig | undefined;
	flat: TData[];
	xAcc: (d: TData) => AxisValue;
	seriesNames: string[];
	processedData: ProcessedData | undefined;
	themeMargins: Record<'top' | 'right' | 'bottom' | 'left', number | 'auto'>;
	seriesPadding: number;
}): BarLayout {
	const {
		scales,
		isHorizontal,
		width,
		height,
		margins,
		flat,
		xAcc,
		seriesNames,
		processedData,
		themeMargins,
		seriesPadding
	} = args;

	const spans = buildStackedSpans(processedData);
	const layout: BarSeriesLayout = spans.size > 0 ? 'stacked' : 'grouped';
	const categoricalScale = isHorizontal ? scales.y : scales.x;
	const valueScale = isHorizontal ? scales.x : scales.y;

	const valueBaseline = (() => {
		const domain = valueScale?.domain;
		if (!domain || domain.length < 2) return 0;
		const lo = Number(domain[0]);
		const hi = Number(domain[domain.length - 1]);
		if (Number.isNaN(lo) || Number.isNaN(hi)) return 0;
		const min = Math.min(lo, hi);
		const max = Math.max(lo, hi);
		if (min > 0) return min;
		if (max < 0) return max;
		return 0;
	})();

	const estimatedBandwidth = (() => {
		const categoryCount = new Set(flat.map((d) => xAcc(d))).size;
		if (categoryCount === 0) return 0;
		const baseMargins = { ...themeMargins, ...margins };
		const innerSize = isHorizontal
			? Math.max(
					0,
					height -
						numericMargin('top', baseMargins.top) -
						numericMargin('bottom', baseMargins.bottom)
				)
			: Math.max(
					0,
					width -
						numericMargin('left', baseMargins.left) -
						numericMargin('right', baseMargins.right)
				);
		const paddingInner = categoricalScale?.paddingInner ?? categoricalScale?.padding ?? 0.15;
		const paddingOuter = categoricalScale?.paddingOuter ?? categoricalScale?.padding ?? 0.15;
		const step = innerSize / (categoryCount - paddingInner + 2 * paddingOuter);
		return step * (1 - paddingInner);
	})();

	const seriesCount = seriesNames.length;
	// A lone series, or a stack, fills its whole band: there's nothing to set side by side.
	const sideBySide = layout === 'grouped' && seriesCount > 1;
	const seriesGapFraction = Math.max(0, Math.min(1, seriesPadding));
	const seriesStep = seriesCount > 0 ? estimatedBandwidth / seriesCount : 0;
	const seriesGap = seriesGapFraction * seriesStep;

	function stackedSpan(category: AxisValue, seriesIndex: number): [number, number] | undefined {
		return spans.get(seriesNames[seriesIndex])?.get(categoryKey(category));
	}

	function groupOffset(seriesIndex: number): { dx: number; dy: number } {
		if (!sideBySide) return { dx: 0, dy: 0 };
		const offset = -(estimatedBandwidth / 2) + seriesIndex * seriesStep + seriesStep / 2;
		return isHorizontal ? { dx: 0, dy: -offset } : { dx: offset, dy: 0 };
	}

	function groupInsetFraction(seriesIndex: number): { start: number; end: number } {
		if (!sideBySide) return { start: 0, end: 0 };
		const sliceFraction = 1 / seriesCount;
		const gapFraction = (seriesGapFraction * sliceFraction) / 2;
		return {
			start: seriesIndex * sliceFraction + gapFraction,
			end: (seriesCount - 1 - seriesIndex) * sliceFraction + gapFraction
		};
	}

	return {
		layout,
		valueBaseline,
		estimatedBandwidth,
		seriesCount,
		seriesStep,
		seriesGap,
		stackedSpan,
		groupOffset,
		groupInsetFraction
	};
}

/** BarPlot's "scales" phase: resolved x/y scales, given the mapping phase's category-axis assignment. */
export function buildScales<TData extends Record<string, unknown>>(
	state: BarPlotState<TData>,
	ctx: BarPlotCtx
): BarPlotState<TData> {
	const { scales, resolvedSeries, categoricalAxis, isHorizontal, width, height } = state;
	const padding = { inner: ctx.cfg.bar.paddingInner, outer: ctx.cfg.bar.paddingOuter };

	function stripCategoricalType(scale?: AxisScale<TData>): AxisScale<TData> | undefined {
		if (scale?.type !== 'categorical') return scale;
		const rest = { ...scale };
		delete rest.type;
		return rest;
	}

	function withDefaultPadding(scale?: AxisScale<TData>): AxisScale<TData> {
		return {
			...scale,
			paddingInner: scale?.paddingInner ?? scale?.padding ?? padding.inner,
			paddingOuter: scale?.paddingOuter ?? scale?.padding ?? padding.outer
		};
	}

	const stackedSpans = buildStackedSpans(state.processedData);

	const valueExtent = ((): [number, number] | undefined => {
		let lo = 0;
		let hi = 0;
		if (stackedSpans.size > 0) {
			for (const byCategory of stackedSpans.values()) {
				for (const [bottom, top] of byCategory.values()) {
					lo = Math.min(lo, bottom, top);
					hi = Math.max(hi, bottom, top);
				}
			}
		} else {
			for (const s of resolvedSeries!) {
				const sy = resolveAccessor(s.y);
				for (const row of s.data) {
					const raw = sy(row);
					if (isGapValue(raw)) continue;
					const v = Number(raw);
					lo = Math.min(lo, v);
					hi = Math.max(hi, v);
				}
			}
		}
		return hi > lo ? [lo, hi] : undefined;
	})();

	function withValueDomain(scale?: AxisScale<TData>): AxisScale<TData> | undefined {
		if (scale?.domain != null || scale?.ticks != null || scale?.nice != null) return scale;
		if (!valueExtent) return scale;
		const [lo, hi] = valueExtent;
		const spacing = isHorizontal ? 80 : 50;
		const marginEstimate = isHorizontal
			? AUTO_MARGIN_ESTIMATE.left + AUTO_MARGIN_ESTIMATE.right
			: AUTO_MARGIN_ESTIMATE.top + AUTO_MARGIN_ESTIMATE.bottom;
		const span = Math.max(0, (isHorizontal ? width : height) - marginEstimate);
		const count = naturalTickCount(span, spacing, 2);
		return { ...scale, domain: niceDomain(lo, hi, count) };
	}

	const resolvedScales = {
		...scales,
		x: stripCategoricalType(
			categoricalAxis === 'x' ? withDefaultPadding(scales.x) : withValueDomain(scales.x)
		),
		y: stripCategoricalType(
			categoricalAxis === 'y' ? withDefaultPadding(scales.y) : withValueDomain(scales.y)
		)
	};

	const barLayout = buildBarLayout<TData>({
		scales: resolvedScales,
		isHorizontal: isHorizontal!,
		width,
		height,
		margins: state.margins,
		flat: state.flat!,
		xAcc: state.channels!.x.accessor,
		seriesNames: (state.groupedSeries ?? []).map((g) => g.series.name),
		processedData: state.processedData,
		themeMargins: ctx.cfg.margins,
		seriesPadding: ctx.cfg.bar.seriesPadding
	});

	return { ...state, scales: resolvedScales, barLayout };
}
