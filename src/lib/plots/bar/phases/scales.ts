import { resolveAccessor } from '$lib/plots/utils/accessors';
import { isGapValue } from '$lib/plots/utils/gaps';
import { niceDomain, naturalTickCount } from '$lib/layout/scales/niceDomain';
import { AUTO_MARGIN_ESTIMATE, numericMargin } from '$lib/layout/plot/margins';
import type { AxisValue, AxisScale, AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/bar/state';
import type { BarLayout, BarSeriesLayout } from '$lib/types/plots/bar/layout';
import type { Series } from '$lib/types/plots/data/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type { MarginConfig } from '$lib/types/plots/props';
import type { DiscreteGapFill } from '$lib/plots/utils/gaps';

/** BarPlot's series-layout geometry: grouped/stacked offsets, band-width estimate, value baseline. */
export function buildBarLayout<TData extends Record<string, unknown>>(args: {
	scales: AxisBasedScalesConfig<TData>;
	isHorizontal: boolean;
	width: number;
	height: number;
	margins: MarginConfig | undefined;
	flat: TData[];
	xAcc: (d: TData) => AxisValue;
	groupedSeries: VisualGroup<Series<TData>, BarSegmentStyle>[];
	gapFillMaps: Map<string, Map<TData, DiscreteGapFill<BarSegmentStyle>>>;
	themeMargins: Record<'top' | 'right' | 'bottom' | 'left', number | 'auto'>;
	seriesPaddingDefault: number;
}): BarLayout {
	const {
		scales,
		isHorizontal,
		width,
		height,
		margins,
		flat,
		xAcc,
		groupedSeries,
		gapFillMaps,
		themeMargins,
		seriesPaddingDefault
	} = args;

	const layout: BarSeriesLayout = scales.z?.seriesLayout ?? 'overlap';
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

	const seriesCount = groupedSeries.length;
	const seriesGapFraction = Math.max(
		0,
		Math.min(1, scales.z?.seriesPadding ?? seriesPaddingDefault)
	);
	const seriesStep = seriesCount > 0 ? estimatedBandwidth / seriesCount : 0;
	const seriesGap = seriesGapFraction * seriesStep;

	const stackedPrefixSums = new Map<AxisValue, number[]>();
	if (layout === 'stacked') {
		for (const category of new Set(flat.map((d) => xAcc(d)))) {
			let running = 0;
			const prefix: number[] = [];
			for (const group of groupedSeries) {
				prefix.push(running);
				const seriesXFn = resolveAccessor(group.series.x);
				const seriesYFn = resolveAccessor(group.series.y);
				const row = group.series.data.find((d) => seriesXFn(d) === category);
				if (row) {
					const raw = seriesYFn(row);
					const fill = gapFillMaps.get(group.series.name)?.get(row);
					running += fill ? fill.value : isGapValue(raw) ? 0 : Number(raw);
				}
			}
			stackedPrefixSums.set(category, prefix);
		}
	}

	function stackedBaseline(category: AxisValue, seriesIndex: number): number {
		return stackedPrefixSums.get(category)?.[seriesIndex] ?? 0;
	}

	function groupOffset(seriesIndex: number): { dx: number; dy: number } {
		if (layout !== 'grouped') return { dx: 0, dy: 0 };
		const offset = -(estimatedBandwidth / 2) + seriesIndex * seriesStep + seriesStep / 2;
		return isHorizontal ? { dx: 0, dy: -offset } : { dx: offset, dy: 0 };
	}

	function groupInsetFraction(seriesIndex: number): { start: number; end: number } {
		if (layout !== 'grouped' || seriesCount === 0) return { start: 0, end: 0 };
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
		stackedBaseline,
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

	const seriesLayout = scales.z?.seriesLayout ?? 'overlap';

	const valueExtent = ((): [number, number] | undefined => {
		let lo = 0;
		let hi = 0;
		if (seriesLayout === 'stacked') {
			const totals = new Map<AxisValue, number>();
			for (const s of resolvedSeries!) {
				const sx = resolveAccessor(s.x);
				const sy = resolveAccessor(s.y);
				for (const row of s.data) {
					const raw = sy(row);
					if (isGapValue(raw)) continue;
					const cat = sx(row);
					totals.set(cat, (totals.get(cat) ?? 0) + Number(raw));
				}
			}
			for (const total of totals.values()) {
				lo = Math.min(lo, total);
				hi = Math.max(hi, total);
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
		groupedSeries: state.groupedSeries!,
		gapFillMaps: state.gapFillMaps!,
		themeMargins: ctx.cfg.margins,
		seriesPaddingDefault: ctx.cfg.bar.seriesPadding
	});

	return { ...state, scales: resolvedScales, barLayout };
}
