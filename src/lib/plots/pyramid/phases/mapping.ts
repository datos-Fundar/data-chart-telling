import { resolveAccessor } from '$lib/plots/utils/accessors';
import { isGapValue } from '$lib/plots/utils/gaps';
import type { AxisValue } from '$lib/types/layout/mapping';
import type {
	PyramidPlotState,
	PyramidPlotCtx,
	PyramidTaggedRow
} from '$lib/types/plots/pyramid/state';

/** PyramidPlot's own "mapping" output: every real (non-gap) row tagged with its resolved side/signed-magnitude/category/label, as `flat`. */
export function buildTaggedRows<TData extends Record<string, unknown>>(
	state: PyramidPlotState<TData>,
	ctx: PyramidPlotCtx
): PyramidPlotState<TData> {
	const { resolvedSeries } = state;

	const flat = resolvedSeries!.flatMap((s) => {
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
					__label: ctx.formatValue(v, s.name),
					__series: s.name
				} as PyramidTaggedRow<TData>;
			});
	});

	return { ...state, flat };
}
