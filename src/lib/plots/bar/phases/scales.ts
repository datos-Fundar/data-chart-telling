import { resolveAccessor } from '$lib/plots/utils/accessors';
import { isGapValue } from '$lib/plots/utils/gaps';
import { niceDomain, naturalTickCount } from '$lib/layout/scales/niceDomain';
import { AUTO_MARGIN_ESTIMATE, numericMargin } from '$lib/layout/plot/margins';
import type { AxisScale, AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/bar/state';
import type { BarLayout, BarSeriesLayout } from '$lib/types/plots/bar/layout';
import type { ProcessedData, ProcessedRow } from '$lib/types/layout/phases';
import { processedPosition } from '$lib/layout/phases/transforms';
import type { MarginConfig } from '$lib/types/plots/props';

/**
 * Where each processed row's bar sits: its category, and its span along the
 * value axis — from the row's own `y1` when a plot-level `stackY` produced
 * one, from `valueBaseline` otherwise, up to its top (`y2`, or `y`).
 */
function buildRowGeometry(
	processed: ProcessedData | undefined,
	valueBaseline: number
): Pick<BarLayout, 'categoryOf' | 'spanOf'> & { stacked: boolean } {
	if (!processed) {
		return { stacked: false, categoryOf: () => undefined as never, spanOf: () => undefined };
	}
	const position = processedPosition(processed);
	const { y1 } = processed.channels;
	const stacked = y1 !== undefined && processed.channels.y2 !== undefined;
	const bottomOf = stacked
		? (resolveAccessor(y1 as never) as (row: ProcessedRow) => unknown)
		: () => valueBaseline;
	return {
		stacked,
		categoryOf: (row) => position.x(row) as AxisValue,
		spanOf: (row) => {
			const top = position.y(row);
			const bottom = bottomOf(row);
			if (isGapValue(top) || isGapValue(bottom)) return undefined;
			const span: [number, number] = [Number(bottom), Number(top)];
			return Number.isFinite(span[0]) && Number.isFinite(span[1]) ? span : undefined;
		}
	};
}

/** BarPlot's series-layout geometry: grouped offsets, stacked spans, band-width estimate, value baseline. */
export function buildBarLayout<TData extends Record<string, unknown>>(args: {
	scales: AxisBasedScalesConfig<TData>;
	isHorizontal: boolean;
	width: number;
	height: number;
	margins: MarginConfig | undefined;
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
		seriesNames,
		processedData,
		themeMargins,
		seriesPadding
	} = args;

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

	const { stacked, categoryOf, spanOf } = buildRowGeometry(processedData, valueBaseline);
	const layout: BarSeriesLayout = stacked ? 'stacked' : 'grouped';

	const estimatedBandwidth = (() => {
		const categoryCount = new Set((processedData?.data ?? []).map(categoryOf)).size;
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
		categoryOf,
		spanOf,
		seriesIndexOf: (name) => seriesNames.indexOf(name),
		groupOffset,
		groupInsetFraction
	};
}

/** BarPlot's "scales" phase: resolved x/y scales, given the mapping phase's category-axis assignment. */
export function buildScales<TData extends Record<string, unknown>>(
	state: BarPlotState<TData>,
	ctx: BarPlotCtx
): BarPlotState<TData> {
	const { scales, categoricalAxis, isHorizontal, width, height } = state;
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

	// Every bar's span, as the "transforms" phase left it — its baseline is
	// unknown until the domain is, so a plain bar reads as reaching from zero.
	const valueExtent = ((): [number, number] | undefined => {
		const { spanOf } = buildRowGeometry(state.processedData, 0);
		let lo = 0;
		let hi = 0;
		for (const row of state.processedData?.data ?? []) {
			const span = spanOf(row);
			if (!span) continue;
			lo = Math.min(lo, ...span);
			hi = Math.max(hi, ...span);
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
		seriesNames: (state.groupedSeries ?? []).map((g) => g.series.name),
		processedData: state.processedData,
		themeMargins: ctx.cfg.margins,
		seriesPadding: ctx.cfg.bar.seriesPadding
	});

	return { ...state, scales: resolvedScales, barLayout };
}
