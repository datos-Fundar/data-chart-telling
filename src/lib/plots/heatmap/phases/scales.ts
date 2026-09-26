import { resolveColorScale } from '$lib/utils/color';
import { resolveOpacityScale } from '$lib/utils/opacity';
import type { AxisValue } from '$lib/types/layout/scales';
import type { HeatmapPlotState, HeatmapPlotCtx } from '$lib/types/plots/heatmap/state';

/** HeatmapPlot's "scales" phase: band x/y domains over every distinct category, and each row's own resolved color. */
export function buildScales<TData extends Record<string, unknown>>(
	state: HeatmapPlotState<TData>,
	ctx: HeatmapPlotCtx
): HeatmapPlotState<TData> {
	const { scales, flat, channels } = state;
	const { range, cfg } = ctx;
	const { x: xAcc, y: yAcc, color: colorAcc } = channels!;

	const xDomain = [...new Set(flat!.map((d) => xAcc.accessor(d) as AxisValue))];
	const yDomain = [...new Set(flat!.map((d) => yAcc.accessor(d) as AxisValue))];

	const valueDomain: [number, number] = (() => {
		if (
			scales.color?.domain &&
			Array.isArray(scales.color.domain) &&
			typeof scales.color.domain[0] === 'number'
		) {
			return scales.color.domain as [number, number];
		}
		const vals = flat!.map((d) => Number(colorAcc.accessor(d)));
		return vals.length ? [Math.min(...vals, 0), Math.max(...vals)] : [0, 1];
	})();

	// 'rescale' reprojects the ramp onto the narrowed range; 'filter' (and no
	// active range) keeps the original domain — only which cells are hidden
	// changes (resolved in the "markers" phase).
	const effectiveDomain: [number, number] =
		range && range.mode === 'rescale' ? [range.min, range.max] : valueDomain;

	const colorScale = resolveColorScale(
		{ ...scales.color, domain: effectiveDomain },
		effectiveDomain,
		[cfg.continuous.min, cfg.continuous.max]
	);
	const resolveColor = (row: TData) => colorScale(Number(colorAcc.accessor(row)));

	const opacityAcc = channels!.opacity;
	const resolveOpacity = opacityAcc
		? (() => {
				const rawVals = flat!.map((d) => opacityAcc.accessor(d)).filter((v) => v != null);
				const allNumeric = rawVals.every((v) => Number.isFinite(Number(v)));
				const opacityDomain: [number, number] | string[] = allNumeric
					? rawVals.length
						? [Math.min(...rawVals.map(Number)), Math.max(...rawVals.map(Number))]
						: [0, 1]
					: [...new Set(rawVals.map(String))];
				const opacityScale = resolveOpacityScale(scales.opacity, opacityDomain, cfg.continuous.opacityRange);
				return (row: TData) => opacityScale(opacityAcc.accessor(row));
			})()
		: undefined;

	return {
		...state,
		scales: {
			...scales,
			x: { type: 'band', labelAnchor: 'right', domain: xDomain, ...(scales.x ?? {}) },
			y: { type: 'band', domain: yDomain, ...(scales.y ?? {}) }
		},
		resolveColor,
		resolveOpacity
	};
}
