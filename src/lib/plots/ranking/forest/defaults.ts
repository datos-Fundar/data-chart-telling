import { buildClevelandDefaults } from '$lib/plots/ranking/cleveland/defaults';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { ForestPlotState, ForestPlotCtx } from '$lib/types/plots/ranking/forest/state';

/**
 * ForestPlot on the shared pipeline: a ClevelandPlot whose dot is an estimate
 * and whose stem is its interval - each row's `lower` and `upper`, or `error`
 * either side of it. One interval per category, so it warns when a category
 * has values in several series, which `ClevelandPlot` and `DumbbellPlot` are
 * for - or `facet`, to compare the series side by side. The value axis fits the
 * intervals' ends.
 */
export function buildForestDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	ForestPlotState<TData>,
	ForestPlotCtx
> {
	return buildClevelandDefaults<TData>({
		name: 'ForestPlot',
		config: 'forest',
		interval: true,
		validate: ({ maxSeriesPerCategory }) =>
			maxSeriesPerCategory > 1
				? 'a forest plot draws one interval per category, but a category has values in several series. ' +
					'Split the series into panels with `facet`.'
				: undefined
	});
}
