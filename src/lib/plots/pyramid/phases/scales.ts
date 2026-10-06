import { resolveAccessor } from '$lib/plots/utils/accessors';
import { isGapValue } from '$lib/plots/utils/gaps';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { PyramidPlotState, PyramidPlotCtx } from '$lib/types/plots/pyramid/state';

/** PyramidPlot's "scales" phase: diverging x domain sized to the largest magnitude, band y domain over every category. */
export function buildScales<TData extends Record<string, unknown>>(
	state: PyramidPlotState<TData>,
	ctx: PyramidPlotCtx
): PyramidPlotState<TData> {
	const { scales, resolvedSeries, gapFillMaps } = state;

	const yDomain = [
		...new Set(
			resolvedSeries!.flatMap((s) => {
				const getCategory = resolveAccessor(s.x);
				return s.data.map((d) => getCategory(d) as AxisValue);
			})
		)
	];

	const maxMagnitude = (() => {
		const vals = resolvedSeries!.flatMap((s) => {
			const getMagnitude = resolveAccessor(s.y);
			const fillMap = gapFillMaps!.get(s.name);
			return s.data.flatMap((d) => {
				const raw = getMagnitude(d);
				if (!isGapValue(raw)) return [Math.abs(Number(raw))];
				const fill = fillMap?.get(d);
				return fill ? [Math.abs(fill.value)] : [];
			});
		});
		return vals.length ? Math.max(...vals) : 1;
	})();

	return {
		...state,
		scales: {
			...scales,
			x: {
				domain: [-maxMagnitude, maxMagnitude],
				tickFormat: (v: unknown) => ctx.formatValue(Math.abs(Number(v)), ''),
				...(scales.x ?? {})
			},
			y: { type: 'band', padding: 0.2, domain: yDomain, ...(scales.y ?? {}) }
		}
	};
}
