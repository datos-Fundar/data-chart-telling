import { makeColorScale } from '$lib/utils/color';
import type { AxisValue } from '$lib/types/layout/scales';
import type { HeatmapPlotState, HeatmapPlotCtx } from '$lib/types/plots/heatmap/state';

/** HeatmapPlot's "scales" phase: band x/y domains over every distinct category, and the value→color scale. */
export function buildScales<TData extends Record<string, unknown>>(
	state: HeatmapPlotState<TData>,
	ctx: HeatmapPlotCtx
): HeatmapPlotState<TData> {
	const { scales, flat, channels } = state;
	const { minColor, maxColor, range } = ctx;
	const { x: xAcc, y: yAcc, z: zAcc } = channels!;

	const xDomain = [...new Set(flat!.map((d) => xAcc.accessor(d) as AxisValue))];
	const yDomain = [...new Set(flat!.map((d) => yAcc.accessor(d) as AxisValue))];

	const valueDomain: [number, number] = (() => {
		if (scales.z?.domain && scales.z.domain.length >= 2) {
			return [Number(scales.z.domain[0]), Number(scales.z.domain[1])];
		}
		const vals = flat!.map((d) => Number(zAcc.accessor(d)));
		return vals.length ? [Math.min(...vals, 0), Math.max(...vals)] : [0, 1];
	})();

	// 'rescale' reprojects the ramp onto the narrowed range; 'filter' (and no
	// active range) keeps the original domain — only which cells are hidden
	// changes (resolved in the "markers" phase).
	const effectiveDomain: [number, number] =
		range && range.mode === 'rescale' ? [range.min, range.max] : valueDomain;

	const colorScale = makeColorScale(effectiveDomain[0], effectiveDomain[1], minColor, maxColor);

	return {
		...state,
		scales: {
			...scales,
			x: { type: 'band', labelAnchor: 'right', domain: xDomain, ...(scales.x ?? {}) },
			y: { type: 'band', domain: yDomain, ...(scales.y ?? {}) }
		},
		colorScale
	};
}
