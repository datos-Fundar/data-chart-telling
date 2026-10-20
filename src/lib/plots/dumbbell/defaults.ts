import { buildClevelandDefaults } from '$lib/plots/cleveland/defaults';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { DumbbellPlotState, DumbbellPlotCtx } from '$lib/types/plots/dumbbell/state';

/**
 * DumbbellPlot on the shared pipeline: a ClevelandPlot of exactly two series,
 * so every category is two dots joined by a connector - the change, or the gap,
 * between them. It warns when it has another number of series, which
 * `LollipopPlot` (one) and `ClevelandPlot` (any) are for.
 */
export function buildDumbbellDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	DumbbellPlotState<TData>,
	DumbbellPlotCtx
> {
	return buildClevelandDefaults<TData>({
		name: 'DumbbellPlot',
		config: 'dumbbell',
		validate: ({ seriesCount }) =>
			seriesCount !== 2
				? `a dumbbell joins exactly two series, but it has ${seriesCount}. ` +
					(seriesCount === 1
						? 'Use LollipopPlot for one series.'
						: 'Use ClevelandPlot for any number of series.')
				: undefined
	});
}
