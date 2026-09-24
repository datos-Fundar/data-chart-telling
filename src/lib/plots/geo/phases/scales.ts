import { makeColorScale } from '$lib/utils/color';
import type { GeoPlotState, GeoPlotCtx } from '$lib/types/plots/geo/state';

/** GeoPlot's "scales" phase: the choropleth value→color scale (mirrors HeatmapPlot's own). */
export function buildScales<TProps extends Record<string, unknown>>(
	state: GeoPlotState<TProps>,
	ctx: GeoPlotCtx<TProps>
): GeoPlotState<TProps> {
	const { scales, features, value } = state;
	const { minColor, maxColor, range } = ctx;

	const valueDomain: [number, number] | null = (() => {
		if (scales.color?.domain) return scales.color.domain;
		if (!value) return null;
		const vals = features!.map((f) => value(f)).filter((v): v is number => v != null);
		return vals.length ? [Math.min(...vals), Math.max(...vals)] : null;
	})();

	const effectiveDomain: [number, number] | null = !valueDomain
		? null
		: range && range.mode === 'rescale'
			? [range.min, range.max]
			: valueDomain;

	const colorScale = effectiveDomain
		? makeColorScale(effectiveDomain[0], effectiveDomain[1], minColor, maxColor)
		: null;

	return { ...state, colorScale };
}
