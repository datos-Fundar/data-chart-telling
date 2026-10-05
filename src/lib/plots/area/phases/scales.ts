import { markerAxisValues } from '$lib/utils/markerAxisValues';
import type { AreaPlotState } from '$lib/types/plots/area/state';

/**
 * AreaPlot's "scales" phase: grows an unpinned `x` domain to cover the marks
 * derived from the plot (a density curve's tails, a regression band), which
 * svelteplot's own domain doesn't read off their symbol-keyed rows. A pinned
 * domain is left alone and clipped instead. `y` is left to svelteplot, since
 * its auto domain already stacks the default areas correctly.
 */
export function buildScales<TData extends Record<string, unknown>>(
	state: AreaPlotState<TData>
): AreaPlotState<TData> {
	const { scales, channels, flat = [], markers = [] } = state;
	if (scales.x?.domain || !channels) return state;

	const extraX = markerAxisValues(markers, 'x');
	if (extraX.length === 0) return state;

	const xAcc = channels.x.accessor;
	const flatX = flat.map((d) => xAcc(d));
	// Only a plain numeric axis can take a numeric extent; a date axis keeps svelteplot's own domain.
	if (!flatX.every((v) => typeof v === 'number')) return state;

	const values = [...(flatX as number[]), ...extraX];
	const domain: [number, number] = [Math.min(...values), Math.max(...values)];
	return {
		...state,
		scales: { ...scales, x: { ...scales.x, domain, nice: scales.x?.nice ?? true } }
	};
}
