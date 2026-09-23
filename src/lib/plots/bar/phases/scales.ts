import { resolveAccessor } from '$lib/plots/utils/accessors';
import { isGapValue } from '$lib/plots/utils/gaps';
import { niceDomain, naturalTickCount } from '$lib/layout/scales/niceDomain';
import { AUTO_MARGIN_ESTIMATE } from '$lib/layout/plot/margins';
import type { AxisValue, AxisScale, AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { Series } from '$lib/types/plots/data/common';

/** BarPlot's resolved x/y scales, given which axis the mapping phase assigned as the category. */
export function buildScales<TData extends Record<string, unknown>>(args: {
	scales: AxisBasedScalesConfig<TData>;
	resolvedSeries: Series<TData>[];
	categoricalAxis: 'x' | 'y';
	isHorizontal: boolean;
	width: number;
	height: number;
	padding: { inner: number; outer: number };
}): AxisBasedScalesConfig<TData> {
	const { scales, resolvedSeries, categoricalAxis, isHorizontal, width, height, padding } = args;

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
			for (const s of resolvedSeries) {
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
			for (const s of resolvedSeries) {
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

	return {
		...scales,
		x: stripCategoricalType(
			categoricalAxis === 'x' ? withDefaultPadding(scales.x) : withValueDomain(scales.x)
		),
		y: stripCategoricalType(
			categoricalAxis === 'y' ? withDefaultPadding(scales.y) : withValueDomain(scales.y)
		)
	};
}
