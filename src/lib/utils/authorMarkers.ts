import { resolveTransforms } from '$lib/utils/transforms';
import { inheritPlotGrouping } from '$lib/utils/markerGrouping';
import { withComponentSeriesColor } from '$lib/utils/componentSeriesColor';

type Row = Record<string, unknown>;

/**
 * Prepares a plot's own author markers for the rest of its pipeline: inherits
 * the plot's grouping and default color first (a transform's `z` defaults to
 * the grouping), then runs each marker's own transforms over its rows — its
 * series' rows when it's scoped to one, the plot's rows otherwise.
 */
export function prepareAuthorMarkers<T extends { type: string; component?: unknown; props?: unknown }>(
	markers: T[],
	plot: {
		grouping?: unknown;
		color?: unknown;
		defaultColor?: string;
		colorForSeries?: (name: string) => string;
		flat: Row[];
		resolvedSeries?: { name: string; data: Row[] }[];
	}
): T[] {
	return inheritPlotGrouping(markers, plot).map((marker) => {
		const scope = (marker as { series?: unknown }).series;
		const seriesRows =
			typeof scope === 'string'
				? plot.resolvedSeries?.find((s) => s.name === scope)?.data
				: undefined;
		const colored =
			marker.type === 'component' && typeof scope === 'string'
				? withComponentSeriesColor(marker, plot.colorForSeries?.(scope))
				: marker;
		return resolveTransforms(colored, seriesRows ?? plot.flat);
	});
}
