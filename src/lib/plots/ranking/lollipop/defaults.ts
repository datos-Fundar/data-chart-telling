import { buildClevelandDefaults } from '$lib/plots/ranking/cleveland/defaults';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { LollipopPlotState, LollipopPlotCtx } from '$lib/types/plots/ranking/lollipop/state';

/**
 * LollipopPlot on the shared pipeline: a ClevelandPlot of one value per
 * category, whose stem rises from the baseline - zero, or the nearest end of a
 * pinned value domain - to the dot. It warns when a category has values in
 * several series, which `DumbbellPlot` and `ClevelandPlot` are for.
 */
export function buildLollipopDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	LollipopPlotState<TData>,
	LollipopPlotCtx
> {
	return buildClevelandDefaults<TData>({
		name: 'LollipopPlot',
		config: 'lollipop',
		fromBaseline: true,
		validate: ({ maxSeriesPerCategory }) =>
			maxSeriesPerCategory > 1
				? 'a lollipop draws one value per category, but a category has values in several series. ' +
					'Use DumbbellPlot for two series, or ClevelandPlot for any number.'
				: undefined
	});
}
